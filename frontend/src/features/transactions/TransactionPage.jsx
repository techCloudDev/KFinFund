import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../mutual-fund/component/DashboardLayout";
import "./transactions.css";

const TRANSACTION_SERVICE_URL = import.meta.env.VITE_TRANSACTION_API || "http://localhost:4003";

export default function TransactionPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
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

  const formatCurrency = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const filtered = transactions.filter(tx => {
    if (activeTab === "all") return true;
    if (activeTab === "investments") return tx.transaction_type === "BUY";
    if (activeTab === "redemptions") return tx.transaction_type === "REDEEM"; // ✅ REDEEM not SELL
    return true;
  });

  const tabs = [
    { key: "all", label: "All" },
    { key: "investments", label: "Investments" },
    { key: "redemptions", label: "Redemptions" },
  ];

  return (
    <DashboardLayout pageTitle="Transactions">
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "24px" }}>
          {[
            {
              label: "Total Invested",
              value: formatCurrency(transactions.filter(t => t.transaction_type === "BUY").reduce((s, t) => s + Number(t.amount), 0)),
              color: "#6C3AED", bg: "#f3f0ff"
            },
            {
              label: "Total Redeemed",
              value: formatCurrency(transactions.filter(t => t.transaction_type === "REDEEM").reduce((s, t) => s + Number(t.amount), 0)),
              color: "#dc2626", bg: "#fef2f2"
            },
            {
              label: "Total Transactions",
              value: transactions.length,
              color: "#111827", bg: "#f9fafb"
            },
          ].map((c, i) => (
            <div key={i} style={{ background: c.bg, borderRadius: "12px", padding: "16px 20px", border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "8px" }}>{c.label}</div>
              <div style={{ fontSize: "22px", fontWeight: "800", color: c.color }}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", background: "#f3f4f6", borderRadius: "10px", padding: "4px", marginBottom: "20px", width: "fit-content" }}>
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "8px 20px", border: "none", borderRadius: "7px", fontSize: "14px", fontWeight: "600", cursor: "pointer",
                background: activeTab === tab.key ? "#fff" : "transparent",
                color: activeTab === tab.key ? "#6C3AED" : "#6b7280",
                boxShadow: activeTab === tab.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Transaction list */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", background: "#fff", borderRadius: "14px", border: "1px solid #e5e7eb", color: "#6b7280" }}>
            Loading transactions...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", background: "#fff", borderRadius: "14px", border: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>📋</div>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111827", margin: "0 0 8px" }}>No transactions yet</h3>
            <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "20px" }}>Your investment transactions will appear here.</p>
            <button onClick={() => navigate("/mutual-fund")}
              style={{ background: "#6C3AED", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", fontWeight: "600", cursor: "pointer" }}>
              Start Investing
            </button>
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
            {/* Table header */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", padding: "12px 20px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", gap: "12px" }}>
              {["Fund", "Type", "Amount", "Units", "Date"].map(h => (
                <span key={h} style={{ fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.4px" }}>{h}</span>
              ))}
            </div>

            {/* Rows */}
            {filtered.map((tx, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                padding: "14px 20px", borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none",
                alignItems: "center", gap: "12px",
              }}>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {tx.fund_id}
                </span>
                <span style={{
                  display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: "10px", fontSize: "12px", fontWeight: "700",
                  background: tx.transaction_type === "BUY" ? "#dcfce7" : "#fee2e2",
                  color: tx.transaction_type === "BUY" ? "#15803d" : "#dc2626",
                  width: "fit-content",
                }}>
                  {tx.transaction_type === "BUY" ? "BUY" : "REDEEM"}
                </span>
                <span style={{ fontSize: "14px", fontWeight: "700", color: tx.transaction_type === "BUY" ? "#15803d" : "#dc2626" }}>
                  {tx.transaction_type === "BUY" ? "+" : "-"}{formatCurrency(tx.amount)}
                </span>
                <span style={{ fontSize: "13px", color: "#374151" }}>
                  {Number(tx.units || 0).toFixed(4)}
                </span>
                <span style={{ fontSize: "13px", color: "#6b7280" }}>
                  {formatDate(tx.transaction_date)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}