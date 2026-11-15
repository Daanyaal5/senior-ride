import { Link } from "react-router-dom";
import ContactOptions from "../components/ContactOptions";
import { useFees } from "../hooks/useFees";
import { ASSISTANCE_NAME } from "../utils/brand";

/** Booking policy: short and plain. PLACEHOLDER wording: have it reviewed before launch. */
export default function Terms() {
  const fees = useFees(); // from server/data/fees.csv
  return (
    <main className="page legal">
      <h1>Booking Policy</h1>
      <p className="lead">Please read this before you book.</p>

      <h2>1. We Are Not a Taxi Service</h2>
      <p>We provide pre-arranged transportation for seniors, people with accessibility and mobility needs, wheelchair users, and children who need special care. We also provide airport pickup and drop-off. We are not an ambulance or a medical service. In an emergency, call 911.</p>

      <h2>2. Book in Advance</h2>
      <p>All rides are booked in advance. You can pay by card, Apple Pay or Interac e-Transfer before the ride, or in cash to the driver at your destination. Card, Apple Pay and e-Transfer rides are confirmed once we receive your payment. Cash rides are confirmed when we call you.</p>

      <h2>3. Prices</h2>
      <p>Prices are fixed and include tax. You see the full price before you pay. {ASSISTANCE_NAME} (the driver helps and stays with you) is ${fees.assistancePerHour} per hour. An urgent ride (today or short notice) has a ${fees.urgent} urgent ride fee, and we confirm by phone that a driver is available. For long-distance trips or other areas, contact us for a price.</p>

      <h2>4. Waiting Time</h2>
      <p className="warning">Waiting time costs ${fees.waitPer30} for every 30 minutes the driver waits. It is charged to the card you paid with, or paid to the driver.</p>

      <h2>5. If We Cancel</h2>
      <p>We may cancel a ride at any time, even after you have paid. If we do, you receive a 100% refund within 5 business days.</p>

      <h2>6. Driver Language</h2>
      <p>We try our best to match you with a driver who speaks your preferred language, but we cannot guarantee it.</p>

      <h2>Questions?</h2>
      <ContactOptions />
      <p><Link to="/privacy">Privacy policy</Link></p>
    </main>
  );
}