import { apiFetch } from "../../utils/api";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../mutual-fund/component/DashboardLayout";
import "./profile.css";

const KYC_SERVICE_URL = import.meta.env.VITE_KYC_API || "http://localhost:4002";

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
  const [kycStatus, setKycStatus] = useState(null);

  // ✅ Added location.pathname — refetches KYC status on every page navigation
  useEffect(() => {
    const tokenData = getTokenData();
    if (tokenData?.email) {
      setUserEmail(tokenData.email);
      setUserName(tokenData.email.split("@")[0]);
    }
    const token = localStorage.getItem("token");
    if (token) {
      apiFetch(`${KYC_SERVICE_URL}/api/kyc/status`)
        .then(r => r.json())
        .then(d => setKycStatus(d.status || "NOT_SUBMITTED"))
        .catch(() => setKycStatus("NOT_SUBMITTED"));
    }
  }, [location.pathname]); // ✅ Refetch on every navigation

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("watchlist");
    navigate("/");
  };

  const kycBadge = {
    APPROVED:      { bg: "#dcfce7", color: "#15803d", text: "✓ KYC Verified" },
    PENDING:       { bg: "#fef9c3", color: "#a16207", text: "⏳ KYC Pending" },
    NOT_SUBMITTED: { bg: "#fee2e2", color: "#b91c1c", text: "✗ KYC Not Done" },
  }[kycStatus] || { bg: "#f3f4f6", color: "#6b7280", text: "Loading..." };

  const kycNavBadge = {
    APPROVED:      { bg: "#dcfce7", color: "#15803d", text: "Verified" },
    PENDING:       { bg: "#fef9c3", color: "#a16207", text: "Pending" },
    NOT_SUBMITTED: { bg: "#fee2e2", color: "#b91c1c", text: "Required" },
  }[kycStatus] || null;

  const profileNavItems = [
    {
      name: "Personal Details",
      path: "/user/profile/basic-details",
      icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>)
    },
    {
      name: "KYC Details",
      path: "/user/profile/kyc",
      icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>),
      kycBadge: true,
    },
    {
      name: "Change Password",
      path: "/user/profile/change-password",
      icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>)
    },
    {
      name: "Help & Support",
      path: "/help",
      icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>)
    },
  ];

  return (
    <DashboardLayout pageTitle={pageTitle}>
      <div className="mf-profile-container">
        <aside className="mf-profile-sidebar">
          <div className="mf-profile-user-card">
            <div className="mf-profile-avatar-large">{userName[0]?.toUpperCase()}</div>
            <h2 className="mf-profile-user-name">{userName}</h2>
            <div className="mf-profile-user-email">{userEmail}</div>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "5px",
              background: kycBadge.bg, color: kycBadge.color,
              padding: "5px 14px", borderRadius: "20px",
              fontSize: "12px", fontWeight: "700", marginTop: "8px",
            }}>
              {kycBadge.text}
            </span>
          </div>

          <nav className="mf-profile-nav-card">
            {profileNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.name} to={item.path} className={`mf-profile-nav-item ${isActive ? "is-active" : ""}`}>
                  <div className="mf-profile-nav-left">
                    <span className="mf-profile-nav-icon">{item.icon}</span>
                    <span>{item.name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {item.kycBadge && kycNavBadge && (
                      <span style={{ fontSize: "11px", backgroundColor: kycNavBadge.bg, color: kycNavBadge.color, padding: "2px 8px", borderRadius: "10px", fontWeight: "600" }}>
                        {kycNavBadge.text}
                      </span>
                    )}
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                </Link>
              );
            })}

            <button onClick={handleLogout} className="mf-profile-nav-item"
              style={{ background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left", color: "#EF4444", fontFamily: "inherit", padding: 0 }}>
              <div className="mf-profile-nav-left">
                <span className="mf-profile-nav-icon" style={{ color: "#EF4444" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                </span>
                <span>Logout</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </nav>
        </aside>

        <section className="mf-profile-content-area">{children}</section>
      </div>
    </DashboardLayout>
  );
}