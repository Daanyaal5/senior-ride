import { Link } from "react-router-dom";

const PHONE = import.meta.env.VITE_PHONE_NUMBER;

/** Site footer: short intro, page links, legal links and contact details. */
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <h2>Senior Ride</h2>
          <p>Safe, comfortable rides in Halifax, with drivers who speak your language.</p>
        </div>
        <nav aria-label="Footer pages">
          <h2>Explore</h2>
          <Link to="/who-we-are">Who we are</Link>
          <Link to="/about">About us</Link>
          <a href="/book" target="_blank" rel="noopener noreferrer">Book a ride<span className="sr-only"> (opens in a new tab)</span></a>
        </nav>
        <nav aria-label="Legal">
          <h2>Legal</h2>
          <Link to="/privacy">Privacy policy</Link>
          <Link to="/terms">Terms and conditions</Link>
        </nav>
        <div>
          <h2>Contact us</h2>
          <p>Phone: <a href={`tel:${PHONE}`}>{PHONE}</a></p>
          <p>Email: hello@yourdomain.ca</p>
        </div>
      </div>
      <p className="footer-bottom">© {new Date().getFullYear()} Senior Ride. All rights reserved.</p>
    </footer>
  );
}