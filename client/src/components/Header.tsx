import { Link, NavLink } from "react-router-dom";
import AccessibilityControls from "./AccessibilityControls";

const PHONE = import.meta.env.VITE_PHONE_NUMBER;

/** Top bar on every page: name, page links, phone number, display settings. */
export default function Header() {
  return (
    <header className="header">
      <Link to="/" className="brand">Senior Ride</Link>
      <nav className="nav" aria-label="Main">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/who-we-are">Who we are</NavLink>
        <NavLink to="/about">About us</NavLink>
        {/* The booking form opens in a new tab. The hidden text tells screen readers. */}
        <a href="/book" target="_blank" rel="noopener noreferrer" className="nav-book">Book a ride<span className="sr-only"> (opens in a new tab)</span></a>
      </nav>
      <a className="call" href={`tel:${PHONE}`}>Prefer to book by phone? Call {PHONE}</a>
      <AccessibilityControls />
    </header>
  );
}
