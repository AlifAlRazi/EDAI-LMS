import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Course from "@/models/Course";

export async function PATCH(req: Request, { params }: { params: { courseId: string } }) {
  try {
    const session = await getSession();
    if (session?.user?.role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await req.json();
    await connectDB();

    // Find and update the course
    const course = await Course.findByIdAndUpdate(
      params.courseId,
      {
        $set: {
          title: body.title,
          description: body.description,
          price: body.price,
          isFree: body.isFree,
          level: body.level,
          thumbnail: body.thumbnail,
          isPublished: body.isPublished,
          modules: body.modules || [], // Simplified for prototype: normally we'd separate module docs
          knowledgeNodes: body.knowledgeNodes || [],
        }
      },
      { new: true }
    );

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("[COURSE_UPDATE_ERROR]", error);
    return new NextResponse(error instanceof Error ? error.message : "Internal Server Error", { status: 500 });
  }
}
