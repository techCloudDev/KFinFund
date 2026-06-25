import { useState, useEffect, useRef } from "react";

const AMCS_ROW1 = [
  { abbr: "SB", name: "SBI Mutual Fund", color: "#3b82f6", bg: "#eff6ff" },
  { abbr: "HD", name: "HDFC Mutual Fund", color: "#ef4444", bg: "#fef2f2" },
  { abbr: "IC", name: "ICICI Prudential", color: "#f97316", bg: "#fff7ed" },
  { abbr: "AX", name: "Axis Mutual Fund", color: "#ec4899", bg: "#fdf2f8" },
  { abbr: "KO", name: "Kotak Mutual Fund", color: "#6366f1", bg: "#eef2ff" },
  { abbr: "AB", name: "Aditya Birla", color: "#eab308", bg: "#fefce8" },
];
const AMCS_ROW2 = [
  { abbr: "NP", name: "Nippon India", color: "#ef4444", bg: "#fef2f2" },
  { abbr: "TA", name: "Tata Mutual Fund", color: "#06b6d4", bg: "#ecfeff" },
  { abbr: "DS", name: "DSP Mutual Fund", color: "#a855f7", bg: "#faf5ff" },
  { abbr: "MI", name: "Mirae Asset", color: "#14b8a6", bg: "#f0fdfa" },
  { abbr: "UT", name: "UTI Mutual Fund", color: "#64748b", bg: "#f8fafc" },
  { abbr: "ED", name: "Edelweiss", color: "#22c55e", bg: "#f0fdf4" },
];

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function AnimatedOrb({ style }) {
  return (
    <div style={{
      position: "absolute", borderRadius: "50%",
      filter: "blur(80px)", pointerEvents: "none", transition: "all 0.1s",
      ...style
    }} />
  );
}

function MarqueeRow({ items, direction = "ltr", speed = 32 }) {
  const doubled = [...items, ...items];
  const anim = direction === "ltr" ? "marquee-ltr" : "marquee-rtl";
  return (
    <div style={{
      overflow: "hidden", display: "flex",
      maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
      WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
    }}>
      <div style={{
        display: "flex", gap: "1rem", width: "max-content",
        animation: `${anim} ${speed}s linear infinite`,
      }}>
        {doubled.map((a, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: "0.6rem",
            padding: "0.7rem 1.4rem", background: "white",
            borderRadius: "999px", border: "1px solid #f1f5f9",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            fontWeight: 600, color: "#1e293b", fontSize: "0.9rem",
            whiteSpace: "nowrap", cursor: "pointer",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6,
              background: a.bg, color: a.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.65rem", fontWeight: 800,
            }}>{a.abbr}</div>
            {a.name}
          </div>
        ))}
      </div>
    </div>
  );
}

function StepCard({ number, icon, title, desc, delay }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{
      background: "white", borderRadius: 24, padding: "2rem",
      boxShadow: "0 4px 24px rgba(0,0,0,0.07)", border: "1px solid #f1f5f9",
      display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
      transition: `all 0.6s cubic-bezier(.22,1,.36,1) ${delay}ms`,
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(40px)",
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 18,
        background: "linear-gradient(135deg, #dbeafe, #eff6ff)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.8rem", marginBottom: "1.2rem",
        boxShadow: "0 4px 12px rgba(59,130,246,0.15)",
      }}>{icon}</div>
      <div style={{
        fontSize: "0.7rem", fontWeight: 800, color: "#3b82f6",
        letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.4rem",
      }}>Step {number}</div>
      <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.6rem" }}>{title}</h3>
      <p style={{ color: "#64748b", fontSize: "0.92rem", lineHeight: 1.65, margin: 0 }}>{desc}</p>
    </div>
  );
}

function NavDropdown({ label, items }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}>
      <button style={{
        display: "flex", alignItems: "center", gap: 4,
        background: "none", border: "none", cursor: "pointer",
        color: "#475569", fontWeight: 600, fontSize: "0.92rem",
        padding: "0.5rem 0", fontFamily: "inherit",
        transition: "color 0.2s",
      }}
        onMouseEnter={e => e.currentTarget.style.color = "#3b82f6"}
        onMouseLeave={e => e.currentTarget.style.color = "#475569"}>
        {label}
        <span style={{ transition: "transform 0.25s", display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)", fontSize: "0.7rem" }}>▾</span>
      </button>
      <div style={{
        position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 100,
        background: "white", borderRadius: 14, padding: "0.5rem",
        boxShadow: "0 12px 40px rgba(0,0,0,0.12)", border: "1px solid #f1f5f9",
        minWidth: 200,
        opacity: open ? 1 : 0, pointerEvents: open ? "all" : "none",
        transform: open ? "translateY(0)" : "translateY(-8px)",
        transition: "all 0.2s cubic-bezier(.22,1,.36,1)",
      }}>
        {items.map((item, i) => (
          <a key={i} href="#" style={{
            display: "block", padding: "0.55rem 0.9rem", borderRadius: 9,
            color: "#475569", fontSize: "0.87rem", textDecoration: "none",
            transition: "all 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.color = "#3b82f6"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#475569"; }}>
            {item}
          </a>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [scrollY, setScrollY] = useState(0);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [heroRef, heroInView] = useInView(0.05);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    const onMouse = (e) => setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouse, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("mousemove", onMouse); };
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif", background: "#f8fafc", color: "#0f172a", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        @keyframes marquee-ltr { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        @keyframes marquee-rtl { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes float { 0%,100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-16px) rotate(3deg); } }
        @keyframes pulse-ring { 0%,100% { transform: scale(1); opacity:0.7; } 50% { transform: scale(1.08); opacity:0.4; } }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fade-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes grid-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 999px; }
      `}</style>

      {/* HEADER */}
      <header style={{
        position: "sticky", top: 0, zIndex: 200,
        background: scrollY > 10 ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.7)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(241,245,249,0.8)",
        transition: "background 0.3s, box-shadow 0.3s",
        boxShadow: scrollY > 10 ? "0 4px 24px rgba(0,0,0,0.06)" : "none",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 70 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <div style={{
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              padding: "8px", borderRadius: 12, color: "white", fontSize: "1.1rem",
              boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
            }}>📈</div>
            <span style={{ fontWeight: 900, fontSize: "1.35rem", color: "#1e3a8a", letterSpacing: "-0.02em" }}>InvestPro</span>
          </div>

          <nav style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
            <NavDropdown label="Mutual Funds" items={["Start Investment", "My Portfolio", "STP", "Return Calculator", "Taxes"]} />
            <NavDropdown label="Fund Categories" items={["Large Cap", "Mid Cap", "Small Cap", "Flexi Cap", "Liquid Fund", "Tax Saving (ELSS)", "Commodity"]} />
            <NavDropdown label="Features" items={["Portfolio Analysis", "Register with PAN", "Smart Alerts", "Multiple Bank Accounts", "Watchlist"]} />
          </nav>

          <button style={{
            background: "linear-gradient(135deg, #3b82f6, #6366f1)",
            color: "white", border: "none", borderRadius: 999,
            padding: "0.6rem 1.5rem", fontWeight: 700, fontSize: "0.88rem",
            cursor: "pointer", fontFamily: "inherit",
            boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
            transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(99,102,241,0.45)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(99,102,241,0.35)"; }}>
            Login / Sign Up
          </button>
        </div>
      </header>

      {/* HERO */}
      <section ref={heroRef} style={{ position: "relative", overflow: "hidden", paddingTop: "5rem", paddingBottom: "4rem", minHeight: "92vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {/* Dynamic orb background */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
          <AnimatedOrb style={{
            width: 600, height: 600, top: "-10%",
            left: `${mouse.x * 6 - 10}%`,
            background: "radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)",
          }} />
          <AnimatedOrb style={{
            width: 500, height: 500, top: "20%", right: "-5%",
            background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          }} />
          <AnimatedOrb style={{
            width: 400, height: 400, bottom: "5%", left: "20%",
            background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)",
          }} />
          {/* Grid dots */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "radial-gradient(circle, rgba(99,102,241,0.12) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            opacity: 0.7,
          }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem" }}>
          {/* Hero text */}
          <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 3.5rem" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)",
              borderRadius: 999, padding: "0.4rem 1rem", marginBottom: "1.5rem",
              fontSize: "0.82rem", fontWeight: 700, color: "#6366f1",
              animation: heroInView ? "fade-up 0.6s ease both" : "none",
            }}>
              <span style={{ animation: "spin-slow 4s linear infinite", display: "inline-block" }}>✦</span>
              India's smartest investing platform
            </div>

            <h1 style={{
              fontSize: "clamp(2.4rem, 6vw, 4.2rem)", fontWeight: 900,
              lineHeight: 1.1, letterSpacing: "-0.03em",
              color: "#0f172a", marginBottom: "1.4rem",
              animation: heroInView ? "fade-up 0.7s 0.1s ease both" : "none",
            }}>
              Invest with the{" "}
              <span style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>Top AMCs</span>{" "}
              in India
            </h1>

            <p style={{
              fontSize: "1.1rem", color: "#64748b", lineHeight: 1.7,
              marginBottom: "2.2rem", fontWeight: 500,
              animation: heroInView ? "fade-up 0.7s 0.2s ease both" : "none",
            }}>
              Start your wealth creation journey today. Explore thousands of mutual funds, analyze performance, and invest seamlessly — all in one place.
            </p>

            <div style={{
              display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap",
              animation: heroInView ? "fade-up 0.7s 0.3s ease both" : "none",
            }}>
              <button style={{
                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                color: "white", border: "none", borderRadius: 999,
                padding: "0.85rem 2.2rem", fontWeight: 800, fontSize: "1rem",
                cursor: "pointer", fontFamily: "inherit",
                boxShadow: "0 8px 28px rgba(99,102,241,0.4)",
                transition: "all 0.25s cubic-bezier(.22,1,.36,1)",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px) scale(1.03)"; e.currentTarget.style.boxShadow = "0 14px 36px rgba(99,102,241,0.5)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0) scale(1)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(99,102,241,0.4)"; }}>
                Start Investing Free 🚀
              </button>
              <button style={{
                background: "white", color: "#1e293b",
                border: "1.5px solid #e2e8f0", borderRadius: 999,
                padding: "0.85rem 2rem", fontWeight: 700, fontSize: "1rem",
                cursor: "pointer", fontFamily: "inherit",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                transition: "all 0.25s cubic-bezier(.22,1,.36,1)",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}>
                Explore Funds →
              </button>
            </div>

            {/* Trust badges */}
            <div style={{
              display: "flex", gap: "2rem", justifyContent: "center", marginTop: "2.5rem", flexWrap: "wrap",
              animation: heroInView ? "fade-up 0.7s 0.4s ease both" : "none",
            }}>
              {[["5M+", "Investors"], ["₹0", "Commission"], ["40+", "AMC Partners"]].map(([val, label]) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 900, fontSize: "1.4rem", color: "#1e293b" }}>{val}</div>
                  <div style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* AMC Marquees */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <MarqueeRow items={AMCS_ROW1} direction="ltr" speed={35} />
            <MarqueeRow items={AMCS_ROW2} direction="rtl" speed={28} />
          </div>
        </div>
      </section>

      {/* 3 STEPS SECTION */}
      <section style={{
        background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
        padding: "6rem 1.5rem",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
        <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "#6366f1", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "0.75rem" }}>How it works</div>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em" }}>
              Invest in 3 Simple Steps
            </h2>
            <p style={{ color: "#64748b", marginTop: "0.8rem", fontSize: "1rem", fontWeight: 500 }}>
              Go from zero to your first SIP in under 5 minutes.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            <StepCard number="01" icon="👤" title="Register" delay={0}
              desc="Create your free account in less than 2 minutes using your mobile number and email." />
            <StepCard number="02" icon="🛡️" title="PAN Verify" delay={120}
              desc="Complete KYC instantly with PAN verification and bank mandate setup — 100% paperless." />
            <StepCard number="03" icon="🐷" title="Start SIP" delay={240}
              desc="Pick from curated funds and kick off your Systematic Investment Plan right away." />
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section style={{ padding: "5rem 1.5rem", background: "white", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: 700, height: 700, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em" }}>
              Trusted by millions across India
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.5rem" }}>
            {[
              { val: "₹2,400 Cr+", label: "Assets Managed", icon: "💰", color: "#eff6ff", accent: "#3b82f6" },
              { val: "5M+", label: "Happy Investors", icon: "🎉", color: "#faf5ff", accent: "#8b5cf6" },
              { val: "40+", label: "AMC Partners", icon: "🤝", color: "#f0fdf4", accent: "#22c55e" },
              { val: "4.8★", label: "App Rating", icon: "⭐", color: "#fefce8", accent: "#eab308" },
            ].map(({ val, label, icon, color, accent }) => {
              const [ref, inView] = useInView();
              return (
                <div key={label} ref={ref} style={{
                  background: color, borderRadius: 20, padding: "1.8rem 1.5rem",
                  textAlign: "center", border: `1px solid ${accent}22`,
                  transition: "all 0.6s cubic-bezier(.22,1,.36,1)",
                  opacity: inView ? 1 : 0,
                  transform: inView ? "translateY(0) scale(1)" : "translateY(30px) scale(0.96)",
                }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.6rem" }}>{icon}</div>
                  <div style={{ fontWeight: 900, fontSize: "1.7rem", color: accent, letterSpacing: "-0.02em" }}>{val}</div>
                  <div style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 600, marginTop: "0.3rem" }}>{label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{ padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          {(() => {
            const [ref, inView] = useInView();
            return (
              <div ref={ref} style={{
                background: "linear-gradient(135deg, #1e40af 0%, #4f46e5 50%, #7c3aed 100%)",
                borderRadius: 32, padding: "4rem 3rem", textAlign: "center",
                position: "relative", overflow: "hidden",
                boxShadow: "0 24px 60px rgba(99,102,241,0.35)",
                transition: "all 0.8s cubic-bezier(.22,1,.36,1)",
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(50px)",
              }}>
                <div style={{
                  position: "absolute", top: "-60px", right: "-60px",
                  width: 260, height: 260, borderRadius: "50%",
                  background: "rgba(255,255,255,0.06)",
                  animation: "pulse-ring 4s ease-in-out infinite",
                }} />
                <div style={{
                  position: "absolute", bottom: "-40px", left: "-40px",
                  width: 200, height: 200, borderRadius: "50%",
                  background: "rgba(255,255,255,0.05)",
                  animation: "pulse-ring 5s 1s ease-in-out infinite",
                }} />
                <div style={{ fontSize: "3rem", marginBottom: "1rem", animation: "float 4s ease-in-out infinite" }}>🚀</div>
                <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.6rem)", fontWeight: 900, color: "white", marginBottom: "1rem", letterSpacing: "-0.02em" }}>
                  Your future self will thank you
                </h2>
                <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1rem", marginBottom: "2.2rem", lineHeight: 1.65, fontWeight: 500 }}>
                  Start SIP with as little as ₹100/month. Zero commission, zero paperwork, zero excuses.
                </p>
                <button style={{
                  background: "white", color: "#4f46e5",
                  border: "none", borderRadius: 999,
                  padding: "0.95rem 2.8rem", fontWeight: 800, fontSize: "1.05rem",
                  cursor: "pointer", fontFamily: "inherit",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                  transition: "all 0.25s cubic-bezier(.22,1,.36,1)",
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px) scale(1.04)"; e.currentTarget.style.boxShadow = "0 16px 36px rgba(0,0,0,0.25)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0) scale(1)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.2)"; }}>
                  Start Investing Today →
                </button>
              </div>
            );
          })()}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#0f172a", color: "#94a3b8", padding: "4rem 1.5rem 2rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2.5rem", marginBottom: "3rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
                <div style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", padding: 8, borderRadius: 10, fontSize: "1rem" }}>📈</div>
                <span style={{ fontWeight: 900, fontSize: "1.2rem", color: "white" }}>InvestPro</span>
              </div>
              <p style={{ fontSize: "0.87rem", lineHeight: 1.7 }}>
                Empowering millions of Indians to achieve their financial goals through smart, simple investments.
              </p>
            </div>
            <div>
              <h4 style={{ color: "white", fontWeight: 700, marginBottom: "1rem", fontSize: "0.95rem" }}>Corporate Address</h4>
              <p style={{ fontSize: "0.87rem", lineHeight: 1.8 }}>
                📍 InvestPro Tower, 4th Floor,<br />
                Bandra Kurla Complex (BKC),<br />
                Mumbai, Maharashtra - 400051
              </p>
            </div>
            <div>
              <h4 style={{ color: "white", fontWeight: 700, marginBottom: "1rem", fontSize: "0.95rem" }}>Contact Us</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", fontSize: "0.87rem" }}>
                {[["📞", "1800-123-4567 (Toll-Free)"], ["✉️", "support@investpro.com"], ["💬", "Live Chat Support"]].map(([ico, txt]) => (
                  <a key={txt} href="#" style={{ display: "flex", alignItems: "center", gap: 8, color: "#94a3b8", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.color = "white"}
                    onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}>
                    {ico} {txt}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ color: "white", fontWeight: 700, marginBottom: "1rem", fontSize: "0.95rem" }}>Connect</h4>
              <p style={{ fontSize: "0.84rem", marginBottom: "1rem" }}>Daily market insights & tips.</p>
              <div style={{ display: "flex", gap: "0.7rem" }}>
                {["𝕏", "f", "in", "📸"].map((icon, i) => (
                  <a key={i} href="#" style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center",
                    justifyContent: "center", color: "#94a3b8", textDecoration: "none",
                    fontSize: "0.85rem", fontWeight: 700,
                    transition: "all 0.2s", border: "1px solid rgba(255,255,255,0.08)",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg, #3b82f6, #6366f1)"; e.currentTarget.style.color = "white"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#94a3b8"; }}>
                    {icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1.5rem", textAlign: "center", fontSize: "0.8rem" }}>
            <p>© {new Date().getFullYear()} InvestPro Financial Services. All rights reserved.</p>
            <p style={{ marginTop: "0.5rem", color: "#475569" }}>Mutual Fund investments are subject to market risks. Please read all scheme-related documents carefully.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
