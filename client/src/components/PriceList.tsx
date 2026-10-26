import { useEffect, useState } from "react";
import { getPrices } from "../api/bookings";

/** The price list, loaded from the server so it always matches what customers are charged. */
export default function PriceList() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getPrices>> | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => { getPrices().then(setData).catch(() => setFailed(true)); }, []);

  if (failed) return <p>Prices could not load. Please refresh, or contact us.</p>;
  if (!data) return <p className="hint">Loading prices...</p>;

  return (
    <>
      <table className="price-table">
        <caption className="sr-only">Prices, tax included, either direction</caption>
        <thead><tr><th scope="col">Trip (either direction)</th><th scope="col">Price, tax included</th></tr></thead>
        <tbody>
          {data.prices.map((p) => (
            <tr key={p.route}><td>{p.route}</td><td>${p.price}</td></tr>
          ))}
          <tr><td>Extra Care (driver stays and helps)</td><td>${data.extraCarePerHour} per hour</td></tr>
          <tr><td>Urgent ride fee (today or short notice)</td><td>${data.urgentFee}</td></tr>
          <tr className="warning-row"><td>Waiting time</td><td>${data.waitFeePer30} per 30 minutes</td></tr>
        </tbody>
      </table>
    </>
  );
}