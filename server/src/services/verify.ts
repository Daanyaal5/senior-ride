import crypto from "crypto";

const mock = () => process.env.MOCK_MODE === "true"; // test mode: no real text; the code is always 123456

/** Turns "902-555-0100" into "+19025550100", the format text-message services need. */
export function toE164(phone: string): string {
  const digits = String(phone).replace(/\D/g, "");
  return digits.length === 10 ? `+1${digits}` : `+${digits}`;
}

const twilioUrl = (path: string) => `https://verify.twilio.com/v2/Services/${process.env.TWILIO_VERIFY_SID}/${path}`;
const twilioHeaders = () => ({
  Authorization: "Basic " + Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64"),
  "Content-Type": "application/x-www-form-urlencoded",
});

/** Asks Twilio Verify to text a 6-digit code to the phone. */
export async function sendCode(phone: string): Promise<void> {
  if (mock()) return;
  const res = await fetch(twilioUrl("Verifications"), { method: "POST", headers: twilioHeaders(), body: new URLSearchParams({ To: phone, Channel: "sms" }) });
  if (!res.ok) throw new Error("Could not send code");
}

/** Asks Twilio whether the code the customer typed is correct. */
export async function checkCode(phone: string, code: string): Promise<boolean> {
  if (mock()) return code === "123456";
  const res = await fetch(twilioUrl("VerificationCheck"), { method: "POST", headers: twilioHeaders(), body: new URLSearchParams({ To: phone, Code: code }) });
  return res.ok && (await res.json()).status === "approved";
}

// A signed receipt proving "this phone was verified". Customers cannot forge it without VERIFY_SECRET.
const sign = (data: string) => crypto.createHmac("sha256", process.env.VERIFY_SECRET as string).update(data).digest("hex");

/** Creates a receipt valid for 30 minutes: "phone|expiry|signature". */
export function makeToken(phone: string): string {
  const data = `${phone}|${Date.now() + 30 * 60 * 1000}`;
  return `${data}|${sign(data)}`;
}

/** True only if the receipt is for this phone, has not expired, and the signature is genuine. */
export function isTokenValid(phone: string, token: unknown): boolean {
  if (typeof token !== "string") return false;
  const [p, exp, sig] = token.split("|");
  if (p !== phone || Number(exp) < Date.now() || !sig) return false;
  const expected = sign(`${p}|${exp}`);
  return sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}