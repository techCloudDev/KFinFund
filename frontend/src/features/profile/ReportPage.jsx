import { apiFetch } from "../../utils/api";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../mutual-fund/component/DashboardLayout";
import "./profile.css";

const TRANSACTION_SERVICE_URL = import.meta.env.VITE_TRANSACTION_API || "http://localhost:4003";

// ✅ Dynamic NAV fetch — works for ANY fund automatically
const navCache = {};

const fetchLiveNav = async (fundName) => {
  if (!fundName) return null;
  if (navCache[fundName] !== undefined) return navCache[fundName];
  try {
    const searchRes = await fetch(`https://api.mfapi.in/mf/search?q=${encodeURIComponent(fundName.trim())}`);
    if (!searchRes.ok) { navCache[fundName] = null; return null; }
    const searchData = await searchRes.json();
    if (!searchData?.length) { navCache[fundName] = null; return null; }
    const schemeCode = searchData[0].schemeCode;
    if (!schemeCode) { navCache[fundName] = null; return null; }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const navRes = await fetch(`https://api.mfapi.in/mf/${schemeCode}/latest`, { signal: controller.signal });
    clearTimeout(timer);
    if (!navRes.ok) { navCache[fundName] = null; return null; }
    const navData = await navRes.json();
    const nav = parseFloat(navData?.data?.[0]?.nav);
    if (isNaN(nav)) { navCache[fundName] = null; return null; }
    navCache[fundName] = nav;
    return nav;
  } catch { navCache[fundName] = null; return null; }
};

export default function ReportPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [navLoading, setNavLoading] = useState(false);
  const [plItems, setPlItems] = useState([]);
  const [totalCurrentValue, setTotalCurrentValue] = useState(0);
  const [navLoaded, setNavLoaded] = useState(false);

  // ✅ Date range filter
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    apiFetch(`${TRANSACTION_SERVICE_URL}/api/transactions/history`)
      .then(r => r.json())
      .then(data => {
        setTransactions(data.transactions || []);
        setLoading(false);
      })
      .catch(() => { setTransactions([]); setLoading(false); });
  }, [navigate]);

  // ✅ Fetch live NAV for all funds
  useEffect(() => {
    if (transactions.length === 0) return;
    setNavLoading(true);

    const fundMap = {};
    transactions.forEach(tx => {
      const key = tx.fund_id;
      if (!fundMap[key]) fundMap[key] = { name: key, invested: 0, units: 0, redeemed: 0 };
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
      const liveNav = await fetchLiveNav(f.name);
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

  // ✅ Filter transactions by date range
  const filteredTxns = transactions.filter(tx => {
    if (!fromDate && !toDate) return true;
    const d = new Date(tx.transaction_date);
    if (fromDate && d < new Date(fromDate)) return false;
    if (toDate) { const to = new Date(toDate); to.setHours(23,59,59); if (d > to) return false; }
    return true;
  });

  const formatCurrency = (n) => `₹ ${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const totalInvested = filteredTxns.filter(t => t.transaction_type === "BUY").reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalGain = totalCurrentValue - totalInvested;
  const gainPct = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(2) : "0.00";

  // ✅ Download as CSV
  const handleDownload = () => {
    const dateLabel = fromDate || toDate ? `${fromDate || "all"}_to_${toDate || "all"}` : "all";
    const rows = [
      ["KFinFund - P&L Statement"],
      [`Generated: ${new Date().toLocaleDateString("en-IN")}`],
      fromDate || toDate ? [`Period: ${fromDate || "start"} to ${toDate || "today"}`] : ["Period: All time"],
      [],
      ["Fund Name", "Invested", "Current Value", "Profit/Loss", "Return %", "Live NAV"],
      ...plItems.map(item => [
        item.name,
        item.invested.toFixed(2),
        item.current.toFixed(2),
        item.gain.toFixed(2),
        item.pct + "%",
        item.liveNav ? item.liveNav.toFixed(4) : "N/A",
      ]),
      [],
      ["TOTAL", totalInvested.toFixed(2), totalCurrentValue.toFixed(2), totalGain.toFixed(2), gainPct + "%", ""],
      [],
      ["Transaction History"],
      ["Date", "Fund", "Type", "Amount", "Units", "NAV"],
      ...filteredTxns.map(tx => [
        formatDate(tx.transaction_date),
        tx.fund_id,
        tx.transaction_type,
        tx.amount,
        tx.units || "",
        tx.nav || "",
      ]),
    ];

    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `KFinFund_PL_Report_${dateLabel}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {/* Date filter button */}
              <button
                onClick={() => setShowDateFilter(f => !f)}
                style={{ display: "flex", alignItems: "center", gap: "6px", background: showDateFilter ? "#f3f0ff" : "#fff", border: `1.5px solid ${showDateFilter ? "#6C3AED" : "#e5e7eb"}`, borderRadius: "8px", padding: "8px 16px", fontSize: "14px", fontWeight: "600", color: showDateFilter ? "#6C3AED" : "#374151", cursor: "pointer" }}>
                📅 {fromDate || toDate ? `${fromDate || "—"} → ${toDate || "—"}` : "Date Range"}
              </button>
              {/* ✅ Download button */}
              <button
                onClick={handleDownload}
                style={{ display: "flex", alignItems: "center", gap: "6px", background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: "8px", padding: "8px 16px", fontSize: "14px", fontWeight: "600", color: "#374151", cursor: "pointer" }}>
                ⬇️ Download
              </button>
            </div>
          )}
        </div>

        {/* Date range picker */}
        {showDateFilter && (
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "16px 20px", marginBottom: "20px", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>From Date</label>
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                style={{ height: "40px", border: "1.5px solid #e5e7eb", borderRadius: "8px", padding: "0 12px", fontSize: "14px", outline: "none" }} />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>To Date</label>
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                style={{ height: "40px", border: "1.5px solid #e5e7eb", borderRadius: "8px", padding: "0 12px", fontSize: "14px", outline: "none" }} />
            </div>
            <button onClick={() => { setFromDate(""); setToDate(""); }}
              style={{ height: "40px", background: "transparent", border: "1.5px solid #e5e7eb", borderRadius: "8px", padding: "0 16px", fontSize: "14px", color: "#6b7280", cursor: "pointer" }}>
              Clear
            </button>
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
                  Transaction History {fromDate || toDate ? <span style={{ fontSize: "13px", color: "#6C3AED", fontWeight: "600" }}>({filteredTxns.length} transactions)</span> : ""}
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