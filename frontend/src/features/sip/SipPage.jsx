import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../mutual-fund/component/DashboardLayout";
import "./sip.css";

const SIP_SERVICE_URL = import.meta.env.VITE_SIP_API || "http://localhost:4004";

const getAmcLogo = (fundName = "") => {
  const name = fundName.toLowerCase();
  if (name.includes("hdfc")) return "https://assets-netstorage.groww.in/mf-assets/logos/hdfc_groww.png";
  if (name.includes("sbi")) return "https://assets-netstorage.groww.in/mf-assets/logos/sbi_groww.png";
  if (name.includes("parag")) return "https://assets-netstorage.groww.in/mf-assets/logos/ppfas_groww.png";
  if (name.includes("nippon")) return "https://assets-netstorage.groww.in/mf-assets/logos/nippon_groww.png";
  if (name.includes("quant")) return "https://assets-netstorage.groww.in/mf-assets/logos/quant_groww.png";
  if (name.includes("axis")) return "https://assets-netstorage.groww.in/mf-assets/logos/axis_groww.png";
  if (name.includes("icici")) return "https://assets-netstorage.groww.in/mf-assets/logos/icici_groww.png";
  return "https://assets-netstorage.groww.in/mf-assets/logos/sbi_groww.png";
};

export default function SipPage() {
  const [sips, setSips] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${SIP_SERVICE_URL}/api/sips/my-sips`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => { setSips(Array.isArray(data) ? data.filter(s => s.status === "ACTIVE") : []); setLoading(false); })
      .catch(() => { setSips([]); setLoading(false); });
  }, []);

  const totalSipAmount = sips.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return { day: "--", month: "---" };
    const d = new Date(dateStr);
    return {
      day: String(d.getDate()).padStart(2, "0"),
      month: d.toLocaleString("en-IN", { month: "short" })
    };
  };

  return (
    <DashboardLayout pageTitle="SIP">
      <div className="sip-container">
        <div className="sip-summary-card">
          <div className="sip-summary-label">Monthly SIP amount</div>
          <div className="sip-summary-value">₹{totalSipAmount.toLocaleString("en-IN")}</div>
        </div>

        <div className="sip-list-header">
          <h3 className="sip-list-title">Active SIP ({sips.length})</h3>
          <div className="sip-sort-wrapper"><span>Sort by: Due Date</span></div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>Loading SIPs...</div>
        ) : sips.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: "14px", border: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📅</div>
            <h3 style={{ fontWeight: 700, color: "#111827", marginBottom: "8px" }}>No Active SIPs</h3>
            <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "20px" }}>Start a SIP to build wealth systematically.</p>
            <button onClick={() => navigate("/mutual-fund")}
              style={{ background: "#6C3AED", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", fontWeight: 600, cursor: "pointer" }}>
              Browse Funds
            </button>
          </div>
        ) : (
          <div className="sip-cards-list">
            {sips.map((item) => {
              const { day, month } = formatDate(item.start_date);
              return (
                <div key={item.id} className="sip-card">
                  <div className="sip-left">
                    <img src={getAmcLogo(item.fund_name)} alt={item.fund_name} className="sip-logo" />
                    <div className="sip-info">
                      <span className="sip-name">{item.fund_name}</span>
                      <span className="sip-amount">₹{Number(item.amount).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                  <div className="sip-right">
                    <div className="sip-date-box" title="Next installment date">
                      <span className="sip-date-day">{day}</span>
                      <span className="sip-date-month">{month}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}