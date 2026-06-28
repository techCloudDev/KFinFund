import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfileLayout from "./ProfileLayout";

const KYC_SERVICE_URL = import.meta.env.VITE_KYC_API || "http://localhost:4002";

const STEPS = [
  { id: 1, label: "PAN & Aadhaar" },
  { id: 2, label: "Bank Details" },
  { id: 3, label: "Photo & Signature" },
];

export default function KycPage() {
  const navigate = useNavigate();
  const [kycStatus, setKycStatus] = useState(null);
  const [kycData, setKycData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [form, setForm] = useState({
    full_name: "", pan_number: "", aadhaar_number: "",
    address: "", bank_account_number: "", ifsc_code: "",
    income_bracket: "BELOW_1L",
  });
  const [photo, setPhoto] = useState(null);
  const [signature, setSignature] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    fetch(`${KYC_SERVICE_URL}/api/kyc/status`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        setKycStatus(data.status || "NOT_SUBMITTED");
        if (data.status === "PENDING" || data.status === "APPROVED") {
          fetch(`${KYC_SERVICE_URL}/api/kyc`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json()).then(setKycData).catch(() => {});
        }
      })
      .catch(() => setKycStatus("NOT_SUBMITTED"));
  }, [navigate]);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === "photo") { setPhoto(file); setPhotoPreview(url); }
    else { setSignature(file); setSignaturePreview(url); }
  };

  // Step validation
  const validateStep = () => {
    setError("");
    if (currentStep === 1) {
      if (!form.full_name.trim()) { setError("Full name is required."); return false; }
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.pan_number.toUpperCase())) { setError("Enter a valid PAN number (e.g. ABCDE1234F)."); return false; }
      if (!/^\d{12}$/.test(form.aadhaar_number)) { setError("Aadhaar must be exactly 12 digits."); return false; }
      if (!form.address.trim()) { setError("Address is required."); return false; }
    }
    if (currentStep === 2) {
      if (!form.bank_account_number.trim()) { setError("Bank account number is required."); return false; }
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc_code.toUpperCase())) { setError("Enter a valid IFSC code (e.g. SBIN0001234)."); return false; }
    }
    if (currentStep === 3) {
      if (!photo) { setError("Please upload your photo."); return false; }
      if (!signature) { setError("Please upload your signature."); return false; }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) setCurrentStep(s => s + 1);
  };

  const handleBack = () => {
    setError("");
    setCurrentStep(s => s - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
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

  const inputStyle = {
    height: "48px", border: "1.5px solid #e5e7eb", borderRadius: "10px",
    padding: "0 16px", fontSize: "14px", outline: "none", color: "#111827",
    width: "100%", boxSizing: "border-box", transition: "border-color 0.2s",
  };
  const labelStyle = {
    fontSize: "12px", fontWeight: "700", color: "#6b7280",
    textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "6px", display: "block",
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
          <div style={{ display: "flex", alignItems: "center", gap: "16px", background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: "12px", padding: "18px 20px", marginBottom: "24px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "700", color: "#15803d" }}>KYC Verified & Active</div>
              <div style={{ fontSize: "13px", color: "#16a34a", marginTop: "2px" }}>Your identity has been verified as per SEBI regulations.</div>
            </div>
          </div>
          <div className="mf-details-list">
            {[
              ["Full Name", kycData?.full_name || "—"],
              ["PAN Card", kycData?.pan_number ? kycData.pan_number.slice(0,5) + "****" + kycData.pan_number.slice(-1) : "—"],
              ["Aadhaar Number", kycData?.aadhaar_number ? "XXXX-XXXX-" + kycData.aadhaar_number.slice(-4) : "—"],
              ["Address", kycData?.address || "—"],
              ["Bank Account", kycData?.financials?.bank_account_number ? `****${String(kycData.financials.bank_account_number).slice(-4)}` : "—"],
              ["IFSC Code", kycData?.financials?.ifsc_code || "—"],
              ["Income Bracket", kycData?.financials?.income_bracket || "—"],
            ].map(([label, value]) => (
              <div key={label} className="mf-details-item">
                <span className="mf-details-label">{label}</span>
                <span className="mf-details-value">{value}</span>
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
          <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: "0 0 8px" }}>KYC Under Review</h3>
          <p style={{ color: "#6b7280", fontSize: "14px", maxWidth: "400px", margin: "0 auto 24px", lineHeight: "1.6" }}>
            Your documents are under review. This typically takes <strong>1–2 working days</strong>.
          </p>
          <div style={{ background: "#fef9c3", border: "1px solid #fde047", borderRadius: "10px", padding: "14px 20px", display: "inline-block" }}>
            <span style={{ fontSize: "13px", color: "#a16207", fontWeight: "600" }}>Status: Pending Verification</span>
          </div>
        </div>
      </ProfileLayout>
    );
  }

  // ── SUCCESS ──
  if (success) {
    return (
      <ProfileLayout pageTitle="KYC Details">
        <div className="mf-detail-card" style={{ textAlign: "center", padding: "60px 24px" }}>
          <div style={{ fontSize: "56px", marginBottom: "16px" }}>✅</div>
          <h3 style={{ fontSize: "22px", fontWeight: "700", color: "#15803d", margin: "0 0 12px" }}>KYC Submitted!</h3>
          <p style={{ color: "#6b7280", fontSize: "15px", maxWidth: "400px", margin: "0 auto" }}>
            Your documents are under review. We'll notify you within 1–2 working days.
          </p>
        </div>
      </ProfileLayout>
    );
  }

  // ── NOT SUBMITTED — Step wizard ──
  return (
    <ProfileLayout pageTitle="KYC Details">
      <div className="mf-detail-card">
        <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>Complete Your KYC</h2>
        <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 28px" }}>As per SEBI regulations, KYC is mandatory to start investing.</p>

        {/* ── Step indicator ── */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "36px" }}>
          {STEPS.map((step, idx) => {
            const done = currentStep > step.id;
            const active = currentStep === step.id;
            return (
              <div key={step.id} style={{ display: "flex", alignItems: "center", flex: idx < STEPS.length - 1 ? 1 : "none" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "50%",
                    background: done ? "#22c55e" : active ? "#6C3AED" : "#e5e7eb",
                    color: done || active ? "#fff" : "#9ca3af",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "14px", fontWeight: "700", transition: "all 0.3s",
                    flexShrink: 0,
                  }}>
                    {done ? "✓" : step.id}
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: "600", color: active ? "#6C3AED" : done ? "#22c55e" : "#9ca3af", whiteSpace: "nowrap" }}>
                    {step.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: "2px", background: done ? "#22c55e" : "#e5e7eb", margin: "0 8px", marginBottom: "20px", transition: "background 0.3s" }} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Step 1: Identity ── */}
        {currentStep === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#6C3AED", margin: 0, paddingBottom: "10px", borderBottom: "1px solid #e5e7eb" }}>
              Step 1 — Identity Details
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
              <div>
                <label style={labelStyle}>Full Name (as per PAN)</label>
                <input type="text" style={inputStyle} placeholder="Enter your full name"
                  value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>PAN Number</label>
                <input type="text" style={inputStyle} placeholder="ABCDE1234F" maxLength={10}
                  value={form.pan_number} onChange={e => setForm(f => ({ ...f, pan_number: e.target.value.toUpperCase() }))} />
              </div>
              <div>
                <label style={labelStyle}>Aadhaar Number (12 digits)</label>
                <input type="text" style={inputStyle} placeholder="123456789012" maxLength={12}
                  value={form.aadhaar_number} onChange={e => setForm(f => ({ ...f, aadhaar_number: e.target.value.replace(/\D/g, "") }))} />
              </div>
              <div>
                <label style={labelStyle}>Residential Address</label>
                <input type="text" style={inputStyle} placeholder="Full residential address"
                  value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Bank ── */}
        {currentStep === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#6C3AED", margin: 0, paddingBottom: "10px", borderBottom: "1px solid #e5e7eb" }}>
              Step 2 — Bank Details
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
              <div>
                <label style={labelStyle}>Bank Account Number</label>
                <input type="text" style={inputStyle} placeholder="Enter account number"
                  value={form.bank_account_number} onChange={e => setForm(f => ({ ...f, bank_account_number: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>IFSC Code</label>
                <input type="text" style={inputStyle} placeholder="SBIN0001234" maxLength={11}
                  value={form.ifsc_code} onChange={e => setForm(f => ({ ...f, ifsc_code: e.target.value.toUpperCase() }))} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Annual Income</label>
                <select value={form.income_bracket} onChange={e => setForm(f => ({ ...f, income_bracket: e.target.value }))}
                  style={{ ...inputStyle, background: "#fff", cursor: "pointer" }}>
                  <option value="BELOW_1L">Below ₹1 Lakh</option>
<option value="1L_5L">₹1 – ₹5 Lakh</option>
<option value="5L_10L">₹5 – ₹10 Lakh</option>
<option value="ABOVE_10L">Above ₹10 Lakh</option>
                </select>
              </div>
            </div>
            {/* Summary of step 1 */}
            <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "14px 18px" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", marginBottom: "8px" }}>Identity (Step 1 ✓)</div>
              <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", fontSize: "13px", color: "#374151" }}>
                <span><strong>Name:</strong> {form.full_name}</span>
                <span><strong>PAN:</strong> {form.pan_number}</span>
                <span><strong>Aadhaar:</strong> {form.aadhaar_number}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Documents ── */}
        {currentStep === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#6C3AED", margin: 0, paddingBottom: "10px", borderBottom: "1px solid #e5e7eb" }}>
              Step 3 — Photo & Signature
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
              {/* Photo upload */}
              <div>
                <label style={labelStyle}>Your Photo</label>
                <label style={{ border: `2px dashed ${photo ? "#22c55e" : "#d1d5db"}`, borderRadius: "10px", padding: "20px", textAlign: "center", cursor: "pointer", background: photo ? "#f0fdf4" : "#fafafa", display: "block", transition: "all 0.2s" }}>
                  <input type="file" accept="image/jpeg,image/jpg,image/png" style={{ display: "none" }} onChange={e => handleFileChange(e, "photo")} />
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "50%", margin: "0 auto 8px", display: "block", border: "2px solid #22c55e" }} />
                  ) : (
                    <div style={{ fontSize: "32px", marginBottom: "8px" }}>🤳</div>
                  )}
                  <div style={{ fontSize: "13px", color: photo ? "#15803d" : "#6b7280", fontWeight: photo ? "600" : "400" }}>
                    {photo ? photo.name : "Click to upload photo"}
                  </div>
                  <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}>JPG, PNG — max 5MB</div>
                </label>
              </div>
              {/* Signature upload */}
              <div>
                <label style={labelStyle}>Your Signature</label>
                <label style={{ border: `2px dashed ${signature ? "#22c55e" : "#d1d5db"}`, borderRadius: "10px", padding: "20px", textAlign: "center", cursor: "pointer", background: signature ? "#f0fdf4" : "#fafafa", display: "block", transition: "all 0.2s" }}>
                  <input type="file" accept="image/jpeg,image/jpg,image/png" style={{ display: "none" }} onChange={e => handleFileChange(e, "signature")} />
                  {signaturePreview ? (
                    <img src={signaturePreview} alt="Signature preview" style={{ width: "120px", height: "60px", objectFit: "contain", margin: "0 auto 8px", display: "block", border: "1px solid #d1d5db", borderRadius: "6px" }} />
                  ) : (
                    <div style={{ fontSize: "32px", marginBottom: "8px" }}>✍️</div>
                  )}
                  <div style={{ fontSize: "13px", color: signature ? "#15803d" : "#6b7280", fontWeight: signature ? "600" : "400" }}>
                    {signature ? signature.name : "Click to upload signature"}
                  </div>
                  <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}>JPG, PNG — max 5MB</div>
                </label>
              </div>
            </div>
            {/* Summary */}
            <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "14px 18px" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", marginBottom: "8px" }}>Review Summary</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "13px", color: "#374151" }}>
                <span>✓ <strong>Name:</strong> {form.full_name} &nbsp;|&nbsp; <strong>PAN:</strong> {form.pan_number}</span>
                <span>✓ <strong>Bank:</strong> ****{form.bank_account_number.slice(-4)} &nbsp;|&nbsp; <strong>IFSC:</strong> {form.ifsc_code}</span>
                <span>✓ <strong>Income:</strong> {form.income_bracket.replace(/_/g, " ")}</span>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "12px 16px", color: "#dc2626", fontSize: "13px", marginTop: "16px" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Navigation buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "28px", gap: "12px" }}>
          {currentStep > 1 ? (
            <button type="button" onClick={handleBack}
              style={{ background: "transparent", color: "#6C3AED", border: "1.5px solid #6C3AED", borderRadius: "10px", padding: "12px 28px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>
              ← Back
            </button>
          ) : <div />}

          {currentStep < 3 ? (
            <button type="button" onClick={handleNext}
              style={{ background: "#6C3AED", color: "#fff", border: "none", borderRadius: "10px", padding: "12px 32px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>
              Next →
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={submitting}
              style={{ background: submitting ? "#9ca3af" : "#6C3AED", color: "#fff", border: "none", borderRadius: "10px", padding: "12px 32px", fontSize: "14px", fontWeight: "700", cursor: submitting ? "not-allowed" : "pointer" }}>
              {submitting ? "Submitting..." : "Submit KYC ✓"}
            </button>
          )}
        </div>

        <p style={{ margin: "16px 0 0", fontSize: "12px", color: "#9ca3af", textAlign: "center" }}>
          🔒 Your data is encrypted and stored securely as per SEBI guidelines.
        </p>
      </div>
    </ProfileLayout>
  );
}