import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Enrollment from "@/models/Enrollment";
import Course from "@/models/Course";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getSession();
    if (session?.user?.role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    await connectDB();

    const [totalUsers, totalCourses, totalEnrollments, enrollments] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments({ isPublished: true }),
      Enrollment.countDocuments(),
      Enrollment.find().select("courseId quizAttempts lessonProgress diagnosticResult enrolledAt").lean(),
    ]);

    // Revenue (sum of all stripe payments — approximated from enrollment * course price)
    const coursePrices: Record<string, number> = {};
    const courses = await Course.find().select("_id price isFree").lean() as any[];
    courses.forEach((c: any) => { coursePrices[c._id.toString()] = c.isFree ? 0 : c.price; });

    const totalRevenueCents = (enrollments as any[]).reduce((sum, e) => {
      return sum + (coursePrices[e.courseId?.toString()] ?? 0);
    }, 0);

    // Enrollments per day for last 30 days
    const enrollmentsByDay: Record<string, number> = {};
    const now = Date.now();
    (enrollments as any[]).forEach((e) => {
      const d = new Date(e.enrolledAt ?? now).toISOString().split("T")[0];
      enrollmentsByDay[d] = (enrollmentsByDay[d] ?? 0) + 1;
    });
    const enrollmentTrend = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now - (29 - i) * 86400000).toISOString().split("T")[0];
      return { date: d.slice(5), enrollments: enrollmentsByDay[d] ?? 0 };
    });

    // Avg quiz score per course
    const scoresByCourse: Record<string, number[]> = {};
    (enrollments as any[]).forEach((e) => {
      const cid = e.courseId?.toString();
      if (!cid) return;
      (e.quizAttempts ?? []).forEach((qa: any) => {
        if (!scoresByCourse[cid]) scoresByCourse[cid] = [];
        scoresByCourse[cid].push(qa.score);
      });
    });
    const courseScores = await Promise.all(
      Object.entries(scoresByCourse).map(async ([cid, scores]) => {
        const course = await Course.findById(cid).select("title").lean() as any;
        return {
          title: course?.title?.slice(0, 20) ?? "Unknown",
          avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        };
      })
    );

    // Most common gap nodes
    const gapCount: Record<string, number> = {};
    (enrollments as any[]).forEach((e) => {
      (e.diagnosticResult?.gapNodes ?? []).forEach((n: string) => {
        gapCount[n] = (gapCount[n] ?? 0) + 1;
      });
    });
    const topGaps = Object.entries(gapCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([node, count]) => ({ node, count }));

    return NextResponse.json({
      summary: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalRevenue: totalRevenueCents / 100,
      },
      enrollmentTrend,
      courseScores,
      topGaps,
    });
  } catch (err) {
    console.error("[ADMIN_ANALYTICS]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
