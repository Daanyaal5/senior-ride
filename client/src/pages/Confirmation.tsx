import { Link, useSearchParams } from "react-router-dom";

/** Shown after Stripe sends the customer back. The summary was saved in the browser before payment. */
export default function Confirmation() {
  const ref = useSearchParams()[0].get("ref");
  const saved = JSON.parse(sessionStorage.getItem("lastBooking") ?? "null");
  const s = saved && saved.reference === ref ? saved : null; // only trust it if it matches this booking

  const when = s && (s.asap ? "As soon as possible" : new Date(s.scheduledTime).toLocaleString("en-CA", { dateStyle: "full", timeStyle: "short" }));

  return (
    <main className="page">
      <h1>Thank you{s ? `, ${s.name.split(" ")[0]}` : ""}. Your ride is booked and paid.</h1>
      <p>Booking reference: <strong>{ref}</strong></p>
      {s && (
        <dl className="summary">
          <div><dt>When</dt><dd>{when}</dd></div>
          <div><dt>Pickup</dt><dd>{s.pickup.address}</dd></div>
          <div><dt>Destination</dt><dd>{s.dropoff.address}</dd></div>
          <div><dt>Driver language</dt><dd>{s.language}</dd></div>
          <div><dt>Extra Care</dt><dd>{s.extraCare ? "Yes" : "No"}</dd></div>
          <div><dt>Amount paid</dt><dd>${s.fare.total.toFixed(2)}</dd></div>
        </dl>
      )}
      <p>We will call you to confirm your driver.</p>
      <Link className="button" to="/">Back to home</Link>
    </main>
  );
}
