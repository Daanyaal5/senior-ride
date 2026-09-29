import { Link, useLocation } from "react-router-dom";

/** Shown after a successful booking. Details arrive through the router state. */
export default function Confirmation() {
  const s = useLocation().state as any;
  if (!s) return <main className="page"><p>No booking found. <Link to="/book">Book a ride</Link></p></main>;

  const when = s.asap ? "As soon as possible" : new Date(s.scheduledTime).toLocaleString("en-CA", { dateStyle: "full", timeStyle: "short" });

  return (
    <main className="page">
      <h1>Your ride is booked, {s.name.split(" ")[0]}.</h1>
      <p>Booking reference: <strong>{s.reference}</strong></p>
      <dl className="summary">
        <div><dt>When</dt><dd>{when}</dd></div>
        <div><dt>Pickup</dt><dd>{s.pickup.address}</dd></div>
        <div><dt>Destination</dt><dd>{s.dropoff.address}</dd></div>
        <div><dt>Driver language</dt><dd>{s.language}</dd></div>
        <div><dt>Extra Care</dt><dd>{s.extraCare ? "Yes" : "No"}</dd></div>
        <div><dt>Estimated fare</dt><dd>${s.fare.total.toFixed(2)}</dd></div>
      </dl>
      <p>We will call you to confirm your driver.</p>
      <Link className="button" to="/">Back to home</Link>
    </main>
  );
}
