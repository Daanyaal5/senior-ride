import { Estimate } from "../types";

const money = (n: number) => `$${n.toFixed(2)}`;

/** Itemised estimated fare. Only shows extra lines when they apply. */
export default function FareEstimate({ estimate }: { estimate: Estimate }) {
  const { fare } = estimate;
  return (
    <section className="fare" aria-live="polite" aria-label="Estimated fare">
      <h2>Estimated fare: {money(fare.total)}</h2>
      <p>About {estimate.distanceKm.toFixed(1)} km, around {Math.round(estimate.durationMin)} minutes.</p>
      <dl>
        <div><dt>Starting fare</dt><dd>{money(fare.baseFare)}</dd></div>
        <div><dt>Distance</dt><dd>{money(fare.distanceFare)}</dd></div>
        <div><dt>Travel time</dt><dd>{money(fare.timeFare)}</dd></div>
        {fare.extraCareFee > 0 && <div><dt>Extra Care</dt><dd>{money(fare.extraCareFee)}</dd></div>}
        {fare.asapFee > 0 && <div><dt>Ride-now fee</dt><dd>{money(fare.asapFee)}</dd></div>}
      </dl>
      <p className="hint">This is an estimate. Traffic can change the final amount slightly.</p>
    </section>
  );
}
