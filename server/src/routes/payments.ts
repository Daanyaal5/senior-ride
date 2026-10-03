import { Request, Response } from "express";
import Stripe from "stripe";
import { stripe } from "../services/stripe.js";
import { markPaid } from "../db/bookingsRepo.js";

/** Stripe calls this URL after a payment. We check its signature, then mark the booking as paid. */
export async function stripeWebhook(req: Request, res: Response) {
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.header("stripe-signature") as string, process.env.STRIPE_WEBHOOK_SECRET as string);
  } catch {
    return res.status(400).send("Invalid signature"); // not really from Stripe
  }
  if (event.type === "checkout.session.completed") {
    const reference = (event.data.object as Stripe.Checkout.Session).metadata?.reference;
    if (reference) await markPaid(reference);
  }
  res.json({ received: true });
}