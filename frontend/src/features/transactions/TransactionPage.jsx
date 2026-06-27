import { useState, useEffect } from "react";
import DashboardLayout from "../mutual-fund/component/DashboardLayout";
import "./transactions.css";

const TRANSACTION_SERVICE_URL = import.meta.env.VITE_TRANSACTION_API || "http://localhost:4003";

export default function TransactionPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${TRANSACTION_SERVICE_URL}/api/transactions/history`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setTransactions(data.transactions || []);
        setLoading(false);
      })
      .catch(() => { setTransactions([]); setLoading(false); });
  }, []);

  const filteredTransactions = transactions.filter((tx) => {
    if (activeTab === "all") return true;
    if (activeTab === "investments") return tx.transaction_type === "BUY";
    if (activeTab === "redemptions") return tx.transaction_type === "SELL";
    if (activeTab === "sip") return tx.transaction_type === "BUY" && tx.investment_type === "SIP";
    return true;
  });

  const groupedTransactions = filteredTransactions.reduce((groups, tx) => {
    const date = new Date(tx.transaction_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" });
    if (!groups[date]) groups[date] = [];
    groups[date].push(tx);
    return groups;
  }, {});

  const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  return (
    <DashboardLayout pageTitle="Transactions">
      <div className="tx-container">
        <header className="tx-header">
          <h2 className="tx-title">Transaction History</h2>
          <p className="tx-subtitle">View and monitor your order status, SIP installments, and redemptions.</p>
        </header>

        <div className="tx-tabs-container">
          {["all", "investments", "redemptions", "sip"].map((tab) => (
            <button key={tab} type="button"
              className={`tx-tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>Loading transactions...</div>
        ) : Object.keys(groupedTransactions).length === 0 ? (
          <div className="mf-empty-state" style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--mf-border-color)", borderRadius: "14px", padding: "60px 20px" }}>
            <div style={{ fontSize: "50px", marginBottom: "16px" }}>🔍</div>
            <h3 style={{ fontSize: "20px", fontWeight: "700", color: "var(--mf-text-dark)", margin: "0 0 8px 0" }}>No Transactions Found</h3>
            <p style={{ color: "var(--mf-text-muted)", fontSize: "14px", margin: 0 }}>
              No transactions yet. Start investing to see your history here.
            </p>
          </div>
        ) : (
          Object.keys(groupedTransactions).map((date) => (
            <div key={date} className="tx-date-group">
              <div className="tx-date-header">{date}</div>
              {groupedTransactions[date].map((tx) => {
                const isBuy = tx.transaction_type === "BUY";
                const isSip = tx.investment_type === "SIP";
                return (
                  <div key={tx.id} className="tx-card">
                    <div className="tx-left-section">
                      <div className={`tx-icon-box ${!isBuy ? "sell" : isSip ? "buy-sip" : "buy-lumpsum"}`}>
                        {!isBuy ? "↓" : isSip ? "↻" : "↑"}
                      </div>
                      <div className="tx-info">
                        <span className="tx-fund-name">{tx.fund_id}</span>
                        <div className="tx-meta-row">
                          <span className={`tx-type-badge ${isBuy ? "buy" : "sell"}`}>{isBuy ? "Buy" : "Sell"}</span>
                          <span className="tx-subtype-text">{isBuy ? (isSip ? "SIP Installment" : "One-time") : "Redemption"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="tx-right-section">
                      <div className="tx-amount-col">
                        <span className={`tx-amount ${isBuy ? "buy" : "sell"}`}>
                          {isBuy ? "+" : "-"} {formatCurrency(tx.amount)}
                        </span>
                        <span className={`tx-status-badge ${tx.status?.toLowerCase() || "completed"}`}>
                          <span className={`tx-dot ${tx.status?.toLowerCase() || "completed"}`} />
                          {tx.status || "Completed"}
                        </span>
                      </div>
                      <div className="tx-arrow">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}