import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfileLayout from "./ProfileLayout";

const KYC_SERVICE_URL = import.meta.env.VITE_KYC_API || "http://localhost:4002";

export default function KycPage() {
  const navigate = useNavigate();
  const [kycStatus, setKycStatus] = useState(null); // null = loading
  const [kycData, setKycData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form state
  const [form, setForm] = useState({
    full_name: "", pan_number: "", aadhaar_number: "",
    address: "", bank_account_number: "", ifsc_code: "",
    income_bracket: "BELOW_1_LAC",
  });
  const [photo, setPhoto] = useState(null);
  const [signature, setSignature] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    fetch(`${KYC_SERVICE_URL}/api/kyc/status`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setKycStatus(data.status || "NOT_SUBMITTED");
        if (data.status === "PENDING" || data.status === "APPROVED") {
          fetch(`${KYC_SERVICE_URL}/api/kyc`, {
            headers: { Authorization: `Bearer ${token}` }
          }).then(r => r.json()).then(setKycData).catch(() => {});
        }
      })
      .catch(() => setKycStatus("NOT_SUBMITTED"));
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!photo || !signature) { setError("Please upload both photo and signature."); return; }

    const token = localStorage.getItem("token");
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append("kyc_photo", photo);
    fd.append("kyc_signature", signature);

    setSubmitting(true);
    try {
      const res = await fetch(`${KYC_SERVICE_URL}/api/kyc`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setSuccess(true);
      setKycStatus("PENDING");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ──
  if (kycStatus === null) {
    return (
      <ProfileLayout pageTitle="KYC Details">
        <div className="mf-detail-card" style={{ textAlign: "center", padding: "60px" }}>
          <p style={{ color: "#6b7280" }}>Loading KYC status...</p>
        </div>
      </ProfileLayout>
    );
  }

  // ── APPROVED ──
  if (kycStatus === "APPROVED") {
    return (
      <ProfileLayout pageTitle="KYC Details">
        <div className="mf-detail-card">
          <h2 className="mf-detail-card-title">KYC Details</h2>
          <p className="mf-detail-card-subtitle">Your KYC is verified and active.</p>

          {/* Green verified banner */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: "12px", padding: "18px 20px", marginBottom: "24px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "700", color: "#15803d" }}>KYC Verified & Active</div>
              <div style={{ fontSize: "13px", color: "#16a34a", marginTop: "2px" }}>Your identity has been verified as per SEBI regulations.</div>
            </div>
          </div>

          <div className="mf-details-grid">
            {[
              { label: "Full Name",       value: kycData?.full_name || "—" },
              { label: "PAN Card",        value: kycData?.pan_number || "—" },
              { label: "Aadhaar Number",  value: kycData?.aadhaar_number || "—" },
              { label: "Address",         value: kycData?.address || "—" },
              { label: "Bank Account",    value: kycData?.financials?.bank_account_number ? `****${String(kycData.financials.bank_account_number).slice(-4)}` : "—" },
              { label: "IFSC Code",       value: kycData?.financials?.ifsc_code || "—" },
              { label: "Income Bracket",  value: kycData?.financials?.income_bracket || "—" },
              { label: "KYC Status",      value: "APPROVED", isStatus: true },
            ].map((item, idx) => (
              <div key={idx} className="mf-detail-item">
                <span className="mf-detail-label">{item.label}</span>
                {item.isStatus ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "#dcfce7", color: "#15803d", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "700" }}>
                    ✓ Verified
                  </span>
                ) : (
                  <span className="mf-detail-value">{item.value}</span>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: "20px", padding: "12px 16px", background: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
            <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af", textAlign: "center" }}>
              🔒 KYC details are locked after verification. To update, contact{" "}
              <a href="mailto:kfintech@gmail.com" style={{ color: "#6C3AED", fontWeight: "600", textDecoration: "none" }}>kfintech@gmail.com</a>
            </p>
          </div>
        </div>
      </ProfileLayout>
    );
  }

  // ── PENDING ──
  if (kycStatus === "PENDING") {
    return (
      <ProfileLayout pageTitle="KYC Details">
        <div className="mf-detail-card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <div style={{ fontSize: "52px", marginBottom: "16px" }}>⏳</div>
          <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: "0 0 8px" }}>
            KYC Under Review
          </h3>
          <p style={{ color: "#6b7280", fontSize: "14px", maxWidth: "400px", margin: "0 auto 24px", lineHeight: "1.6" }}>
            Your KYC documents have been submitted and are currently under review. This typically takes <strong>1–2 working days</strong>.
          </p>
          <div style={{ background: "#fef9c3", border: "1px solid #fde047", borderRadius: "10px", padding: "14px 20px", display: "inline-block" }}>
            <span style={{ fontSize: "13px", color: "#a16207", fontWeight: "600" }}>Status: Pending Verification</span>
          </div>
          <p style={{ marginTop: "20px", fontSize: "13px", color: "#9ca3af" }}>
            Questions? Email us at{" "}
            <a href="mailto:kfintech@gmail.com" style={{ color: "#6C3AED", fontWeight: "600", textDecoration: "none" }}>kfintech@gmail.com</a>
          </p>
        </div>
      </ProfileLayout>
    );
  }

  // ── NOT SUBMITTED — show form ──
  return (
    <ProfileLayout pageTitle="KYC Details">
      <div className="mf-detail-card">
        <h2 className="mf-detail-card-title">Complete Your KYC</h2>
        <p className="mf-detail-card-subtitle">As per SEBI regulations, KYC is mandatory to start investing.</p>

        {/* Steps banner */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "28px", flexWrap: "wrap" }}>
          {["PAN & Aadhaar", "Bank Details", "Photo & Signature"].map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", background: "#f3f0ff", borderRadius: "20px", padding: "6px 14px" }}>
              <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#6C3AED", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", flexShrink: 0 }}>{i + 1}</span>
              <span style={{ fontSize: "13px", color: "#6C3AED", fontWeight: "600" }}>{step}</span>
            </div>
          ))}
        </div>

        {success ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div style={{ fontSize: "52px", marginBottom: "16px" }}>✅</div>
            <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#15803d", margin: "0 0 8px" }}>KYC Submitted!</h3>
            <p style={{ color: "#6b7280", fontSize: "14px" }}>Your documents are under review. We'll notify you within 1–2 working days.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Section 1 — Identity */}
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#6C3AED", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #e5e7eb", paddingBottom: "8px" }}>
              Identity Details
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {[
                { label: "Full Name (as per PAN)", key: "full_name", placeholder: "Enter your full name", type: "text" },
                { label: "PAN Number", key: "pan_number", placeholder: "ABCDE1234F", type: "text" },
                { label: "Aadhaar Number (12 digits)", key: "aadhaar_number", placeholder: "123456789012", type: "text" },
                { label: "Address", key: "address", placeholder: "Full residential address", type: "text" },
              ].map(field => (
                <div key={field.key} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.4px" }}>{field.label}</label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={form[field.key]}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    required
                    style={{ height: "44px", border: "1.5px solid #e5e7eb", borderRadius: "8px", padding: "0 14px", fontSize: "14px", outline: "none", color: "#111827" }}
                  />
                </div>
              ))}
            </div>

            {/* Section 2 — Bank */}
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#6C3AED", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #e5e7eb", paddingBottom: "8px" }}>
              Bank Details
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {[
                { label: "Bank Account Number", key: "bank_account_number", placeholder: "Enter account number" },
                { label: "IFSC Code", key: "ifsc_code", placeholder: "SBIN0001234" },
              ].map(field => (
                <div key={field.key} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.4px" }}>{field.label}</label>
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    value={form[field.key]}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    required
                    style={{ height: "44px", border: "1.5px solid #e5e7eb", borderRadius: "8px", padding: "0 14px", fontSize: "14px", outline: "none", color: "#111827" }}
                  />
                </div>
              ))}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.4px" }}>Annual Income</label>
                <select
                  value={form.income_bracket}
                  onChange={e => setForm(f => ({ ...f, income_bracket: e.target.value }))}
                  style={{ height: "44px", border: "1.5px solid #e5e7eb", borderRadius: "8px", padding: "0 14px", fontSize: "14px", outline: "none", color: "#111827", background: "#fff" }}
                >
                  <option value="BELOW_1_LAC">Below ₹1 Lakh</option>
                  <option value="1_TO_5_LAC">₹1 – ₹5 Lakh</option>
                  <option value="5_TO_10_LAC">₹5 – ₹10 Lakh</option>
                  <option value="ABOVE_10_LAC">Above ₹10 Lakh</option>
                </select>
              </div>
            </div>

            {/* Section 3 — Documents */}
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#6C3AED", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #e5e7eb", paddingBottom: "8px" }}>
              Upload Documents
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {[
                { label: "Your Photo", key: "photo", setter: setPhoto, accept: "image/jpeg,image/jpg,image/png" },
                { label: "Your Signature", key: "sig", setter: setSignature, accept: "image/jpeg,image/jpg,image/png" },
              ].map(doc => (
                <div key={doc.key} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.4px" }}>{doc.label}</label>
                  <label style={{ border: "1.5px dashed #d1d5db", borderRadius: "8px", padding: "16px", textAlign: "center", cursor: "pointer", background: "#fafafa" }}>
                    <input type="file" accept={doc.accept} style={{ display: "none" }} onChange={e => doc.setter(e.target.files[0])} />
                    <div style={{ fontSize: "22px", marginBottom: "4px" }}>📎</div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                      {doc.key === "photo" ? (photo?.name || "Click to upload photo") : (signature?.name || "Click to upload signature")}
                    </div>
                    <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>JPG, PNG — max 5MB</div>
                  </label>
                </div>
              ))}
            </div>

            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "12px 16px", color: "#dc2626", fontSize: "13px" }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{ background: submitting ? "#9ca3af" : "#6C3AED", color: "#fff", border: "none", borderRadius: "10px", padding: "14px", fontSize: "15px", fontWeight: "700", cursor: submitting ? "not-allowed" : "pointer", marginTop: "4px" }}
            >
              {submitting ? "Submitting..." : "Submit KYC →"}
            </button>

            <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af", textAlign: "center" }}>
              🔒 Your data is encrypted and stored securely as per SEBI guidelines.
            </p>
          </form>
        )}
      </div>
    </ProfileLayout>
  );
}