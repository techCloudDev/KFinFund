import { apiFetch } from "../../utils/api";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../mutual-fund/component/DashboardLayout";
import "./profile.css";

const TRANSACTION_SERVICE_URL = import.meta.env.VITE_TRANSACTION_API || "http://localhost:4003";

const navCache = {};

// ✅ Fetch NAV by exact scheme_code — never guesses, always correct.
const fetchNavByCode = async (schemeCode) => {
  const cacheKey = `code:${schemeCode}`;
  if (navCache[cacheKey] !== undefined) return navCache[cacheKey];
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const navRes = await fetch(`https://api.mfapi.in/mf/${schemeCode}/latest`, { signal: controller.signal });
    clearTimeout(timer);
    if (!navRes.ok) { navCache[cacheKey] = null; return null; }
    const navData = await navRes.json();
    const nav = parseFloat(navData?.data?.[0]?.nav);
    if (isNaN(nav)) { navCache[cacheKey] = null; return null; }
    navCache[cacheKey] = nav;
    return nav;
  } catch { navCache[cacheKey] = null; return null; }
};

// ⚠️ Fallback only — name search can match the wrong scheme. Used only when
// a transaction has no stored scheme_code (e.g. older transactions made
// before this fix). Always prefer fetchNavByCode when a code is available.
const fetchLiveNavBySearch = async (fundName) => {
  if (!fundName) return null;
  const cacheKey = `name:${fundName}`;
  if (navCache[cacheKey] !== undefined) return navCache[cacheKey];
  try {
    const searchRes = await fetch(`https://api.mfapi.in/mf/search?q=${encodeURIComponent(fundName.trim())}`);
    if (!searchRes.ok) { navCache[cacheKey] = null; return null; }
    const searchData = await searchRes.json();
    if (!searchData?.length) { navCache[cacheKey] = null; return null; }
    const schemeCode = searchData[0].schemeCode;
    if (!schemeCode) { navCache[cacheKey] = null; return null; }
    const nav = await fetchNavByCode(schemeCode);
    navCache[cacheKey] = nav;
    return nav;
  } catch { navCache[cacheKey] = null; return null; }
};

// ✅ Unified entry point — uses scheme_code when present, falls back to search.
const fetchLiveNav = async (fundName, schemeCode) => {
  if (schemeCode) return fetchNavByCode(schemeCode);
  return fetchLiveNavBySearch(fundName);
};

// ── Custom mini calendar ──────────────────────────────────────
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function MiniCalendar({ value, onChange, maxDate }) {
  const today = new Date();
  const init = value ? new Date(value) : today;
  const [year, setYear] = useState(init.getFullYear());
  const [month, setMonth] = useState(init.getMonth());

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  while (cells.length % 7 !== 0) cells.push(null);

  const toStr = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  return (
    <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: "12px", padding: "14px", width: "220px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
        <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#6b7280", padding: "2px 6px" }}>‹</button>
        <span style={{ fontWeight: "700", fontSize: "13px", color: "#111827" }}>{MONTHS[month]} {year}</span>
        <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#6b7280", padding: "2px 6px" }}>›</button>
      </div>
      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", marginBottom: "4px" }}>
        {DAYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: "10px", fontWeight: "700", color: "#9ca3af", padding: "2px 0" }}>{d}</div>)}
      </div>
      {/* Dates */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const dateStr = toStr(year, month, day);
          const isSelected = value === dateStr;
          const isDisabled = maxDate && dateStr > maxDate;
          const isToday = dateStr === toStr(today.getFullYear(), today.getMonth(), today.getDate());
          return (
            <button key={i} disabled={isDisabled}
              onClick={() => onChange(dateStr)}
              style={{
                background: isSelected ? "#6C3AED" : "transparent",
                color: isSelected ? "#fff" : isDisabled ? "#d1d5db" : isToday ? "#6C3AED" : "#374151",
                border: isToday && !isSelected ? "1.5px solid #6C3AED" : "none",
                borderRadius: "6px", padding: "4px 2px", fontSize: "11px", fontWeight: isSelected ? "700" : "500",
                cursor: isDisabled ? "not-allowed" : "pointer", textAlign: "center",
              }}>
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Preset ranges ─────────────────────────────────────────────
const getPresetRange = (preset) => {
  const today = new Date();
  const fmt = (d) => d.toISOString().split("T")[0];
  const ago = (days) => { const d = new Date(today); d.setDate(d.getDate() - days); return fmt(d); };
  const startOfMonth = (offset = 0) => {
    const d = new Date(today.getFullYear(), today.getMonth() - offset, 1);
    return fmt(d);
  };
  const endOfMonth = (offset = 0) => {
    const d = new Date(today.getFullYear(), today.getMonth() - offset + 1, 0);
    return fmt(d);
  };
  switch (preset) {
    case "last_week":    return { from: ago(7), to: fmt(today) };
    case "last_month":   return { from: startOfMonth(1), to: endOfMonth(1) };
    case "last_2_month": return { from: startOfMonth(2), to: endOfMonth(1) };
    case "last_year":    return { from: `${today.getFullYear() - 1}-01-01`, to: `${today.getFullYear() - 1}-12-31` };
    case "all":          return { from: "", to: "" };
    default:             return null;
  }
};

const PRESET_OPTIONS = [
  { key: "all",          label: "All Time" },
  { key: "last_week",    label: "Last Week" },
  { key: "last_month",   label: "Last Month" },
  { key: "last_2_month", label: "Last 2 Months" },
  { key: "last_year",    label: "Last Year" },
  { key: "custom",       label: "Custom Range" },
];

export default function ReportPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [navLoading, setNavLoading] = useState(false);
  const [plItems, setPlItems] = useState([]);
  const [totalCurrentValue, setTotalCurrentValue] = useState(0);
  const [navLoaded, setNavLoaded] = useState(false);

  // Download dropdown state
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showCustomFrom, setShowCustomFrom] = useState(false);
  const [showCustomTo, setShowCustomTo] = useState(false);
  const dropdownRef = useRef(null);
  const today = new Date().toISOString().split("T")[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
        setShowCustomFrom(false);
        setShowCustomTo(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    apiFetch(`${TRANSACTION_SERVICE_URL}/api/transactions/history`)
      .then(r => r.json())
      .then(data => { setTransactions(data.transactions || []); setLoading(false); })
      .catch(() => { setTransactions([]); setLoading(false); });
  }, [navigate]);

  useEffect(() => {
    if (transactions.length === 0) return;
    setNavLoading(true);
    const fundMap = {};
    transactions.forEach(tx => {
      const key = tx.fund_id;
      if (!fundMap[key]) fundMap[key] = { name: key, invested: 0, units: 0, redeemed: 0, scheme_code: null };
      if (tx.scheme_code) fundMap[key].scheme_code = tx.scheme_code; // ✅ capture exact code
      if (tx.transaction_type === "BUY") {
        fundMap[key].invested += Number(tx.amount || 0);
        fundMap[key].units += Number(tx.units || 0);
      }
      if (tx.transaction_type === "REDEEM") {
        fundMap[key].redeemed += Number(tx.amount || 0);
        fundMap[key].units -= Number(tx.units || 0);
      }
    });
    Promise.all(Object.values(fundMap).map(async (f) => {
      const liveNav = await fetchLiveNav(f.name, f.scheme_code);
      const units = Math.max(0, f.units);
      const current = liveNav && units > 0 ? units * liveNav : f.invested;
      const gain = current - f.invested;
      const pct = f.invested > 0 ? ((gain / f.invested) * 100).toFixed(2) : "0.00";
      return { ...f, liveNav, current, gain, pct, isPositive: gain >= 0 };
    })).then(items => {
      setPlItems(items);
      setTotalCurrentValue(items.reduce((s, i) => s + i.current, 0));
      setNavLoaded(true);
      setNavLoading(false);
    });
  }, [transactions]);

  // Apply preset
  const handlePreset = (key) => {
    setSelectedPreset(key);
    if (key === "custom") {
      setShowCustomFrom(true);
      setShowCustomTo(false);
      return;
    }
    const range = getPresetRange(key);
    if (range) { setFromDate(range.from); setToDate(range.to); }
    setShowCustomFrom(false);
    setShowCustomTo(false);
  };

  // Filtered transactions
  const filteredTxns = transactions.filter(tx => {
    if (!fromDate && !toDate) return true;
    const d = new Date(tx.transaction_date);
    if (fromDate && d < new Date(fromDate)) return false;
    if (toDate) { const to = new Date(toDate); to.setHours(23, 59, 59); if (d > to) return false; }
    return true;
  });

  const formatCurrency = (n) => `₹ ${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const formatShort = (s) => s ? new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "";

  const totalInvested = filteredTxns.filter(t => t.transaction_type === "BUY").reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalGain = totalCurrentValue - totalInvested;
  const gainPct = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(2) : "0.00";

  // Download CSV
  const handleDownload = () => {
    const dateLabel = fromDate || toDate ? `${fromDate || "all"}_to_${toDate || "all"}` : "all";
    const rows = [
      ["KFinFund - P&L Statement"],
      [`Generated: ${new Date().toLocaleDateString("en-IN")}`],
      fromDate || toDate ? [`Period: ${fromDate || "start"} to ${toDate || "today"}`] : ["Period: All time"],
      [],
      ["Fund Name", "Invested", "Current Value", "Profit/Loss", "Return %", "Live NAV"],
      ...plItems.map(item => [item.name, item.invested.toFixed(2), item.current.toFixed(2), item.gain.toFixed(2), item.pct + "%", item.liveNav ? item.liveNav.toFixed(4) : "N/A"]),
      [],
      ["TOTAL", totalInvested.toFixed(2), totalCurrentValue.toFixed(2), totalGain.toFixed(2), gainPct + "%", ""],
      [],
      ["Transaction History"],
      ["Date", "Fund", "Type", "Amount", "Units", "NAV"],
      ...filteredTxns.map(tx => [formatDate(tx.transaction_date), tx.fund_id, tx.transaction_type, tx.amount, tx.units || "", tx.nav || ""]),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `KFinFund_PL_Report_${dateLabel}.csv`; a.click();
    URL.revokeObjectURL(url);
    setShowDropdown(false);
  };

  // Label shown on button
  const buttonLabel = selectedPreset === "all" ? "Download"
    : selectedPreset === "custom"
      ? (fromDate && toDate ? `${formatShort(fromDate)} → ${formatShort(toDate)}` : fromDate ? `From ${formatShort(fromDate)}` : "Custom Range")
      : PRESET_OPTIONS.find(o => o.key === selectedPreset)?.label || "Download";

  return (
    <DashboardLayout pageTitle="Profit & Loss Report">
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>Profit & Loss Statement</h2>
            <p style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>Realized and unrealized returns across your mutual fund investments.</p>
          </div>

          {transactions.length > 0 && (
            <div style={{ position: "relative" }} ref={dropdownRef}>
              {/* Download button */}
              <button
                onClick={() => setShowDropdown(v => !v)}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  background: "#fff", border: "1.5px solid #e5e7eb",
                  borderRadius: "8px", padding: "9px 18px",
                  fontSize: "14px", fontWeight: "600", color: "#374151",
                  cursor: "pointer", whiteSpace: "nowrap",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                {buttonLabel}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points={showDropdown ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}/>
                </svg>
              </button>

              {/* Dropdown */}
              {showDropdown && (
                <div style={{
                  position: "absolute", top: "calc(100% + 6px)", right: 0,
                  background: "#fff", border: "1.5px solid #e5e7eb",
                  borderRadius: "12px", minWidth: "200px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  zIndex: 100, overflow: "visible",
                }}>
                  <div style={{ padding: "8px" }}>
                    {PRESET_OPTIONS.map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => handlePreset(opt.key)}
                        style={{
                          width: "100%", textAlign: "left",
                          background: selectedPreset === opt.key ? "#f3f0ff" : "transparent",
                          border: "none", borderRadius: "8px",
                          padding: "9px 14px", fontSize: "14px", fontWeight: "500",
                          color: selectedPreset === opt.key ? "#6C3AED" : "#374151",
                          cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
                        }}>
                        {selectedPreset === opt.key && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6C3AED" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                        {selectedPreset !== opt.key && <span style={{ width: "14px" }} />}
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom range pickers */}
                  {selectedPreset === "custom" && (
                    <div style={{ borderTop: "1px solid #f3f4f6", padding: "12px 12px 8px" }}>
                      <div style={{ fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.4px" }}>
                        Select Range
                      </div>
                      <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                        {/* From */}
                        <div style={{ flex: 1, position: "relative" }}>
                          <label style={{ fontSize: "11px", fontWeight: "600", color: "#9ca3af", display: "block", marginBottom: "4px" }}>FROM</label>
                          <button
                            onClick={() => { setShowCustomFrom(v => !v); setShowCustomTo(false); }}
                            style={{
                              width: "100%", textAlign: "left", background: "#f9fafb",
                              border: `1.5px solid ${showCustomFrom ? "#6C3AED" : "#e5e7eb"}`,
                              borderRadius: "8px", padding: "7px 10px", fontSize: "13px",
                              color: fromDate ? "#111827" : "#9ca3af", cursor: "pointer", fontWeight: "500",
                            }}>
                            {fromDate ? formatShort(fromDate) : "Pick date"}
                          </button>
                          {showCustomFrom && (
                            <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 200 }}>
                              <MiniCalendar value={fromDate} maxDate={toDate || today}
                                onChange={(d) => { setFromDate(d); setShowCustomFrom(false); setShowCustomTo(true); }} />
                            </div>
                          )}
                        </div>
                        {/* To */}
                        <div style={{ flex: 1, position: "relative" }}>
                          <label style={{ fontSize: "11px", fontWeight: "600", color: "#9ca3af", display: "block", marginBottom: "4px" }}>TO</label>
                          <button
                            onClick={() => { setShowCustomTo(v => !v); setShowCustomFrom(false); }}
                            style={{
                              width: "100%", textAlign: "left", background: "#f9fafb",
                              border: `1.5px solid ${showCustomTo ? "#6C3AED" : "#e5e7eb"}`,
                              borderRadius: "8px", padding: "7px 10px", fontSize: "13px",
                              color: toDate ? "#111827" : "#9ca3af", cursor: "pointer", fontWeight: "500",
                            }}>
                            {toDate ? formatShort(toDate) : "Pick date"}
                          </button>
                          {showCustomTo && (
                            <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, zIndex: 200 }}>
                              <MiniCalendar value={toDate} maxDate={today}
                                onChange={(d) => { setToDate(d); setShowCustomTo(false); }} />
                            </div>
                          )}
                        </div>
                      </div>
                      {fromDate && <button onClick={() => { setFromDate(""); setToDate(""); }}
                        style={{ background: "none", border: "none", fontSize: "12px", color: "#9ca3af", cursor: "pointer", padding: 0 }}>
                        Clear dates
                      </button>}
                    </div>
                  )}

                  {/* Download button at bottom */}
                  <div style={{ borderTop: "1px solid #f3f4f6", padding: "8px" }}>
                    <button
                      onClick={handleDownload}
                      style={{
                        width: "100%", background: "#6C3AED", color: "#fff",
                        border: "none", borderRadius: "8px", padding: "10px",
                        fontSize: "14px", fontWeight: "700", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                      }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Download Report
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Active filter pill */}
        {(fromDate || toDate) && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <div style={{ background: "#f3f0ff", border: "1px solid #c4b5fd", borderRadius: "20px", padding: "4px 14px", fontSize: "13px", color: "#6C3AED", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
              📅 {fromDate ? formatShort(fromDate) : "Start"} → {toDate ? formatShort(toDate) : "Today"}
              <button onClick={() => { setFromDate(""); setToDate(""); setSelectedPreset("all"); }}
                style={{ background: "none", border: "none", color: "#6C3AED", cursor: "pointer", fontSize: "16px", lineHeight: 1, padding: "0 0 0 4px" }}>×</button>
            </div>
            <span style={{ fontSize: "13px", color: "#9ca3af" }}>{filteredTxns.length} transaction{filteredTxns.length !== 1 ? "s" : ""}</span>
          </div>
        )}

        {loading ? (
          <div style={{ background: "#fff", borderRadius: "14px", padding: "60px", textAlign: "center", border: "1px solid #e5e7eb", color: "#6b7280" }}>Loading report...</div>
        ) : transactions.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: "14px", padding: "60px", textAlign: "center", border: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
            <p style={{ color: "#6b7280", fontSize: "15px", marginBottom: "20px" }}>No transactions yet. Start investing to see your P&L report.</p>
            <button onClick={() => navigate("/mutual-fund")} style={{ background: "#6C3AED", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 24px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>Start Investing</button>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
              {[
                { label: "Total Invested", value: formatCurrency(totalInvested), color: "#111827" },
                { label: "Current Value", value: navLoading ? "Loading..." : formatCurrency(totalCurrentValue), sub: navLoaded ? "Live NAV" : null, color: "#111827" },
                { label: "Total P&L", value: `${totalGain >= 0 ? "+" : ""}${formatCurrency(totalGain)}`, sub: `(${gainPct}%)`, color: totalGain >= 0 ? "#16a34a" : "#dc2626" },
              ].map((card, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: "12px", padding: "20px 24px", border: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <div style={{ fontSize: "13px", color: "#6b7280", fontWeight: "600", marginBottom: "8px" }}>{card.label}</div>
                  <div style={{ fontSize: "22px", fontWeight: "700", color: card.color }}>{card.value}</div>
                  {card.sub && <div style={{ fontSize: "12px", color: card.color === "#111827" ? "#9ca3af" : card.color, fontWeight: "600", marginTop: "2px" }}>{card.sub}</div>}
                </div>
              ))}
            </div>

            {/* Fund breakdown */}
            <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "24px" }}>
              <div style={{ padding: "18px 24px", borderBottom: "1px solid #e5e7eb" }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#111827" }}>Fund-wise Breakdown</h3>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
                  <thead>
                    <tr style={{ background: "#f9fafb" }}>
                      {["Mutual Fund Scheme", "Invested", "Current Value", "Profit / Loss", "Return %", "Live NAV"].map(h => (
                        <th key={h} style={{ padding: "12px 20px", fontSize: "13px", fontWeight: "600", color: "#6b7280", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {plItems.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: idx < plItems.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                        <td style={{ padding: "14px 20px", fontWeight: "600", color: "#111827", fontSize: "14px" }}>{item.name}</td>
                        <td style={{ padding: "14px 20px", color: "#374151", fontSize: "14px" }}>{formatCurrency(item.invested)}</td>
                        <td style={{ padding: "14px 20px", color: "#374151", fontSize: "14px" }}>{navLoading ? "..." : formatCurrency(item.current)}</td>
                        <td style={{ padding: "14px 20px", fontWeight: "700", fontSize: "14px", color: item.isPositive ? "#16a34a" : "#dc2626" }}>
                          {item.isPositive ? "+" : ""}{formatCurrency(item.gain)}
                        </td>
                        <td style={{ padding: "14px 20px", fontWeight: "700", fontSize: "14px", color: item.isPositive ? "#16a34a" : "#dc2626" }}>
                          {item.isPositive ? "+" : ""}{item.pct}%
                        </td>
                        <td style={{ padding: "14px 20px", fontSize: "13px", color: item.liveNav ? "#6C3AED" : "#9ca3af", fontWeight: "600" }}>
                          {item.liveNav ? `₹${item.liveNav.toFixed(4)}` : "Unavailable"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: "14px 24px", borderTop: "1px solid #e5e7eb", background: "#f9fafb" }}>
                <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af" }}>
                  * Current value is based on live NAV from mfapi.in. Actual returns may vary. Mutual Fund investments are subject to market risks.
                </p>
              </div>
            </div>

            {/* Transaction history */}
            <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ padding: "18px 24px", borderBottom: "1px solid #e5e7eb" }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#111827" }}>
                  Transaction History{" "}
                  {(fromDate || toDate) && <span style={{ fontSize: "13px", color: "#6C3AED", fontWeight: "600" }}>({filteredTxns.length} transactions)</span>}
                </h3>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "500px" }}>
                  <thead>
                    <tr style={{ background: "#f9fafb" }}>
                      {["Date", "Fund", "Type", "Amount", "Units", "NAV"].map(h => (
                        <th key={h} style={{ padding: "12px 20px", fontSize: "13px", fontWeight: "600", color: "#6b7280", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTxns.length === 0 ? (
                      <tr><td colSpan="6" style={{ padding: "24px", textAlign: "center", color: "#9ca3af" }}>No transactions in this date range</td></tr>
                    ) : filteredTxns.map((tx, idx) => (
                      <tr key={idx} style={{ borderBottom: idx < filteredTxns.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                        <td style={{ padding: "12px 20px", fontSize: "13px", color: "#6b7280" }}>{formatDate(tx.transaction_date)}</td>
                        <td style={{ padding: "12px 20px", fontSize: "13px", fontWeight: "600", color: "#111827" }}>{tx.fund_id}</td>
                        <td style={{ padding: "12px 20px" }}>
                          <span style={{ background: tx.transaction_type === "BUY" ? "#dcfce7" : "#fee2e2", color: tx.transaction_type === "BUY" ? "#15803d" : "#b91c1c", padding: "2px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" }}>
                            {tx.transaction_type}
                          </span>
                        </td>
                        <td style={{ padding: "12px 20px", fontSize: "13px", fontWeight: "700", color: tx.transaction_type === "BUY" ? "#15803d" : "#b91c1c" }}>
                          {tx.transaction_type === "BUY" ? "+" : "-"}{formatCurrency(tx.amount)}
                        </td>
                        <td style={{ padding: "12px 20px", fontSize: "13px", color: "#374151" }}>{parseFloat(tx.units || 0).toFixed(4)}</td>
                        <td style={{ padding: "12px 20px", fontSize: "13px", color: "#374151" }}>₹{parseFloat(tx.nav || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}