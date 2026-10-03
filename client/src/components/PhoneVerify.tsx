import { useState } from "react";
import { checkCode, sendCode } from "../api/bookings";

/** Step 1 of the form: the customer enters their phone, gets a text code, and types it in. */
export default function PhoneVerify({ onVerified }: { onVerified: (phone: string, token: string) => void }) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  // Asks the server to text a code to the phone number.
  async function send() {
    setBusy(true); setMessage("");
    try { await sendCode(phone); setSent(true); setMessage("We texted you a 6-digit code."); }
    catch (e) { setMessage((e as Error).message); }
    finally { setBusy(false); }
  }

  // Checks the typed code. On success the form below unlocks.
  async function verify() {
    setBusy(true); setMessage("");
    try { const { token } = await checkCode(phone, code); setDone(true); onVerified(phone, token); }
    catch (e) { setMessage((e as Error).message); }
    finally { setBusy(false); }
  }

  if (done) return <p className="verified" role="status">✓ Phone number verified: {phone}</p>;

  return (
    <fieldset>
      <legend>Step 1: Verify your phone number</legend>
      <p className="hint">We text you a code to make sure this is really you. Standard message rates may apply.</p>
      <div className="field"><label htmlFor="phone">Phone number</label>
        <input id="phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
      <button type="button" className="button" disabled={busy || phone.replace(/\D/g, "").length < 10} onClick={send}>{sent ? "Send a new code" : "Text me a code"}</button>
      {sent && (
        <div className="field"><label htmlFor="code">6-digit code</label>
          <input id="code" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} />
          <button type="button" className="button" disabled={busy || code.length < 6} onClick={verify}>Verify</button></div>
      )}
      {message && <p role="status" aria-live="polite"><strong>{message}</strong></p>}
    </fieldset>
  );
}