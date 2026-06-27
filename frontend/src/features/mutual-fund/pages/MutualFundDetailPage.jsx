import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../component/DashboardLayout";
import PublicLayout from "../component/PublicLayout";
import { AMC_LOGOS } from "../component/amc_logo";
import FundChart from "../component/FundChart";
import "../mutual-fund.css";

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

export function MutualFundDetailPage() {
  const { schemeCode } = useParams();
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [fundData, setFundData] = useState(null);
  const [error, setError] = useState("");
  const [timeframe, setTimeframe] = useState("1Y");
  const [investMode, setInvestMode] = useState("sip");
  const [investAmount, setInvestAmount] = useState("100");
  const [investSuccess, setInvestSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState("");

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

  const [watchlist, setWatchlist] = useState(() => {
    try { const stored = localStorage.getItem("watchlist"); return stored ? JSON.parse(stored) : []; }
    catch { return []; }
  });

  const isWatchlisted = useMemo(() =>
    watchlist.some(item => String(item.code) === String(schemeCode)),
    [watchlist, schemeCode]);

  const toggleWatchlist = () => {
    if (!isLoggedIn) { navigate("/login"); return; }
    let updated;
    if (isWatchlisted) {
      updated = watchlist.filter(item => String(item.code) !== String(schemeCode));
    } else {
      updated = [...watchlist, {
        code: fundData.code, name: fundData.name, fundHouse: fundData.fundHouse,
        category: fundData.category, type: fundData.type, logo: fundData.logo,
        risk: fundData.risk, currentNav: fundData.currentNav, cagr3Y: fundData.cagr3Y
      }];
    }
    setWatchlist(updated);
    localStorage.setItem("watchlist", JSON.stringify(updated));
  };

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
    if (!fundData || !fundData.rawHistory || fundData.rawHistory.length === 0) return null;
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

  useEffect(() => {
    const fetchFundDetail = async () => {
      setLoading(true); setError("");
      try {
        const res = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
        if (!res.ok) throw new Error("Scheme not found");
        const json = await res.json();
        if (!json || !json.data || json.data.length === 0) throw new Error("No data returned");
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
          date1Y: point1Y?.date || "N/A", date3Y: point3Y?.date || "N/A", date5Y: point5Y?.date || "N/A",
          aum: ((numericCode % 35) * 650 + 1200).toLocaleString("en-IN") + " Cr",
          expenseRatio: ((numericCode % 13) * 0.08 + 0.35).toFixed(2) + "%",
          minSip: numericCode % 2 === 0 ? "₹100" : "₹500",
          exitLoad: "1.00% if redeemed within 365 days",
          manager: numericCode % 3 === 0 ? "Mr. Rajeev Thakkar" : numericCode % 3 === 1 ? "Mr. Anupam Tiwari" : "Ms. Sohini Andani",
          rawHistory: json.data || [],
        });
      } catch (err) { console.error(err); setError(err.message || "Failed to load mutual fund details."); }
      finally { setLoading(false); }
    };
    if (schemeCode) fetchFundDetail();
  }, [schemeCode]);

  const minAmount = investMode === "sip" ? 100 : 500;
  const isInvalidAmount = !investAmount || parseFloat(investAmount) < minAmount;

  const handleTabChange = (mode) => { setInvestMode(mode); setInvestAmount(mode === "sip" ? "100" : "500"); };

  const handleInvestSubmit = (e) => {
    e.preventDefault();
    if (!isLoggedIn) { navigate("/login"); return; }
    if (!investAmount || parseFloat(investAmount) < minAmount) { alert(`Minimum amount is ₹${minAmount}`); return; }
    if (investMode === "sip") {
      const year = sipDate.split("-")[0];
      if (!/^\d{4}$/.test(year)) { alert("Please select a valid date."); return; }
    }
    setTransactionId("KFF-" + Math.floor(10000000 + Math.random() * 90000000));
    setInvestSuccess(true);
  };

  const content = (
    <>
      <button type="button" className="mf-back-btn" onClick={() => navigate("/mutual-fund")} style={{ marginBottom: "24px" }}>← Back to List</button>

      {loading && (<div className="mf-loader-container"><div className="mf-spinner" /><div className="mf-loader-text">Loading scheme data from mfapi.in...</div></div>)}

      {error && (
        <div className="mf-empty-state">
          <div className="mf-empty-icon">⚠️</div>
          <div className="mf-empty-title">Error Loading Details</div>
          <div className="mf-empty-text">{error}</div>
          <button onClick={() => navigate("/mutual-fund")} style={{ marginTop: "16px", backgroundColor: "var(--mf-accent-purple)", color: "#FFFFFF", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>Return to List</button>
        </div>
      )}

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
                <button type="button" onClick={toggleWatchlist} style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: isWatchlisted ? "rgba(239, 68, 68, 0.08)" : "transparent", color: isWatchlisted ? "#EF4444" : "var(--mf-text-muted)", border: "1.5px solid", borderColor: isWatchlisted ? "#EF4444" : "var(--mf-border-color)", borderRadius: "20px", padding: "6px 14px", fontSize: "13px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s ease", whiteSpace: "nowrap", alignSelf: "center" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={isWatchlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                  <span>{isWatchlisted ? "Watchlisted" : "Watchlist"}</span>
                </button>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--mf-border-color)" }}>
                <span style={{ fontSize: "28px", fontWeight: 800, color: "var(--mf-text-dark)" }}>₹{fundData.currentNav.toFixed(2)}</span>
                <span style={{ fontSize: "14px", color: "var(--mf-text-muted)" }}>Latest NAV on ({fundData.currentDate})</span>
              </div>
            </div>

            <FundChart rawHistory={fundData.rawHistory} themeColor="#6C3AED" timeframe={timeframe} setTimeframe={setTimeframe} />

            {dynamicReturn && (
              <div className="mf-detail-card" style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", color: "var(--mf-text-dark)", textAlign: "left" }}>NAV Return Analysis ({timeframe})</h3>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px", backgroundColor: "#FAFBFD", borderRadius: "12px", border: "1px solid var(--mf-border-color)", flexWrap: "wrap", gap: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ fontSize: "13px", color: "var(--mf-text-muted)", fontWeight: 500 }}>{dynamicReturn.returnType}</span>
                    <span style={{ fontSize: "32px", fontWeight: 800, color: dynamicReturn.returnVal >= 0 ? "#10B981" : "#EF4444" }}>{dynamicReturn.returnVal >= 0 ? "+" : ""}{dynamicReturn.returnVal}%</span>
                  </div>
                  <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ fontSize: "13px", color: "var(--mf-text-dark)" }}>Initial NAV: <strong>₹{dynamicReturn.pastNav.toFixed(2)}</strong> ({dynamicReturn.pastDate})</div>
                    <div style={{ fontSize: "13px", color: "var(--mf-text-dark)" }}>Current NAV: <strong>₹{fundData.currentNav.toFixed(2)}</strong> ({fundData.currentDate})</div>
                    {dynamicReturn.years > 0 && <div style={{ fontSize: "12px", color: "var(--mf-text-muted)", fontStyle: "italic", marginTop: "2px" }}>Period: {dynamicReturn.years} {dynamicReturn.years === 1 ? "year" : "years"}</div>}
                  </div>
                </div>
              </div>
            )}

            <div className="mf-detail-card">
              <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", color: "var(--mf-text-dark)", textAlign: "left" }}>Scheme Key Info</h3>
              <div className="mf-details-list">
                {[["Assets Under Management (AUM)", fundData.aum], ["Expense Ratio", fundData.expenseRatio], ["Min. SIP Investment", fundData.minSip], ["Exit Load", fundData.exitLoad], ["Fund Manager", fundData.manager]].map(([label, value]) => (
                  <div key={label} className="mf-details-item">
                    <span className="mf-details-label">{label}</span>
                    <span className="mf-details-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mf-invest-card">
            {!investSuccess ? (
              <form onSubmit={handleInvestSubmit}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 16px 0", color: "var(--mf-text-dark)", textAlign: "left" }}>Start Investment</h3>
                {!isLoggedIn && (
                  <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: "8px", padding: "12px", marginBottom: "16px", fontSize: "13px", color: "#92400e" }}>
                    Please <button type="button" onClick={() => navigate("/login")} style={{ background: "none", border: "none", color: "#6C3AED", fontWeight: 700, cursor: "pointer", padding: 0 }}>login</button> to invest in this fund.
                  </div>
                )}
                <div className="mf-invest-tabs">
                  <button type="button" className={`mf-invest-tab ${investMode === "sip" ? "active" : ""}`} onClick={() => handleTabChange("sip")}>Monthly SIP</button>
                  <button type="button" className={`mf-invest-tab ${investMode === "lumpsum" ? "active" : ""}`} onClick={() => handleTabChange("lumpsum")}>One-Time</button>
                </div>
                <div className="mf-invest-input-wrapper">
                  <label className="mf-invest-label">Investment Amount</label>
                  <div className="mf-invest-input-box">
                    <span className="mf-invest-currency">₹</span>
                    <input type="number" className="mf-invest-input" value={investAmount} onChange={(e) => setInvestAmount(e.target.value)} min={minAmount} required />
                  </div>
                  {isInvalidAmount && investAmount !== "" && <span style={{ color: "#EF4444", fontSize: "12px", marginTop: "6px", display: "block" }}>Minimum {investMode === "sip" ? "SIP" : "One-Time"} amount is ₹{minAmount}</span>}
                </div>
                {investMode === "sip" && (
                  <div className="mf-invest-input-wrapper">
                    <label className="mf-invest-label" style={{ textTransform: "lowercase" }}>sip installment date</label>
                    <div className="sip-calendar-container">
                      <div className="sip-calendar-grid">
                        {daysArray.map((day) => (
                          <button key={day} type="button" className={`sip-calendar-day ${day === selectedSipDay ? "selected" : ""}`} onClick={() => setSelectedSipDay(day)}>{day}</button>
                        ))}
                      </div>
                      <div className="sip-calendar-info">
                        <span>Next SIP instalment on {String(selectedSipDay).padStart(2, "0")} of {nextMonthName}</span>
                      </div>
                    </div>
                  </div>
                )}
                <button type="submit" className="mf-invest-btn" disabled={isInvalidAmount} style={isInvalidAmount ? { opacity: 0.5, cursor: "not-allowed" } : {}}>
                  {investMode === "sip" ? "Start Monthly SIP" : "Invest Now"}
                </button>
              </form>
            ) : (
              <div className="mf-success-container">
                <div className="mf-success-icon-box">✓</div>
                <h3 className="mf-success-title">Investment Initialized!</h3>
                <p className="mf-success-text">Successfully set up a <strong>{investMode === "sip" ? "Monthly SIP" : "One-Time"}</strong> investment of <strong>₹{parseFloat(investAmount).toLocaleString("en-IN")}</strong> in <br /><em>{fundData.name}</em>.</p>
                <div style={{ backgroundColor: "#F3F4F6", padding: "12px", borderRadius: "8px", fontSize: "12px", color: "var(--mf-text-muted)", marginBottom: "20px", textAlign: "left" }}>
                  <div><strong>Transaction ID:</strong> {transactionId}</div>
                  {investMode === "sip" && <div style={{ marginTop: "4px" }}><strong>Installment Day:</strong> {formattedInstallmentDate}</div>}
                  <div style={{ marginTop: "4px" }}><strong>Order Date:</strong> {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
                </div>
                <button type="button" className="mf-success-close" onClick={() => setInvestSuccess(false)}>New Investment</button>
              </div>
            )}
          </div>
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