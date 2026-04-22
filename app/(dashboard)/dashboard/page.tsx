import { requireAuth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Enrollment from "@/models/Enrollment";
import Course from "@/models/Course";
import DashboardClient from "./dashboard-client";

export default async function StudentDashboardPage() {
  const session = await requireAuth();
  await connectDB();

  // Fetch student's enrollments mapped with their courses
  const enrollments = await Enrollment.find({ userId: session?.user?.id })
    .populate({
      path: "courseId",
      model: Course,
      select: "title slug thumbnail level category",
    })
    .lean();

  // Fix ObjectIds for client propagation
  const safeEnrollments = enrollments.map((enr: any) => ({
    ...enr,
    _id: enr._id.toString(),
    userId: enr.userId.toString(),
    courseId: {
      ...enr.courseId,
      _id: enr.courseId._id.toString()
    }
  }));

  return (
    <div className="container mx-auto px-6 py-8">
      <DashboardClient userName={session?.user?.name || "Student"} enrollments={safeEnrollments} />
    </div>
  );
}
