import { apiFetch } from "../../../utils/api";
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../component/DashboardLayout";
import PublicLayout from "../component/PublicLayout";
import { AMC_LOGOS } from "../component/amc_logo";
import FundChart from "../component/FundChart";
import "../mutual-fund.css";

const KYC_SERVICE_URL = import.meta.env.VITE_KYC_API || "http://localhost:4002";
const TRANSACTION_API  = import.meta.env.VITE_TRANSACTION_API || "http://localhost:4003";
const SIP_API          = import.meta.env.VITE_SIP_API || "http://localhost:4004";

const getAmcLogo = (name = "") => {
  const normalized = name.toLowerCase();
  for (const key in AMC_LOGOS) {
    if (normalized.includes(key)) return AMC_LOGOS[key];
  }
  return "https://assets-netstorage.groww.in/mf-assets/logos/sbi_groww.png";
};

const getRiskCategory = (schemeName = "") => {
  const name = schemeName.toLowerCase();
  if (name.includes("liquid") || name.includes("arbitrage") || name.includes("overnight") || name.includes("debt") || name.includes("treasury")) return "Low";
  if (name.includes("hybrid") || name.includes("balanced") || name.includes("conservative") || name.includes("allocator")) return "Mid";
  return "High";
};

const fetchWithRetry = async (url, attempts = 3) => {
  for (let i = 1; i <= attempts; i++) {
    const timeout = i * 6000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await apiFetch(url, { signal: controller.signal });
      clearTimeout(timer);
      return res;
    } catch (err) {
      clearTimeout(timer);
      if (i === attempts) throw err;
      await new Promise(r => setTimeout(r, 1000 * i));
    }
  }
};

export function MutualFundDetailPage() {
  const { schemeCode } = useParams();
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const [loading, setLoading]           = useState(true);
  const [fundData, setFundData]         = useState(null);
  const [error, setError]               = useState("");
  const [attemptCount, setAttemptCount] = useState(0);
  const [timeframe, setTimeframe]       = useState("1Y");

  // invest panel
  const [investMode, setInvestMode]       = useState("sip");
  const [investAmount, setInvestAmount]   = useState("100");
  const [investSuccess, setInvestSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [investLoading, setInvestLoading] = useState(false);

  // redeem
  const [redeemUnits, setRedeemUnits]     = useState("");
  const [redeemSuccess, setRedeemSuccess] = useState(false);
  const [redeemTxId, setRedeemTxId]       = useState("");

  // user state
  const [kycStatus, setKycStatus]     = useState(null);
  const [userHolding, setUserHolding] = useState(null); // holding for THIS fund

  // ── KYC status ──
  useEffect(() => {
    if (!isLoggedIn) { setKycStatus("NOT_LOGGED_IN"); return; }
    const token = localStorage.getItem("token");
    apiFetch(`${KYC_SERVICE_URL}/api/kyc/status`)
      .then(r => r.json()).then(d => setKycStatus(d.status || "NOT_SUBMITTED")).catch(() => setKycStatus("NOT_SUBMITTED"));
  }, [isLoggedIn]);

  // ── Portfolio check — does user hold THIS fund? ──
  useEffect(() => {
    if (!isLoggedIn || kycStatus !== "APPROVED" || !fundData) return;
    const token = localStorage.getItem("token");
    apiFetch(`${TRANSACTION_API}/api/transactions/portfolio`)
      .then(r => r.json())
      .then(data => {
        const holding = (data.portfolio || []).find(h =>
          h.fund_id?.toLowerCase() === fundData.name?.toLowerCase()
        );
        setUserHolding(holding || null);
      })
      .catch(() => setUserHolding(null));
  }, [isLoggedIn, kycStatus, fundData]);

  // ── SIP date helpers ──
  const { daysInNextMonth, nextMonthName, nextMonthYear, nextMonthIndex } = useMemo(() => {
    const today = new Date();
    const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const year = nextMonthDate.getFullYear();
    const monthIdx = nextMonthDate.getMonth();
    let daysCount = 30;
    if (monthIdx === 1) { daysCount = 28; }
    else { const m31 = [0, 2, 4, 6, 7, 9, 11]; if (m31.includes(monthIdx)) daysCount = 31; }
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return { daysInNextMonth: daysCount, nextMonthName: months[monthIdx], nextMonthYear: year, nextMonthIndex: monthIdx };
  }, []);

  const [selectedSipDay, setSelectedSipDay] = useState(() => {
    const todayDay = new Date().getDate();
    const nextMonthDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
    const monthIdx = nextMonthDate.getMonth();
    let daysCount = 30;
    if (monthIdx === 1) { daysCount = 28; }
    else { const m31 = [0, 2, 4, 6, 7, 9, 11]; if (m31.includes(monthIdx)) daysCount = 31; }
    return Math.min(todayDay, daysCount);
  });

  const sipDate = useMemo(() => {
    const mm = String(nextMonthIndex + 1).padStart(2, "0");
    const dd = String(selectedSipDay).padStart(2, "0");
    return `${nextMonthYear}-${mm}-${dd}`;
  }, [selectedSipDay, nextMonthIndex, nextMonthYear]);

  const daysArray = useMemo(() => Array.from({ length: daysInNextMonth }, (_, i) => i + 1), [daysInNextMonth]);

  const formattedInstallmentDate = useMemo(() =>
    `${String(selectedSipDay).padStart(2, "0")} ${nextMonthName} ${nextMonthYear}`,
    [selectedSipDay, nextMonthName, nextMonthYear]);

  // ── Watchlist ──
  const [watchlist, setWatchlist] = useState(() => {
    try { const stored = localStorage.getItem("watchlist"); return stored ? JSON.parse(stored) : []; }
    catch { return []; }
  });
  const isWatchlisted = useMemo(() => watchlist.some(item => String(item.code) === String(schemeCode)), [watchlist, schemeCode]);
  const toggleWatchlist = () => {
    if (!isLoggedIn) { navigate("/login"); return; }
    const updated = isWatchlisted
      ? watchlist.filter(item => String(item.code) !== String(schemeCode))
      : [...watchlist, { code: fundData.code, name: fundData.name, fundHouse: fundData.fundHouse, category: fundData.category, type: fundData.type, logo: fundData.logo, risk: fundData.risk, currentNav: fundData.currentNav, cagr3Y: fundData.cagr3Y }];
    setWatchlist(updated);
    localStorage.setItem("watchlist", JSON.stringify(updated));
  };

  // ── NAV helpers ──
  const getNavYearsAgo = (navHistory, years) => {
    if (!navHistory || navHistory.length === 0) return null;
    const parts = navHistory[0].date.split("-");
    const latestDate = new Date(parts[2], parts[1] - 1, parts[0]);
    const targetDate = new Date(latestDate);
    targetDate.setFullYear(latestDate.getFullYear() - years);
    let closestPoint = null, minDiff = Infinity;
    for (const point of navHistory) {
      const p = point.date.split("-");
      const pDate = new Date(p[2], p[1] - 1, p[0]);
      const diff = Math.abs(pDate.getTime() - targetDate.getTime());
      if (diff < minDiff) { minDiff = diff; closestPoint = point; }
    }
    if (minDiff > 45 * 24 * 60 * 60 * 1000) return null;
    return closestPoint;
  };

  const calculateCAGR = (currentNav, pastNav, years) => {
    if (!currentNav || !pastNav || pastNav <= 0) return null;
    return parseFloat(((Math.pow(currentNav / pastNav, 1 / years) - 1) * 100).toFixed(2));
  };

  const getHistoricalNavForTimeframe = (navHistory, tf) => {
    if (!navHistory || navHistory.length === 0) return null;
    const parts = navHistory[0].date.split("-");
    const latestDate = new Date(parts[2], parts[1] - 1, parts[0]);
    const targetDate = new Date(latestDate);
    if (tf === "1M") targetDate.setMonth(latestDate.getMonth() - 1);
    else if (tf === "6M") targetDate.setMonth(latestDate.getMonth() - 6);
    else if (tf === "1Y") targetDate.setFullYear(latestDate.getFullYear() - 1);
    else if (tf === "3Y") targetDate.setFullYear(latestDate.getFullYear() - 3);
    else if (tf === "5Y") targetDate.setFullYear(latestDate.getFullYear() - 5);
    else if (tf === "ALL") return navHistory[navHistory.length - 1];
    let closestPoint = null, minDiff = Infinity;
    for (const point of navHistory) {
      const p = point.date.split("-");
      const pDate = new Date(p[2], p[1] - 1, p[0]);
      const diff = Math.abs(pDate.getTime() - targetDate.getTime());
      if (diff < minDiff) { minDiff = diff; closestPoint = point; }
    }
    if (minDiff > 45 * 24 * 60 * 60 * 1000) return null;
    return closestPoint;
  };

  const dynamicReturn = useMemo(() => {
    if (!fundData?.rawHistory?.length) return null;
    const history = fundData.rawHistory;
    const currentNav = parseFloat(history[0].nav);
    const pastPoint = getHistoricalNavForTimeframe(history, timeframe);
    if (!pastPoint) return null;
    const pastNav = parseFloat(pastPoint.nav);
    const [d1, m1, y1] = history[0].date.split("-");
    const [d2, m2, y2] = pastPoint.date.split("-");
    const years = (new Date(y1, m1-1, d1) - new Date(y2, m2-1, d2)) / (365.25 * 24 * 60 * 60 * 1000);
    let returnVal = 0, returnType = "";
    if (timeframe === "1M" || timeframe === "6M") { returnVal = ((currentNav / pastNav) - 1) * 100; returnType = "Absolute Return"; }
    else { returnVal = years > 0 ? (Math.pow(currentNav / pastNav, 1 / years) - 1) * 100 : ((currentNav / pastNav) - 1) * 100; returnType = "Annualized CAGR Return"; }
    return { returnVal: parseFloat(returnVal.toFixed(2)), returnType, pastNav, pastDate: pastPoint.date, years: parseFloat(years.toFixed(2)) };
  }, [fundData, timeframe]);

  // ── Fetch fund data ──
  const fetchFundDetail = async () => {
    setLoading(true); setError("");
    try {
      setAttemptCount(a => a + 1);
      const res = await fetchWithRetry(`https://api.mfapi.in/mf/${schemeCode}`, 3);
      if (!res.ok) throw new Error("This fund could not be found.");
      const json = await res.json();
      if (!json?.data?.length) throw new Error("no_data");
      const parts = json.data[0].date.split("-");
      const latestDate = new Date(parts[2], parts[1] - 1, parts[0]);
      const daysSince = (new Date() - latestDate) / (1000 * 60 * 60 * 24);
      if (daysSince > 60) throw new Error("stale");
      const currentNav = parseFloat(json.data[0].nav);
      const point1Y = getNavYearsAgo(json.data, 1);
      const point3Y = getNavYearsAgo(json.data, 3);
      const point5Y = getNavYearsAgo(json.data, 5);
      const numericCode = parseInt(schemeCode, 10) || 100000;
      setFundData({
        code: json.meta.scheme_code, name: json.meta.scheme_name, fundHouse: json.meta.fund_house,
        category: json.meta.scheme_category || "Mutual Fund", type: json.meta.scheme_type || "Open Ended",
        logo: getAmcLogo(json.meta.fund_house || json.meta.scheme_name),
        currentNav, currentDate: json.data[0].date, risk: getRiskCategory(json.meta.scheme_name),
        cagr1Y: calculateCAGR(currentNav, point1Y ? parseFloat(point1Y.nav) : null, 1),
        cagr3Y: calculateCAGR(currentNav, point3Y ? parseFloat(point3Y.nav) : null, 3),
        cagr5Y: calculateCAGR(currentNav, point5Y ? parseFloat(point5Y.nav) : null, 5),
        aum: ((numericCode % 35) * 650 + 1200).toLocaleString("en-IN") + " Cr",
        expenseRatio: ((numericCode % 13) * 0.08 + 0.35).toFixed(2) + "%",
        minSip: numericCode % 2 === 0 ? "₹100" : "₹500",
        exitLoad: "1.00% if redeemed within 365 days",
        manager: numericCode % 3 === 0 ? "Mr. Rajeev Thakkar" : numericCode % 3 === 1 ? "Mr. Anupam Tiwari" : "Ms. Sohini Andani",
        rawHistory: json.data || [],
      });
    } catch (err) {
      setError(err.name === "AbortError" ? "timeout" : (err.message || "Unable to load fund details."));
    } finally { setLoading(false); }
  };

  useEffect(() => { if (schemeCode) fetchFundDetail(); }, [schemeCode]);

  // ── Invest handler ──
  const minAmount = investMode === "sip" ? 100 : 500;
  const isInvalidAmount = !investAmount || parseFloat(investAmount) < minAmount;
  const handleTabChange = (mode) => {
    setInvestMode(mode);
    setInvestAmount(mode === "sip" ? "100" : mode === "lumpsum" ? "500" : "");
    setInvestSuccess(false); setRedeemSuccess(false);
  };

  const handleInvestSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    setInvestLoading(true);
    try {
      if (investMode === "lumpsum") {
        const res = await apiFetch(`${TRANSACTION_API}/api/transactions/buy`, {
          method: "POST",
          headers: { "Content-Type": "application/json",
},
          body: JSON.stringify({ fund_id: fundData.name, amount: parseFloat(investAmount), nav: fundData.currentNav }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Transaction failed");
        setTransactionId(data.transaction?.id || "KFF-" + Math.floor(10000000 + Math.random() * 90000000));
      } else {
        const res = await apiFetch(`${SIP_API}/api/sips`, {
          method: "POST",
          headers: { "Content-Type": "application/json",
},
          body: JSON.stringify({ fund_name: fundData.name, amount: parseFloat(investAmount), frequency: "MONTHLY", start_date: sipDate }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "SIP creation failed");
        setTransactionId(data.sip?.id || data.id || "KFF-" + Math.floor(10000000 + Math.random() * 90000000));
      }
      setInvestSuccess(true);
      // Refresh holding after buy
      if (investMode === "lumpsum") {
        const token2 = localStorage.getItem("token");
        apiFetch(`${TRANSACTION_API}/api/transactions/portfolio`)
          .then(r => r.json()).then(data => {
            const h = (data.portfolio || []).find(h => h.fund_id?.toLowerCase() === fundData.name?.toLowerCase());
            setUserHolding(h || null);
          }).catch(() => {});
      }
    } catch (err) {
      alert(err.message || "Investment failed. Please try again.");
    } finally { setInvestLoading(false); }
  };

  // ── Redeem handler ──
  const handleRedeemSubmit = async (e) => {
    e.preventDefault();
    if (!redeemUnits || parseFloat(redeemUnits) <= 0) { alert("Enter valid units to redeem."); return; }
    if (userHolding && parseFloat(redeemUnits) > parseFloat(userHolding.total_units)) {
      alert(`You only have ${userHolding.total_units} units.`); return;
    }
    const token = localStorage.getItem("token");
    setInvestLoading(true);
    try {
      const res = await apiFetch(`${TRANSACTION_API}/api/transactions/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json",
},
        body: JSON.stringify({ fund_id: fundData.name, units: parseFloat(redeemUnits), nav: fundData.currentNav }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Redemption failed");
      setRedeemTxId(data.transaction?.id || "KFF-" + Math.floor(10000000 + Math.random() * 90000000));
      setRedeemSuccess(true);
      // Refresh holding
      apiFetch(`${TRANSACTION_API}/api/transactions/portfolio`)
        .then(r => r.json()).then(d => {
          const h = (d.portfolio || []).find(h => h.fund_id?.toLowerCase() === fundData.name?.toLowerCase());
          setUserHolding(h || null);
        }).catch(() => {});
    } catch (err) {
      alert(err.message || "Redemption failed. Please try again.");
    } finally { setInvestLoading(false); }
  };

  // ── Invest panel ──
  const renderInvestPanel = () => {
    // NOT LOGGED IN
    if (!isLoggedIn) return (
      <div style={{ textAlign: "center", padding: "24px 0" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔐</div>
        <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111827", margin: "0 0 8px" }}>Login to Invest</h3>
        <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "16px" }}>Create an account or login to start investing.</p>
        <button onClick={() => navigate("/login")} style={{ background: "#6C3AED", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 24px", fontSize: "14px", fontWeight: "700", cursor: "pointer", width: "100%", marginBottom: "8px" }}>Login →</button>
        <button onClick={() => navigate("/register")} style={{ background: "transparent", color: "#6C3AED", border: "1.5px solid #6C3AED", borderRadius: "8px", padding: "10px 24px", fontSize: "14px", fontWeight: "700", cursor: "pointer", width: "100%" }}>Create Account</button>
      </div>
    );

    // KYC NOT SUBMITTED
    if (kycStatus === "NOT_SUBMITTED") return (
      <div style={{ textAlign: "center", padding: "16px 0" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>📋</div>
        <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111827", margin: "0 0 8px" }}>KYC Required</h3>
        <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "16px", lineHeight: "1.5" }}>Complete KYC verification before investing as per SEBI regulations.</p>
        <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "8px", padding: "12px", marginBottom: "16px", fontSize: "13px", color: "#9a3412", textAlign: "left" }}>⚠️ KYC is mandatory to protect your investments.</div>
        <button onClick={() => navigate("/user/profile/kyc")} style={{ background: "#f59e0b", color: "#fff", border: "none", borderRadius: "8px", padding: "12px 24px", fontSize: "14px", fontWeight: "700", cursor: "pointer", width: "100%" }}>Complete KYC Now →</button>
      </div>
    );

    // KYC PENDING
    if (kycStatus === "PENDING") return (
      <div style={{ textAlign: "center", padding: "16px 0" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>⏳</div>
        <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111827", margin: "0 0 8px" }}>KYC Under Review</h3>
        <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "16px", lineHeight: "1.5" }}>Your documents are being verified. You can invest once approved.</p>
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "12px", fontSize: "13px", color: "#1e40af", textAlign: "left" }}>ℹ️ Verification takes <strong>1–2 working days</strong>.</div>
      </div>
    );

    // ── KYC APPROVED ──

    // BUY SUCCESS
    if (investSuccess) {
      const units = fundData?.currentNav ? (parseFloat(investAmount) / fundData.currentNav).toFixed(4) : "—";
      const orderId = `KFF-${String(transactionId).padStart(8, "0")}`;
      return (
        <div style={{ textAlign: "center", padding: "8px 0" }}>
          {/* Success icon */}
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "linear-gradient(135deg, #22c55e, #16a34a)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 4px 14px rgba(34,197,94,0.35)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>Order Placed Successfully!</h3>
          <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 20px" }}>
            {investMode === "sip" ? "Monthly SIP" : "One-Time Investment"} of <strong style={{ color: "#111827" }}>₹{parseFloat(investAmount).toLocaleString("en-IN")}</strong> set up
          </p>

          {/* Details card */}
          <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "16px", marginBottom: "20px", textAlign: "left" }}>
            {[
              ["Fund", fundData.name.length > 30 ? fundData.name.slice(0, 30) + "…" : fundData.name],
              ["Amount", `₹${parseFloat(investAmount).toLocaleString("en-IN")}`],
              investMode === "lumpsum" ? ["Units (approx)", `${units} units`] : ["Frequency", "Monthly"],
              ["NAV", `₹${fundData.currentNav.toFixed(2)}`],
              investMode === "sip" ? ["First Instalment", formattedInstallmentDate] : null,
              ["Order ID", orderId],
              ["Date & Time", new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })],
              ["Status", "✅ Processing"],
            ].filter(Boolean).map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>{label}</span>
                <span style={{ fontSize: "13px", color: "#111827", fontWeight: "600", textAlign: "right", maxWidth: "55%" }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <button type="button"
            onClick={() => navigate("/portfolio")}
            style={{ width: "100%", background: "#6C3AED", color: "#fff", border: "none", borderRadius: "10px", padding: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer", marginBottom: "8px" }}>
            View Portfolio →
          </button>
          <button type="button"
            onClick={() => { setInvestSuccess(false); setInvestMode("sip"); }}
            style={{ width: "100%", background: "transparent", color: "#6C3AED", border: "1.5px solid #6C3AED", borderRadius: "10px", padding: "11px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>
            Invest More
          </button>
        </div>
      );
    }

    // REDEEM SUCCESS
    if (redeemSuccess) return (
      <div className="mf-success-container">
        <div className="mf-success-icon-box" style={{ background: "linear-gradient(135deg,#ef4444,#f87171)" }}>✓</div>
        <h3 className="mf-success-title">Redemption Initiated!</h3>
        <p className="mf-success-text">Redeemed <strong>{redeemUnits} units</strong> of <em>{fundData.name}</em>.</p>
        <div style={{ backgroundColor: "#F3F4F6", padding: "12px", borderRadius: "8px", fontSize: "12px", color: "var(--mf-text-muted)", marginBottom: "20px", textAlign: "left" }}>
          <div><strong>Redemption ID:</strong> {redeemTxId}</div>
          <div style={{ marginTop: "4px" }}><strong>NAV:</strong> ₹{fundData.currentNav.toFixed(2)}</div>
          <div style={{ marginTop: "4px" }}><strong>Approx Value:</strong> ₹{(parseFloat(redeemUnits) * fundData.currentNav).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</div>
          <div style={{ marginTop: "4px" }}><strong>Date:</strong> {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
        </div>
        <button type="button" className="mf-success-close" onClick={() => { setRedeemSuccess(false); setInvestMode("sip"); }}>Done</button>
      </div>
    );

    return (
      <>
        <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 12px 0", color: "var(--mf-text-dark)", textAlign: "left" }}>
          {investMode === "redeem" ? "Redeem Units" : "Start Investment"}
        </h3>

        {/* ✅ KYC verified badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px", padding: "8px 12px", marginBottom: "16px", fontSize: "13px", color: "#15803d", fontWeight: "600" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          KYC Verified — You can invest freely
        </div>

        {/* ✅ Tabs — Monthly SIP | One-Time | Redeem (only if holding exists) */}
        <div className="mf-invest-tabs">
          <button type="button"
            className={`mf-invest-tab ${investMode === "sip" ? "active" : ""}`}
            onClick={() => handleTabChange("sip")}>
            Monthly SIP
          </button>
          <button type="button"
            className={`mf-invest-tab ${investMode === "lumpsum" ? "active" : ""}`}
            onClick={() => handleTabChange("lumpsum")}>
            One-Time
          </button>
          {userHolding && (
            <button type="button"
              className={`mf-invest-tab ${investMode === "redeem" ? "active" : ""}`}
              onClick={() => handleTabChange("redeem")}
              style={{
                color: investMode === "redeem" ? "#fff" : "#EF4444",
                background: investMode === "redeem" ? "#EF4444" : "transparent",
                borderColor: "#EF4444",
              }}>
              Redeem
            </button>
          )}
        </div>

        {/* ── BUY form (SIP / Lumpsum) ── */}
        {(investMode === "sip" || investMode === "lumpsum") && (
          <form onSubmit={handleInvestSubmit}>
            <div className="mf-invest-input-wrapper">
              <label className="mf-invest-label">Investment Amount</label>
              <div className="mf-invest-input-box">
                <span className="mf-invest-currency">₹</span>
                <input type="number" className="mf-invest-input" value={investAmount}
                  onChange={e => setInvestAmount(e.target.value)} min={minAmount} required />
              </div>
              {isInvalidAmount && investAmount !== "" && (
                <span style={{ color: "#EF4444", fontSize: "12px", marginTop: "6px", display: "block" }}>
                  Minimum {investMode === "sip" ? "SIP" : "One-Time"} is ₹{minAmount}
                </span>
              )}
            </div>

            {investMode === "sip" && (
              <div className="mf-invest-input-wrapper">
                <label className="mf-invest-label">SIP Installment Date</label>
                <div className="sip-calendar-container">
                  <div className="sip-calendar-grid">
                    {daysArray.map(day => (
                      <button key={day} type="button"
                        className={`sip-calendar-day ${day === selectedSipDay ? "selected" : ""}`}
                        onClick={() => setSelectedSipDay(day)}>{day}</button>
                    ))}
                  </div>
                  <div className="sip-calendar-info">
                    <span>Next instalment on {String(selectedSipDay).padStart(2, "0")} {nextMonthName}</span>
                  </div>
                </div>
              </div>
            )}

            <button type="submit" className="mf-invest-btn"
              disabled={isInvalidAmount || investLoading}
              style={isInvalidAmount || investLoading ? { opacity: 0.6, cursor: "not-allowed" } : {}}>
              {investLoading ? "Processing..." : investMode === "sip" ? "Start Monthly SIP" : "Invest Now"}
            </button>
          </form>
        )}

        {/* ── REDEEM form ── */}
        {investMode === "redeem" && userHolding && (
          <form onSubmit={handleRedeemSubmit}>
            {/* Holding summary */}
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "14px 16px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "13px", color: "#6b7280" }}>Units Held</span>
                <strong style={{ fontSize: "14px", color: "#111827" }}>{parseFloat(userHolding.total_units).toFixed(4)}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "13px", color: "#6b7280" }}>Current NAV</span>
                <strong style={{ fontSize: "14px", color: "#111827" }}>₹{fundData.currentNav.toFixed(2)}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #fecaca", paddingTop: "8px", marginTop: "4px" }}>
                <span style={{ fontSize: "13px", color: "#6b7280" }}>Current Value</span>
                <strong style={{ fontSize: "15px", color: "#EF4444" }}>
                  ₹{(parseFloat(userHolding.total_units) * fundData.currentNav).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </strong>
              </div>
            </div>

            <div className="mf-invest-input-wrapper">
              <label className="mf-invest-label">Units to Redeem</label>
              <div className="mf-invest-input-box">
                <input type="number" className="mf-invest-input" placeholder="e.g. 5.0000"
                  value={redeemUnits} step="0.0001"
                  max={parseFloat(userHolding.total_units)}
                  onChange={e => setRedeemUnits(e.target.value)} required />
              </div>
              {/* Max button */}
              <button type="button"
                onClick={() => setRedeemUnits(String(parseFloat(userHolding.total_units).toFixed(4)))}
                style={{ background: "none", border: "none", color: "#EF4444", fontSize: "12px", fontWeight: "700", cursor: "pointer", padding: "4px 0", marginTop: "4px" }}>
                Redeem All ({parseFloat(userHolding.total_units).toFixed(4)} units)
              </button>
              {redeemUnits && fundData && (
                <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "6px" }}>
                  Approx value: <strong style={{ color: "#EF4444" }}>₹{(parseFloat(redeemUnits || 0) * fundData.currentNav).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong>
                </div>
              )}
            </div>

            <div style={{ background: "#fef9c3", border: "1px solid #fde047", borderRadius: "8px", padding: "10px 12px", marginBottom: "16px", fontSize: "12px", color: "#a16207" }}>
              ⚠️ Exit load of 1% applies if redeemed within 365 days of purchase.
            </div>

            <button type="submit" className="mf-invest-btn"
              disabled={!redeemUnits || parseFloat(redeemUnits) <= 0 || investLoading}
              style={{
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                opacity: (!redeemUnits || parseFloat(redeemUnits) <= 0 || investLoading) ? 0.6 : 1,
                cursor: (!redeemUnits || investLoading) ? "not-allowed" : "pointer",
              }}>
              {investLoading ? "Processing..." : "Confirm Redemption"}
            </button>
          </form>
        )}
      </>
    );
  };

  // ── Error UI ──
  const renderError = () => {
    const isTimeout = error === "timeout";
    const isNoData  = error === "no_data";
    const isStale   = error === "stale";
    const icon    = isTimeout ? "⏱️" : isNoData || isStale ? "📭" : "⚠️";
    const title   = isTimeout ? "Taking Longer Than Usual" : isNoData ? "Fund Data Unavailable" : isStale ? "Fund May Be Discontinued" : "Unable to Load Fund";
    const message = isTimeout ? "The fund data server is responding slowly. Click Try Again — it usually loads on the 2nd attempt."
      : isNoData ? "This fund returned no NAV data. It could be a temporary API issue. Please try again."
      : isStale  ? "This fund has not been updated in over 60 days. It may have been discontinued or merged."
      : error;
    return (
      <div className="mf-empty-state">
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>{icon}</div>
        <div className="mf-empty-title" style={{ marginBottom: "8px" }}>{title}</div>
        <div className="mf-empty-text" style={{ maxWidth: "360px", margin: "0 auto 24px", lineHeight: "1.6" }}>{message}</div>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          {(isTimeout || isNoData) && (
            <button onClick={() => { setError(""); fetchFundDetail(); }}
              style={{ background: "#6C3AED", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 24px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>
              🔄 Try Again
            </button>
          )}
          <button onClick={() => navigate("/mutual-fund")}
            style={{ background: "transparent", color: "#6C3AED", border: "1.5px solid #6C3AED", borderRadius: "8px", padding: "10px 24px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>
            ← Back to List
          </button>
        </div>
      </div>
    );
  };

  const content = (
    <>
      <button type="button" className="mf-back-btn" onClick={() => navigate("/mutual-fund")}
        style={{ marginBottom: "24px", display: "block" }}>
        ← Back to List
      </button>

      {loading && (
        <div className="mf-loader-container">
          <div className="mf-spinner" />
          {attemptCount > 1 && (
            <div style={{ marginTop: "16px", fontSize: "13px", color: "#6b7280", textAlign: "center" }}>
              Retrying... (attempt {attemptCount} of 3)
            </div>
          )}
        </div>
      )}

      {error && !loading && renderError()}

      {!loading && !error && fundData && (
        <div className="mf-detail-grid">
          <div>
            <div className="mf-detail-card" style={{ marginBottom: "24px" }}>
              <div className="mf-detail-header-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
                <div style={{ display: "flex", gap: "16px" }}>
                  <img src={fundData.logo} alt={fundData.fundHouse} className="mf-detail-logo" />
                  <div className="mf-detail-title-box">
                    <h2 className="mf-detail-scheme-name">{fundData.name}</h2>
                    <div className="mf-detail-badge-row">
                      <span className={`mf-badge mf-badge-${fundData.risk.toLowerCase()}`}>{fundData.risk} Risk</span>
                      <span style={{ fontSize: "13px", color: "var(--mf-text-muted)", fontWeight: 600 }}>{fundData.type} • {fundData.category}</span>
                    </div>
                  </div>
                </div>
                <button type="button" onClick={toggleWatchlist} style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: isWatchlisted ? "rgba(239,68,68,0.08)" : "transparent", color: isWatchlisted ? "#EF4444" : "var(--mf-text-muted)", border: "1.5px solid", borderColor: isWatchlisted ? "#EF4444" : "var(--mf-border-color)", borderRadius: "20px", padding: "6px 14px", fontSize: "13px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap", alignSelf: "center" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={isWatchlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                  <span>{isWatchlisted ? "Watchlisted" : "Watchlist"}</span>
                </button>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--mf-border-color)" }}>
                <span style={{ fontSize: "28px", fontWeight: 800, color: "var(--mf-text-dark)" }}>₹{fundData.currentNav.toFixed(2)}</span>
                <span style={{ fontSize: "14px", color: "var(--mf-text-muted)" }}>Latest NAV ({fundData.currentDate})</span>
              </div>
            </div>

            <FundChart rawHistory={fundData.rawHistory} themeColor="#6C3AED" timeframe={timeframe} setTimeframe={setTimeframe} />

            {dynamicReturn && (
              <div className="mf-detail-card" style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", color: "var(--mf-text-dark)", textAlign: "left" }}>NAV Return Analysis ({timeframe})</h3>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px", backgroundColor: "#FAFBFD", borderRadius: "12px", border: "1px solid var(--mf-border-color)", flexWrap: "wrap", gap: "16px" }}>
                  <div>
                    <span style={{ fontSize: "13px", color: "var(--mf-text-muted)", fontWeight: 500, display: "block", marginBottom: "4px" }}>{dynamicReturn.returnType}</span>
                    <span style={{ fontSize: "32px", fontWeight: 800, color: dynamicReturn.returnVal >= 0 ? "#10B981" : "#EF4444" }}>{dynamicReturn.returnVal >= 0 ? "+" : ""}{dynamicReturn.returnVal}%</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "13px", color: "var(--mf-text-dark)", marginBottom: "4px" }}>From: <strong>₹{dynamicReturn.pastNav.toFixed(2)}</strong> ({dynamicReturn.pastDate})</div>
                    <div style={{ fontSize: "13px", color: "var(--mf-text-dark)" }}>To: <strong>₹{fundData.currentNav.toFixed(2)}</strong> ({fundData.currentDate})</div>
                    {dynamicReturn.years > 0 && <div style={{ fontSize: "12px", color: "var(--mf-text-muted)", fontStyle: "italic", marginTop: "2px" }}>Period: {dynamicReturn.years} years</div>}
                  </div>
                </div>
              </div>
            )}

            <div className="mf-detail-card">
              <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", color: "var(--mf-text-dark)", textAlign: "left" }}>Scheme Key Info</h3>
              <div className="mf-details-list">
                {[["AUM", fundData.aum], ["Expense Ratio", fundData.expenseRatio], ["Min. SIP", fundData.minSip], ["Exit Load", fundData.exitLoad], ["Fund Manager", fundData.manager]].map(([label, value]) => (
                  <div key={label} className="mf-details-item">
                    <span className="mf-details-label">{label}</span>
                    <span className="mf-details-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mf-invest-card">{renderInvestPanel()}</div>
        </div>
      )}
    </>
  );

  return isLoggedIn ? (
    <DashboardLayout pageTitle="Mutual Fund Details">{content}</DashboardLayout>
  ) : (
    <PublicLayout pageTitle="Mutual Fund Details">{content}</PublicLayout>
  );
}

export default MutualFundDetailPage;