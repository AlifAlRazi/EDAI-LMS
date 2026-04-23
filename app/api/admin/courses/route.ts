import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Course from "@/models/Course";


export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (session?.user?.role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { title, description } = await req.json();

    if (!title || !description) {
      return new NextResponse("Title and description are required", { status: 400 });
    }

    await connectDB();

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") + "-" + Math.floor(Math.random() * 1000);

    const course = await Course.create({
      title,
      description,
      slug,
      instructor: session.user.id,
      category: "Uncategorized",
      level: "beginner",
      isPublished: false,
      isFree: false,
      price: 0,
      modules: [],
      knowledgeNodes: [],
    });

    return NextResponse.json({ courseId: course._id });
  } catch (err) {
    console.error("[CREATE_COURSE_ERROR]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
