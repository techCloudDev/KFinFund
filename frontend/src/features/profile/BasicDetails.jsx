import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfileLayout from "./ProfileLayout";

const USER_SERVICE_URL = import.meta.env.VITE_USER_API || "http://localhost:4001";
const KYC_SERVICE_URL = import.meta.env.VITE_KYC_API || "http://localhost:4002";

export default function BasicDetails() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [kycData, setKycData] = useState(null);
  const [kycStatus, setKycStatus] = useState("NOT_SUBMITTED");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    // Fetch user profile
    fetch(`${USER_SERVICE_URL}/api/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setUser(data))
      .catch(() => {});

    // Fetch KYC status
    fetch(`${KYC_SERVICE_URL}/api/kyc/status`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setKycStatus(data.status || "NOT_SUBMITTED");
        // If KYC approved, fetch full KYC data for address etc
        if (data.status === "APPROVED") {
          fetch(`${KYC_SERVICE_URL}/api/kyc`, {
            headers: { Authorization: `Bearer ${token}` }
          })
            .then(r => r.json())
            .then(setKycData)
            .catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [navigate]);

  const isKycDone = kycStatus === "APPROVED";

  // Fields shown — prefilled from registration + KYC if approved
  const details = [
    { label: "USERNAME",      value: user?.email?.split("@")[0] || "—" },
    { label: "EMAIL ADDRESS", value: user?.email || "—" },
    { label: "FULL NAME",     value: isKycDone ? (kycData?.full_name || user?.full_name || "—") : (user?.full_name || "—") },
    { label: "MOBILE NUMBER", value: user?.phone || "—" },
    { label: "DATE OF BIRTH", value: isKycDone ? (kycData?.dob || "—") : "—" },
    { label: "GENDER",        value: isKycDone ? (kycData?.gender || "—") : "—" },
    { label: "MARITAL STATUS",value: "—" },
    { label: "INCOME RANGE",  value: isKycDone ? (kycData?.financials?.income_bracket || "—") : "—" },
    { label: "OCCUPATION",    value: "—" },
    { label: "ADDRESS",       value: isKycDone ? (kycData?.address || "—") : "—" },
  ];

  return (
    <ProfileLayout pageTitle="Personal Details">
      <div className="mf-detail-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <div>
            <h2 className="mf-detail-card-title" style={{ margin: "0 0 4px" }}>Personal Details</h2>
            <p className="mf-detail-card-subtitle" style={{ margin: 0 }}>Your account information from registration.</p>
          </div>

          {/* KYC status pill */}
          {kycStatus === "APPROVED" && (
            <span style={{ display: "flex", alignItems: "center", gap: "6px", background: "#dcfce7", color: "#15803d", padding: "6px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", flexShrink: 0 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              KYC Verified
            </span>
          )}
          {kycStatus === "PENDING" && (
            <span style={{ display: "flex", alignItems: "center", gap: "6px", background: "#fef9c3", color: "#a16207", padding: "6px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", flexShrink: 0 }}>
              ⏳ KYC Pending
            </span>
          )}
          {kycStatus === "NOT_SUBMITTED" && (
            <button
              onClick={() => navigate("/user/profile/kyc")}
              style={{ background: "#6C3AED", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", fontWeight: "600", cursor: "pointer", flexShrink: 0 }}
            >
              Complete KYC →
            </button>
          )}
        </div>

        {/* Banner if KYC not done */}
        {kycStatus === "NOT_SUBMITTED" && (
          <div style={{ background: "rgba(108,58,237,0.06)", border: "1px dashed rgba(108,58,237,0.3)", borderRadius: "10px", padding: "14px 18px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "20px" }}>ℹ️</span>
            <p style={{ margin: 0, fontSize: "13px", color: "#6b7280", lineHeight: "1.5" }}>
              Some details like Date of Birth, Gender and Address will be filled automatically after your <strong>KYC is verified</strong>.
            </p>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>Loading profile...</div>
        ) : (
          <div className="mf-details-grid">
            {details.map((item, idx) => (
              <div key={idx} className="mf-detail-item">
                <span className="mf-detail-label">{item.label}</span>
                <span className={`mf-detail-value ${item.value === "—" ? "empty" : ""}`} style={{ color: item.value === "—" ? "#9ca3af" : "#111827" }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Lock notice */}
        <div style={{ marginTop: "24px", padding: "14px 18px", background: "#f9fafb", borderRadius: "10px", border: "1px solid #e5e7eb" }}>
          <p style={{ margin: 0, fontSize: "13px", color: "#9ca3af", textAlign: "center" }}>
            🔒 Personal details are locked after KYC verification as per SEBI regulations.
            To update, contact{" "}
            <a href="mailto:kfintech@gmail.com" style={{ color: "#6C3AED", fontWeight: "600", textDecoration: "none" }}>
              kfintech@gmail.com
            </a>
          </p>
        </div>
      </div>
    </ProfileLayout>
  );
}