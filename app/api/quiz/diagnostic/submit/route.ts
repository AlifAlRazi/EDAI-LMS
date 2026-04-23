import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Quiz from "@/models/Quiz";
import Enrollment from "@/models/Enrollment";
import Course from "@/models/Course";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const { courseId, quizId, answers } = await req.json();

    if (!courseId || !quizId || !answers) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    await connectDB();

    // 1. Fetch the Quiz to get correct answers
    let quiz;
    if (quizId === "diagnostic") {
      quiz = await Quiz.findOne({ courseId, type: "diagnostic" }).lean();
    } else {
      quiz = await Quiz.findById(quizId).lean();
    }

    if (!quiz) {
      return new NextResponse("Quiz not found", { status: 404 });
    }

    // 2. Grade the answers
    let correctCount = 0;
    const strongNodes: string[] = [];
    const gapNodes: string[] = [];

    quiz.questions.forEach((q: any) => {
      const userAnswer = answers[q._id.toString()];
      const isCorrect = userAnswer === q.correctAnswer;
      
      if (isCorrect) {
        correctCount++;
        if (q.knowledgeNodeId) strongNodes.push(q.knowledgeNodeId);
      } else {
        if (q.knowledgeNodeId) gapNodes.push(q.knowledgeNodeId);
      }
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);

    // 3. Generate AI Justification using GPT-4o
    const course = await Course.findById(courseId).select("title knowledgeNodes").lean();
    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }
    
    // Map node IDs to real labels for the AI
    const nodeMap = new Map((course.knowledgeNodes || []).map((n: any) => [n.id, n.label]));
    const gapLabels = gapNodes.map(id => nodeMap.get(id) || id);
    const strongLabels = strongNodes.map(id => nodeMap.get(id) || id);

    const systemPrompt = `You are an expert academic advisor. A student just completed a diagnostic test for the course "${course.title}".
They scored ${score}% (${correctCount}/${quiz.questions.length}).

Areas they mastered: ${strongLabels.length > 0 ? strongLabels.join(", ") : "None"}
Areas they struggled with: ${gapLabels.length > 0 ? gapLabels.join(", ") : "None"}

Generate a personalized, encouraging justification of their result. Explain exactly why they received this score based on their specific strengths and weaknesses. Then, provide a short, bulleted recommended learning path (list of 3-4 topics) they should focus on.

You MUST return valid JSON exactly matching this structure:
{
  "explanation": "Your personalized 3-sentence justification paragraph addressing the student directly.",
  "recommendedPath": ["Topic 1 to study", "Topic 2 to study", "Topic 3 to study"]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: systemPrompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content || "{}");

    const diagnosticResult = {
      score,
      totalQuestions: quiz.questions.length,
      gapNodes: Array.from(new Set(gapNodes)), // Deduplicate safely
      strongNodes: Array.from(new Set(strongNodes)),
      recommendedPath: aiResponse.recommendedPath || [],
      explanation: aiResponse.explanation || "Your results have been recorded.",
    };

    // 4. Save to Enrollment
    await Enrollment.findOneAndUpdate(
      { userId: session.user.id, courseId },
      { $set: { diagnosticResult } },
      { new: true, upsert: true }
    );

    // 5. Return the result
    return NextResponse.json(diagnosticResult);

  } catch (error) {
    console.error("[QUIZ_SUBMIT_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
