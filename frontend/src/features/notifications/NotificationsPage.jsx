import { apiFetch } from "../../utils/api";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../mutual-fund/component/DashboardLayout";

const NOTIFICATION_SERVICE_URL = import.meta.env.VITE_NOTIFICATION_API || "http://localhost:4005";

const getTokenData = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try { return JSON.parse(atob(token.split(".")[1])); }
  catch { return null; }
};

const typeIcon = { SIP: "📅", PURCHASE: "💰", ALERT: "⚠️" };
const typeColor = { SIP: "#6C3AED", PURCHASE: "#16a34a", ALERT: "#f59e0b" };

const formatTime = (d) => {
  const diffMs = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const FILTERS = [
  { key: "ALL", label: "All" },
  { key: "UNREAD", label: "Unread" },
  { key: "SIP", label: "SIP" },
  { key: "PURCHASE", label: "Purchases" },
  { key: "ALERT", label: "Alerts" },
];

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  const tokenData = getTokenData();
  const userId = tokenData?.id;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    if (!userId) { setLoading(false); return; }

    apiFetch(`${NOTIFICATION_SERVICE_URL}/api/notifications/${userId}`)
      .then(r => r.json())
      .then(d => setNotifications(Array.isArray(d) ? d : []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, [navigate, userId]);

  // ✅ Mark this one notification as read on click — same behavior as the
  // bell dropdown, kept consistent across both surfaces.
  const handleClick = (n) => {
    if (n.isRead) return;
    setNotifications(prev => prev.map(item => item._id === n._id ? { ...item, isRead: true } : item));
    apiFetch(`${NOTIFICATION_SERVICE_URL}/api/notifications/read/${n._id}`, { method: "PUT" }).catch(() => {});
  };

  const filtered = notifications.filter(n => {
    if (filter === "ALL") return true;
    if (filter === "UNREAD") return !n.isRead;
    return n.type === filter;
  });

  const unreadTotal = notifications.filter(n => !n.isRead).length;

  return (
    <DashboardLayout pageTitle="Notifications">
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>Notifications</h2>
            <p style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>
              {unreadTotal > 0 ? `${unreadTotal} unread notification${unreadTotal !== 1 ? "s" : ""}` : "You're all caught up"}
            </p>
          </div>
        </div>

        {/* Filter pills */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                background: filter === f.key ? "#6C3AED" : "#fff",
                color: filter === f.key ? "#fff" : "#374151",
                border: `1.5px solid ${filter === f.key ? "#6C3AED" : "#e5e7eb"}`,
                borderRadius: "20px", padding: "6px 16px", fontSize: "13px",
                fontWeight: "600", cursor: "pointer",
              }}
            >
              {f.label}
              {f.key === "UNREAD" && unreadTotal > 0 && (
                <span style={{ marginLeft: "6px", fontSize: "11px" }}>({unreadTotal})</span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          {loading ? (
            <div style={{ padding: "60px", textAlign: "center", color: "#6b7280" }}>Loading notifications...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "60px", textAlign: "center" }}>
              <div style={{ fontSize: "44px", marginBottom: "12px" }}>🔔</div>
              <p style={{ color: "#9ca3af", fontSize: "14px" }}>
                {filter === "ALL" ? "No notifications yet" : `No ${filter.toLowerCase()} notifications`}
              </p>
            </div>
          ) : (
            filtered.map((n, idx) => (
              <div
                key={n._id}
                onClick={() => handleClick(n)}
                style={{
                  display: "flex", gap: "14px", padding: "16px 20px",
                  borderBottom: idx < filtered.length - 1 ? "1px solid #f3f4f6" : "none",
                  cursor: n.isRead ? "default" : "pointer",
                  background: n.isRead ? "#fff" : "#f9f7ff",
                  transition: "background 0.15s",
                }}
              >
                <div style={{
                  width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0,
                  background: `${typeColor[n.type] || "#6b7280"}15`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "18px", position: "relative",
                }}>
                  {typeIcon[n.type] || "🔔"}
                  {!n.isRead && (
                    <span style={{ position: "absolute", top: "-2px", right: "-2px", width: "10px", height: "10px", borderRadius: "50%", background: "#EF4444", border: "2px solid #fff" }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                    {/* ✅ Bold while unread, normal once read */}
                    <span style={{ fontSize: "14px", fontWeight: n.isRead ? "500" : "700", color: "#111827" }}>{n.title}</span>
                    <span style={{ fontSize: "12px", color: "#9ca3af", whiteSpace: "nowrap", flexShrink: 0 }}>{formatTime(n.createdAt)}</span>
                  </div>
                  <p style={{ fontSize: "13px", color: "#6b7280", margin: "4px 0 0", lineHeight: "1.5", fontWeight: n.isRead ? "400" : "600" }}>{n.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}