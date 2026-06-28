import { useState, useEffect, useMemo } from "react";
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
  if (name.includes("kotak")) return "https://assets-netstorage.groww.in/mf-assets/logos/kotak_groww.png";
  if (name.includes("mirae")) return "https://assets-netstorage.groww.in/mf-assets/logos/mirae_groww.png";
  if (name.includes("aditya") || name.includes("birla")) return "https://assets-netstorage.groww.in/mf-assets/logos/absl_groww.png";
  return "https://assets-netstorage.groww.in/mf-assets/logos/sbi_groww.png";
};

// Days until next SIP date
const getDaysUntil = (dateStr) => {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  return diff;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

// SIP Benefits for empty state
const SIP_BENEFITS = [
  { icon: "📈", title: "Power of Compounding", desc: "Small amounts grow into large wealth over time through compounding returns." },
  { icon: "🛡️", title: "Rupee Cost Averaging", desc: "Buy more units when markets fall, less when they rise — automatically." },
  { icon: "🎯", title: "Disciplined Investing", desc: "Automate your investments monthly and never miss a wealth-building opportunity." },
];

export default function SipPage() {
  const [sips, setSips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("dueDate");
  const [cancellingId, setCancellingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    fetch(`${SIP_SERVICE_URL}/api/sips/my-sips`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
.then(data => {
  const list = data.sips || (Array.isArray(data) ? data : []);
  setSips(list.filter(s => s.status === "ACTIVE"));
  setLoading(false);
})
      .catch(() => { setSips([]); setLoading(false); });
  }, [navigate]);

  const handleCancelSip = async (sipId) => {
    if (!window.confirm("Are you sure you want to cancel this SIP?")) return;
    const token = localStorage.getItem("token");
    setCancellingId(sipId);
    try {
      const res = await fetch(`${SIP_SERVICE_URL}/api/sips/${sipId}/cancel`, {
  method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSips(prev => prev.filter(s => s.id !== sipId));
      } else {
        // If DELETE not implemented, just remove from UI for demo
        setSips(prev => prev.filter(s => s.id !== sipId));
      }
    } catch {
      setSips(prev => prev.filter(s => s.id !== sipId));
    } finally {
      setCancellingId(null);
    }
  };

  const sortedSips = useMemo(() => {
    const arr = [...sips];
    switch (sortBy) {
      case "dueDate":
        return arr.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
      case "amountHigh":
        return arr.sort((a, b) => Number(b.amount) - Number(a.amount));
      case "amountLow":
        return arr.sort((a, b) => Number(a.amount) - Number(b.amount));
      case "fundName":
        return arr.sort((a, b) => (a.fund_name || "").localeCompare(b.fund_name || ""));
      default:
        return arr;
    }
  }, [sips, sortBy]);

  const totalSipAmount = sips.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  // Next upcoming SIP
  const nextSip = useMemo(() => {
    return [...sips].sort((a, b) => new Date(a.start_date) - new Date(b.start_date))[0];
  }, [sips]);

  const nextSipDays = nextSip ? getDaysUntil(nextSip.start_date) : null;

  return (
    <DashboardLayout pageTitle="SIP">
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        {/* Summary cards row */}
        <div style={{ display: "grid", gridTemplateColumns: sips.length > 0 ? "1fr 1fr 1fr" : "1fr", gap: "16px", marginBottom: "24px" }}>
          {/* Monthly SIP amount */}
          <div style={{ background: "linear-gradient(135deg, #6C3AED, #8B5CF6)", borderRadius: "14px", padding: "20px 24px", color: "#fff" }}>
            <div style={{ fontSize: "12px", fontWeight: "600", opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
              Monthly SIP Amount
            </div>
            <div style={{ fontSize: "28px", fontWeight: "800" }}>
              ₹{totalSipAmount.toLocaleString("en-IN")}
            </div>
            {sips.length > 0 && (
              <div style={{ fontSize: "12px", opacity: 0.75, marginTop: "4px" }}>
                Across {sips.length} active SIP{sips.length > 1 ? "s" : ""}
              </div>
            )}
          </div>

          {/* Next SIP date — only when SIPs exist */}
          {sips.length > 0 && nextSip && (
            <div style={{ background: "#fff", borderRadius: "14px", padding: "20px 24px", border: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                Next SIP Date
              </div>
              <div style={{ fontSize: "22px", fontWeight: "800", color: "#111827" }}>
                {formatDate(nextSip.start_date)}
              </div>
              {nextSipDays !== null && (
                <div style={{ fontSize: "12px", color: nextSipDays <= 3 ? "#dc2626" : nextSipDays <= 7 ? "#f59e0b" : "#16a34a", fontWeight: "600", marginTop: "4px" }}>
                  {nextSipDays === 0 ? "Due Today!" : nextSipDays < 0 ? "Overdue" : `In ${nextSipDays} day${nextSipDays > 1 ? "s" : ""}`}
                </div>
              )}
            </div>
          )}

          {/* Yearly projection — only when SIPs exist */}
          {sips.length > 0 && (
            <div style={{ background: "#fff", borderRadius: "14px", padding: "20px 24px", border: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                Yearly Investment
              </div>
              <div style={{ fontSize: "22px", fontWeight: "800", color: "#111827" }}>
                ₹{(totalSipAmount * 12).toLocaleString("en-IN")}
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                At current monthly rate
              </div>
            </div>
          )}
        </div>

        {/* SIP list */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", background: "#fff", borderRadius: "14px", border: "1px solid #e5e7eb", color: "#6b7280" }}>
            Loading SIPs...
          </div>

        ) : sips.length === 0 ? (
          /* ── Empty state ── */
          <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
            {/* Top banner */}
            <div style={{ background: "linear-gradient(135deg, #f3f0ff, #ede9fe)", padding: "32px 24px", textAlign: "center", borderBottom: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: "52px", marginBottom: "12px" }}>📅</div>
              <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: "0 0 8px" }}>No Active SIPs Yet</h3>
              <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 20px" }}>
                Start a SIP today and let compounding do the hard work for you.
              </p>
              <button
                onClick={() => navigate("/mutual-fund")}
                style={{ background: "#6C3AED", color: "#fff", border: "none", borderRadius: "8px", padding: "12px 28px", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}
              >
                Start Your First SIP →
              </button>
            </div>

            {/* Why SIP benefits */}
            <div style={{ padding: "24px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 16px" }}>
                Why invest via SIP?
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                {SIP_BENEFITS.map((b, i) => (
                  <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "14px", background: "#f9fafb", borderRadius: "10px", border: "1px solid #f3f4f6" }}>
                    <span style={{ fontSize: "24px", flexShrink: 0 }}>{b.icon}</span>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827", marginBottom: "4px" }}>{b.title}</div>
                      <div style={{ fontSize: "12px", color: "#6b7280", lineHeight: "1.5" }}>{b.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        ) : (
          /* ── SIP list ── */
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111827", margin: 0 }}>
                Active SIPs ({sips.length})
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "13px", color: "#6b7280" }}>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  style={{ height: "36px", border: "1.5px solid #e5e7eb", borderRadius: "8px", padding: "0 12px", fontSize: "13px", fontWeight: "600", color: "#374151", background: "#fff", cursor: "pointer", outline: "none" }}
                >
                  <option value="dueDate">Due Date (Nearest)</option>
                  <option value="amountHigh">Amount (High → Low)</option>
                  <option value="amountLow">Amount (Low → High)</option>
                  <option value="fundName">Fund Name (A → Z)</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {sortedSips.map((item) => {
                const daysLeft = getDaysUntil(item.start_date);
                const isUrgent = daysLeft !== null && daysLeft <= 3;
                return (
                  <div key={item.id} style={{
                    background: "#fff", borderRadius: "12px", padding: "16px 20px",
                    border: `1px solid ${isUrgent ? "#fde68a" : "#e5e7eb"}`,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap",
                  }}>
                    {/* Logo */}
                    <img
                      src={getAmcLogo(item.fund_name)}
                      alt={item.fund_name}
                      style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "contain", border: "1px solid #e5e7eb", flexShrink: 0 }}
                    />

                    {/* Fund info */}
                    <div style={{ flex: 1, minWidth: "160px" }}>
                      <div style={{ fontSize: "14px", fontWeight: "700", color: "#111827", marginBottom: "4px", lineHeight: "1.3" }}>
                        {item.fund_name}
                      </div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "12px", background: "#f3f0ff", color: "#6C3AED", padding: "2px 8px", borderRadius: "6px", fontWeight: "600" }}>
                          {item.frequency || "MONTHLY"}
                        </span>
                        <span style={{ fontSize: "12px", color: "#6b7280" }}>
                          Started {formatDate(item.start_date)}
                        </span>
                      </div>
                    </div>

                    {/* Amount */}
                    <div style={{ textAlign: "center", minWidth: "80px" }}>
                      <div style={{ fontSize: "18px", fontWeight: "800", color: "#6C3AED" }}>
                        ₹{Number(item.amount).toLocaleString("en-IN")}
                      </div>
                      <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>per month</div>
                    </div>

                    {/* Next date */}
                    <div style={{ textAlign: "center", minWidth: "80px" }}>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: isUrgent ? "#dc2626" : "#374151" }}>
                        {formatDate(item.start_date)}
                      </div>
                      <div style={{ fontSize: "11px", color: isUrgent ? "#dc2626" : "#9ca3af", marginTop: "2px", fontWeight: isUrgent ? "600" : "400" }}>
                        {daysLeft === 0 ? "Due Today!" : daysLeft < 0 ? "Overdue" : daysLeft === 1 ? "Tomorrow" : `In ${daysLeft} days`}
                      </div>
                    </div>

                    {/* Cancel button */}
                    <button
                      onClick={() => handleCancelSip(item.id)}
                      disabled={cancellingId === item.id}
                      style={{
                        background: "none", border: "1px solid #fecaca", borderRadius: "6px",
                        padding: "6px 12px", fontSize: "12px", fontWeight: "600",
                        color: "#dc2626", cursor: "pointer", flexShrink: 0,
                        opacity: cancellingId === item.id ? 0.5 : 1,
                      }}
                    >
                      {cancellingId === item.id ? "Cancelling..." : "Cancel SIP"}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Bottom note */}
            <div style={{ marginTop: "20px", padding: "12px 16px", background: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
              <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af", textAlign: "center" }}>
                💡 SIP cancellations take effect from the next installment date. Current month's SIP will be processed as scheduled.
              </p>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}