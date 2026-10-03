/** Privacy policy. PLACEHOLDER: have a lawyer review and adjust it before you launch. */
export default function Privacy() {
  return (
    <main className="page legal">
      <h1>Privacy policy</h1>
      <p>Last updated: {new Date().toLocaleDateString("en-CA", { dateStyle: "long" })}</p>
      <h2>What we collect</h2>
      <p>Your name, phone number, email, a family contact's phone number, pickup and destination addresses, your preferred language, and your ride choices.</p>
      <h2>Why we collect it</h2>
      <p>To confirm it is really you, arrange and carry out your ride, contact you or your family contact about it, and match you with a driver.</p>
      <h2>Payments and text messages</h2>
      <p>Card payments are handled by Stripe. We do not see or store your card number. Verification texts are sent through a messaging provider.</p>
      <h2>Sharing</h2>
      <p>We do not sell your information. We share it only with the driver assigned to your ride and the service providers above.</p>
      <h2>Your choices</h2>
      <p>You can ask to see, correct or delete your information by contacting us.</p>
      <h2>Contact</h2>
      <p>hello@yourdomain.ca</p>
    </main>
  );
}