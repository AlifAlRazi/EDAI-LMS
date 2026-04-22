import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Enrollment from "@/models/Enrollment";
import mongoose from "mongoose";

// PATCH /api/progress/quiz — Record a quiz attempt result
export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { courseId, quizId, score, answers = [], isDiagnostic = false, diagnosticResult } = await req.json();
    if (!courseId || !quizId || score === undefined) {
      return new NextResponse("courseId, quizId, and score required", { status: 400 });
    }

    await connectDB();

    const enrollment = await Enrollment.findOne({
      userId: new mongoose.Types.ObjectId(session.user.id),
      courseId: new mongoose.Types.ObjectId(courseId),
    });

    if (!enrollment) return new NextResponse("Enrollment not found", { status: 404 });

    // Append quiz attempt
    enrollment.quizAttempts = [
      ...(enrollment.quizAttempts ?? []),
      { quizId, score, answers, completedAt: new Date() },
    ];

    // If this is the diagnostic quiz, also save the full diagnostic result
    if (isDiagnostic && diagnosticResult) {
      enrollment.diagnosticResult = {
        completedAt: new Date(),
        score: diagnosticResult.score,
        totalQuestions: diagnosticResult.totalQuestions,
        gapNodes: diagnosticResult.gapNodes ?? [],
        strongNodes: diagnosticResult.strongNodes ?? [],
        recommendedPath: diagnosticResult.recommendedPath ?? [],
      };
    }

    await enrollment.save();

    return NextResponse.json({ ok: true, score });
  } catch (err) {
    console.error("[PROGRESS_QUIZ]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
