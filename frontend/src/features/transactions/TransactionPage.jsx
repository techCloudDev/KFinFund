import { apiFetch } from "../../utils/api";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../mutual-fund/component/DashboardLayout";
import "./transactions.css";

const TRANSACTION_SERVICE_URL = import.meta.env.VITE_TRANSACTION_API || "http://localhost:4003";

// ✅ Fund name → scheme code for Buy Again navigation
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

export default function TransactionPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    apiFetch(`${TRANSACTION_SERVICE_URL}/api/transactions/history`)
      .then(r => r.json())
      .then(data => { setTransactions(data.transactions || []); setLoading(false); })
      .catch(() => { setTransactions([]); setLoading(false); });
  }, [navigate]);

  const formatCurrency = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const filtered = transactions.filter(tx => {
    if (activeTab === "all") return true;
    if (activeTab === "investments") return tx.transaction_type === "BUY";
    if (activeTab === "redemptions") return tx.transaction_type === "REDEEM";
    return true;
  });

  const tabs = [
    { key: "all", label: "All" },
    { key: "investments", label: "Investments" },
    { key: "redemptions", label: "Redemptions" },
  ];

  return (
    <DashboardLayout pageTitle="Transactions">
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "24px" }}>
          {[
            { label: "Total Invested", value: formatCurrency(transactions.filter(t => t.transaction_type === "BUY").reduce((s, t) => s + Number(t.amount), 0)), color: "#6C3AED", bg: "#f3f0ff" },
            { label: "Total Redeemed", value: formatCurrency(transactions.filter(t => t.transaction_type === "REDEEM").reduce((s, t) => s + Number(t.amount), 0)), color: "#dc2626", bg: "#fef2f2" },
            { label: "Total Transactions", value: transactions.length, color: "#111827", bg: "#f9fafb" },
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
              style={{ padding: "8px 20px", border: "none", borderRadius: "7px", fontSize: "14px", fontWeight: "600", cursor: "pointer",
                background: activeTab === tab.key ? "#fff" : "transparent",
                color: activeTab === tab.key ? "#6C3AED" : "#6b7280",
                boxShadow: activeTab === tab.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
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
            {filtered.map((tx, i) => {
              const isBuy = tx.transaction_type === "BUY";
              const fundCode = getFundCode(tx.fund_id);
              return (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "1fr auto",
                  padding: "16px 20px",
                  borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none",
                  alignItems: "center", gap: "16px",
                }}>
                  {/* Left — fund info */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "14px", fontWeight: "700", color: "#111827" }}>{tx.fund_id}</span>
                      <span style={{
                        padding: "2px 10px", borderRadius: "10px", fontSize: "11px", fontWeight: "700",
                        background: isBuy ? "#dcfce7" : "#fee2e2",
                        color: isBuy ? "#15803d" : "#dc2626",
                      }}>
                        {isBuy ? "BUY" : "REDEEM"}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "13px", color: "#6b7280" }}>
                        Amount: <strong style={{ color: isBuy ? "#15803d" : "#dc2626" }}>{isBuy ? "+" : "-"}{formatCurrency(tx.amount)}</strong>
                      </span>
                      <span style={{ fontSize: "13px", color: "#6b7280" }}>
                        Units: <strong style={{ color: "#374151" }}>{Number(tx.units || 0).toFixed(4)}</strong>
                      </span>
                      <span style={{ fontSize: "13px", color: "#6b7280" }}>
                        NAV: <strong style={{ color: "#374151" }}>₹{Number(tx.nav || 0).toFixed(2)}</strong>
                      </span>
                      <span style={{ fontSize: "13px", color: "#9ca3af" }}>{formatDate(tx.transaction_date)}</span>
                    </div>
                  </div>

                  {/* ✅ Right — Buy Again button on BUY transactions */}
                  {isBuy && (
                    <button
                      onClick={() => fundCode ? navigate(`/mutual-fund/${fundCode}`) : navigate("/mutual-fund")}
                      style={{ padding: "8px 16px", background: "#6C3AED", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap" }}>
                      + Buy Again
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}