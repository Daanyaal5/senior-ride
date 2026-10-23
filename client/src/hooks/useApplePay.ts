import { useEffect, useRef, useState } from "react";
import { getPayments } from "../utils/squarePayments";

const LABEL = "Halifax Accessible Mobility"; // shown on the Apple Pay sheet

/**
 * Sets up Apple Pay through Square once a price is known.
 * available is true only on devices and browsers that support it (Safari on Apple devices,
 * on a live HTTPS website with the domain registered in Square). Everywhere else the option stays hidden.
 */
export function useApplePay(total: number | null) {
  const ref = useRef<{ applePay: any; request: any } | null>(null);
  const [available, setAvailable] = useState(false);

  // Create Apple Pay the first time a price appears. Square throws if the device can't use it.
  useEffect(() => {
    if (total == null || ref.current) return;
    let cancelled = false;
    getPayments()
      .then(async (payments) => {
        const request = payments.paymentRequest({
          countryCode: "CA",
          currencyCode: "CAD",
          total: { amount: total.toFixed(2), label: LABEL },
        });
        const applePay = await payments.applePay(request);
        if (!cancelled) { ref.current = { applePay, request }; setAvailable(true); }
      })
      .catch(() => {}); // not supported here: keep the option hidden
    return () => { cancelled = true; };
  }, [total != null]);

  // Keep the amount on the Apple Pay sheet in step with the price.
  useEffect(() => {
    if (ref.current && total != null) ref.current.request.update({ total: { amount: total.toFixed(2), label: LABEL } });
  }, [total]);

  /** Opens the Apple Pay sheet. Must be called straight from the button click. */
  async function tokenize(): Promise<string> {
    const result = await ref.current!.applePay.tokenize();
    if (result.status !== "OK") throw new Error("Apple Pay was cancelled or did not finish. Please try again.");
    return result.token as string;
  }

  return { available, tokenize };
}