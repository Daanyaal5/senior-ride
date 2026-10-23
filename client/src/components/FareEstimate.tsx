import { FareBreakdown } from "../types";

const money = (n: number) => `$${n.toFixed(2)}`;

/** The price, itemised. Tax is already included. */
export default function FareEstimate({ fare }: { fare: FareBreakdown }) {
  return (
    <section className="fare" aria-live="polite" aria-label="Your price">
      <h2>Your price: {money(fare.total)}</h2>
      <p>{fare.route}. Tax included.</p>
      <dl>
        <div><dt>Trip</dt><dd>{money(fare.tripFare)}</dd></div>
        {fare.urgentFee > 0 && <div><dt>Urgent ride fee</dt><dd>{money(fare.urgentFee)}</dd></div>}
        {fare.extraCareFee > 0 && (
          <div><dt>Extra Care ({fare.extraCareHours} {fare.extraCareHours === 1 ? "hour" : "hours"})</dt><dd>{money(fare.extraCareFee)}</dd></div>
        )}
      </dl>
    </section>
  );
}