import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import connectDB from "@/lib/mongodb";
import Enrollment from "@/models/Enrollment";
import Course from "@/models/Course";
import User from "@/models/User";
import { sendEnrollmentConfirmation } from "@/lib/email";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    if (!session?.metadata?.userId || !session?.metadata?.courseId) {
      return new NextResponse("Webhook Error: Missing metadata", { status: 400 });
    }

    await connectDB();

    // Idempotency: skip if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      userId: session.metadata.userId,
      courseId: session.metadata.courseId,
    });

    if (!existingEnrollment) {
      const enrollment = await Enrollment.create({
        userId: session.metadata.userId,
        courseId: session.metadata.courseId,
        stripeSessionId: session.id,
        stripePaymentId: session.payment_intent as string,
        status: "active",
      });

      // Increment enrollment count in Course
      await Course.findByIdAndUpdate(session.metadata.courseId, {
        $inc: { enrollmentCount: 1 },
      });

      // Send enrollment confirmation email (non-blocking)
      try {
        const [user, course] = await Promise.all([
          User.findById(session.metadata.userId).select("name email").lean() as any,
          Course.findById(session.metadata.courseId).select("title slug thumbnail price isFree").lean() as any,
        ]);

        if (user && course) {
          await sendEnrollmentConfirmation(
            { name: user.name, email: user.email },
            course,
            { _id: enrollment._id.toString(), courseId: session.metadata.courseId }
          );
        }
      } catch (emailErr) {
        // Email failures should never break enrollment
        console.error("[WEBHOOK_EMAIL_ERROR]", emailErr);
      }
    }
  }

  return new NextResponse(null, { status: 200 });
}
