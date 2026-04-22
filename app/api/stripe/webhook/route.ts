import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import connectDB from "@/lib/mongodb";
import Enrollment from "@/models/Enrollment";
import Course from "@/models/Course";

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
      await Enrollment.create({
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
    }
  }

  return new NextResponse(null, { status: 200 });
}
