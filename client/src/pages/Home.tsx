import Photo from "../components/Photo";
import HeroVideo from "../components/HeroVideo";
import PriceList from "../components/PriceList";
import ContactOptions from "../components/ContactOptions";
import HeroContact from "../components/HeroContact";
import { ASSISTANCE_NAME, CONTACT_LINKS, TAGLINE } from "../utils/brand";
import { useFees } from "../hooks/useFees";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import PricesLink, { scrollToPrices } from "../components/PricesLink";

/**
 * Landing page: hero, who we serve, prices, how it works, long distance, policy.
 * Photos go in client/public/images/.
 */
export default function Home() {
  const fees = useFees(); // from server/data/fees.csv
  const { hash } = useLocation();

  // Arriving from another page's "Prices" link (/#prices): scroll down once the page has drawn.
  useEffect(() => {
    if (hash === "#prices") window.setTimeout(scrollToPrices, 80);
  }, [hash]);

  return (
    <main>
      <section className="hero">
        <HeroVideo />
        {/* Dark fade on one side of the video so the white text is easy to read. */}
        <div className="hero-shade" aria-hidden="true" />
        <HeroContact />
        <div className="hero-text">
          <p className="hero-tagline">{TAGLINE}</p>
          <h1>Safe, Caring Rides for Seniors and Wheelchair Users.</h1>
          {/* Computers show the full sentence; phones show the short list so it fits on one line. */}
          <p className="hero-lead">
            <span className="lead-full">Pre-Booked Rides in Halifax, Dartmouth, Sackville, Bedford, Hammonds Plains &amp; the Airport</span>
            <span className="lead-short">Halifax · Dartmouth · Sackville · Bedford · Hammonds Plains · Airport</span>
          </p>
          <p className="hero-note">(We Also Do Long Distance, Just <a href={CONTACT_LINKS.call}>Call Us</a> for Details)</p>
          <ul className="hero-points">
            <li>Doctor's Appointments</li>
            <li>Wheelchair Accessible</li>
            <li>Fixed Prices, Tax Included</li>
            <li>Available 24/7</li>
          </ul>
          {/* Opens the booking form in a new tab. */}
          <div className="hero-buttons">
            <a className="button gold" href="/book" target="_blank" rel="noopener noreferrer">Book a Ride<span className="sr-only"> (opens in a new tab)</span></a>
            <PricesLink className="button ghost">See Prices</PricesLink>
          </div>
        </div>
      </section>

      <section className="section split">
        <div>
          <h2>We Are Not a Taxi Service.</h2>
          <p className="subheading">We Are Pre-Arranged Transportation</p>
          <p>We provide pre-arranged transportation for people who need a little more care: seniors, people with accessibility and mobility needs, wheelchair users, and children who need special care.</p>
          <p>We are also professional for airport pickup and drop-off.</p>
        </div>
        <Photo src="/images/driver-and-passenger.webp" alt="A driver helping a passenger into the car" hint="Driver helping a passenger, 1200×800" />
      </section>

      <section className="section">
        <h2>What We Offer</h2>
        <div className="cards offer-cards">
          <div className="card"><h3>Doctors and Medical Appointments</h3><p>Rides to and from doctor's appointments, clinics, hospitals and all medical appointments.</p></div>
          <div className="card"><h3>Airport Pickup and Drop-Off</h3><p>Fixed prices to and from Halifax Stanfield airport.</p></div>
          <div className="card"><h3>Wheelchair Accessible</h3><p>Tell us in the booking notes or call us, and we send the right vehicle.</p></div>
          <div className="card"><h3>{ASSISTANCE_NAME}</h3><p>Your driver helps you in and out and stays with you as needed.</p></div>
          <div className="card"><h3>Your Language</h3><p>We try our best to match you with a driver who speaks your language.</p></div>
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
        <h2>How to Book</h2>
        <div className="cards">
          <div><span className="step-num">1</span><h3>Choose Where and When</h3><p>Type your addresses or tap "airport", and pick the time.</p></div>
          <div><span className="step-num">2</span><h3>See Your Price</h3><p>The full price appears straight away, tax included.</p></div>
          <div><span className="step-num">3</span><h3>Pay and You're Booked</h3><p>Pay by card, Apple Pay or Interac e-Transfer, or pay the driver in cash.</p></div>
        </div>
      </section>

      <section className="section">
        <h2>Long Distance or Another Area?</h2>
        <ContactOptions />
      </section>

      <section className="section">
        <div className="policy-box">
          <h2>Our Booking Policy, in Short</h2>
          <ul>
            <li>All rides are booked in advance. Pay by card, Apple Pay, e-Transfer, or cash to the driver.</li>
            <li>We may cancel a ride at any time, even after payment. If we do, you get a 100% refund within 5 business days.</li>
            <li className="warning">Waiting time: ${fees.waitPer30} for every 30 minutes the driver waits.</li>
          </ul>
          <a href="/terms">Read the Full Policy</a>
        </div>
      </section>
    </main>
  );}