import { Link } from "react-router-dom";
import { BRAND_NAME, CONTACT_LINKS, EMAIL, PHONE_DISPLAY, TAGLINE } from "../utils/brand";

/** Site footer: short intro, page links, legal links and contact details. */
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <h2>{BRAND_NAME}</h2>
          <p><strong>{TAGLINE}</strong></p>
          <p>Pre-arranged accessible transportation and airport transfers in Halifax, Dartmouth and Sackville. Not a taxi service.</p>
        </div>
        <nav aria-label="Footer pages">
          <h2>Explore</h2>
          <a href="/#prices">Prices</a>
          <Link to="/who-we-are">Who we are</Link>
          <Link to="/about">About us</Link>
          <a href="/book" target="_blank" rel="noopener noreferrer">Book a ride<span className="sr-only"> (opens in a new tab)</span></a>
        </nav>
        <nav aria-label="Legal">
          <h2>Policies</h2>
          <Link to="/terms">Booking policy</Link>
          <Link to="/privacy">Privacy policy</Link>
        </nav>
        <div>
          <h2>Contact us 24/7</h2>
          <a href={CONTACT_LINKS.call}>Call {PHONE_DISPLAY}</a>
          <a href={CONTACT_LINKS.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp<span className="sr-only"> (opens in a new tab)</span></a>
          <a href={CONTACT_LINKS.text}>Text {PHONE_DISPLAY}</a>
          <a href={CONTACT_LINKS.email}>{EMAIL}</a>
        </div>
      </div>
      <p className="footer-bottom">© {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.</p>
    </footer>
  );
}