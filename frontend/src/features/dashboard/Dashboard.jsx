import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../mutual-fund/component/DashboardLayout";
import "./dashboard.css";

const TRANSACTION_SERVICE_URL = import.meta.env.VITE_TRANSACTION_API || "http://localhost:4003";
const SIP_SERVICE_URL = import.meta.env.VITE_SIP_API || "http://localhost:4004";
const KYC_SERVICE_URL = import.meta.env.VITE_KYC_API || "http://localhost:4002";

const getTokenData = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try { return JSON.parse(atob(token.split(".")[1])); }
  catch { return null; }
};

const classifyFund = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("liquid") || n.includes("debt") || n.includes("bond") || n.includes("gilt") || n.includes("income") || n.includes("money market")) return "Debt";
  if (n.includes("hybrid") || n.includes("balanced") || n.includes("arbitrage") || n.includes("multi asset")) return "Hybrid";
  return "Equity";
};

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const SHORT_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_LABELS = ["S","M","T","W","T","F","S"];

const TAGLINES = [
  "Small steps today, big wealth tomorrow. 🌱",
  "Your money is working while you sleep. 💰",
  "Every rupee invested is a future secured. 🔐",
  "Wealth is built quietly, one SIP at a time. 📈",
  "The best time to invest was yesterday. The next best is now. ⏳",
  "Markets fluctuate, disciplined investors profit. 💎",
  "Compounding is the eighth wonder of the world. 🚀",
];

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

// ✅ Fetch live NAV from mfapi.in
const fetchLiveNav = async (fundName) => {
  const code = FUND_NAME_TO_CODE[fundName?.toLowerCase()?.trim()];
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

function MiniCalendar({ label, value, onChange }) {
  const today = new Date();
  const [month, setMonth] = useState(value ? new Date(value).getMonth() : today.getMonth());
  const [year, setYear] = useState(value ? new Date(value).getFullYear() : today.getFullYear());
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];
  const selectedDay = value ? new Date(value).getDate() : null;
  const selectedM = value ? new Date(value).getMonth() : null;
  const selectedY = value ? new Date(value).getFullYear() : null;
  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };
  return (
    <div style={{ flex: 1, minWidth: "220px" }}>
      <div style={{ fontSize: "12px", fontWeight: "700", color: "#6C3AED", marginBottom: "8px", textTransform: "uppercase" }}>{label}</div>
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <button onClick={prevMonth} style={{ border: "none", background: "none", cursor: "pointer", fontSize: "18px", color: "#6b7280" }}>‹</button>
          <span style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>{MONTH_NAMES[month]} {year}</span>
          <button onClick={nextMonth} style={{ border: "none", background: "none", cursor: "pointer", fontSize: "18px", color: "#6b7280" }}>›</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", textAlign: "center", marginBottom: "6px" }}>
          {DAY_LABELS.map((d, i) => <span key={i} style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "600" }}>{d}</span>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "2px" }}>
          {cells.map((day, i) => {
            const isSelected = day && day === selectedDay && month === selectedM && year === selectedY;
            return (
              <button key={i} disabled={!day}
                onClick={() => day && onChange(new Date(year, month, day).toISOString().split("T")[0])}
                style={{ width: "30px", height: "30px", border: "none", borderRadius: "50%", background: isSelected ? "#6C3AED" : "transparent", color: isSelected ? "#fff" : day ? "#374151" : "transparent", fontSize: "13px", cursor: day ? "pointer" : "default", fontWeight: isSelected ? "700" : "400" }}>
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function KycBanner({ kycStatus, navigate }) {
  if (kycStatus === "APPROVED" || kycStatus === null) return null;
  if (kycStatus === "NOT_SUBMITTED") return (
    <div onClick={() => navigate("/user/profile/kyc")} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(135deg, #fff7ed, #fef3c7)", border: "1.5px solid #f59e0b", borderRadius: "12px", padding: "14px 20px", marginBottom: "20px", cursor: "pointer", gap: "12px", flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>⚠️</div>
        <div>
          <div style={{ fontSize: "15px", fontWeight: "700", color: "#92400e" }}>KYC Verification Required</div>
          <div style={{ fontSize: "13px", color: "#a16207", marginTop: "2px" }}>Complete your KYC to start investing in mutual funds.</div>
        </div>
      </div>
      <span style={{ background: "#f59e0b", color: "#fff", padding: "8px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", whiteSpace: "nowrap" }}>Complete KYC →</span>
    </div>
  );
  if (kycStatus === "PENDING") return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "linear-gradient(135deg, #eff6ff, #dbeafe)", border: "1.5px solid #93c5fd", borderRadius: "12px", padding: "14px 20px", marginBottom: "20px", flexWrap: "wrap" }}>
      <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>⏳</div>
      <div>
        <div style={{ fontSize: "15px", fontWeight: "700", color: "#1e40af" }}>KYC Under Review</div>
        <div style={{ fontSize: "13px", color: "#1d4ed8", marginTop: "2px" }}>Your documents are being verified. This typically takes 1–2 working days.</div>
      </div>
    </div>
  );
  return null;
}

function Dashboard() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("thisMonth");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [sips, setSips] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [userName, setUserName] = useState("User");
  const [kycStatus, setKycStatus] = useState(null);
  const [tagline] = useState(() => TAGLINES[Math.floor(Math.random() * TAGLINES.length)]);

  // ✅ Real current value from live NAV
  const [realCurrentValue, setRealCurrentValue] = useState(0);
  const [navLoaded, setNavLoaded] = useState(false);

  const formatCurrency = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    const td = getTokenData();
    if (td?.email) setUserName(td.email.split("@")[0]);
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${KYC_SERVICE_URL}/api/kyc/status`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setKycStatus(d.status || "NOT_SUBMITTED")).catch(() => setKycStatus("NOT_SUBMITTED"));

    fetch(`${TRANSACTION_SERVICE_URL}/api/transactions/portfolio`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(async (data) => {
        setPortfolio(data);
        // ✅ Fetch live NAV for each holding and calculate real current value
        const holdings = data.portfolio || [];
        if (holdings.length === 0) { setNavLoaded(true); return; }
        let totalCurrentValue = 0;
        await Promise.all(holdings.map(async (h) => {
          const liveNav = await fetchLiveNav(h.fund_id);
          const units = parseFloat(h.total_units || 0);
          if (liveNav && units > 0) {
            totalCurrentValue += units * liveNav;
          } else {
            // fallback to invested if NAV unavailable
            totalCurrentValue += parseFloat(h.invested || 0);
          }
        }));
        setRealCurrentValue(totalCurrentValue);
        setNavLoaded(true);
      }).catch(() => { setPortfolio(null); setNavLoaded(true); });

    fetch(`${TRANSACTION_SERVICE_URL}/api/transactions/history`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setTransactions(d.transactions || [])).catch(() => setTransactions([]));

    fetch(`${SIP_SERVICE_URL}/api/sips/my-sips`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setSips(d.sips || (Array.isArray(d) ? d : []))).catch(() => setSips([]));
  }, []);

  const filteredTxns = useMemo(() => {
    const now = new Date();
    return transactions.filter(tx => {
      const d = new Date(tx.transaction_date);
      if (filter === "thisMonth") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (filter === "lastMonth") { const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1); return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear(); }
      if (filter === "custom" && fromDate) { const from = new Date(fromDate); const to = toDate ? new Date(toDate) : new Date(fromDate); to.setHours(23,59,59); return d >= from && d <= to; }
      return true;
    });
  }, [transactions, filter, fromDate, toDate]);

  const chartPoints = useMemo(() => {
    if (filteredTxns.length === 0) return [];
    const sorted = [...filteredTxns].sort((a, b) => new Date(a.transaction_date) - new Date(b.transaction_date));
    let cumulative = 0;
    return sorted.map(tx => {
      cumulative += tx.transaction_type === "BUY" ? Number(tx.amount || 0) : -Number(tx.amount || 0);
      const d = new Date(tx.transaction_date);
      return { label: `${d.getDate()} ${SHORT_MONTHS[d.getMonth()]}`, value: Math.max(0, cumulative) };
    });
  }, [filteredTxns]);

  const allocation = useMemo(() => {
    if (transactions.length === 0) return null;
    const map = { Equity: 0, Debt: 0, Hybrid: 0 };
    transactions.forEach(tx => { if (tx.transaction_type === "BUY") map[classifyFund(tx.fund_id)] += Number(tx.amount || 0); });
    const total = Object.values(map).reduce((a, b) => a + b, 0);
    if (total === 0) return null;
    return Object.entries(map).filter(([, v]) => v > 0).map(([k, v]) => ({ name: k, pct: Math.round((v / total) * 100), color: k === "Equity" ? "#5b21d9" : k === "Debt" ? "#1e90ff" : "#ffb703" }));
  }, [transactions]);

  const chartWidth = Math.max(chartPoints.length * 90, 400);
  const maxVal = chartPoints.length > 0 ? Math.max(...chartPoints.map(p => p.value)) * 1.1 : 1;
  const minY = 28, maxY = 175;
  const scaled = chartPoints.map((pt, i) => ({ ...pt, x: i * 90 + 45, y: maxY - (pt.value / maxVal) * (maxY - minY) }));
  const polyPoints = scaled.map(p => `${p.x},${p.y}`).join(" ");
  const areaPoints = scaled.length > 0 ? `${polyPoints} ${scaled[scaled.length-1].x},190 ${scaled[0].x},190` : "";
  const formatVal = (v) => v >= 100000 ? `${(v/100000).toFixed(1)}L` : v >= 1000 ? `${Math.round(v/1000)}K` : `${Math.round(v)}`;

  const donutParts = useMemo(() => {
    if (!allocation) return [];
    let cumDeg = 0;
    return allocation.map(a => { const deg = (a.pct / 100) * 360; const part = { ...a, start: cumDeg, end: cumDeg + deg }; cumDeg += deg; return part; });
  }, [allocation]);

  const describeArc = (cx, cy, r, startDeg, endDeg) => {
    const toRad = d => (d - 90) * Math.PI / 180;
    const x1 = cx + r * Math.cos(toRad(startDeg)); const y1 = cy + r * Math.sin(toRad(startDeg));
    const x2 = cx + r * Math.cos(toRad(endDeg)); const y2 = cy + r * Math.sin(toRad(endDeg));
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${endDeg - startDeg > 180 ? 1 : 0} 1 ${x2} ${y2} Z`;
  };

  // ✅ Real values — live NAV based
  const totalInvestment = portfolio?.totalInvestment || 0;
  const currentValue    = navLoaded && realCurrentValue > 0 ? realCurrentValue : totalInvestment;
  const totalGain       = currentValue - totalInvestment;
  const gainPercent     = totalInvestment > 0 ? ((totalGain / totalInvestment) * 100).toFixed(2) : "0.00";
  const activeSips      = sips.filter(s => s.status === "ACTIVE");
  const nextSip         = activeSips[0];

  return (
    <DashboardLayout pageTitle="Dashboard">
      <div style={{ marginBottom: "16px" }}>
        <h1 style={{ fontSize: "24px", color: "#111827", margin: "0 0 4px" }}>Hey, {userName}! 👋</h1>
        <p style={{ color: "#6b7280", fontSize: "14px", margin: 0, fontStyle: "italic" }}>{tagline}</p>
      </div>

      <KycBanner kycStatus={kycStatus} navigate={navigate} />

      {/* ✅ Stats — real live NAV values */}
      <div className="stats-grid" style={{ marginBottom: "20px" }}>
        {[
          { label: "Total Investment", value: formatCurrency(totalInvestment) },
          {
            label: "Current Value",
            value: navLoaded ? formatCurrency(currentValue) : "Loading...",
            sub: navLoaded && totalInvestment > 0 ? "Live NAV" : null,
          },
          {
            label: totalGain >= 0 ? "Total Gain" : "Total Loss",
            value: navLoaded ? formatCurrency(Math.abs(totalGain)) : "—",
            sub: navLoaded && totalInvestment > 0 ? `(${totalGain >= 0 ? "+" : "-"}${Math.abs(gainPercent)}%)` : null,
            green: totalGain >= 0,
            red: totalGain < 0,
          },
        ].map((c, i) => (
          <div key={i} className="stat-card">
            <p>{c.label}</p>
            <h2 className={c.green ? "green" : c.red ? "red" : ""}>{c.value}</h2>
            {c.sub && <h4 className={c.green ? "green" : c.red ? "red" : ""}>{c.sub}</h4>}
          </div>
        ))}
      </div>

      {/* Chart + Allocation */}
      <div className="main-grid" style={{ marginBottom: "20px" }}>
        <div className="overview-card" style={{ position: "relative" }}>
          <div className="section-head" style={{ flexWrap: "wrap", gap: "8px" }}>
            <h3>Portfolio Overview</h3>
            <select value={filter} onChange={e => { setFilter(e.target.value); if (e.target.value !== "custom") { setFromDate(""); setToDate(""); } }}>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          {filter === "custom" && (
            <div style={{ marginTop: "12px", marginBottom: "8px" }}>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <MiniCalendar label="From Date" value={fromDate} onChange={v => { setFromDate(v); if (!toDate) setToDate(v); }} />
                <MiniCalendar label="To Date" value={toDate} onChange={v => setToDate(v < fromDate ? fromDate : v)} />
              </div>
              {fromDate && (
                <div style={{ marginTop: "10px", padding: "8px 12px", background: "#f3f0ff", borderRadius: "8px", fontSize: "13px", color: "#6C3AED", fontWeight: "600" }}>
                  📅 {fromDate === toDate || !toDate ? `Single day: ${fromDate}` : `Range: ${fromDate} → ${toDate}`}
                </div>
              )}
            </div>
          )}
          <div className="chart-area" style={{ marginTop: "12px" }}>
            {chartPoints.length === 0 ? (
              <div style={{ height: "200px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
                <div style={{ fontSize: "36px", marginBottom: "8px" }}>📈</div>
                <div style={{ fontSize: "14px", fontWeight: "500" }}>No transactions in this period</div>
                <div style={{ fontSize: "12px", marginTop: "4px" }}>Invest in a mutual fund to see your chart</div>
              </div>
            ) : (
              <>
                <div className="y-labels">
                  {[maxVal, maxVal*0.75, maxVal*0.5, maxVal*0.25, 0].map((v, i) => <span key={i}>{formatVal(v)}</span>)}
                </div>
                <div className="chart-scroll">
                  <svg viewBox={`0 0 ${chartWidth} 230`} className="line-chart-scroll" style={{ width: `${chartWidth}px` }}>
                    <defs>
                      <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6c3aed" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#6c3aed" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <polygon points={areaPoints} fill="url(#chartFill)" />
                    <polyline points={polyPoints} fill="none" stroke="#5b21d9" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    {scaled.map((p, i) => (
                      <g key={i}>
                        <circle cx={p.x} cy={p.y} r="5" fill="#5b21d9" stroke="white" strokeWidth="2" />
                        <text x={p.x} y={p.y-12} textAnchor="middle" className="chart-value-label">{formatVal(p.value)}</text>
                        <text x={p.x} y="220" textAnchor="middle" className="chart-date-label">{p.label}</text>
                      </g>
                    ))}
                  </svg>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="allocation-card">
          <h3>Asset Allocation</h3>
          {!allocation ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#9ca3af", textAlign: "center", padding: "20px" }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>🥧</div>
              <div style={{ fontSize: "13px", fontWeight: "500" }}>No investment data yet</div>
            </div>
          ) : (
            <>
              <svg viewBox="0 0 160 160" width="150" height="150" style={{ display: "block", margin: "8px auto 12px" }}>
                {donutParts.map((part, i) => <path key={i} d={describeArc(80,80,60,part.start,part.end)} fill={part.color} />)}
                <circle cx="80" cy="80" r="36" fill="white" />
              </svg>
              <div className="allocation-list">
                {allocation.map((a, i) => (
                  <p key={i}><span><i className="dot" style={{ background: a.color }}></i>{a.name}</span><b>{a.pct}%</b></p>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom cards */}
      <div className="bottom-grid" style={{ marginBottom: "32px" }}>
        <div className="small-card sip-card">
          <div><h3>My SIPs</h3><p>Active SIPs</p><h2>{activeSips.length}</h2></div>
          <div className="icon-circle purple-icon">📅</div>
        </div>

        <div className="small-card sip-card">
          <div>
            <h3>Upcoming SIP</h3>
            {nextSip ? (
              <><p>{nextSip.fund_name}</p><span style={{ fontSize: "12px", color: "#6b7280" }}>{new Date(nextSip.start_date).toLocaleDateString("en-IN")}</span><h2>- {formatCurrency(nextSip.amount)}</h2></>
            ) : (
              <><p style={{ color: "#9ca3af", fontSize: "13px" }}>No active SIPs</p><button onClick={() => navigate("/mutual-fund")} style={{ marginTop: "8px", background: "#6C3AED", color: "#fff", border: "none", borderRadius: "6px", padding: "6px 12px", fontSize: "12px", cursor: "pointer" }}>Start a SIP</button></>
            )}
          </div>
          <div className="icon-circle green-icon">📅</div>
        </div>

        <div className="small-card transactions-card">
          <div className="transaction-card-header">
            <h3>Recent Transactions</h3>
            <button className="see-all-btn" onClick={() => navigate("/transactions")}>See all →</button>
          </div>
          <div className="transaction-list">
            {transactions.length > 0
              ? transactions.slice(0, 2).map((item, i) => (
                <div className="transaction-row" key={i}>
                  <div><b>{item.fund_id}</b><p>{new Date(item.transaction_date).toLocaleDateString("en-IN")}</p></div>
                  <span className={item.transaction_type === "BUY" ? "green" : "red"}>
                    {item.transaction_type === "BUY" ? "+ " : "- "}{formatCurrency(item.amount)}
                  </span>
                </div>
              ))
              : (
                <div style={{ textAlign: "center", padding: "16px" }}>
                  <p style={{ color: "#9ca3af", fontSize: "13px", marginBottom: "8px" }}>No transactions yet</p>
                  <button onClick={() => navigate("/mutual-fund")} style={{ background: "#6C3AED", color: "#fff", border: "none", borderRadius: "6px", padding: "6px 12px", fontSize: "12px", cursor: "pointer" }}>Start Investing</button>
                </div>
              )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;