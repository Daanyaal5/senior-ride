import { Link } from "react-router-dom";
import PricesLink from "./PricesLink";
import { BRAND_NAME, CONTACT_LINKS, EMAIL, PHONE_DISPLAY, SUPPORT_EMAIL, TAGLINE } from "../utils/brand";

/** Site footer: short intro, page links, legal links and contact details. */
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <h2>{BRAND_NAME}</h2>
          <p><strong>{TAGLINE}</strong></p>
          <p>Pre-arranged accessible transportation and airport transfers in Halifax, Dartmouth, Sackville, Bedford and Hammonds Plains. Not a taxi service.</p>
        </div>
        <nav aria-label="Footer pages">
          <h2>Explore</h2>
          <PricesLink>Prices</PricesLink>
          <Link to="/who-we-are">Who We Are</Link>
          <Link to="/about">About Us</Link>
          <a href="/book" target="_blank" rel="noopener noreferrer">Book a Ride<span className="sr-only"> (opens in a new tab)</span></a>
        </nav>
        <nav aria-label="Legal">
          <h2>Policies</h2>
          <Link to="/terms">Booking Policy</Link>
          <Link to="/privacy">Privacy Policy</Link>
        </nav>
        <div>
          <h2>Contact Us 24/7</h2>
          <a href={CONTACT_LINKS.call}>Call {PHONE_DISPLAY}</a>
          <a href={CONTACT_LINKS.whatsapp}>WhatsApp</a>
          <a href={CONTACT_LINKS.text}>Text {PHONE_DISPLAY}</a>
          <a className="footer-email" href={CONTACT_LINKS.email}>{EMAIL}</a>
          <a className="footer-email" href={CONTACT_LINKS.supportEmail}>Support: {SUPPORT_EMAIL}</a>
        </div>
      </div>
      <p className="footer-bottom">© {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.</p>
    </footer>
  );
}