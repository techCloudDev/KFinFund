import { useState, useEffect } from "react";
import ProfileLayout from "./ProfileLayout";

const TRANSACTION_SERVICE_URL = import.meta.env.VITE_TRANSACTION_API || "http://localhost:4003";

export default function ReportPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${TRANSACTION_SERVICE_URL}/api/transactions/history`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => { setTransactions(data.transactions || []); setLoading(false); })
      .catch(() => { setTransactions([]); setLoading(false); });
  }, []);

  const formatCurrency = (amount) => `₹ ${Number(amount || 0).toLocaleString("en-IN")}`;

  const totalInvested = transactions.filter(t => t.transaction_type === "BUY").reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalRedeemed = transactions.filter(t => t.transaction_type === "SELL").reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const currentValue = totalInvested * 1.19;
  const totalGain = currentValue - totalInvested;
  const gainPct = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(2) : "0.00";

  // Group by fund
  const fundMap = {};
  transactions.forEach(tx => {
    const key = tx.fund_id;
    if (!fundMap[key]) fundMap[key] = { name: key, invested: 0, redeemed: 0 };
    if (tx.transaction_type === "BUY") fundMap[key].invested += Number(tx.amount || 0);
    if (tx.transaction_type === "SELL") fundMap[key].redeemed += Number(tx.amount || 0);
  });

  const plItems = Object.values(fundMap).map(f => {
    const current = f.invested * 1.19;
    const gain = current - f.invested;
    const pct = f.invested > 0 ? ((gain / f.invested) * 100).toFixed(2) : "0.00";
    return { ...f, current, gain, pct, isPositive: gain >= 0 };
  });

  return (
    <ProfileLayout pageTitle="Profit & Loss Report">
      <div className="mf-detail-card">
        <h2 className="mf-detail-card-title">Profit & Loss Statement</h2>
        <p className="mf-detail-card-subtitle">Realized and unrealized returns across your mutual fund investments.</p>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>Loading report...</div>
        ) : transactions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
            <p style={{ color: "#6b7280" }}>No transactions yet. Start investing to see your P&L report.</p>
          </div>
        ) : (
          <>
            <div className="mf-pl-summary-cards">
              <div className="mf-pl-card">
                <span className="mf-pl-card-label">Total Invested</span>
                <span className="mf-pl-card-value">{formatCurrency(totalInvested)}</span>
              </div>
              <div className="mf-pl-card">
                <span className="mf-pl-card-label">Current Value</span>
                <span className="mf-pl-card-value">{formatCurrency(currentValue)}</span>
              </div>
              <div className="mf-pl-card">
                <span className="mf-pl-card-label">Total P&L</span>
                <span className={`mf-pl-card-value ${totalGain >= 0 ? "positive" : "negative"}`}>
                  {totalGain >= 0 ? "+" : ""}{formatCurrency(totalGain)} ({gainPct}%)
                </span>
              </div>
            </div>

            <div className="mf-pl-table-wrapper">
              <table className="mf-pl-table">
                <thead>
                  <tr>
                    <th>Mutual Fund Scheme</th>
                    <th>Invested Value</th>
                    <th>Current Value</th>
                    <th>Profit / Loss</th>
                    <th>Abs. Return</th>
                  </tr>
                </thead>
                <tbody>
                  {plItems.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: "500", color: "#111827" }}>{item.name}</td>
                      <td>{formatCurrency(item.invested)}</td>
                      <td>{formatCurrency(item.current)}</td>
                      <td className={item.isPositive ? "positive" : "negative"} style={{ fontWeight: "600" }}>
                        {item.isPositive ? "+" : ""}{formatCurrency(item.gain)}
                      </td>
                      <td className={item.isPositive ? "positive" : "negative"} style={{ fontWeight: "600" }}>
                        {item.isPositive ? "+" : ""}{item.pct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </ProfileLayout>
  );
}