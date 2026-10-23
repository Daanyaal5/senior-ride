import { FareBreakdown, Place } from "./fare.js";
import { sendEmail } from "./email.js";
import { WAIT_FEE_PER_30_MIN } from "../config/pricing.js";

export interface Booking {
  reference: string;
  name: string; phone: string; familyPhone: string; email: string;
  pickup: Place; dropoff: Place;
  when: string;              // readable date and time, e.g. "Saturday, October 24, 2026 at 9:00 a.m."
  flightNumber: string; language: string; notes: string;
  payment: "card" | "applepay" | "etransfer" | "cash";
  fare: FareBreakdown;
}

const money = (n: number) => `$${n.toFixed(2)}`;

const PAYMENT_LABEL: Record<Booking["payment"], string> = {
  card: "Paid by card (Square)",
  applepay: "Paid by Apple Pay (Square)",
  etransfer: "Interac e-Transfer: NOT YET RECEIVED",
  cash: "CASH to the driver at the destination",
};
const STATUS: Record<Booking["payment"], string> = {
  card: "PAID", applepay: "PAID", etransfer: "WAITING FOR E-TRANSFER", cash: "CASH ON ARRIVAL: CALL TO CONFIRM",
};

// Customer text is escaped so nobody can inject HTML into the business's inbox.
const esc = (s: string) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** The booking details as a simple two-column table, shared by both emails. */
function detailsTable(b: Booking): string {
  const rows: [string, string][] = [
    ["Reference", b.reference],
    ["When", b.when],
    ["Pickup", b.pickup.address],
    ["Drop-off", b.dropoff.address],
    ["Passenger", b.name],
    ["Phone", b.phone],
    ["Family contact", b.familyPhone || "None"],
    ["Email", b.email],
    ["Flight number", b.flightNumber || "None"],
    ["Urgent ride", b.fare.urgentFee ? "YES" : "No"],
    ["Extra Care", b.fare.extraCareHours ? `${b.fare.extraCareHours} hour(s)` : "No"],
    ["Driver language", b.language],
    ["Notes", b.notes || "None"],
    ["Total (tax included)", money(b.fare.total)],
    ["Payment", PAYMENT_LABEL[b.payment]],
  ];
  return `<table cellpadding="6" style="border-collapse:collapse;font-size:16px">${rows
    .map(([k, v]) => `<tr><td style="border:1px solid #ccc"><b>${k}</b></td><td style="border:1px solid #ccc">${esc(v)}</td></tr>`)
    .join("")}</table>`;
}

/** Tells the business about a new booking. Replying goes straight to the customer. */
export function emailBusiness(b: Booking) {
  const status = (b.fare.urgentFee ? "URGENT, " : "") + STATUS[b.payment];
  return sendEmail(
    process.env.BUSINESS_EMAIL as string,
    `New booking ${b.reference} (${status}): ${b.when}`,
    `<h2>New booking: ${status}</h2>${detailsTable(b)}`,
    b.email
  );
}

/** Confirms the booking to the customer. For e-Transfer, it explains exactly how to pay. */
export function emailCustomer(b: Booking) {
  const etransfer = `
    <h3>Please send your Interac e-Transfer</h3>
    <p>Amount: <b>${money(b.fare.total)}</b><br>Send to: <b>${esc(process.env.ETRANSFER_EMAIL ?? "")}</b><br>Message: <b>${b.reference}</b></p>
    <p>Your ride is confirmed once we receive your payment.</p>`;
  const paid = `<p>Your payment of <b>${money(b.fare.total)}</b> was received. Your ride is booked.</p>`;
  const cash = `<p>Please pay <b>${money(b.fare.total)}</b> in cash to the driver when you reach your destination. We will call you to confirm your ride.</p>`;
  const waiting = `<p style="color:#b00020"><b>Waiting time: $${WAIT_FEE_PER_30_MIN} for every 30 minutes the driver waits.</b></p>`;
  return sendEmail(
    b.email,
    `Your booking ${b.reference}`,
    `<p>Hello ${esc(b.name.split(" ")[0])},</p>
     <p>Thank you for booking with us.</p>
     ${b.payment === "etransfer" ? etransfer : b.payment === "cash" ? cash : paid}
     ${waiting}
     ${detailsTable(b)}
     <p>Questions or changes? Call or WhatsApp ${esc(process.env.BUSINESS_PHONE ?? "")}, or reply to this email. We are available 24/7.</p>`,
    process.env.BUSINESS_EMAIL
  );
}