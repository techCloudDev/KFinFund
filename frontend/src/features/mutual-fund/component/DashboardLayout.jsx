import { logout as apiLogout } from "../../../utils/api";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logoImg from "/logo.png";
import { Avatar, AvatarFallback } from "./Avatar";

const getTokenData = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try { return JSON.parse(atob(token.split(".")[1])); }
  catch { return null; }
};

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
    navigate("/");
  };

  const menuItems = [
    { name: "Dashboard",    path: "/dashboard" },
    { name: "Portfolio",    path: "/portfolio" },
    { name: "SIP",          path: "/user/sip" },
    { name: "Mutual Funds", path: "/mutual-fund" },
    { name: "Transactions", path: "/transactions" },
    { name: "Watchlist",    path: "/mutual-fund/watchlist" },
    { name: "Reports",      path: "/user/profile/report" },
    { name: "Profile",      path: "/user/profile/basic-details" },
    { name: "Support",      path: "/help" },
  ];

  const isActive = (item) => {
    const p = location.pathname;
    if (item.path === "/dashboard") return p === "/dashboard";
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

          <div className="mf-header-actions">
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