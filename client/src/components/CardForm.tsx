import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { getPayments } from "../utils/squarePayments";

/** What the booking page can ask the card form to do. */
export interface CardFormHandle {
  /** Turns the typed card into a one-time token (with bank verification if needed). Throws if the card is incomplete. */
  tokenize(amount: number, name: string, email: string): Promise<string>;
}

/**
 * Square's secure card fields (credit and debit cards only).
 * The card number goes straight to Square; our server only receives a one-time token.
 */
const CardForm = forwardRef<CardFormHandle>(function CardForm(_props, ref) {
  const cardRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  // Load Square and draw the card fields inside #card-container.
  useEffect(() => {
    let cancelled = false;
    getPayments()
      .then(async (payments) => {
        const card = await payments.card({ style: { input: { fontSize: "18px" } } });
        if (cancelled) return card.destroy();
        await card.attach("#card-container");
        cardRef.current = card;
        setReady(true);
      })
      .catch((e) => setError(e.message));
    return () => { cancelled = true; cardRef.current?.destroy(); };
  }, []);

  useImperativeHandle(ref, () => ({
    async tokenize(amount, name, email) {
      if (!cardRef.current) throw new Error("The card form is still loading. Please wait a moment.");
      const [givenName, ...rest] = name.trim().split(/\s+/);
      const result = await cardRef.current.tokenize({
        amount: amount.toFixed(2),
        currencyCode: "CAD",
        intent: "CHARGE_AND_STORE", // charge now and keep the card for extra waiting time
        customerInitiated: true,
        sellerKeyedIn: false,
        billingContact: { givenName, familyName: rest.join(" "), email, countryCode: "CA" },
      });
      if (result.status !== "OK") throw new Error("Please check your card details.");
      return result.token as string;
    },
  }));

  return (
    <div className="card-form">
      <div id="card-container" />
      {!ready && !error && <p className="hint">Loading the secure card form...</p>}
      {error && <p className="error" role="alert">{error}</p>}
      <p className="hint">Your card details go directly to Square, our payment provider.</p>
    </div>
  );
});

export default CardForm;