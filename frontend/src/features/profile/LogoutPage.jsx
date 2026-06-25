import { useNavigate } from "react-router-dom";
import DashboardLayout from "../mutual-fund/component/DashboardLayout";
import "./profile.css";

export default function LogoutPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Perform simulated logout operations if needed (e.g., clear localStorage)
    localStorage.clear();
    // Redirect to login page
    navigate("/login");
  };

  return (
    <DashboardLayout pageTitle="Logout">
      <div 
        className="mf-detail-card" 
        style={{ 
          maxWidth: "500px", 
          margin: "40px auto", 
          minHeight: "auto", 
          boxSizing: "border-box" 
        }}
      >
        <div className="mf-logout-box">
          <div style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: "#FEE2E2",
            color: "#EF4444",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            marginBottom: "8px"
          }}>
            ⚠️
          </div>
          <h2 style={{ margin: "0", fontSize: "20px", fontWeight: "700", color: "#111827" }}>Confirm Logout</h2>
          <p style={{ margin: "0", fontSize: "14px", color: "#6B7280", lineHeight: "1.4" }}>
            Are you sure you want to log out of your KfinFund account? You will need to log back in to access your dashboard.
          </p>

          <button onClick={handleLogout} className="mf-logout-btn-red">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Logout
          </button>
          
          <button onClick={() => navigate(-1)} className="mf-logout-btn-cancel">
            Cancel and Go Back
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
