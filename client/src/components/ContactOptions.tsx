import { CONTACT_LINKS, EMAIL, PHONE_DISPLAY } from "../utils/brand";

/** Big buttons to reach the business 24/7: call, WhatsApp, text or email. */
export default function ContactOptions({ message }: { message?: string }) {
  return (
    <div className="contact-box" role="region" aria-label="Contact us">
      {message && <p><strong>{message}</strong></p>}
      <p>We are available 24/7. Long-distance rides are welcome.</p>
      <div className="contact-buttons">
        <a className="contact-btn" href={CONTACT_LINKS.call}>Call {PHONE_DISPLAY}</a>
        <a className="contact-btn" href={CONTACT_LINKS.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp<span className="sr-only"> (opens in a new tab)</span></a>
        <a className="contact-btn" href={CONTACT_LINKS.text}>Send a text</a>
        <a className="contact-btn" href={CONTACT_LINKS.email}>Email {EMAIL}</a>
      </div>
    </div>
  );
}