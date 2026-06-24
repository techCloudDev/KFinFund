import { useInView } from "../hooks/useInView";

const STATS = [
  { val: "₹2,400 Cr+", label: "Assets Managed", icon: "💰", color: "#eff6ff", accent: "#3b82f6" },
  { val: "5M+", label: "Happy Investors", icon: "🎉", color: "#faf5ff", accent: "#8b5cf6" },
  { val: "40+", label: "AMC Partners", icon: "🤝", color: "#f0fdf4", accent: "#22c55e" },
  { val: "4.8★", label: "App Rating", icon: "⭐", color: "#fefce8", accent: "#eab308" },
];

function StatCard({ val, label, icon, color, accent }) {
  const [ref, inView] = useInView();

  return (
    <div
      ref={ref}
      className={`lp-stat-card lp-reveal lp-reveal--scale${inView ? " is-visible" : ""}`}
      style={{ "--stat-bg": color, "--stat-accent": accent }}
    >
      <div className="lp-stat-card__icon">{icon}</div>
      <div className="lp-stat-card__value">{val}</div>
      <div className="lp-stat-card__label">{label}</div>
    </div>
  );
}

export default function StatsSection() {
  return (
    <section className="lp-stats">
      <div className="lp-stats__radial" />

      <div className="lp-container lp-container--relative">
        <div className="lp-stats__header">
          <h2 className="lp-stats__title">Trusted by millions across India</h2>
        </div>

        <div className="lp-stats__grid">
          {STATS.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
