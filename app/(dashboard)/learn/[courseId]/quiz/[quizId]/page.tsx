import { requireAuth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Quiz from "@/models/Quiz";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import { notFound } from "next/navigation";
import QuizClient from "./quiz-client";

export default async function QuizPage({ params }: { params: { courseId: string, quizId: string } }) {
  const session = await requireAuth();
  await connectDB();

  const course = await Course.findById(params.courseId).select("title").lean();
  if (!course) notFound();

  let quizData = null;

  if (params.quizId === "diagnostic") {
    // 1. Check if a diagnostic quiz already exists for this course
    const existingQuiz = await Quiz.findOne({ courseId: params.courseId, type: "diagnostic" }).lean();
    
    if (existingQuiz) {
      quizData = JSON.parse(JSON.stringify(existingQuiz));
    } else {
      // 2. Dynamically generate exactly 10 questions using RAG
      const courseNodes = course.knowledgeNodes || [];
      
      // If no nodes, create a generic fallback node
      const safeNodes = courseNodes.length > 0 ? courseNodes : [{ id: "general", label: course.title || "Course Topic", difficulty: "intermediate" }];
      
      // Build exactly 10 testing slots, cycling through available nodes if needed
      const nodesToTest = Array.from({ length: 10 }, (_, i) => safeNodes[i % safeNodes.length]);
      
      const { generateAdaptiveQuestion } = await import("@/lib/rag");
      
      const generatedQuestions = await Promise.all(
        nodesToTest.map(async (node: any, index: number) => {
          try {
            const q = await generateAdaptiveQuestion({
              courseId: params.courseId,
              nodeId: node.id || `node-${index}`,
              difficulty: node.difficulty || course.level || "intermediate",
              topic: node.label || node.id,
            });
            return {
              questionText: q.questionText,
              type: q.type || "mcq",
              options: q.options || [],
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
              knowledgeNodeId: node.id || "general",
            };
          } catch (e) {
            console.error("Failed to generate question for node:", node.id, e);
            return null;
          }
        })
      );

      const validQuestions = generatedQuestions.filter((q): q is NonNullable<typeof q> => q !== null);

      // Create and save the new quiz
      const newQuiz = await Quiz.create({
        courseId: params.courseId,
        type: "diagnostic",
        title: `${course.title} — Diagnostic Assessment`,
        questions: validQuestions.length > 0 ? validQuestions : [
          {
            questionText: "What is the primary goal of this course?",
            type: "mcq",
            options: ["Learning", "Sleeping", "Eating", "Running"],
            correctAnswer: "Learning",
            explanation: "Fallback question.",
            knowledgeNodeId: "general"
          }
        ],
      });

      quizData = JSON.parse(JSON.stringify(newQuiz));
    }
  } else {
    const rawQuiz = await Quiz.findById(params.quizId).lean();
    if (!rawQuiz) notFound();
    quizData = JSON.parse(JSON.stringify(rawQuiz));
  }

  // Pre-check if they already completed this (in a real app we'd redirect or show history)
  const enrollment = await Enrollment.findOne({ userId: session?.user?.id, courseId: params.courseId }).lean();
  const pastResult = params.quizId === "diagnostic" ? enrollment?.diagnosticResult : undefined;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-dark flex flex-col items-center justify-center py-12 px-6">
      <QuizClient 
        courseId={params.courseId} 
        quiz={quizData} 
        pastResult={pastResult} 
      />
    </div>
  );
}
