import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../mutual-fund/component/DashboardLayout";
import "./profile.css";

const getTokenData = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try { return JSON.parse(atob(token.split(".")[1])); }
  catch { return null; }
};

export default function ProfileLayout({ children, pageTitle = "Profile" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const tokenData = getTokenData();
    if (tokenData?.email) {
      setUserEmail(tokenData.email);
      setUserName(tokenData.email.split("@")[0]);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("watchlist");
    navigate("/");
  };

  const profileNavItems = [
    {
      name: "Personal Details",
      path: "/user/profile/basic-details",
      icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>)
    },
    {
      name: "KYC Details",
      path: "/user/profile/kyc",
      icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>),
      badge: "Verified"
    },
    {
      name: "Profit & Loss",
      path: "/user/profile/report",
      icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>)
    },
    {
      name: "Change Password",
      path: "/user/profile/change-password",
      icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>)
    },
    {
      name: "Help & Support",
      path: "/help",
      icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>)
    },
  ];

  return (
    <DashboardLayout pageTitle={pageTitle}>
      <div className="mf-profile-container">
        {/* Left profile sidebar */}
        <aside className="mf-profile-sidebar">
          <div className="mf-profile-user-card">
            <div className="mf-profile-avatar-large">{userName[0]?.toUpperCase()}</div>
            <h2 className="mf-profile-user-name">{userName}</h2>
            <div className="mf-profile-user-email">{userEmail}</div>
            <span className="mf-profile-verified-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              Verified User
            </span>
          </div>

          <nav className="mf-profile-nav-card">
            {profileNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`mf-profile-nav-item ${isActive ? "is-active" : ""}`}
                >
                  <div className="mf-profile-nav-left">
                    <span className="mf-profile-nav-icon">{item.icon}</span>
                    <span>{item.name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {item.badge && (
                      <span style={{ fontSize: "11px", backgroundColor: "#DEF7EC", color: "#03543F", padding: "2px 8px", borderRadius: "10px", fontWeight: "600" }}>{item.badge}</span>
                    )}
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}><polyline points="9 18 15 12 9 6" /></svg>
                  </div>
                </Link>
              );
            })}

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="mf-profile-nav-item"
              style={{ background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left", color: "#EF4444", fontFamily: "inherit", padding: 0 }}
            >
              <div className="mf-profile-nav-left">
                <span className="mf-profile-nav-icon" style={{ color: "#EF4444" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                </span>
                <span>Logout</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </nav>
        </aside>

        {/* Right content area */}
        <section className="mf-profile-content-area">
          {children}
        </section>
      </div>
    </DashboardLayout>
  );
}