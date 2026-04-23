import { requireAdmin } from "@/lib/auth";
import NewCourseClient from "./new-course-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Course | Admin",
};

export default async function NewCoursePage() {
  await requireAdmin();
  return <NewCourseClient />;
}
