import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import connectDB from "@/lib/mongodb";
import Enrollment from "@/models/Enrollment";
import Course from "@/models/Course";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");
    const courseId = searchParams.get("course_id");

    if (!sessionId || !courseId) {
      return new NextResponse("Missing parameters", { status: 400 });
    }

    const authSession = await getSession();
    if (!authSession?.user) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/sign-in`);
    }

    // Verify session with Stripe
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (stripeSession.payment_status !== "paid") {
      return new NextResponse("Payment not successful", { status: 400 });
    }

    await connectDB();

    // Ensure the enrollment doesn't already exist (in case webhook already fired)
    const existingEnrollment = await Enrollment.findOne({
      userId: authSession.user.id,
      courseId: courseId,
    });

    if (!existingEnrollment) {
      // Create it manually
      await Enrollment.create({
        userId: authSession.user.id,
        courseId: courseId,
        stripeSessionId: sessionId,
        stripePaymentId: stripeSession.payment_intent as string,
        status: "active",
      });

      // Increment enrollment count
      await Course.findByIdAndUpdate(courseId, {
        $inc: { enrollmentCount: 1 },
      });
    }

    // Redirect user to the diagnostic quiz
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/learn/${courseId}/quiz/diagnostic`);
  } catch (error) {
    console.error("[CHECKOUT_SUCCESS_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
