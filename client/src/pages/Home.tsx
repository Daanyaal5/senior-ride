import Photo from "../components/Photo";

/**
 * Landing page, laid out in simple blocks: hero, why us, how it works, driver photo, review, call to action.
 * Photos go in client/public/images/ using the file names below.
 */
export default function Home() {
  return (
    <main>
      <section className="hero">
        <video className="hero-video" autoPlay muted loop playsInline aria-hidden="true">
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        <div className="hero-text">
          <h1>A driver who speaks your language, and takes care of you.</h1>
          <p>Safe, comfortable rides around Halifax for yourself or a parent. Pick a time, tell us your language, and we do the rest.</p>
          {/* Opens the booking form in a new tab. */}
          <a className="button gold" href="/book" target="_blank" rel="noopener noreferrer">Book a ride<span className="sr-only"> (opens in a new tab)</span></a>
          <a className="button ghost" href="#how">How it works</a>
        </div>
      </section>

      <section className="section split">
        <div>
          <h2>We understand.</h2>
          <p>Getting to an appointment, a visit or the shops should never be stressful. We offer more than a ride: a patient driver, a clear price, and a family member we can call if we cannot reach you.</p>
        </div>
        <Photo src="/images/driver-and-passenger.jpg" alt="A driver helping a passenger into the car" hint="Driver helping a passenger, 1200×800" />
      </section>

      <section className="section">
        <h2>Why families choose us</h2>
        <div className="cards">
          <div className="card"><h3>Your language</h3><p>Tell us what you speak. We will try our best to match you with a driver who speaks it.</p></div>
          <div className="card"><h3>Extra Care</h3><p>Your driver helps you in and out of the car and makes sure you are settled.</p></div>
          <div className="card"><h3>Family contact</h3><p>If we cannot reach you, we call the person you choose.</p></div>
          <div className="card"><h3>Price up front</h3><p>See your estimated fare before you book, and pay securely online.</p></div>
        </div>
      </section>

      <section className="band" id="how">
        <div className="section">
          <h2>How it works</h2>
          <div className="cards">
            <div><span className="step-num">1</span><h3>Confirm your phone</h3><p>We text you a short code so we know it is really you.</p></div>
            <div><span className="step-num">2</span><h3>Choose where and when</h3><p>Pick your addresses and roll the wheels to set your time.</p></div>
            <div><span className="step-num">3</span><h3>Pay and relax</h3><p>Pay securely online. We call to confirm your driver.</p></div>
          </div>
        </div>
      </section>

      <section className="section split">
        <Photo src="/images/our-drivers.jpg" alt="Our friendly drivers" hint="Your drivers, 1200×800" />
        <div>
          <h2>Meet our drivers.</h2>
          <p>Our drivers speak many languages and take the time to help. Add their names, photos and languages here when you are ready.</p>
        </div>
      </section>

      <section className="section">
        {/* Replace with a REAL customer review, with their permission. */}
        <blockquote className="quote">Add a real customer review here.</blockquote>
      </section>
    </main>
  );
}
