import { logout as apiLogout } from "../../../utils/api";
import { apiFetch } from "../../../utils/api";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logoImg from "/logo.png";
import { Avatar, AvatarFallback } from "./Avatar";

const NOTIFICATION_SERVICE_URL = import.meta.env.VITE_NOTIFICATION_API || "http://localhost:4005";

const getTokenData = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try { return JSON.parse(atob(token.split(".")[1])); }
  catch { return null; }
};

// ── Notification bell with unread red dot + dropdown ──────────────
const DROPDOWN_PREVIEW_LIMIT = 8; // dropdown shows only the most recent N; full list lives on /notifications

function NotificationBell() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const tokenData = getTokenData();
  const userId = tokenData?.id;

  const fetchCount = () => {
    if (!userId) return;
    apiFetch(`${NOTIFICATION_SERVICE_URL}/api/notifications/${userId}/unread-count`)
      .then(r => r.json())
      .then(d => setUnreadCount(d.count || 0))
      .catch(() => {});
  };

  // Poll unread count every 30s
  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!e.target.closest(".mf-notif-wrapper")) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleBellClick = () => {
    const next = !open;
    setOpen(next);
    // ✅ Just fetches and shows the list — does NOT mark everything read
    // anymore. Each notification is marked read individually on click.
    if (next && userId) {
      setLoading(true);
      apiFetch(`${NOTIFICATION_SERVICE_URL}/api/notifications/${userId}`)
        .then(r => r.json())
        .then(d => setNotifications(Array.isArray(d) ? d : []))
        .catch(() => setNotifications([]))
        .finally(() => setLoading(false));
    }
  };

  // ✅ Mark just this one notification as read, instantly update its
  // styling from bold→normal and decrement the unread count.
  const handleNotificationClick = (n) => {
    if (n.isRead) return; // already read, nothing to do
    setNotifications(prev => prev.map(item => item._id === n._id ? { ...item, isRead: true } : item));
    setUnreadCount(c => Math.max(0, c - 1));
    apiFetch(`${NOTIFICATION_SERVICE_URL}/api/notifications/read/${n._id}`, { method: "PUT" }).catch(() => {});
  };

  const handleViewAll = () => {
    setOpen(false);
    navigate("/notifications");
  };

  const formatTime = (d) => {
    const diffMs = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const typeIcon = { SIP: "📅", PURCHASE: "💰", ALERT: "⚠️" };
  const previewList = notifications.slice(0, DROPDOWN_PREVIEW_LIMIT);
  const hasMore = notifications.length > DROPDOWN_PREVIEW_LIMIT;

  return (
    <div className="mf-notif-wrapper" style={{ position: "relative" }}>
      <button
        type="button"
        onClick={handleBellClick}
        style={{
          position: "relative", background: "none", border: "none",
          cursor: "pointer", padding: "8px", display: "flex",
          alignItems: "center", justifyContent: "center",
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span style={{
            position: "absolute", top: "4px", right: "4px",
            width: "9px", height: "9px", borderRadius: "50%",
            background: "#EF4444", border: "2px solid #fff",
          }} />
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          width: "340px", maxHeight: "460px", background: "#fff",
          border: "1px solid #e5e7eb", borderRadius: "12px",
          boxShadow: "0 12px 32px rgba(0,0,0,0.15)", zIndex: 500,
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #f3f4f6", fontWeight: "700", fontSize: "14px", color: "#111827", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span style={{ fontSize: "11px", fontWeight: "700", color: "#6C3AED", background: "#f3f0ff", padding: "2px 8px", borderRadius: "10px" }}>
                {unreadCount} new
              </span>
            )}
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {loading ? (
              <div style={{ padding: "30px", textAlign: "center", color: "#9ca3af", fontSize: "13px" }}>Loading...</div>
            ) : previewList.length === 0 ? (
              <div style={{ padding: "30px", textAlign: "center", color: "#9ca3af", fontSize: "13px" }}>No notifications yet</div>
            ) : (
              previewList.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  style={{
                    display: "flex", gap: "10px", padding: "12px 16px",
                    borderBottom: "1px solid #f9fafb", cursor: n.isRead ? "default" : "pointer",
                    background: n.isRead ? "#fff" : "#f5f3ff",
                  }}
                >
                  <div style={{ fontSize: "18px", flexShrink: 0, position: "relative" }}>
                    {typeIcon[n.type] || "🔔"}
                    {!n.isRead && (
                      <span style={{ position: "absolute", top: "-2px", right: "-2px", width: "7px", height: "7px", borderRadius: "50%", background: "#EF4444" }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* ✅ Bold while unread, normal weight once read */}
                    <div style={{ fontSize: "13px", fontWeight: n.isRead ? "500" : "700", color: "#111827" }}>{n.title}</div>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px", lineHeight: "1.4", fontWeight: n.isRead ? "400" : "600" }}>{n.message}</div>
                    <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}>{formatTime(n.createdAt)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={handleViewAll}
              style={{
                padding: "12px 16px", background: "#fafafa", border: "none",
                borderTop: "1px solid #f3f4f6", color: "#6C3AED", fontSize: "13px",
                fontWeight: "700", cursor: "pointer", textAlign: "center",
              }}
            >
              View All Notifications →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function DashboardLayout({ children, pageTitle = "Dashboard" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const tokenData = getTokenData();
    if (tokenData?.email) setUserName(tokenData.email.split("@")[0]);
  }, []);

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    // ✅ Delete refresh token from backend
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      fetch(`${import.meta.env.VITE_USER_API || "http://localhost:4001"}/api/users/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {});
    }
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("watchlist");
    localStorage.removeItem("kycStatus"); // ✅ Clear KYC cache on logout
    navigate("/");
  };

  const menuItems = [
    { name: "Dashboard",    path: "/dashboard" },
    { name: "Portfolio",    path: "/portfolio" },
    { name: "SIP",          path: "/user/sip" },
    { name: "Mutual Funds", path: "/mutual-fund" },
    { name: "Calculators",  path: "/calculators" },
    { name: "Transactions", path: "/transactions" },
    { name: "Watchlist",    path: "/mutual-fund/watchlist" },
    { name: "Reports",      path: "/user/profile/report" },
    { name: "Profile",      path: "/user/profile/basic-details" },
    { name: "Support",      path: "/help" },
  ];

  const isActive = (item) => {
    const p = location.pathname;
    if (item.path === "/dashboard") return p === "/dashboard";
    if (item.path === "/calculators") return p === "/calculators";
    if (item.path === "/mutual-fund/watchlist") return p === "/mutual-fund/watchlist";
    if (item.path === "/mutual-fund") return p.startsWith("/mutual-fund") && p !== "/mutual-fund/watchlist";
    if (item.path === "/user/profile/report") return p === "/user/profile/report";
    if (item.path === "/user/profile/basic-details") return p.startsWith("/user/profile") && p !== "/user/profile/report";
    if (item.path === "/help") return p === "/help";
    return p === item.path;
  };

  const SidebarContent = () => (
    <>
      <Link to="/" className="mf-sidebar-brand">
        <img src={logoImg} alt="KfinFund logo" className="mf-sidebar-logo" />
        <span className="mf-sidebar-title">KfinFund</span>
      </Link>

      <nav className="mf-sidebar-menu">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`mf-sidebar-item ${isActive(item) ? "is-active" : ""}`}
          >
            <span>{item.name}</span>
          </Link>
        ))}
        <button
          type="button"
          onClick={handleLogout}
          className="mf-sidebar-item"
          style={{ background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left", fontFamily: "inherit", fontSize: "inherit", padding: "12px 16px" }}
        >
          <span style={{ color: "#EF4444" }}>Logout</span>
        </button>
      </nav>

      <div className="mf-sidebar-upgrade">
        <div className="mf-sidebar-upgrade-title">Upgrade to Premium</div>
        <div className="mf-sidebar-upgrade-text">Unlock advanced insights and specialized tools</div>
        <button type="button" className="mf-sidebar-upgrade-btn" onClick={() => alert("Premium feature coming soon!")}>
          Upgrade Now
        </button>
      </div>
    </>
  );

  return (
    <div className="mf-layout">

      {/* Desktop sidebar — always visible */}
      <aside className="mf-sidebar mf-sidebar-desktop" style={{ overflowY: "auto" }}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            zIndex: 200, display: "none",
          }}
          className="mf-sidebar-backdrop"
        />
      )}

      {/* Mobile sidebar — slides in */}
      <aside
        className="mf-sidebar mf-sidebar-mobile"
        style={{
          position: "fixed", top: 0, left: 0, height: "100vh",
          zIndex: 201, overflowY: "auto",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
        }}
      >
        {/* Close button inside mobile sidebar */}
        <button
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "absolute", top: "16px", right: "16px",
            background: "rgba(255,255,255,0.1)", border: "none",
            borderRadius: "50%", width: "32px", height: "32px",
            color: "#fff", fontSize: "18px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >✕</button>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="mf-main-content" style={{ minHeight: "100vh", overflowY: "auto" }}>
        <header className="mf-top-header">

          {/* Hamburger — mobile only */}
          <button
            className="mf-hamburger"
            onClick={() => setSidebarOpen(true)}
            style={{
              display: "none",
              background: "none", border: "none",
              cursor: "pointer", padding: "8px",
              flexDirection: "column", gap: "5px",
              marginRight: "12px",
            }}
          >
            <span style={{ display: "block", width: "22px", height: "2px", background: "#374151", borderRadius: "2px" }} />
            <span style={{ display: "block", width: "22px", height: "2px", background: "#374151", borderRadius: "2px" }} />
            <span style={{ display: "block", width: "22px", height: "2px", background: "#374151", borderRadius: "2px" }} />
          </button>

          <h1 className="mf-header-title">{pageTitle}</h1>

          <div className="mf-header-actions" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <NotificationBell />
            <div
              className="mf-header-profile"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/user/profile/basic-details")}
            >
              <Avatar style={{ width: "36px", height: "36px" }}>
                <AvatarFallback>{userName[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="mf-header-profile-name">{userName}</span>
            </div>
          </div>
        </header>

        <main className="mf-workspace">{children}</main>
      </div>
    </div>
  );
}