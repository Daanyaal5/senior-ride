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
import { ETRANSFER_EMAIL } from "../utils/brand";
import { useApplePay } from "../hooks/useApplePay";

const DRAFT_KEY = "bookingDraft";
const EXTRA_CARE_RATE = 25; // per hour, tax included. Display only: the server sets the real price.
const URGENT_FEE = 99;      // display only, like the line above
const WAIT_FEE = 20;        // per 30 minutes of waiting, display only
const HOUR_CHOICES = [1, 2, 3, 4, 5, 6, 7, 8];

/** The words on the main button for each way of paying. */
const SUBMIT_LABEL: Record<PaymentMethod, (total: number) => string> = {
  card: (t) => `Pay $${t.toFixed(2)} and book`,
  applepay: (t) => `Pay $${t.toFixed(2)} with Apple Pay`,
  etransfer: () => "Book now, pay by e-Transfer",
  cash: () => "Book now, pay cash to the driver",
};

/** Reads the answers saved in this browser tab, so a refresh or Back does not lose anything. */
function loadDraft(): any {
  try { return JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? "null") ?? {}; } catch { return {}; }
}

/** One short booking form: where, when, price, your details, payment, policy. */
export default function Booking() {
  const navigate = useNavigate();
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

  // Ask the server for the price whenever the trip or Extra Care changes.
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
      <h1>Book your ride</h1>
      <p className="lead">All rides are booked in advance.</p>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend><span className="step-num">1</span> Where are you going?</legend>
          <PlacesInput id="pickup" label="Pickup address" initialValue={pickup?.address} onSelect={setPickup}
            quickPick={{ label: "✈ Pick up at the airport", place: AIRPORT_PLACE }} />
          <PlacesInput id="dropoff" label="Drop-off address" initialValue={dropoff?.address} onSelect={setDropoff}
            quickPick={{ label: "✈ Drop off at the airport", place: AIRPORT_PLACE }} />
          {isAirportTrip && (
            <div className="field"><label htmlFor="flight">Flight number <span className="optional">(optional)</span></label>
              <p className="hint" id="flight-hint">Helps us track your flight if it is early or late.</p>
              <input id="flight" type="text" aria-describedby="flight-hint" value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} placeholder="e.g. AC 612" /></div>
          )}
        </fieldset>

        <fieldset>
          <legend><span className="step-num">2</span> When?</legend>
          <DateTimeWheel initial={when} onChange={setWhen} />
          <label className="choice"><input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} />
            <span><strong>Urgent ride fee: ${URGENT_FEE}</strong>. For today or short notice. We confirm by phone that a driver is available.</span></label>
        </fieldset>

        {fare && <FareEstimate fare={fare} />}
        {fare && <p className="warning">Waiting time: ${WAIT_FEE} for every 30 minutes the driver waits.</p>}
        {contactUs && <ContactOptions message={contactUs} />}

        {/* The rest only appears once the trip has an online price. */}
        {fare && (
          <div className="reveal">
            <fieldset>
              <legend><span className="step-num">3</span> About the passenger</legend>
              <div className="field"><label htmlFor="name">Full name</label>
                <input id="name" type="text" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div className="field"><label htmlFor="phone">Phone number</label>
                <input id="phone" type="tel" required autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
              <div className="field"><label htmlFor="email">Email</label>
                <p className="hint" id="email-hint">Your booking confirmation is sent here.</p>
                <input id="email" type="email" required autoComplete="email" aria-describedby="email-hint" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div className="field"><label htmlFor="family">Family contact phone <span className="optional">(optional)</span></label>
                <p className="hint" id="family-hint">We call this person if we cannot reach you.</p>
                <input id="family" type="tel" aria-describedby="family-hint" value={familyPhone} onChange={(e) => setFamilyPhone(e.target.value)} />
                {familyPhone && samePhone(phone, familyPhone) && <p className="error" role="alert">This must be a different number from your own.</p>}</div>
              <div className="field"><label htmlFor="lang">Preferred driver language</label>
                <select id="lang" value={language} onChange={(e) => setLanguage(e.target.value)}>
                  {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                </select></div>
              <label className="choice"><input type="checkbox" checked={extraCare} onChange={(e) => setExtraCare(e.target.checked)} />
                <span>Extra Care: the driver helps you in and out and stays with you as needed. ${EXTRA_CARE_RATE} per hour, tax included.</span></label>
              {extraCare && (
                <div className="field"><label htmlFor="hours">How many hours of help?</label>
                  <select id="hours" value={extraCareHours} onChange={(e) => setExtraCareHours(Number(e.target.value))}>
                    {HOUR_CHOICES.map((h) => <option key={h} value={h}>{h} {h === 1 ? "hour" : "hours"} (${h * EXTRA_CARE_RATE})</option>)}
                  </select></div>
              )}
              <div className="field"><label htmlFor="notes">Anything we should know? <span className="optional">(optional)</span></label>
                <textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. buzzer number, walker, extra luggage" /></div>
            </fieldset>

            <fieldset>
              <legend><span className="step-num">4</span> How would you like to pay?</legend>
              <div className="choices">
                <button type="button" className="choice-btn" aria-pressed={method === "card"} onClick={() => setPayment("card")}>Credit or debit card</button>
                {applePay.available && (
                  <button type="button" className="choice-btn" aria-pressed={method === "applepay"} onClick={() => setPayment("applepay")}>Apple Pay</button>
                )}
                <button type="button" className="choice-btn" aria-pressed={method === "etransfer"} onClick={() => setPayment("etransfer")}>Interac e-Transfer</button>
                <button type="button" className="choice-btn" aria-pressed={method === "cash"} onClick={() => setPayment("cash")}>Cash to the driver</button>
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

            <div className="policy-box">
              <h2>Booking policy</h2>
              <ul>
                <li>All rides are booked in advance. Card, Apple Pay and e-Transfer rides are confirmed once paid. Cash rides are confirmed by phone.</li>
                <li>We may cancel a ride at any time, even after payment. If we do, you get a 100% refund within 5 business days.</li>
                <li className="warning">Waiting time: ${WAIT_FEE} for every 30 minutes the driver waits.</li>
              </ul>
              <Link to="/terms" target="_blank" rel="noopener noreferrer">Read the full policy<span className="sr-only"> (opens in a new tab)</span></Link>
            </div>
            <label className="choice"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span><strong>I have read and accept the booking policy.</strong></span></label>

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