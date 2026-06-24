import { useInView } from "../hooks/useInView";

const FEATURES = [
  {
    icon: "📊",
    title: "Portfolio Analysis",
    desc: "Track all your investments in one dashboard. Visualize returns, XIRR, and asset allocation at a glance.",
    color: "#eff6ff",
    accent: "#3b82f6",
  },
  {
    icon: "🔔",
    title: "Smart Alerts",
    desc: "Get notified about fund performance changes, SIP reminders, and market opportunities in real time.",
    color: "#faf5ff",
    accent: "#8b5cf6",
  },
  {
    icon: "🏦",
    title: "Multiple Bank Accounts",
    desc: "Link and manage multiple bank accounts for seamless, flexible SIP payments without hassle.",
    color: "#f0fdf4",
    accent: "#22c55e",
  },
  {
    icon: "🧮",
    title: "Return Calculator",
    desc: "Simulate SIP and lump-sum returns with our goal-based calculator before you invest a single rupee.",
    color: "#fefce8",
    accent: "#eab308",
  },
  {
    icon: "🛡️",
    title: "Instant KYC",
    desc: "Paperless PAN & Aadhaar-based KYC approved in minutes. No branch visits, no physical documents.",
    color: "#fff7ed",
    accent: "#f97316",
  },
  {
    icon: "👀",
    title: "Fund Watchlist",
    desc: "Shortlist funds you love, watch their performance, and invest when you're ready — all without pressure.",
    color: "#ecfeff",
    accent: "#06b6d4",
  },
];

function FeatureCard({ icon, title, desc, color, accent, delay }) {
  const [ref, inView] = useInView();

  return (
    <div
      ref={ref}
      className={`lp-feature-card${inView ? " is-visible" : ""}`}
      style={{
        "--feat-bg": color,
        "--feat-accent": accent,
        "--delay": `${delay}ms`,
      }}
    >
      <div className="lp-feature-card__icon-wrap">{icon}</div>
      <h3 className="lp-feature-card__title">{title}</h3>
      <p className="lp-feature-card__desc">{desc}</p>
    </div>
  );
}

export default function FeatureHighlights() {
  return (
    <section className="lp-features">
      <div className="lp-features__dots-bg" />

      <div className="lp-container lp-container--relative">
        <div className="lp-features__header">
          <div className="lp-section-label">Everything you need</div>
          <h2 className="lp-section-title">Built for serious investors</h2>
          <p className="lp-section-subtitle">
            Powerful tools and features that put the full power of professional
            wealth management in your hands.
          </p>
        </div>

        <div className="lp-features__grid">
          {FEATURES.map((feat, i) => (
            <FeatureCard key={feat.title} {...feat} delay={i * 80} />
          ))}
        </div>
      </div>
    </section>
  );
}
