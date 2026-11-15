import { FormEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isValidPhone, samePhone } from "../utils/phone";
import DateTimeWheel from "../components/DateTimeWheel";
import PlacesInput from "../components/PlacesInput";
import FareEstimate from "../components/FareEstimate";
import CardForm, { CardFormHandle } from "../components/CardForm";
import ContactOptions from "../components/ContactOptions";
import { ApiError, getEstimate, submitBooking } from "../api/bookings";
import { FareBreakdown, PaymentMethod, Place } from "../types";
import { LANGUAGES } from "../utils/languages";
import { AIRPORT_PLACE } from "../utils/serviceArea";
import { ASSISTANCE_NAME, ETRANSFER_EMAIL } from "../utils/brand";
import { useFees } from "../hooks/useFees";
import { useApplePay } from "../hooks/useApplePay";

const DRAFT_KEY = "bookingDraft";

/** The words on the main button for each way of paying. */
const SUBMIT_LABEL: Record<PaymentMethod, (total: number) => string> = {
  card: (t) => `Pay $${t.toFixed(2)} and Book`,
  applepay: (t) => `Pay $${t.toFixed(2)} with Apple Pay`,
  etransfer: () => "Book Now, Pay by e‑Transfer", // ‑ keeps "e-Transfer" on one line
  cash: () => "Book Now, Pay Cash to the Driver",
};

/** Reads the answers saved in this browser tab, so a refresh or Back does not lose anything. */
function loadDraft(): any {
  try { return JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? "null") ?? {}; } catch { return {}; }
}

/** One short booking form: where, when, price, your details, payment, policy. */
export default function Booking() {
  const navigate = useNavigate();
  const fees = useFees(); // from server/data/fees.csv
  const [draft] = useState<any>(loadDraft);
  const cardForm = useRef<CardFormHandle>(null);

  // 1. Trip
  const [pickup, setPickup] = useState<Place | null>(draft.pickup ?? null);
  const [dropoff, setDropoff] = useState<Place | null>(draft.dropoff ?? null);
  const [when, setWhen] = useState(draft.when ?? ""); // e.g. 2026-09-30T10:30
  const [urgent, setUrgent] = useState(draft.urgent ?? false); // same-day or short-notice ride
  const [flightNumber, setFlightNumber] = useState(draft.flightNumber ?? "");
  // 2. Passenger
  const [name, setName] = useState(draft.name ?? "");
  const [phone, setPhone] = useState(draft.phone ?? "");
  const [email, setEmail] = useState(draft.email ?? "");
  const [familyPhone, setFamilyPhone] = useState(draft.familyPhone ?? "");
  const [language, setLanguage] = useState(draft.language ?? "English");
  const [extraCare, setExtraCare] = useState(draft.extraCare ?? false);
  const [extraCareHours, setExtraCareHours] = useState<number>(draft.extraCareHours ?? 1);
  const [notes, setNotes] = useState(draft.notes ?? "");
  // 3. Payment and policy
  const [payment, setPayment] = useState<PaymentMethod>(draft.payment ?? "card");
  const [agree, setAgree] = useState(false); // asked again each visit, on purpose
  // Screen state
  const [fare, setFare] = useState<FareBreakdown | null>(null);
  const [contactUs, setContactUs] = useState(""); // set when the trip has no online price
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const hours = extraCare ? extraCareHours : 0;
  const applePay = useApplePay(fare?.total ?? null);
  // If Apple Pay was chosen before but isn't available on this device, fall back to card.
  const method: PaymentMethod = payment === "applepay" && !applePay.available ? "card" : payment;
  const isAirportTrip = !!fare?.route.includes("Airport");

  // Save answers as the customer types, so nothing is lost on refresh.
  useEffect(() => {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ pickup, dropoff, when, urgent, flightNumber, name, phone, email, familyPhone, language, extraCare, extraCareHours, notes, payment }));
  }, [pickup, dropoff, when, urgent, flightNumber, name, phone, email, familyPhone, language, extraCare, extraCareHours, notes, payment]);

  // Ask the server for the price whenever the trip, Personal Assistance or "urgent" changes.
  useEffect(() => {
    setFare(null); setContactUs(""); setError("");
    if (!pickup || !dropoff) return;
    getEstimate(pickup, dropoff, hours, urgent)
      .then((r) => setFare(r.fare))
      .catch((e: ApiError) => (e.contactUs ? setContactUs(e.message) : setError(e.message)));
  }, [pickup, dropoff, hours, urgent]);

  // Checks the form, gets a card or Apple Pay token if needed, and sends the booking.
  // Apple Pay must open straight from the click, so nothing slow happens before it.
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!pickup || !dropoff) return setError("Please enter both addresses and wait for them to be confirmed.");
    if (!when) return setError("Please choose the date and time.");
    if (!fare) return setError("Please wait for the price to appear.");
    if (!isValidPhone(phone)) return setError("Please enter a valid 10-digit phone number.");
    if (familyPhone && samePhone(phone, familyPhone)) return setError("The family contact number must be different from your own.");
    if (!agree) return setError("Please tick the box to accept our booking policy.");
    setBusy(true);
    try {
      const token =
        method === "card" ? await cardForm.current!.tokenize(fare.total, name, email)
        : method === "applepay" ? await applePay.tokenize()
        : undefined;
      const result = await submitBooking({
        name, phone, familyPhone, email, pickup, dropoff,
        scheduledTime: new Date(when).toISOString(),
        flightNumber, language, notes, extraCareHours: hours, urgent,
        payment: method, token, agree,
      });
      sessionStorage.setItem("lastBooking", JSON.stringify({ ...result, name, when, pickup, dropoff }));
      sessionStorage.removeItem(DRAFT_KEY);
      navigate(`/confirmation?ref=${result.reference}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <main className="page">
      <h1>Book Your Ride</h1>
      <p className="lead">All rides are booked in advance.</p>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend><span className="step-num">1</span> Where Are You Going?</legend>
          <PlacesInput id="pickup" label="Pickup Address" initialValue={pickup?.address} onSelect={setPickup}
            quickPick={{ label: "✈ Pick Up at the Airport", place: AIRPORT_PLACE }} />
          <PlacesInput id="dropoff" label="Drop-Off Address" initialValue={dropoff?.address} onSelect={setDropoff}
            quickPick={{ label: "✈ Drop Off at the Airport", place: AIRPORT_PLACE }} />
          {isAirportTrip && (
            <div className="field"><label htmlFor="flight">Flight Number <span className="optional">(optional)</span></label>
              <p className="hint" id="flight-hint">Helps us track your flight if it is early or late.</p>
              <input id="flight" type="text" aria-describedby="flight-hint" value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} placeholder="e.g. AC 612" /></div>
          )}
        </fieldset>

        <fieldset>
          <legend><span className="step-num">2</span> When?</legend>
          <DateTimeWheel initial={when} onChange={setWhen} />
          <label className="choice"><input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} />
            <span><strong>Urgent Ride Fee: ${fees.urgent}</strong>. For today or short notice. We confirm by phone that a driver is available.</span></label>
        </fieldset>

        {fare && <FareEstimate fare={fare} />}
        {fare && <p className="warning">Waiting time: ${fees.waitPer30} for every 30 minutes the driver waits.</p>}
        {contactUs && <ContactOptions message={contactUs} />}

        {/* The rest only appears once the trip has an online price. */}
        {fare && (
          <div className="reveal">
            <fieldset>
              <legend><span className="step-num">3</span> About the Passenger</legend>
              <div className="field"><label htmlFor="name">Full Name</label>
                <input id="name" type="text" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div className="field"><label htmlFor="phone">Phone Number</label>
                <input id="phone" type="tel" required autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
              <div className="field"><label htmlFor="email">Email</label>
                <p className="hint" id="email-hint">Your booking confirmation is sent here.</p>
                <input id="email" type="email" required autoComplete="email" aria-describedby="email-hint" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div className="field"><label htmlFor="family">Family Contact Phone <span className="optional">(optional)</span></label>
                <p className="hint" id="family-hint">We call this person if we cannot reach you.</p>
                <input id="family" type="tel" aria-describedby="family-hint" value={familyPhone} onChange={(e) => setFamilyPhone(e.target.value)} />
                {familyPhone && samePhone(phone, familyPhone) && <p className="error" role="alert">This must be a different number from your own.</p>}</div>
              <div className="field"><label htmlFor="lang">Preferred Driver Language</label>
                <select id="lang" value={language} onChange={(e) => setLanguage(e.target.value)}>
                  {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                </select></div>
              <label className="choice"><input type="checkbox" checked={extraCare} onChange={(e) => setExtraCare(e.target.checked)} />
                <span><strong>{ASSISTANCE_NAME}</strong>: the driver helps you in and out and stays with you as needed. ${fees.assistancePerHour} per hour, tax included.</span></label>
              {extraCare && (
                <div className="field"><label htmlFor="hours">How Many Hours of Help?</label>
                  <select id="hours" value={extraCareHours} onChange={(e) => setExtraCareHours(Number(e.target.value))}>
                    {Array.from({ length: fees.maxHours }, (_, i) => i + 1).map((h) => <option key={h} value={h}>{h} {h === 1 ? "hour" : "hours"} (${h * fees.assistancePerHour})</option>)}
                  </select></div>
              )}
              <div className="field"><label htmlFor="notes">Anything We Should Know? <span className="optional">(optional)</span></label>
                <textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. buzzer number, walker, extra luggage" /></div>
            </fieldset>

            <fieldset>
              <legend><span className="step-num">4</span> How Would You Like to Pay?</legend>
              <div className="choices">
                <button type="button" className="choice-btn" aria-pressed={method === "card"} onClick={() => setPayment("card")}>Credit or Debit Card</button>
                {applePay.available && (
                  <button type="button" className="choice-btn" aria-pressed={method === "applepay"} onClick={() => setPayment("applepay")}>Apple Pay</button>
                )}
                <button type="button" className="choice-btn" aria-pressed={method === "etransfer"} onClick={() => setPayment("etransfer")}>Interac e‑Transfer</button>
                <button type="button" className="choice-btn" aria-pressed={method === "cash"} onClick={() => setPayment("cash")}>Cash to the Driver</button>
              </div>
              {method === "card" && <CardForm ref={cardForm} />}
              {method === "applepay" && <p className="etransfer-note">Tap the Apple Pay button below to pay <strong>${fare.total.toFixed(2)}</strong>.</p>}
              {method === "etransfer" && (
                <p className="etransfer-note">After you book, send <strong>${fare.total.toFixed(2)}</strong> by Interac e-Transfer to <strong>{ETRANSFER_EMAIL}</strong> with your booking code in the message. Your ride is confirmed once we receive it. We also email you these steps.</p>
              )}
              {method === "cash" && (
                <p className="etransfer-note">Pay <strong>${fare.total.toFixed(2)}</strong> in cash to the driver when you reach your destination. We call you to confirm your ride.</p>
              )}
            </fieldset>

            {/* The policy opens in a new tab, so the filled-in form stays open here. */}
            <div className="agree">
              <label className="choice"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                <span><strong>I have read and accept the booking policy.</strong></span></label>
              <Link className="policy-link" to="/terms" target="_blank" rel="noopener noreferrer">Read the Booking Policy<span className="sr-only"> (opens in a new tab)</span></Link>
            </div>

            {error && <p className="error" role="alert">{error}</p>}
            {method === "applepay" ? (
              <button className="apple-pay-button" type="submit" disabled={busy} aria-label={`Pay $${fare.total.toFixed(2)} with Apple Pay`} />
            ) : (
              <button className="button submit" type="submit" disabled={busy}>
                {busy ? "Booking..." : SUBMIT_LABEL[method](fare.total)}
              </button>
            )}
          </div>
        )}
        {!fare && error && <p className="error" role="alert">{error}</p>}
      </form>
    </main>
  );
}