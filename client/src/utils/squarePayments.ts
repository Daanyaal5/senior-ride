import { loadSquare } from "./loadSquare";

let payments: Promise<any> | null = null;

/** One shared Square "payments" object for the card form and Apple Pay. */
export function getPayments(): Promise<any> {
  if (!payments) {
    payments = loadSquare().then((Square) =>
      Square.payments(import.meta.env.VITE_SQUARE_APP_ID, import.meta.env.VITE_SQUARE_LOCATION_ID)
    );
    payments.catch(() => { payments = null; }); // allow a retry if it failed to load
  }
  return payments;
}