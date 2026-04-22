import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Enrollment from "@/models/Enrollment";
import Course from "@/models/Course";
import mongoose from "mongoose";

// ─── GET /api/progress — Full learning analytics for the current user ──────────

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectDB();

    const enrollments = await Enrollment.find({
      userId: new mongoose.Types.ObjectId(session.user.id),
    })
      .populate({ path: "courseId", model: Course, select: "title thumbnail slug category" })
      .lean();

    // Compute learning streak (consecutive days with lesson activity)
    const allLessonDates = enrollments
      .flatMap((e: any) => e.lessonProgress ?? [])
      .map((lp: any) => new Date(lp.completedAt).toDateString());
    const uniqueDays = Array.from(new Set(allLessonDates)).sort();
    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (uniqueDays.includes(today) || uniqueDays.includes(yesterday)) {
      for (let i = uniqueDays.length - 1; i >= 0; i--) {
        const day = new Date(uniqueDays[i]);
        const expected = new Date(Date.now() - (uniqueDays.length - 1 - i) * 86400000);
        if (day.toDateString() === expected.toDateString()) streak++;
        else break;
      }
    }

    // Build per-course analytics
    const courses = enrollments.map((e: any) => ({
      courseId: e.courseId?._id ?? e.courseId,
      title: e.courseId?.title ?? "Unknown Course",
      thumbnail: e.courseId?.thumbnail ?? null,
      slug: e.courseId?.slug ?? "",
      category: e.courseId?.category ?? "",
      completionPercentage: e.completionPercentage ?? 0,
      status: e.status,
      enrolledAt: e.enrolledAt,
      completedAt: e.completedAt ?? null,
      lessonsCompleted: (e.lessonProgress ?? []).length,
      totalTimeSpent: (e.lessonProgress ?? []).reduce((sum: number, lp: any) => sum + (lp.timeSpent ?? 0), 0),
      quizAttempts: (e.quizAttempts ?? []).map((qa: any) => ({
        quizId: qa.quizId,
        score: qa.score,
        completedAt: qa.completedAt,
      })),
      diagnosticResult: e.diagnosticResult ?? null,
      gapNodes: e.diagnosticResult?.gapNodes ?? [],
      strongNodes: e.diagnosticResult?.strongNodes ?? [],
    }));

    // Activity heatmap — count lessons completed per day for last 52 weeks
    const heatmapMap: Record<string, number> = {};
    enrollments.forEach((e: any) => {
      (e.lessonProgress ?? []).forEach((lp: any) => {
        const key = new Date(lp.completedAt).toISOString().split("T")[0];
        heatmapMap[key] = (heatmapMap[key] ?? 0) + 1;
      });
    });

    const totalLessons = courses.reduce((s, c) => s + c.lessonsCompleted, 0);
    const totalHours = Math.round(courses.reduce((s, c) => s + c.totalTimeSpent, 0) / 60);
    const avgScore = (() => {
      const allScores = courses.flatMap((c) => c.quizAttempts.map((q: any) => q.score));
      return allScores.length ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;
    })();

    return NextResponse.json({
      summary: { totalLessons, totalHours, streak, avgScore, coursesEnrolled: courses.length },
      courses,
      heatmap: heatmapMap,
    });
  } catch (err) {
    console.error("[PROGRESS_GET]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
