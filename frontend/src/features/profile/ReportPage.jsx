import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../mutual-fund/component/DashboardLayout";
import "./profile.css";

const TRANSACTION_SERVICE_URL = import.meta.env.VITE_TRANSACTION_API || "http://localhost:4003";

export default function ReportPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    fetch(`${TRANSACTION_SERVICE_URL}/api/transactions/history`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { setTransactions(data.transactions || []); setLoading(false); })
      .catch(() => { setTransactions([]); setLoading(false); });
  }, [navigate]);

  const formatCurrency = (n) => `₹ ${Number(n || 0).toLocaleString("en-IN")}`;

  // ✅ Fixed: use "REDEEM" not "SELL"
  const totalInvested = transactions
    .filter(t => t.transaction_type === "BUY")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalRedeemed = transactions
    .filter(t => t.transaction_type === "REDEEM")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const currentValue = totalInvested * 1.19;
  const totalGain = currentValue - totalInvested;
  const gainPct = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(2) : "0.00";

  // Group by fund — ✅ Fixed: REDEEM not SELL
  const fundMap = {};
  transactions.forEach(tx => {
    const key = tx.fund_id;
    if (!fundMap[key]) fundMap[key] = { name: key, invested: 0, redeemed: 0 };
    if (tx.transaction_type === "BUY")    fundMap[key].invested  += Number(tx.amount || 0);
    if (tx.transaction_type === "REDEEM") fundMap[key].redeemed += Number(tx.amount || 0);
  });

  const plItems = Object.values(fundMap).map(f => {
    const current = f.invested * 1.19;
    const gain = current - f.invested;
    const pct = f.invested > 0 ? ((gain / f.invested) * 100).toFixed(2) : "0.00";
    return { ...f, current, gain, pct, isPositive: gain >= 0 };
  });

  return (
    <DashboardLayout pageTitle="Profit & Loss Report">
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>Profit & Loss Statement</h2>
            <p style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>Realized and unrealized returns across your mutual fund investments.</p>
          </div>
          {transactions.length > 0 && (
            <button onClick={() => window.print()}
              style={{ display: "flex", alignItems: "center", gap: "6px", background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: "8px", padding: "8px 16px", fontSize: "14px", fontWeight: "600", color: "#374151", cursor: "pointer" }}>
              🖨️ Print / Export
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ background: "#fff", borderRadius: "14px", padding: "60px", textAlign: "center", border: "1px solid #e5e7eb", color: "#6b7280" }}>
            Loading report...
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: "14px", padding: "60px", textAlign: "center", border: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
            <p style={{ color: "#6b7280", fontSize: "15px", marginBottom: "20px" }}>No transactions yet. Start investing to see your P&amp;L report.</p>
            <button onClick={() => navigate("/mutual-fund")}
              style={{ background: "#6C3AED", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 24px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
              Start Investing
            </button>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "24px" }}>
              {[
                { label: "Total Invested",  value: formatCurrency(totalInvested),  color: "#111827" },
                { label: "Current Value",   value: formatCurrency(currentValue),   color: "#111827" },
                { label: "Total P&L",       value: `${totalGain >= 0 ? "+" : ""}${formatCurrency(totalGain)}`, sub: `(${gainPct}%)`, color: totalGain >= 0 ? "#16a34a" : "#dc2626" },
              ].map((card, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: "12px", padding: "20px 24px", border: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <div style={{ fontSize: "13px", color: "#6b7280", fontWeight: "600", marginBottom: "8px" }}>{card.label}</div>
                  <div style={{ fontSize: "22px", fontWeight: "700", color: card.color }}>{card.value}</div>
                  {card.sub && <div style={{ fontSize: "13px", color: card.color, fontWeight: "600", marginTop: "2px" }}>{card.sub}</div>}
                </div>
              ))}
            </div>

            {/* Fund breakdown table */}
            <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ padding: "18px 24px", borderBottom: "1px solid #e5e7eb" }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#111827" }}>Fund-wise Breakdown</h3>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
                  <thead>
                    <tr style={{ background: "#f9fafb" }}>
                      {["Mutual Fund Scheme", "Invested Value", "Current Value", "Profit / Loss", "Abs. Return"].map(h => (
                        <th key={h} style={{ padding: "12px 20px", fontSize: "13px", fontWeight: "600", color: "#6b7280", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {plItems.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: idx < plItems.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                        <td style={{ padding: "14px 20px", fontWeight: "600", color: "#111827", fontSize: "14px" }}>{item.name}</td>
                        <td style={{ padding: "14px 20px", color: "#374151", fontSize: "14px" }}>{formatCurrency(item.invested)}</td>
                        <td style={{ padding: "14px 20px", color: "#374151", fontSize: "14px" }}>{formatCurrency(item.current)}</td>
                        <td style={{ padding: "14px 20px", fontWeight: "700", fontSize: "14px", color: item.isPositive ? "#16a34a" : "#dc2626" }}>
                          {item.isPositive ? "+" : ""}{formatCurrency(item.gain)}
                        </td>
                        <td style={{ padding: "14px 20px", fontWeight: "700", fontSize: "14px", color: item.isPositive ? "#16a34a" : "#dc2626" }}>
                          {item.isPositive ? "+" : ""}{item.pct}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: "14px 24px", borderTop: "1px solid #e5e7eb", background: "#f9fafb" }}>
                <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af" }}>
                  * Current value is estimated at 19% growth. Actual returns may vary. Mutual Fund investments are subject to market risks.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}