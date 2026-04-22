import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth"; // use getSession for API, to avoid redirects of requireAuth
import connectDB from "@/lib/mongodb";
import Quiz from "@/models/Quiz";
import KnowledgeNode from "@/models/KnowledgeNode";
import Enrollment from "@/models/Enrollment";
import { detectKnowledgeGaps } from "@/lib/knowledge-graph";
import { generateAdaptiveQuestion } from "@/lib/rag";
import { Types } from "mongoose";
import type { QuizAnswer } from "@/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!courseId) {
      return NextResponse.json({ error: "Missing courseId" }, { status: 400 });
    }

    await connectDB();

    // Look for an existing approved diagnostic test
    let diagnosticQuiz = await Quiz.findOne({
      courseId,
      type: "diagnostic",
      isApproved: true,
    }).lean();

    // If none exists, we auto-generate one on the fly (basic implementation)
    if (!diagnosticQuiz) {
      // Get all foundational nodes
      const allNodes = await KnowledgeNode.find({ courseId }).lean();
      if (allNodes.length === 0) {
        return NextResponse.json({ error: "Course has no knowledge graph configured" }, { status: 400 });
      }

      // Pick up to 5 random nodes to test
      const targetNodes = allNodes.sort(() => 0.5 - Math.random()).slice(0, 5);

      const questionPromises = targetNodes.map((node) =>
        generateAdaptiveQuestion({
          courseId,
          nodeId: node.nodeId,
          difficulty: "medium",
          topic: node.label,
        })
      );

      const generatedQuestions = await Promise.all(questionPromises);
      const validQuestions = generatedQuestions.filter(
        (q) => q.questionText && q.options && q.options.length >= 2 && q.correctAnswer
      );

      const finalQuestions = validQuestions.map((q, i) => ({
        _id: new Types.ObjectId(),
        questionText: q.questionText!,
        type: q.type!,
        options: q.options!,
        correctAnswer: q.correctAnswer!,
        explanation: q.explanation || "",
        knowledgeNodeId: q.knowledgeNodeId!,
        difficulty: q.difficulty || "medium",
        order: i,
      }));

      // Store the newly generated quiz
      const newQuiz = await Quiz.create({
        courseId,
        type: "diagnostic",
        title: "Course Diagnostic Test",
        questions: finalQuestions,
        isAIGenerated: true,
        isApproved: true, // Auto-approve for the scope of the MVP
      });

      diagnosticQuiz = newQuiz.toJSON();
    }

    // Strip out correct answers for the client
    const safeQuiz = {
      ...diagnosticQuiz,
      questions: diagnosticQuiz!.questions.map((q) => ({
        id: q._id?.toString(),
        questionText: q.questionText,
        options: q.options,
        type: q.type,
      })),
    };

    return NextResponse.json({ success: true, quiz: safeQuiz });

  } catch (error: any) {
    console.error("Diagnostic GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId, quizId, answers } = await req.json();

    if (!courseId || !quizId || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await connectDB();

    // 1. Grade the quiz
    const quiz = await Quiz.findById(quizId).lean();
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    let correctCount = 0;
    const gradedAnswers: QuizAnswer[] = answers.map((ans) => {
      const q = quiz.questions.find((q) => q._id?.toString() === ans.questionId);
      const isCorrect = q?.correctAnswer === ans.selectedAnswer;
      if (isCorrect) correctCount++;
      return {
        ...ans,
        isCorrect,
        knowledgeNodeId: q?.knowledgeNodeId || "",
      };
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);

    // 2. Perform Gap Analysis using the Knowledge Graph engine
    const gapAnalysis = await detectKnowledgeGaps({
      userId: session.user.id,
      courseId,
      quizAnswers: gradedAnswers,
    });

    // 3. Save diagnostic result to the user's Enrollment record
    await Enrollment.findOneAndUpdate(
      { userId: session.user.id, courseId },
      {
        $set: {
          diagnosticResult: {
            completedAt: new Date(),
            score,
            totalQuestions: quiz.questions.length,
            gapNodes: gapAnalysis.gapNodes.map(n => n.nodeId),
            strongNodes: gapAnalysis.strongNodes.map(n => n.nodeId),
            recommendedPath: gapAnalysis.recommendedPath,
          },
        },
      },
      { upsert: true, new: true } // Creates enrollment if they just started
    );

    // 4. Return results including the AI's friendly explanation
    return NextResponse.json({
      success: true,
      score,
      gapAnalysis,
      explanation: gapAnalysis.explanation,
    });

  } catch (error: any) {
    console.error("Diagnostic POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
