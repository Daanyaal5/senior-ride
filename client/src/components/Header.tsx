import { Link } from "react-router-dom";
import AccessibilityControls from "./AccessibilityControls";

const PHONE = import.meta.env.VITE_PHONE_NUMBER;

/** Top bar on every page: name, phone number for people who prefer to call, display settings. */
export default function Header() {
  return (
    <header className="header">
      <Link to="/" className="brand">Senior Ride</Link>
      <a className="call" href={`tel:${PHONE}`}>Prefer to book by phone? Call {PHONE}</a>
      <AccessibilityControls />
    </header>
  );
}
