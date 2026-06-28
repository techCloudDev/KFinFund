import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../mutual-fund/component/DashboardLayout";
import PortfolioSummary from "./PortfolioSummary";
import "./portfolio.css";

const TRANSACTION_SERVICE_URL = import.meta.env.VITE_TRANSACTION_API || "http://localhost:4003";
const SIP_SERVICE_URL = import.meta.env.VITE_SIP_API || "http://localhost:4004";

const getAmcLogo = (fundName = "") => {
  const name = fundName.toLowerCase();
  if (name.includes("hdfc"))    return "https://assets-netstorage.groww.in/mf-assets/logos/hdfc_groww.png";
  if (name.includes("sbi"))     return "https://assets-netstorage.groww.in/mf-assets/logos/sbi_groww.png";
  if (name.includes("parag"))   return "https://assets-netstorage.groww.in/mf-assets/logos/ppfas_groww.png";
  if (name.includes("nippon"))  return "https://assets-netstorage.groww.in/mf-assets/logos/nippon_groww.png";
  if (name.includes("quant"))   return "https://assets-netstorage.groww.in/mf-assets/logos/quant_groww.png";
  if (name.includes("axis"))    return "https://assets-netstorage.groww.in/mf-assets/logos/axis_groww.png";
  if (name.includes("icici"))   return "https://assets-netstorage.groww.in/mf-assets/logos/icici_groww.png";
  if (name.includes("bandhan")) return "https://assets-netstorage.groww.in/mf-assets/logos/bandhan_groww.png";
  if (name.includes("kotak"))   return "https://assets-netstorage.groww.in/mf-assets/logos/kotak_groww.png";
  if (name.includes("mirae"))   return "https://assets-netstorage.groww.in/mf-assets/logos/mirae_groww.png";
  if (name.includes("tata"))    return "https://assets-netstorage.groww.in/mf-assets/logos/tata_groww.png";
  if (name.includes("dsp"))     return "https://assets-netstorage.groww.in/mf-assets/logos/dsp_groww.png";
  if (name.includes("aditya") || name.includes("birla")) return "https://assets-netstorage.groww.in/mf-assets/logos/absl_groww.png";
  if (name.includes("uti"))     return "https://assets-netstorage.groww.in/mf-assets/logos/uti_groww.png";
  return "https://assets-netstorage.groww.in/mf-assets/logos/sbi_groww.png";
};

// Fund name → mfapi.in scheme code
const FUND_NAME_TO_CODE = {
  "sbi bluechip fund direct growth": 119775,
  "hdfc mid-cap opportunities fund direct growth": 119063,
  "parag parikh flexi cap fund direct growth": 122639,
  "axis bluechip fund direct plan growth": 120465,
  "mirae asset large cap fund direct growth": 118833,
  "icici prudential bluechip fund direct growth": 120594,
  "nippon india small cap fund direct growth": 120828,
  "quant active fund direct growth": 120847,
  "kotak emerging equity fund direct growth": 120155,
  "dsp midcap fund direct growth": 119280,
  "hdfc small cap fund direct growth": 119062,
  "sbi small cap fund direct growth": 125497,
  "axis small cap fund direct growth": 125354,
  "icici prudential value discovery fund direct growth": 120614,
  "tata digital india fund direct growth": 135799,
  "sbi contra fund direct growth": 119782,
  "nippon india growth fund direct growth": 120716,
  "quant small cap fund direct growth": 120849,
  "mirae asset emerging bluechip fund direct growth": 118825,
  "hdfc top 100 fund direct growth": 119065,
  "axis midcap fund direct growth": 120473,
  "kotak bluechip fund direct growth": 120147,
  "uti flexi cap fund direct growth": 120750,
  "dsp small cap fund direct growth": 119295,
  "aditya birla sun life frontline equity fund direct growth": 119551,
  "icici prudential asset allocator fund direct growth": 120599,
  "bandhan small cap fund direct growth": 148784,
  "nippon india liquid fund direct growth": 119827,
  "axis liquid fund direct growth": 119854,
};
const getFundCode = (name = "") => FUND_NAME_TO_CODE[name.toLowerCase().trim()] || null;

// ✅ Fetch live NAV from mfapi.in
const fetchLiveNav = async (fundName) => {
  const code = getFundCode(fundName);
  if (!code) return null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`https://api.mfapi.in/mf/${code}`, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.data?.length) return null;
    return parseFloat(json.data[0].nav);
  } catch { return null; }
};

const WHY_INVEST = [
  { icon: "📈", title: "Wealth Creation", desc: "Mutual funds have historically delivered 12–15% annual returns over long periods." },
  { icon: "🛡️", title: "Professional Management", desc: "Expert fund managers actively manage your money to maximize returns." },
  { icon: "💡", title: "Diversification", desc: "Spread risk across multiple stocks and sectors with a single investment." },
  { icon: "💧", title: "High Liquidity", desc: "Redeem your investments anytime — money credited within 1–3 working days." },
];

// ✅ Redeem Modal
function RedeemModal({ fund, onClose, onSuccess }) {
  const [units, setUnits] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const maxUnits = parseFloat(fund.total_units || 0);
  const currentNav = fund.currentNav || (fund.currentValue / fund.total_units);
  const approxValue = units ? (parseFloat(units) * currentNav).toFixed(2) : 0;

  const handleRedeem = async () => {
    if (!units || parseFloat(units) <= 0) { setError("Enter valid units."); return; }
    if (parseFloat(units) > maxUnits) { setError(`Max units: ${maxUnits.toFixed(4)}`); return; }
    setLoading(true); setError("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${TRANSACTION_SERVICE_URL}/api/transactions/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fund_id: fund.name, units: parseFloat(units), nav: parseFloat(currentNav.toFixed(2)) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Redemption failed");
      onSuccess(fund.name, units);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "420px", padding: "28px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#111827" }}>Redeem Units</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#6b7280" }}>✕</button>
        </div>
        <div style={{ background: "#f9fafb", borderRadius: "10px", padding: "14px 16px", marginBottom: "20px" }}>
          <div style={{ fontSize: "14px", fontWeight: "600", color: "#111827", marginBottom: "10px" }}>{fund.name}</div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "13px", color: "#6b7280" }}>Units Held</span>
            <strong style={{ fontSize: "13px" }}>{maxUnits.toFixed(4)}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "13px", color: "#6b7280" }}>Current NAV</span>
            <strong style={{ fontSize: "13px", color: "#6C3AED" }}>₹{currentNav.toFixed(2)}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e5e7eb", paddingTop: "8px", marginTop: "4px" }}>
            <span style={{ fontSize: "13px", color: "#6b7280" }}>Current Value</span>
            <strong style={{ fontSize: "13px", color: "#6C3AED" }}>₹{Number(fund.currentValue).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong>
          </div>
        </div>
        <label style={{ fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.4px", display: "block", marginBottom: "8px" }}>Units to Redeem</label>
        <div style={{ border: "1.5px solid #e5e7eb", borderRadius: "10px", padding: "10px 14px", display: "flex", alignItems: "center", marginBottom: "8px" }}>
          <input type="number" placeholder="e.g. 5.0000" step="0.0001" value={units}
            onChange={e => { setUnits(e.target.value); setError(""); }}
            style={{ border: "none", outline: "none", fontSize: "15px", flex: 1, color: "#111827" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
          <button type="button" onClick={() => setUnits(String(maxUnits.toFixed(4)))}
            style={{ background: "none", border: "none", color: "#EF4444", fontSize: "12px", fontWeight: "700", cursor: "pointer", padding: 0 }}>
            Redeem All ({maxUnits.toFixed(4)} units)
          </button>
          {units && <span style={{ fontSize: "12px", color: "#6b7280" }}>≈ ₹{Number(approxValue).toLocaleString("en-IN")}</span>}
        </div>
        <div style={{ background: "#fef9c3", border: "1px solid #fde047", borderRadius: "8px", padding: "10px 12px", marginBottom: "16px", fontSize: "12px", color: "#a16207" }}>
          ⚠️ Exit load of 1% applies if redeemed within 365 days.
        </div>
        {error && <div style={{ color: "#dc2626", fontSize: "13px", marginBottom: "12px", background: "#fef2f2", padding: "10px 12px", borderRadius: "8px" }}>⚠️ {error}</div>}
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onClose} style={{ flex: 1, background: "transparent", color: "#6b7280", border: "1.5px solid #e5e7eb", borderRadius: "10px", padding: "12px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
          <button onClick={handleRedeem} disabled={loading || !units}
            style={{ flex: 1, background: loading || !units ? "#9ca3af" : "#EF4444", color: "#fff", border: "none", borderRadius: "10px", padding: "12px", fontSize: "14px", fontWeight: "700", cursor: loading || !units ? "not-allowed" : "pointer" }}>
            {loading ? "Processing..." : "Confirm Redeem"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  const navigate = useNavigate();
  const [isMasked, setIsMasked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [navLoading, setNavLoading] = useState(false);
  const [funds, setFunds] = useState([]);
  const [summary, setSummary] = useState({ currentValue: 0, investedValue: 0, dayChangeAmount: 0, dayChangePct: 0, returnsAmount: 0, returnsPct: 0, xirr: 0 });
  const [redeemFund, setRedeemFund] = useState(null);
  const [redeemSuccessMsg, setRedeemSuccessMsg] = useState("");

  const loadPortfolio = async () => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    setLoading(true);

    try {
      const [portfolioRes, sipRes] = await Promise.all([
        fetch(`${TRANSACTION_SERVICE_URL}/api/transactions/portfolio`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch(`${SIP_SERVICE_URL}/api/sips/my-sips`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => ({ sips: [] })),
      ]);

      const portfolio = portfolioRes.portfolio || [];
      const sips = sipRes.sips || (Array.isArray(sipRes) ? sipRes : []);
      const sipFundNames = new Set(sips.map(s => s.fund_name?.toLowerCase()));

      // Build initial fund list with invested values
      const initialFunds = portfolio
        .filter(f => parseFloat(f.total_units) > 0)
        .map(f => ({
          name:          f.fund_id,
          total_units:   parseFloat(f.total_units),
          avg_nav:       parseFloat(f.avg_nav || 0),
          invested:      parseFloat(f.invested),
          type:          sipFundNames.has(f.fund_id?.toLowerCase()) ? "SIP" : "LUMPSUM",
          logo:          getAmcLogo(f.fund_id),
          currentNav:    parseFloat(f.avg_nav || 0), // fallback until live NAV loads
          currentValue:  parseFloat(f.invested),     // fallback
          investedValue: parseFloat(f.invested),
          returnsAmount: 0,
          returnsPct:    0,
          navLoaded:     false,
        }));

      setFunds(initialFunds);
      setLoading(false);

      // ✅ Fetch live NAV for each fund in background
      if (initialFunds.length > 0) {
        setNavLoading(true);
        const updatedFunds = await Promise.all(
          initialFunds.map(async (fund) => {
            const liveNav = await fetchLiveNav(fund.name);
            if (!liveNav) return fund; // keep fallback
            const currentValue  = fund.total_units * liveNav;
            const returnsAmount = currentValue - fund.investedValue;
            const returnsPct    = fund.investedValue > 0 ? (returnsAmount / fund.investedValue) * 100 : 0;
            return {
              ...fund,
              currentNav:    liveNav,
              currentValue,
              returnsAmount,
              returnsPct:    parseFloat(returnsPct.toFixed(2)),
              xirr:          parseFloat(returnsPct.toFixed(2)),
              navLoaded:     true,
            };
          })
        );

        setFunds(updatedFunds);

        // ✅ Recalculate summary with real values
        const totalInvested = updatedFunds.reduce((s, f) => s + f.investedValue, 0);
        const totalCurrent  = updatedFunds.reduce((s, f) => s + f.currentValue, 0);
        const totalReturns  = totalCurrent - totalInvested;
        const returnsPct    = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

        setSummary({
          currentValue:    totalCurrent,
          investedValue:   totalInvested,
          dayChangeAmount: -(totalInvested * 0.0075),
          dayChangePct:    -0.75,
          returnsAmount:   totalReturns,
          returnsPct:      parseFloat(returnsPct.toFixed(2)),
          xirr:            parseFloat(returnsPct.toFixed(2)),
        });
        setNavLoading(false);
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
      setNavLoading(false);
    }
  };

  useEffect(() => { loadPortfolio(); }, []);

  const handleRedeemSuccess = (fundName, units) => {
    setRedeemFund(null);
    setRedeemSuccessMsg(`Successfully redeemed ${units} units of ${fundName}`);
    setTimeout(() => setRedeemSuccessMsg(""), 4000);
    loadPortfolio();
  };

  const formatCurrency = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

  return (
    <DashboardLayout pageTitle="Portfolio">
      {redeemFund && <RedeemModal fund={redeemFund} onClose={() => setRedeemFund(null)} onSuccess={handleRedeemSuccess} />}

      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <header className="pf-portfolio-header" style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <h2 className="pf-portfolio-title">
              {loading ? "Investments" : `Investments (${funds.length})`}
            </h2>
            {/* ✅ Live NAV loading indicator */}
            {navLoading && (
              <span style={{ fontSize: "12px", color: "#6C3AED", fontWeight: "600", background: "#f3f0ff", padding: "4px 10px", borderRadius: "20px" }}>
                🔄 Fetching live NAV...
              </span>
            )}
          </div>
          {funds.length > 0 && (
            <button type="button" className="pf-eye-toggle-btn" onClick={() => setIsMasked(!isMasked)}>
              {isMasked ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          )}
        </header>

        {redeemSuccessMsg && (
          <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", fontSize: "14px", color: "#15803d", fontWeight: "600" }}>
            ✅ {redeemSuccessMsg}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#6b7280" }}>Loading portfolio...</div>

        ) : funds.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg, #f3f0ff, #ede9fe)", padding: "36px 24px", textAlign: "center", borderBottom: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: "56px", marginBottom: "16px" }}>📊</div>
              <h3 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: "0 0 10px" }}>Your Portfolio is Empty</h3>
              <p style={{ fontSize: "15px", color: "#6b7280", margin: "0 0 24px", maxWidth: "440px", marginLeft: "auto", marginRight: "auto", lineHeight: "1.6" }}>
                Start investing in mutual funds today and watch your wealth grow over time.
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={() => navigate("/mutual-fund")} style={{ background: "#6C3AED", color: "#fff", border: "none", borderRadius: "8px", padding: "12px 28px", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}>Browse Mutual Funds →</button>
                <button onClick={() => navigate("/user/sip")} style={{ background: "transparent", color: "#6C3AED", border: "1.5px solid #6C3AED", borderRadius: "8px", padding: "12px 28px", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}>Start a SIP</button>
              </div>
            </div>
            <div style={{ padding: "28px 24px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 20px" }}>Why invest in Mutual Funds?</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                {WHY_INVEST.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start", padding: "16px", background: "#f9fafb", borderRadius: "12px", border: "1px solid #f3f4f6" }}>
                    <span style={{ fontSize: "28px", flexShrink: 0 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "700", color: "#111827", marginBottom: "4px" }}>{item.title}</div>
                      <div style={{ fontSize: "13px", color: "#6b7280", lineHeight: "1.5" }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: "14px 24px", background: "#f9fafb", borderTop: "1px solid #e5e7eb" }}>
              <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af", textAlign: "center" }}>
                * Mutual Fund investments are subject to market risks. Please read all scheme-related documents carefully before investing.
              </p>
            </div>
          </div>

        ) : (
          <>
            <PortfolioSummary summaryData={summary} isMasked={isMasked} />

            <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {funds.map((fund, i) => {
                const fundCode = getFundCode(fund.name);
                const pl = fund.returnsAmount >= 0;
                return (
                  <div key={i} style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e5e7eb", padding: "18px 20px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                      <img src={fund.logo} alt={fund.name} style={{ width: "44px", height: "44px", borderRadius: "50%", border: "1px solid #e5e7eb", objectFit: "contain", flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "15px", fontWeight: "700", color: "#111827" }}>{fund.name}</span>
                          <span style={{ fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "8px", background: fund.type === "SIP" ? "#eff6ff" : "#f3f0ff", color: fund.type === "SIP" ? "#1d4ed8" : "#6C3AED" }}>{fund.type}</span>
                          {/* ✅ Live NAV badge */}
                          {fund.navLoaded && (
                            <span style={{ fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "8px", background: "#f0fdf4", color: "#15803d" }}>
                              Live NAV: ₹{fund.currentNav.toFixed(2)}
                            </span>
                          )}
                        </div>

                        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", marginBottom: "14px" }}>
                          <div>
                            <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.4px" }}>Current Value</div>
                            <div style={{ fontSize: "16px", fontWeight: "800", color: "#111827" }}>
                              {isMasked ? "••••••" : formatCurrency(fund.currentValue)}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.4px" }}>Invested</div>
                            <div style={{ fontSize: "14px", fontWeight: "600", color: "#6b7280" }}>
                              {isMasked ? "••••••" : formatCurrency(fund.investedValue)}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.4px" }}>P&L</div>
                            <div style={{ fontSize: "14px", fontWeight: "700", color: pl ? "#10b981" : "#ef4444" }}>
                              {isMasked ? "••••" : `${pl ? "+" : ""}${formatCurrency(fund.returnsAmount)} (${pl ? "+" : ""}${fund.returnsPct}%)`}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.4px" }}>Units</div>
                            <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                              {fund.total_units.toFixed(4)}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "8px" }}>
                          <button onClick={() => fundCode ? navigate(`/mutual-fund/${fundCode}`) : navigate("/mutual-fund")}
                            style={{ padding: "8px 18px", background: "#6C3AED", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
                            + Buy More
                          </button>
                          <button onClick={() => setRedeemFund(fund)}
                            style={{ padding: "8px 18px", background: "transparent", color: "#EF4444", border: "1.5px solid #EF4444", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
                            Redeem
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}