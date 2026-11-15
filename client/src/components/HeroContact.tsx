import { CONTACT_LINKS, EMAIL, PHONE_DISPLAY } from "../utils/brand";

/**
 * Round contact icons in the top-left corner of the hero video, each with a small label underneath.
 * Hovering (or tabbing to) an icon highlights it. Tapping it:
 *   Call     → phone call            (tel:)
 *   Text     → phone's messages app  (sms:)
 *   WhatsApp → WhatsApp chat         (wa.me)
 *   Email    → new email             (mailto:)
 * The icons are simple drawings (SVG) so they stay sharp and load instantly.
 */
const ITEMS = [
  {
    label: "Call", href: CONTACT_LINKS.call, aria: `Call ${PHONE_DISPLAY}`,
    // Phone handset
    icon: <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" />,
  },
  {
    label: "Text", href: CONTACT_LINKS.text, aria: `Send a text message to ${PHONE_DISPLAY}`,
    // Square message box with text lines
    icon: <path d="M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2zm3 5v2h10V8H7zm0 4v2h7v-2H7z" transform="translate(-2 0)" />,
  },
  {
    label: "WhatsApp", href: CONTACT_LINKS.whatsapp, aria: "Message us on WhatsApp",
    // Round chat bubble with dots
    icon: <path d="M12 3C7 3 3 6.6 3 11c0 2.3 1.1 4.4 2.9 5.9L5 21l4.4-2.2c.8.2 1.7.3 2.6.3 5 0 9-3.6 9-8s-4-8-9-8zm-3.5 9.2a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4zm3.5 0a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4zm3.5 0a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4z" />,
  },
  {
    label: "Email", href: CONTACT_LINKS.email, aria: `Email ${EMAIL}`,
    // Envelope
    icon: <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1.4 2L12 12.2 19.6 7H4.4zM20 8.6l-7.4 5a1 1 0 0 1-1.2 0L4 8.6V17h16V8.6z" />,
  },
];

export default function HeroContact() {
  return (
    <nav className="hero-contact" aria-label="Contact us">
      {ITEMS.map((item) => (
        <a key={item.label} href={item.href} title={item.aria} aria-label={item.aria}>
          <span className="hero-contact-circle"><svg viewBox="0 0 24 24" aria-hidden="true">{item.icon}</svg></span>
          <span className="hero-contact-label" aria-hidden="true">{item.label}</span>
        </a>
      ))}
    </nav>
  );
}