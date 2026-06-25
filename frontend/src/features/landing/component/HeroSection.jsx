import { useState, useCallback } from "react";
import { useInView } from "../hooks/useInView";
import { AMCS_ROW1, AMCS_ROW2 } from "../amc_images/amcs";
import logoImg from "../../../assets/Logo.png";

function MarqueeRow({ items, direction = "ltr", speed = 32 }) {
  const doubled = [...items, ...items];
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div
      className="lp-marquee"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className={`lp-marquee__track lp-marquee__track--${direction}`}
        style={{
          animationDuration: `${speed}s`,
          animationPlayState: isPaused ? "paused" : "running",
        }}
      >
        {doubled.map((a, i) => (
          <div key={i} className="lp-marquee__item">
            <AmcLogo amc={a} />
            {a.name}
          </div>
        ))}
      </div>
    </div>
  );
}

/** AMC logo with error fallback to abbreviation */
function AmcLogo({ amc }) {
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  if (amc.logo && !hasError) {
    return (
      <img
        src={amc.logo}
        alt={amc.name}
        onError={handleError}
        loading="lazy"
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          objectFit: "contain",
          background: "white",
          padding: "2px",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      />
    );
  }

  return (
    <div
      className="lp-marquee__abbr"
      style={{ background: amc.bg, color: amc.color }}
    >
      {amc.abbr}
    </div>
  );
}

export default function HeroSection({ mouse }) {
  const [heroRef, heroInView] = useInView(0.05);

  return (
    <section
      ref={heroRef}
      className={`lp-hero${heroInView ? " is-visible" : ""}`}
    >
      {/* ── Background layers ── */}
      <div className="lp-hero__bg">
        <div className="lp-hero__gradient-bg" />
        <div className="lp-hero__mesh-overlay" />
        {/* Floating decorative orbs */}
        <div
          className="lp-hero__orb lp-hero__orb--1"
          style={{ "--orb-left": `${mouse.x * 6 - 10}%` }}
        />
        <div className="lp-hero__orb lp-hero__orb--2" />
        <div className="lp-hero__orb lp-hero__orb--3" />
      </div>

      {/* ── Main content ── */}
      <div className="lp-hero__content">
        <div className="lp-hero__splash-layout">
          {/* Left side: branding & text */}
          <div className="lp-hero__splash-left">
            <div className="lp-hero__splash-logo">
              <img
                src={logoImg}
                alt="KFinFund Logo"
                className="lp-hero__splash-logo-img"
              />
              <span className="lp-hero__splash-logo-text">KfinFund</span>
            </div>

            <h1 className="lp-hero__splash-tagline">
              <span className="lp-hero__splash-tagline-word lp-hero__splash-tagline-word--invest">
                Invest.
              </span>
              <span className="lp-hero__splash-tagline-word lp-hero__splash-tagline-word--grow">
                Grow.
              </span>
              <span className="lp-hero__splash-tagline-word lp-hero__splash-tagline-word--secure">
                Secure.
              </span>
            </h1>

            <p className="lp-hero__splash-subtitle">
              Your trusted partner in wealth creation
            </p>

            <div className="lp-hero__splash-actions">
              <button type="button" className="lp-btn-primary lp-hero__splash-cta">
                Start Investing Free 🚀
              </button>
              <button type="button" className="lp-btn-secondary lp-hero__splash-explore">
                Explore Funds →
              </button>
            </div>

            <div className="lp-hero__trust">
              {[
                ["5M+", "Investors"],
                ["₹0", "Commission"],
                ["40+", "AMC Partners"],
              ].map(([val, label]) => (
                <div key={label} className="lp-hero__trust-item">
                  <div className="lp-hero__trust-value">{val}</div>
                  <div className="lp-hero__trust-label">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side: decorative illustration */}
          <div className="lp-hero__splash-right">
            <div className="lp-hero__illustration">
              {/* Glowing coin stack */}
              <div className="lp-hero__coin lp-hero__coin--1">₹</div>
              <div className="lp-hero__coin lp-hero__coin--2">₹</div>
              <div className="lp-hero__coin lp-hero__coin--3">₹</div>
              {/* Growing plant / chart */}
              <div className="lp-hero__growth-chart">
                <svg viewBox="0 0 200 120" className="lp-hero__chart-svg">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(108, 58, 237, 0.35)" />
                      <stop offset="100%" stopColor="rgba(108, 58, 237, 0)" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M10 100 Q40 90 60 70 T100 40 T150 20 T190 10"
                    fill="none"
                    stroke="rgba(255, 183, 3, 0.9)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="lp-hero__chart-line"
                  />
                  <path
                    d="M10 100 Q40 90 60 70 T100 40 T150 20 T190 10 L190 120 L10 120 Z"
                    fill="url(#chartGrad)"
                    className="lp-hero__chart-fill"
                  />
                </svg>
              </div>
              {/* Shield icon */}
              <div className="lp-hero__shield">🛡️</div>
            </div>
          </div>
        </div>

        {/* ── AMC Marquee ── */}
        <div className="lp-marquee-wrap">
          <MarqueeRow items={AMCS_ROW1} direction="ltr" speed={35} />
          <MarqueeRow items={AMCS_ROW2} direction="rtl" speed={28} />
        </div>
      </div>
    </section>
  );
}
