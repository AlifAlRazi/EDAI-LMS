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
    // For MVP frontend we'll mock the diagnostic quiz pull by seeing if User has an existing record
    // Or we'd cleanly call GET /api/quiz/diagnostic
    quizData = {
      _id: "diagnostic",
      title: "Course Diagnostic Test",
      type: "diagnostic",
      questions: [
        {
          _id: "q1",
          questionText: "Which is true about AI?",
          options: ["It learns completely on its own", "It relies on algorithms and data", "It is magic", "All of the above"],
          type: "mcq"
        },
        {
          _id: "q2",
          questionText: "Knowledge Graphs represent relationships between entities.",
          options: ["True", "False"],
          type: "true-false"
        }
      ]
    };
  } else {
    const rawQuiz = await Quiz.findById(params.quizId).lean();
    if (!rawQuiz) notFound();
    quizData = JSON.parse(JSON.stringify(rawQuiz)); // stringify objectIds
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
