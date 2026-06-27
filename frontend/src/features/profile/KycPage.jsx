import ProfileLayout from "./ProfileLayout";

export default function KycPage() {
  const kycDetails = [
    { label: "PAN Card", value: "ABCDE1234F" },
    { label: "Aadhaar Card", value: "XXXX-XXXX-8812" },
    { label: "KYC Status", value: "Verified & Active" }
  ];

  return (
    <ProfileLayout pageTitle="KYC Details">
      <div className="mf-detail-card">
        <h2 className="mf-detail-card-title">Know Your Customer (KYC)</h2>
        <p className="mf-detail-card-subtitle">Verify your PAN and Aadhaar registration details below.</p>

        <div className="mf-details-grid" style={{ marginBottom: "30px" }}>
          {kycDetails.map((item, idx) => (
            <div key={idx} className="mf-detail-item">
              <span className="mf-detail-label">{item.label}</span>
              {item.label === "KYC Status" ? (
                <span className="mf-kyc-status-badge">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px" }}><polyline points="20 6 9 17 4 12" /></svg>
                  {item.value}
                </span>
              ) : (
                <span className="mf-detail-value">
                  {item.value}
                </span>
              )}
            </div>
          ))}
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, rgba(108, 58, 237, 0.05) 0%, rgba(255, 183, 3, 0.05) 100%)",
            border: "1px dashed rgba(108, 58, 237, 0.2)",
            borderRadius: "12px",
            padding: "20px",
            display: "flex",
            alignItems: "center",
            gap: "16px"
          }}
        >
          <div style={{
            backgroundColor: "rgba(108, 58, 237, 0.1)",
            borderRadius: "50%",
            width: "48px",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--mf-accent-purple)",
            fontSize: "24px",
            flexShrink: 0
          }}>
            ℹ️
          </div>
          <div>
            <h4 style={{ margin: "0 0 4px 0", color: "var(--mf-text-dark)", fontSize: "15px", fontWeight: "600" }}>KYC Completed</h4>
            <p style={{ margin: 0, color: "var(--mf-text-muted)", fontSize: "13px", lineHeight: "1.4" }}>
              Your KYC details are verified and updated according to regulatory norms. No further action is required from your side.
            </p>
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
}
