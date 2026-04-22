import { requireAuth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import { notFound, redirect } from "next/navigation";
import LearningClient from "./learning-client"; // We will separate the client UI to manage the panes

export default async function LearningInterfacePage({ params }: { params: { courseId: string, lessonId: string } }) {
  const session = await requireAuth();
  await connectDB();

  // Validate Enrollment securely
  const enrollment = await Enrollment.findOne({
    userId: session?.user?.id,
    courseId: params.courseId
  }).lean();

  if (!enrollment && session?.user?.role !== "admin") {
    // Basic protection against direct URL guessing without purchasing
    redirect(`/courses/${params.courseId}`);
  }

  // Fetch full Course mapping
  const course = await Course.findById(params.courseId).lean();
  if (!course) notFound();

  // Find active Lesson
  let activeLesson = null;
  let activeModuleIndex = 0;
  for (let i = 0; i < (course.modules?.length || 0); i++) {
    const mod = course.modules[i];
    const found = (mod as any).lessons.find((l: any) => l._id?.toString() === params.lessonId || l.id === params.lessonId);
    if (found) {
      activeLesson = found;
      activeModuleIndex = i;
      break;
    }
  }

  // If lessonId is literally "diagnostic", bypass structure and let client render diagnostic intro.
  // We'll assume the URL /learn/{courseId}/diagnostic redirects to /quiz/diagnostic directly instead of here.
  if (params.lessonId === "diagnostic") {
    redirect(`/learn/${params.courseId}/quiz/diagnostic`);
  }

  // Serialize DB objects
  const safeCourse = {
    _id: course._id.toString(),
    title: course.title,
    modules: course.modules?.map((m: any) => ({
      ...m,
      _id: undefined, // ensure cleanliness
      lessons: m.lessons?.map((l: any) => ({
        ...l,
        id: l._id?.toString() || l.id,
        _id: undefined
      }))
    }))
  };

  const safeDiagnosticResult = enrollment?.diagnosticResult || null;
  const safeProgress = enrollment?.lessonProgress?.map((p: any) => p.lessonId.toString()) || [];

  return (
    <div className="h-[calc(100vh-4rem)] max-h-screen overflow-hidden bg-dark">
      <LearningClient 
        course={safeCourse} 
        activeLesson={{ ...activeLesson, id: activeLesson?._id?.toString() || activeLesson?.id }} 
        completedLessonIds={safeProgress}
        gapNodes={safeDiagnosticResult?.gapNodes || []}
      />
    </div>
  );
}
