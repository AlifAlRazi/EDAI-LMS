import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-03-25.dahlia",
  typescript: true,
});

export async function createCheckoutSession({
  courseId,
  userId,
  price,
  courseTitle,
  courseThumbnail,
  successUrl,
  cancelUrl,
  customerEmail,
}: {
  courseId: string;
  userId: string;
  price: number;
  courseTitle: string;
  courseThumbnail?: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string | null;
}) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    customer_email: customerEmail || undefined,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: courseTitle,
            images: courseThumbnail ? [courseThumbnail] : [],
            description: "Full lifetime access to this EdAI generated course.",
          },
          unit_amount: Math.round(price * 100), // convert dollars to cents
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      courseId,
      userId,
    },
  });

  return session.url;
}

export function constructWebhookEvent(body: string | Buffer, signature: string) {
  return stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET || ""
  );
}
