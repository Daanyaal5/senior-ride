/** Landing page: looping video, plain-language promise, one big button. */
export default function Home() {
  return (
    <main>
      <section className="hero">
        <video className="hero-video" autoPlay muted loop playsInline aria-hidden="true">
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        <div className="hero-text">
          <h1>A driver who speaks your language, and takes care of you.</h1>
          <p>Book a ride for yourself or a parent. Pick a time, tell us your language, and we do the rest.</p>
          {/* Opens the booking form in a new tab. */}
          <a className="button" href="/book" target="_blank" rel="noopener noreferrer">Book a ride<span className="sr-only"> (opens in a new tab)</span></a>
        </div>
      </section>

      <section className="features">
        <h2>Why families choose us</h2>
        <ul>
          <li><strong>Your language.</strong> Tell us what you speak and we will try to match a driver who speaks it.</li>
          <li><strong>Extra Care.</strong> Your driver helps you in and out of the car and makes sure you are settled.</li>
          <li><strong>A family contact.</strong> If we cannot reach you, we call the person you choose.</li>
          <li><strong>Price up front.</strong> See your estimated fare before you book.</li>
        </ul>
      </section>
    </main>
  );
}
