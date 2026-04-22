import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import { createCheckoutSession } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { courseId } = await req.json();

    if (!courseId) {
      return new NextResponse("Course ID is required", { status: 400 });
    }

    await connectDB();

    const course = await Course.findById(courseId);
    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      userId: session.user.id,
      courseId: course._id,
    });

    if (existingEnrollment) {
      return new NextResponse("Already enrolled", { status: 400 });
    }

    const checkoutUrl = await createCheckoutSession({
      courseId: course._id.toString(),
      userId: session.user.id,
      price: course.price,
      courseTitle: course.title,
      courseThumbnail: course.thumbnail,
      successUrl: `${process.env.NEXTAUTH_URL}/learn/${course._id}/quiz/diagnostic`,
      cancelUrl: `${process.env.NEXTAUTH_URL}/courses/${course.slug}`,
      customerEmail: session.user.email,
    });

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error("[STRIPE_CHECKOUT]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
