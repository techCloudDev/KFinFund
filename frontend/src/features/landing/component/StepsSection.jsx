import { useInView } from "../hooks/useInView";

function StepCard({ number, icon, title, desc, delay }) {
  const [ref, inView] = useInView();

  return (
    <div
      ref={ref}
      className={`lp-step-card lp-reveal${inView ? " is-visible" : ""}`}
      style={{ "--delay": `${delay}ms` }}
    >
      <div className="lp-step-card__icon">{icon}</div>
      <div className="lp-step-card__number">Step {number}</div>
      <h3 className="lp-step-card__title">{title}</h3>
      <p className="lp-step-card__desc">{desc}</p>
    </div>
  );
}

export default function StepsSection() {
  return (
    <section className="lp-steps">
      <div className="lp-steps__grid-bg" />

      <div className="lp-container lp-container--relative">
        <div className="lp-steps__header">
          <div className="lp-section-label">How it works</div>
          <h2 className="lp-section-title">Invest in 3 Simple Steps</h2>
          <p className="lp-section-subtitle">
            Go from zero to your first SIP in under 5 minutes.
          </p>
        </div>

        <div className="lp-steps__cards">
          <StepCard
            number="01"
            icon="👤"
            title="Register"
            delay={0}
            desc="Create your free account in less than 2 minutes using your mobile number and email."
          />
          <StepCard
            number="02"
            icon="🛡️"
            title="PAN Verify"
            delay={120}
            desc="Complete KYC instantly with PAN verification and bank mandate setup — 100% paperless."
          />
          <StepCard
            number="03"
            icon="🐷"
            title="Start SIP"
            delay={240}
            desc="Pick from curated funds and kick off your Systematic Investment Plan right away."
          />
        </div>
      </div>
    </section>
  );
}
