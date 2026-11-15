import { CONTACT_LINKS, PHONE_DISPLAY } from "../utils/brand";

/** Big buttons to reach the business 24/7: call, WhatsApp, text or email. */
export default function ContactOptions({ message }: { message?: string }) {
  return (
    <div className="contact-box" role="region" aria-label="Contact us">
      {message && <p><strong>{message}</strong></p>}
      <p>We are available 24/7. Long-distance rides are welcome.</p>
      <div className="contact-buttons">
        <a className="contact-btn" href={CONTACT_LINKS.call}>Call {PHONE_DISPLAY}</a>
        <a className="contact-btn" href={CONTACT_LINKS.whatsapp}>WhatsApp</a>
        <a className="contact-btn" href={CONTACT_LINKS.text}>Send a Text</a>
        <a className="contact-btn" href={CONTACT_LINKS.email}>Email</a>
      </div>
    </div>
  );
}