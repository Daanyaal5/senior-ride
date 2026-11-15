import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useLocation } from "react-router-dom";
import { BRAND_NAME, CONTACT_LINKS, PHONE_DISPLAY } from "../utils/brand";
import PricesLink from "./PricesLink";

/** Scrolls back to the top of the page and removes "#prices" from the address bar. */
function goTop() {
  if (window.location.pathname !== "/") return; // other pages: the normal link takes you home
  window.history.replaceState(null, "", "/");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.setTimeout(() => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }), 60); // after the phone menu closes
}

/** The page links, shared by the desktop bar and the phone menu. Only "Book a ride" opens a new tab. */
function NavLinks({ onPick }: { onPick?: () => void }) {
  return (
    <>
      {/* Home: if already on the home page (e.g. scrolled down to Prices), go back to the top */}
      <NavLink to="/" end onClick={() => { onPick?.(); goTop(); }}>Home</NavLink>
      <PricesLink onClick={onPick}>Prices</PricesLink>
      <NavLink to="/about" onClick={onPick}>About Us</NavLink>
      <NavLink to="/terms" onClick={onPick}>Booking Policy</NavLink>
      <a href="/book" target="_blank" rel="noopener noreferrer" className="nav-book" onClick={onPick}>
        Book a Ride<span className="sr-only"> (opens in a new tab)</span>
      </a>
    </>
  );
}

/**
 * Top bar on every page.
 * Wide screens: logo, name, links and phone number in one bar.
 * Phones: logo, name and a ☰ button that opens a full-screen translucent menu.
 */
export default function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close the menu whenever the page changes.
  useEffect(() => setOpen(false), [location.pathname, location.hash]);

  // While the menu is open: Escape closes it, and the page behind it doesn't scroll.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header className="header">
      {/* The logo image replaces the written name. The alt text gives screen readers the full name. */}
      <Link to="/" className="brand" aria-label={`${BRAND_NAME}, home page`}>
        <picture>
          <source srcSet="/images/logo.webp" type="image/webp" />
          <img className="brand-logo-full" src="/images/logo.png" alt={BRAND_NAME} width="588" height="160" />
        </picture>
      </Link>

      {/* Wide screens */}
      <nav className="nav nav-desktop" aria-label="Main"><NavLinks /></nav>
      {/* Top-right phone block: round phone icon, a small "24/7" label and the number in large type */}
      <a className="call call-desktop header-call" href={CONTACT_LINKS.call} aria-label={`Call or WhatsApp us 24/7 at ${PHONE_DISPLAY}`}>
        <span className="header-call-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg>
        </span>
        <span className="header-call-text">
          <span className="header-call-label"><span className="badge-247">24/7</span> <span className="header-call-words">Call or WhatsApp</span></span>
          <span className="header-call-number">{PHONE_DISPLAY}</span>
        </span>
      </a>

      {/* Phones */}
      <button type="button" className="menu-toggle" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(true)}>
        <span className="menu-icon" aria-hidden="true">☰</span><span className="sr-only">Open menu</span>
      </button>
      {/* Rendered on <body>, so the header's blur effect can't trap it inside the header. */}
      {open && createPortal(
        <div id="mobile-menu" className="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" className="menu-close" onClick={() => setOpen(false)} autoFocus>
            <span aria-hidden="true">✕</span><span className="sr-only">Close menu</span>
          </button>
          <nav className="mobile-nav" aria-label="Main"><NavLinks onPick={() => setOpen(false)} /></nav>
          {/* Contact buttons, 24/7 */}
          <a className="mobile-call" href={CONTACT_LINKS.call}>24/7: Call {PHONE_DISPLAY}</a>
          <div className="mobile-contact-row">
            <a className="mobile-call" href={CONTACT_LINKS.text}>Text</a>
            <a className="mobile-call" href={CONTACT_LINKS.whatsapp}>WhatsApp</a>
            <a className="mobile-call" href={CONTACT_LINKS.email}>Email</a>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}