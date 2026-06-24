import { useInView } from "../hooks/useInView";

export default function CTASection() {
  const [ref, inView] = useInView();

  return (
    <section className="lp-cta">
      <div className="lp-cta__inner">
        <div ref={ref} className={`lp-cta__card${inView ? " is-visible" : ""}`}>
          <div className="lp-cta__circle lp-cta__circle--top" />
          <div className="lp-cta__circle lp-cta__circle--bottom" />

          <div className="lp-cta__emoji">🚀</div>
          <h2 className="lp-cta__title">Your future self will thank you</h2>
          <p className="lp-cta__text">
            Start SIP with as little as ₹100/month. Zero commission, zero
            paperwork, zero excuses.
          </p>
          <button type="button" className="lp-cta__btn">
            Start Investing Today →
          </button>
        </div>
      </div>
    </section>
  );
}
