import { apiFetch } from "../../utils/api";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfileLayout from "./ProfileLayout";
import { useKyc } from "../../utils/KycContext";

const USER_SERVICE_URL = import.meta.env.VITE_USER_API || "http://localhost:4001";

export default function BasicDetails() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // ✅ Read KYC status + data from shared context — no independent
  // /api/kyc/status fetch here anymore. This was the bug: this file used
  // to fetch its own copy, which could get stuck/fail separately from the
  // rest of the app and show "Loading..." indefinitely.
  const { kycStatus, kycData } = useKyc();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    // Only fetch user profile here — KYC data comes from context now.
    apiFetch(`${USER_SERVICE_URL}/api/users/profile`)
      .then(r => r.json())
      .then(data => setUser(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [navigate]);

  const isKycDone = kycStatus === "APPROVED";

  // ✅ Only genuine registration data here. Date of Birth, Gender, Marital
  // Status, Income Range, Occupation, and Address are collected during KYC
  // and already shown on the KYC Details page — no need to duplicate them.
  const details = [
    { label: "USERNAME",      value: user?.email?.split("@")[0] || "—" },
    { label: "EMAIL ADDRESS", value: user?.email || "—" },
    { label: "FULL NAME",     value: isKycDone ? (kycData?.full_name || user?.full_name || "—") : (user?.full_name || "—") },
    { label: "MOBILE NUMBER", value: user?.phone || "—" },
  ];

  return (
    <ProfileLayout pageTitle="Personal Details">
      <div className="mf-detail-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <div>
            <h2 className="mf-detail-card-title" style={{ margin: "0 0 4px" }}>Personal Details</h2>
            <p className="mf-detail-card-subtitle" style={{ margin: 0 }}>Your account information from registration.</p>
          </div>

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

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>Loading profile...</div>
        ) : (
          <div className="mf-details-grid">
            {details.map((item, idx) => (
              <div key={idx} className="mf-detail-item">
                <span className="mf-detail-label">{item.label}</span>
                <span className="mf-detail-value" style={{ color: item.value === "—" ? "#9ca3af" : "#111827" }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        )}

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