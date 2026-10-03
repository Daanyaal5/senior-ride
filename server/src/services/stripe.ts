import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

/**
 * Creates a Stripe Checkout page for one booking and returns its web address.
 * Stripe takes amounts in cents, so dollars are multiplied by 100 and rounded.
 * The booking reference is stored on the payment so the webhook knows which booking was paid.
 */
export async function createCheckoutSession(reference: string, totalDollars: number, email: string): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: [{
      quantity: 1,
      price_data: { currency: "cad", unit_amount: Math.round(totalDollars * 100), product_data: { name: `Senior Ride booking ${reference}` } },
    }],
    metadata: { reference },
    success_url: `${process.env.CLIENT_ORIGIN}/confirmation?ref=${reference}`,
    cancel_url: `${process.env.CLIENT_ORIGIN}/book?cancelled=1`,
  });
  return session.url as string;
}