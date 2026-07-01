import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../mutual-fund/component/DashboardLayout";
import PublicLayout from "../mutual-fund/component/PublicLayout";

const formatCurrency = (n) =>
  `₹${Math.round(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

// ── SIP future value: FV = P × [((1+r)^n − 1) / r] × (1+r) ──
const calculateSipFV = (monthlyAmount, years, annualReturnPct) => {
  const n = years * 12;
  const r = annualReturnPct / 12 / 100;
  if (r === 0) return monthlyAmount * n;
  return monthlyAmount * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
};

// ── Lumpsum future value: FV = P × (1+r)^n ──
const calculateLumpsumFV = (principal, years, annualReturnPct) => {
  return principal * Math.pow(1 + annualReturnPct / 100, years);
};

function Slider({ label, value, onChange, min, max, step, prefix = "", suffix = "" }) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: "600" }}>{label}</span>
        <div style={{
          background: "#f3f0ff", color: "#6C3AED", fontWeight: "700",
          fontSize: "14px", padding: "4px 12px", borderRadius: "8px",
          minWidth: "90px", textAlign: "center",
        }}>
          {prefix}{value.toLocaleString("en-IN")}{suffix}
        </div>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#6C3AED", height: "6px", cursor: "pointer" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}>
        <span>{prefix}{min.toLocaleString("en-IN")}{suffix}</span>
        <span>{prefix}{max.toLocaleString("en-IN")}{suffix}</span>
      </div>
    </div>
  );
}

function ResultDonut({ investedPct }) {
  const r = 60, cx = 80, cy = 80;
  const toRad = (deg) => (deg - 90) * Math.PI / 180;
  const investedDeg = (investedPct / 100) * 360;
  const describeArc = (startDeg, endDeg) => {
    const x1 = cx + r * Math.cos(toRad(startDeg)), y1 = cy + r * Math.sin(toRad(startDeg));
    const x2 = cx + r * Math.cos(toRad(endDeg)), y2 = cy + r * Math.sin(toRad(endDeg));
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${endDeg - startDeg > 180 ? 1 : 0} 1 ${x2} ${y2} Z`;
  };
  return (
    <svg viewBox="0 0 160 160" width="140" height="140">
      <path d={describeArc(0, investedDeg)} fill="#6C3AED" />
      <path d={describeArc(investedDeg, 360)} fill="#22c55e" />
      <circle cx={cx} cy={cy} r="36" fill="#fff" />
    </svg>
  );
}

function CalculatorContent({ initialMode = "sip" }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(initialMode);
  const isLoggedIn = !!localStorage.getItem("token");

  const fundName = searchParams.get("fundName");
  const fundReturnParam = searchParams.get("return");

  const [sipAmount, setSipAmount] = useState(5000);
  const [sipYears, setSipYears] = useState(10);
  const [sipReturn, setSipReturn] = useState(12);
  const [lumpsumAmount, setLumpsumAmount] = useState(100000);
  const [lumpsumYears, setLumpsumYears] = useState(10);
  const [lumpsumReturn, setLumpsumReturn] = useState(12);

  // ✅ Auto-fill expected return from the fund's real CAGR when arriving
  // from MutualFundDetailPage's "Calculate Returns" link.
  useEffect(() => {
    if (fundReturnParam) {
      const parsed = parseFloat(fundReturnParam);
      if (!isNaN(parsed) && parsed > 0) {
        const clamped = Math.min(30, Math.max(1, Math.round(parsed * 10) / 10));
        setSipReturn(clamped);
        setLumpsumReturn(clamped);
      }
    }
  }, [fundReturnParam]);

  const sipResult = useMemo(() => {
    const fv = calculateSipFV(sipAmount, sipYears, sipReturn);
    const invested = sipAmount * sipYears * 12;
    return { fv, invested, returns: fv - invested, investedPct: Math.round((invested / fv) * 100) };
  }, [sipAmount, sipYears, sipReturn]);

  const lumpsumResult = useMemo(() => {
    const fv = calculateLumpsumFV(lumpsumAmount, lumpsumYears, lumpsumReturn);
    return { fv, invested: lumpsumAmount, returns: fv - lumpsumAmount, investedPct: Math.round((lumpsumAmount / fv) * 100) };
  }, [lumpsumAmount, lumpsumYears, lumpsumReturn]);

  const result = mode === "sip" ? sipResult : lumpsumResult;

  return (
    <div style={{ maxWidth: "920px", margin: "0 auto" }}>
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>
          {mode === "sip" ? "SIP Return Calculator" : "Lumpsum Return Calculator"}
        </h2>
        <p style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>
          Estimate how your investments could grow over time. These are projections, not guaranteed returns.
        </p>
      </div>

      {/* Fund-specific banner */}
      {fundName && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "linear-gradient(135deg, #f3f0ff, #ede9fe)", border: "1.5px solid #c4b5fd",
          borderRadius: "12px", padding: "14px 20px", marginBottom: "20px", flexWrap: "wrap", gap: "10px",
        }}>
          <div>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#5b21b6" }}>
              📊 Using real historical return for: {decodeURIComponent(fundName)}
            </div>
            <div style={{ fontSize: "12px", color: "#7c3aed", marginTop: "2px" }}>
              Expected return auto-filled from this fund's actual 3-year CAGR — adjust the slider to try other scenarios.
            </div>
          </div>
          <button onClick={() => navigate(isLoggedIn ? "/calculators" : "/calculators/sip")} style={{
            background: "transparent", border: "1.5px solid #7c3aed", color: "#7c3aed",
            borderRadius: "8px", padding: "6px 14px", fontSize: "12px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap",
          }}>
            Clear & use generic calculator
          </button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        {[
          { key: "sip", label: "Monthly SIP", path: isLoggedIn ? "/calculators" : "/calculators/sip" },
          { key: "lumpsum", label: "One-Time / Lumpsum", path: isLoggedIn ? "/calculators" : "/calculators/lumpsum" },
        ].map(t => (
          <button key={t.key} onClick={() => {
            setMode(t.key);
            if (!isLoggedIn) navigate(t.path);
          }} style={{
            flex: 1, padding: "12px", borderRadius: "10px", fontSize: "14px", fontWeight: "700",
            border: `1.5px solid ${mode === t.key ? "#6C3AED" : "#e5e7eb"}`,
            background: mode === t.key ? "#6C3AED" : "#fff",
            color: mode === t.key ? "#fff" : "#374151", cursor: "pointer",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }} className="mf-detail-grid">
        {/* Inputs */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "14px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          {mode === "sip" ? (
            <>
              <Slider label="Monthly Investment" value={sipAmount} onChange={setSipAmount} min={500} max={200000} step={500} prefix="₹" />
              <Slider label="Time Period" value={sipYears} onChange={setSipYears} min={1} max={30} step={1} suffix=" yrs" />
              <Slider label="Expected Annual Return" value={sipReturn} onChange={setSipReturn} min={1} max={30} step={0.1} suffix="%" />
            </>
          ) : (
            <>
              <Slider label="Investment Amount" value={lumpsumAmount} onChange={setLumpsumAmount} min={1000} max={5000000} step={1000} prefix="₹" />
              <Slider label="Time Period" value={lumpsumYears} onChange={setLumpsumYears} min={1} max={30} step={1} suffix=" yrs" />
              <Slider label="Expected Annual Return" value={lumpsumReturn} onChange={setLumpsumReturn} min={1} max={30} step={0.1} suffix="%" />
            </>
          )}
        </div>

        {/* Results */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "14px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <ResultDonut investedPct={result.investedPct} />
          <div style={{ display: "flex", gap: "16px", marginTop: "12px", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#6b7280" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#6C3AED", display: "inline-block" }} />
              Invested
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#6b7280" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
              Est. Returns
            </div>
          </div>

          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
              <span style={{ fontSize: "13px", color: "#6b7280" }}>Invested Amount</span>
              <strong style={{ fontSize: "14px", color: "#111827" }}>{formatCurrency(result.invested)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
              <span style={{ fontSize: "13px", color: "#6b7280" }}>Estimated Returns</span>
              <strong style={{ fontSize: "14px", color: "#16a34a" }}>+{formatCurrency(result.returns)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "#f3f0ff", borderRadius: "10px", marginTop: "4px" }}>
              <span style={{ fontSize: "14px", fontWeight: "700", color: "#6C3AED" }}>Total Value</span>
              <span style={{ fontSize: "20px", fontWeight: "800", color: "#6C3AED" }}>{formatCurrency(result.fv)}</span>
            </div>
          </div>
        </div>
      </div>

      <p style={{ fontSize: "12px", color: "#9ca3af", textAlign: "center", marginTop: "20px" }}>
        * This is an estimate based on the assumptions entered above. Actual mutual fund returns vary and are subject to market risk.
      </p>

      {/* ✅ CTA for non-logged-in users — shows below calculator, nudging them to sign up */}
      {!isLoggedIn && (
        <div style={{
          marginTop: "28px", background: "linear-gradient(135deg, #6C3AED, #8B5CF6)",
          borderRadius: "14px", padding: "28px 32px", textAlign: "center", color: "#fff",
        }}>
          <h3 style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 8px" }}>Ready to start investing?</h3>
          <p style={{ fontSize: "14px", margin: "0 0 20px", opacity: 0.85 }}>
            Open a free account and start your first SIP in minutes — no paperwork, fully online.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/register")} style={{
              background: "#fff", color: "#6C3AED", border: "none", borderRadius: "999px",
              padding: "10px 28px", fontWeight: "700", fontSize: "14px", cursor: "pointer",
            }}>
              Create Free Account →
            </button>
            <button onClick={() => navigate("/login")} style={{
              background: "transparent", color: "#fff", border: "2px solid rgba(255,255,255,0.6)",
              borderRadius: "999px", padding: "10px 28px", fontWeight: "700", fontSize: "14px", cursor: "pointer",
            }}>
              Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Public SIP Calculator (non-logged-in) ──
export function SipCalculator() {
  const isLoggedIn = !!localStorage.getItem("token");
  if (isLoggedIn) {
    // If somehow a logged-in user hits this route, render in DashboardLayout
    return <DashboardLayout pageTitle="SIP Calculator"><CalculatorContent initialMode="sip" /></DashboardLayout>;
  }
  return <PublicLayout pageTitle="SIP Calculator"><CalculatorContent initialMode="sip" /></PublicLayout>;
}

// ── Public Lumpsum Calculator (non-logged-in) ──
export function LumpsumCalculator() {
  const isLoggedIn = !!localStorage.getItem("token");
  if (isLoggedIn) {
    return <DashboardLayout pageTitle="Lumpsum Calculator"><CalculatorContent initialMode="lumpsum" /></DashboardLayout>;
  }
  return <PublicLayout pageTitle="Lumpsum Calculator"><CalculatorContent initialMode="lumpsum" /></PublicLayout>;
}

// ── Authenticated Calculator (logged-in, with sidebar) ──
export default function Calculators() {
  return (
    <DashboardLayout pageTitle="Return Calculators">
      <CalculatorContent initialMode="sip" />
    </DashboardLayout>
  );
}