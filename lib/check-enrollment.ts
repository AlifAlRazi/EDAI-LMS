import connectDB from "./mongodb";
import Enrollment from "@/models/Enrollment";
import mongoose from "mongoose";

/**
 * Checks if a specific user holds an active enrollment for a given course.
 * Extremely fast server-side gate used by lesson/learning access API routes.
 */
export async function checkEnrollment(userId: string, courseId: string | mongoose.Types.ObjectId): Promise<boolean> {
  if (!userId || !courseId) return false;
  
  await connectDB();
  const enr = await Enrollment.findOne({
    userId,
    courseId
  }).select("_id").lean();
  
  return !!enr;
}
