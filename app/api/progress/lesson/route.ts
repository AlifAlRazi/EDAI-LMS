import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Enrollment from "@/models/Enrollment";
import mongoose from "mongoose";

// PATCH /api/progress/lesson — Mark a lesson as complete
export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { courseId, lessonId, timeSpent = 0 } = await req.json();
    if (!courseId || !lessonId) return new NextResponse("courseId and lessonId required", { status: 400 });

    await connectDB();

    const enrollment = await Enrollment.findOne({
      userId: new mongoose.Types.ObjectId(session.user.id),
      courseId: new mongoose.Types.ObjectId(courseId),
    });

    if (!enrollment) return new NextResponse("Enrollment not found", { status: 404 });

    // Idempotent: only add if not already completed
    const alreadyDone = enrollment.lessonProgress?.some((lp: any) => lp.lessonId === lessonId);
    if (!alreadyDone) {
      enrollment.lessonProgress = [...(enrollment.lessonProgress ?? []), {
        lessonId,
        completedAt: new Date(),
        timeSpent,
      }];
      enrollment.currentLessonId = lessonId;
      // Re-calculate completion % — simplified estimate
      const total = enrollment.lessonProgress.length;
      enrollment.completionPercentage = Math.min(99, total * 10); // will be corrected by full total
      await enrollment.save();
    }

    return NextResponse.json({ ok: true, lessonsCompleted: enrollment.lessonProgress.length });
  } catch (err) {
    console.error("[PROGRESS_LESSON]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
