import { EMAIL } from "../utils/brand";

/** Privacy policy. PLACEHOLDER wording: have it reviewed before launch. */
export default function Privacy() {
  return (
    <main className="page legal">
      <h1>Privacy policy</h1>
      <p>Last updated: {new Date().toLocaleDateString("en-CA", { dateStyle: "long" })}</p>
      <h2>What we collect</h2>
      <p>Your name, phone number, email, an optional family contact's phone number, pickup and drop-off addresses, ride date and time, flight number if you give one, your preferred language, any notes you add, and whether you want Extra Care.</p>
      <h2>Why we collect it</h2>
      <p>To arrange and carry out your ride, contact you or your family contact about it, and match you with a suitable driver and vehicle.</p>
      <h2>How it is kept</h2>
      <p>Your booking is sent to us by email. Card and Apple Pay payments are handled by Square; we never see or store your full card number. Address search uses Google Maps.</p>
      <h2>Sharing</h2>
      <p>We do not sell your information. We share it only with the driver assigned to your ride and the service providers above.</p>
      <h2>Your choices</h2>
      <p>You can ask to see, correct or delete your information by contacting us at {EMAIL}.</p>
    </main>
  );
}