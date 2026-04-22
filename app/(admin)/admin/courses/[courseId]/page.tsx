import { requireAdmin } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Course from "@/models/Course";
import CourseEditorClient from "./course-editor-client";
import { notFound } from "next/navigation";

export default async function CourseEditorPage({ params }: { params: { courseId: string } }) {
  await requireAdmin();
  await connectDB();

  let course = null;
  if (params.courseId === "new") {
    // Scaffold empty course
    course = {
      _id: "new",
      title: "",
      slug: "",
      description: "",
      thumbnail: "",
      isFree: true,
      price: 0,
      level: "beginner",
      category: "",
      tags: [],
      prerequisites: [],
      modules: [],
      knowledgeNodes: [],
      isPublished: false,
    };
  } else {
    // If we have populated modules or knowledge nodes, ensure they are converted to strings/POJOs for the client
    const rawCourse = await Course.findById(params.courseId).lean();
    if (!rawCourse) return notFound();
    
    // Stringify ObjectIDs
    course = {
      ...rawCourse,
      _id: rawCourse._id.toString(),
      instructor: typeof rawCourse.instructor === 'object' ? rawCourse.instructor.toString() : rawCourse.instructor,
      // Stringify recursive subdocs if populated (we didn't populate here, so they are just strings/arrays)
    };
  }

  return (
    <div className="max-w-6xl mx-auto">
      <CourseEditorClient initialData={course} />
    </div>
  );
}
