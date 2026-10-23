import Photo from "../components/Photo";
import HeroVideo from "../components/HeroVideo";
import PriceList from "../components/PriceList";
import ContactOptions from "../components/ContactOptions";
import { TAGLINE } from "../utils/brand";

/**
 * Landing page: hero, who we serve, prices, how it works, long distance, policy.
 * Photos go in client/public/images/.
 */
export default function Home() {
  return (
    <main>
      <section className="hero">
        <HeroVideo />
        <div className="hero-text">
          <p className="hero-tagline">{TAGLINE}</p>
          <h1>Pre-arranged, accessible rides in Halifax, and to and from the airport.</h1>
          <p>For seniors, people with mobility needs, wheelchair users and children who need special care. Book in advance, see your price, and pay online.</p>
          {/* Opens the booking form in a new tab. */}
          <a className="button gold" href="/book" target="_blank" rel="noopener noreferrer">Book a ride<span className="sr-only"> (opens in a new tab)</span></a>
          <a className="button ghost" href="#prices">See prices</a>
        </div>
      </section>

      <section className="section split">
        <div>
          <h2>We are not a taxi service.</h2>
          <p>We provide pre-arranged transportation for people who need a little more care: seniors, people with accessibility and mobility needs, wheelchair users, and children who need special care.</p>
          <p>We are also professional for airport pickup and drop-off.</p>
        </div>
        <Photo src="/images/driver-and-passenger.webp" alt="A driver helping a passenger into the car" hint="Driver helping a passenger, 1200×800" />
      </section>

      <section className="section">
        <h2>What we offer</h2>
        <div className="cards">
          <div className="card"><h3>Airport pickup and drop-off</h3><p>Fixed prices to and from Halifax Stanfield airport.</p></div>
          <div className="card"><h3>Wheelchair accessible</h3><p>Tell us in the booking notes or call us, and we send the right vehicle.</p></div>
          <div className="card"><h3>Extra Care</h3><p>Your driver helps you in and out and stays with you as needed.</p></div>
          <div className="card"><h3>Your language</h3><p>We try our best to match you with a driver who speaks your language.</p></div>
        </div>
      </section>

      <section className="band" id="prices">
        <div className="section">
          <h2>Prices</h2>
          <p>Fixed prices. Tax included. Same price in both directions.</p>
          <PriceList />
        </div>
      </section>

      <section className="section" id="how">
        <h2>How to book</h2>
        <div className="cards">
          <div><span className="step-num">1</span><h3>Choose where and when</h3><p>Type your addresses or tap "airport", and pick the time.</p></div>
          <div><span className="step-num">2</span><h3>See your price</h3><p>The full price appears straight away, tax included.</p></div>
          <div><span className="step-num">3</span><h3>Pay and you're booked</h3><p>Pay by card, Apple Pay or Interac e-Transfer, or pay the driver in cash.</p></div>
        </div>
      </section>

      <section className="section">
        <h2>Long distance or another area?</h2>
        <ContactOptions />
      </section>

      <section className="section">
        <div className="policy-box">
          <h2>Our booking policy, in short</h2>
          <ul>
            <li>All rides are booked in advance. Pay by card, Apple Pay, e-Transfer, or cash to the driver.</li>
            <li>We may cancel a ride at any time, even after payment. If we do, you get a 100% refund within 5 business days.</li>
            <li className="warning">Waiting time: $20 for every 30 minutes the driver waits.</li>
          </ul>
          <a href="/terms">Read the full policy</a>
        </div>
      </section>
    </main>
  );
}