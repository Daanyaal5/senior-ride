import crypto from "crypto";

// Square's API, called directly with fetch. Docs: https://developer.squareup.com/reference/square
const BASE_URL = () =>
  process.env.SQUARE_ENVIRONMENT === "production" ? "https://connect.squareup.com" : "https://connect.squareupsandbox.com";
const SQUARE_VERSION = "2026-09-16";

/** Square takes amounts in cents, so dollars are multiplied by 100 and rounded. */
const cents = (dollars: number) => Math.round(dollars * 100);

/** Sends one request to Square and returns the JSON. Throws with Square's own explanation if it fails. */
async function square<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(BASE_URL() + path, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
      "Square-Version": SQUARE_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as any;
  if (!res.ok) throw new Error(data.errors?.[0]?.detail ?? `Square error ${res.status}`);
  return data as T;
}

/**
 * Charges the booking total to the card the customer just entered, then saves the card in Square
 * so extra waiting time can be charged later from the Square Dashboard.
 * The booking details go in the payment note, so you can see them in Square too.
 * Square emails the customer a receipt.
 */
export async function chargeAndSaveCard(opts: {
  reference: string; amount: number; token: string; name: string; email: string; note: string; saveCard: boolean;
}): Promise<void> {
  const [givenName, ...rest] = opts.name.trim().split(/\s+/);

  const { customer } = await square<{ customer: { id: string } }>("/v2/customers", {
    idempotency_key: crypto.randomUUID(),
    given_name: givenName,
    family_name: rest.join(" ") || undefined,
    email_address: opts.email,
    reference_id: opts.reference,
  });

  // The key comes from the booking and the card token, so a double-click can never charge twice.
  const tokenHash = crypto.createHash("sha256").update(opts.token).digest("hex").slice(0, 16);
  const { payment } = await square<{ payment: { id: string; status: string } }>("/v2/payments", {
    idempotency_key: `${opts.reference}-${tokenHash}`,
    source_id: opts.token,
    amount_money: { amount: cents(opts.amount), currency: "CAD" },
    customer_id: customer.id,
    location_id: process.env.SQUARE_LOCATION_ID,
    autocomplete: true,
    reference_id: opts.reference,
    buyer_email_address: opts.email,
    note: opts.note.slice(0, 500), // Square allows up to 500 characters
  });
  if (payment.status !== "COMPLETED") throw new Error(`Payment status: ${payment.status}`);

  // Save the card (not possible for Apple Pay). If this fails, the payment still went through, so we don't fail the booking.
  if (!opts.saveCard) return;
  try {
    await square("/v2/cards", { idempotency_key: crypto.randomUUID(), source_id: payment.id, card: { customer_id: customer.id } });
  } catch (e) {
    console.error(`Card could not be saved for ${opts.reference}:`, (e as Error).message);
  }
}