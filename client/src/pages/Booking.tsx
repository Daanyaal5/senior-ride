import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PlacesInput from "../components/PlacesInput";
import FareEstimate from "../components/FareEstimate";
import { getEstimate, submitBooking } from "../api/bookings";
import { Estimate, Place } from "../types";
import { LANGUAGES } from "../utils/languages";

/** The booking form. Fields are grouped so each section is one clear job. */
export default function Booking() {
  const navigate = useNavigate();
  // Today's date as YYYY-MM-DD in local time; used so past dates can't be chosen.
  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  // Passenger details
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [secondaryPhone, setSecondaryPhone] = useState("");
  const [email, setEmail] = useState("");
  // Trip details
  const [pickup, setPickup] = useState<Place | null>(null);
  const [dropoff, setDropoff] = useState<Place | null>(null);
  const [asap, setAsap] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(""); // e.g. 2026-09-30
  const [scheduledTime, setScheduledTime] = useState(""); // e.g. 10:30
  const [extraCare, setExtraCare] = useState(false);
  const [language, setLanguage] = useState("English");
  // Screen state
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Refresh the fare whenever anything that affects the price changes.
  useEffect(() => {
    setEstimate(null);
    if (!pickup || !dropoff) return;
    getEstimate({ pickup, dropoff, asap, extraCare })
      .then(setEstimate)
      .catch((e) => setError(e.message));
  }, [pickup, dropoff, asap, extraCare]);

  // Sends the booking, then shows the confirmation page.
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!pickup || !dropoff) return setError("Please pick your addresses from the suggestion list.");
    setBusy(true);
    try {
      // Join the two boxes into one local date-time such as "2026-09-30T10:30".
      const when = `${scheduledDate}T${scheduledTime}`;
      const result = await submitBooking({
        name, phone, secondaryPhone, email, pickup, dropoff, asap, extraCare,
        scheduledTime: asap ? null : new Date(when).toISOString(),
        preferredLanguage: language,
      });
      navigate("/confirmation", { state: { ...result, name, pickup, dropoff, asap, scheduledTime: when, extraCare, language } });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page">
      <h1>Book your ride</h1>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>About the passenger</legend>
          <div className="field"><label htmlFor="name">Full name</label>
            <input id="name" type="text" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="field"><label htmlFor="phone">Phone number</label>
            <input id="phone" type="tel" required autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          <div className="field"><label htmlFor="phone2">Family contact phone</label>
            <p className="hint" id="phone2-hint">We call this person if we cannot reach you.</p>
            <input id="phone2" type="tel" required aria-describedby="phone2-hint" value={secondaryPhone} onChange={(e) => setSecondaryPhone(e.target.value)} /></div>
          <div className="field"><label htmlFor="email">Email</label>
            <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        </fieldset>

        <fieldset>
          <legend>Where are you going?</legend>
          <PlacesInput id="pickup" label="Pickup address" onSelect={setPickup} />
          <PlacesInput id="dropoff" label="Destination" onSelect={setDropoff} />
        </fieldset>

        <fieldset>
          <legend>When do you need the ride?</legend>
          <label className="choice"><input type="radio" name="when" checked={!asap} onChange={() => setAsap(false)} /> Schedule for later</label>
          <label className="choice"><input type="radio" name="when" checked={asap} onChange={() => setAsap(true)} /> I need a ride now (extra fee applies)</label>
          {!asap && (
            <>
              <div className="field"><label htmlFor="date">Date</label>
                <input id="date" type="date" required min={today} value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} /></div>
              <div className="field"><label htmlFor="time">Pickup time</label>
                <input id="time" type="time" required value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} /></div>
            </>
          )}
        </fieldset>

        <fieldset>
          <legend>Your preferences</legend>
          <label className="choice"><input type="checkbox" checked={extraCare} onChange={(e) => setExtraCare(e.target.checked)} />
            Extra Care: your driver helps you in and out of the car and makes sure you are settled.</label>
          <div className="field"><label htmlFor="lang">Preferred driver language</label>
            <p className="hint" id="lang-hint">We will try our best to match you with a driver who speaks it.</p>
            <select id="lang" aria-describedby="lang-hint" value={language} onChange={(e) => setLanguage(e.target.value)}>
              {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
            </select></div>
        </fieldset>

        {estimate && <FareEstimate estimate={estimate} />}
        {error && <p className="error" role="alert">{error}</p>}
        <button className="button" type="submit" disabled={busy}>{busy ? "Booking..." : "Book my ride"}</button>
      </form>
    </main>
  );
}
