import { Link, NavLink } from "react-router-dom";
import { BRAND_NAME, CONTACT_LINKS, PHONE_DISPLAY, TAGLINE } from "../utils/brand";

/** Top bar on every page: name, page links, phone number. */
export default function Header() {
  return (
    <header className="header">
      <Link to="/" className="brand">
        <span className="brand-name">{BRAND_NAME}</span>
        <span className="brand-tagline">{TAGLINE}</span>
      </Link>
      <nav className="nav" aria-label="Main">
        <NavLink to="/" end>HOME</NavLink>
        <a href="/#prices">Prices</a>
        <NavLink to="/about">About us</NavLink>
        <NavLink to="/terms">Booking policy</NavLink>
        {/* The booking form opens in a new tab. The hidden text tells screen readers. */}
        <a href="/book" target="_blank" rel="noopener noreferrer" className="nav-book">Book a ride<span className="sr-only"> (opens in a new tab)</span></a>
      </nav>
      <a className="call" href={CONTACT_LINKS.call}>24/7: Call or WhatsApp {PHONE_DISPLAY}</a>
    </header>
  );
}