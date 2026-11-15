import { useEffect, useState } from "react";
import { getPrices } from "../api/bookings";
import { ASSISTANCE_NAME } from "../utils/brand";

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
        <thead><tr><th scope="col">Trip (Either Direction)</th><th scope="col">Price</th></tr></thead>
        <tbody>
          {data.prices.map((p) => (
            <tr key={p.route}><td>{p.route}</td><td>${p.price}</td></tr>
          ))}
          <tr><td>{ASSISTANCE_NAME} (Driver Helps and Stays with You)</td><td>${data.extraCarePerHour} / hour</td></tr>
          <tr><td>Urgent Ride Fee (Today or Short Notice)</td><td>${data.urgentFee}</td></tr>
          <tr className="warning-row"><td>Waiting Time</td><td>${data.waitFeePer30} / 30 min</td></tr>
        </tbody>
      </table>
    </>
  );
}