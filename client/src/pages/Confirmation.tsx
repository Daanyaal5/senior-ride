import { Link, useSearchParams } from "react-router-dom";
import ContactOptions from "../components/ContactOptions";
import { ETRANSFER_EMAIL } from "../utils/brand";

/** Shown after booking. The summary was saved in the browser by the booking page. */
export default function Confirmation() {
  const ref = useSearchParams()[0].get("ref");
  const saved = JSON.parse(sessionStorage.getItem("lastBooking") ?? "null");
  const s = saved && saved.reference === ref ? saved : null; // only trust it if it matches this booking

  if (!s) {
    return <main className="page"><h1>Booking {ref}</h1><p>Your booking details are in your email.</p><ContactOptions /></main>;
  }

  const when = new Date(s.when).toLocaleString("en-CA", { dateStyle: "full", timeStyle: "short" });
  const total = `$${s.fare.total.toFixed(2)}`;

  return (
    <main className="page">
      {(s.payment === "card" || s.payment === "applepay") && (
        <h1>Thank you, {s.name.split(" ")[0]}. Your ride is booked and paid.</h1>
      )}
      {s.payment === "cash" && (
        <>
          <h1>Thank you, {s.name.split(" ")[0]}. We will call you to confirm your ride.</h1>
          <div className="etransfer-note"><p>Please pay <strong>{total}</strong> in cash to the driver when you reach your destination.</p></div>
        </>
      )}
      {s.payment === "etransfer" && (
        <>
          <h1>Almost done, {s.name.split(" ")[0]}. Please send your e-Transfer.</h1>
          <div className="etransfer-note">
            <p>Send <strong>{total}</strong> by Interac e-Transfer to <strong>{ETRANSFER_EMAIL}</strong></p>
            <p>Message: <strong>{s.reference}</strong></p>
            <p>Your ride is confirmed once we receive it.</p>
          </div>
        </>
      )}
      <p>Booking code: <strong>{s.reference}</strong></p>
      <dl className="summary">
        <div><dt>When</dt><dd>{when}</dd></div>
        <div><dt>Pickup</dt><dd>{s.pickup.address}</dd></div>
        <div><dt>Drop-off</dt><dd>{s.dropoff.address}</dd></div>
        <div><dt>Total (tax included)</dt><dd>{total}</dd></div>
      </dl>
      <p className="warning">Waiting time: $20 for every 30 minutes the driver waits.</p>
      <p>We have emailed you these details. Questions or changes? Contact us any time.</p>
      <ContactOptions />
      <Link className="button" to="/">Back to home</Link>
    </main>
  );
}