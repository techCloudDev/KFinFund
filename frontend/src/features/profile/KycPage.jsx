import { apiFetch } from "../../utils/api";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProfileLayout from "./ProfileLayout";
import { useKyc } from "../../utils/KycContext";

const KYC_SERVICE_URL = import.meta.env.VITE_KYC_API || "http://localhost:4002";

const STEPS = [
  { id: 1, label: "Aadhaar" },
  { id: 2, label: "PAN" },
  { id: 3, label: "Bank" },
  { id: 4, label: "Documents" },
];

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "16px",
};

const labelStyle = {
  fontSize: "12px", fontWeight: "700", color: "#6b7280",
  textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "6px", display: "block",
};

const inputStyle = {
  height: "48px", border: "1.5px solid #e5e7eb", borderRadius: "10px",
  padding: "0 16px", fontSize: "14px", outline: "none", color: "#111827",
  width: "100%", boxSizing: "border-box", background: "#fff", fontFamily: "inherit",
};

const Field = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    <label style={labelStyle}>{label}</label>
    {children}
  </div>
);

// ── Verification badge shown when a step is verified ──
const VerifiedBadge = ({ text }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "10px", padding: "10px 16px", marginBottom: "16px" }}>
    <span style={{ fontSize: "18px" }}>✅</span>
    <span style={{ fontSize: "13px", fontWeight: "700", color: "#15803d" }}>{text}</span>
  </div>
);

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function DatePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => value ? parseInt(value.split("-")[0]) : new Date().getFullYear() - 25);
  const [viewMonth, setViewMonth] = useState(() => value ? parseInt(value.split("-")[1]) - 1 : new Date().getMonth());
  const [mode, setMode] = useState("date");
  const ref = useRef(null);
  const maxYear = new Date().getFullYear() - 18;
  const minYear = 1940;

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedDate = value ? new Date(value + "T00:00:00") : null;
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDay = (year, month) => new Date(year, month, 1).getDay();

  const handleDayClick = (day) => {
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    onChange(`${viewYear}-${mm}-${dd}`);
    setOpen(false);
  };

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  const formatDisplay = (val) => {
    if (!val) return "Select date of birth";
    const [y, m, d] = val.split("-");
    return `${d} ${MONTHS[parseInt(m) - 1]} ${y}`;
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDay(viewYear, viewMonth);
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isSelected = (day) => {
    if (!selectedDate || !day) return false;
    return selectedDate.getFullYear() === viewYear && selectedDate.getMonth() === viewMonth && selectedDate.getDate() === day;
  };
  const isDisabled = (day) => {
    if (!day) return false;
    const d = new Date(viewYear, viewMonth, day);
    const minAge = new Date(); minAge.setFullYear(minAge.getFullYear() - 18);
    return d > minAge;
  };

  const years = [];
  for (let y = maxYear; y >= minYear; y--) years.push(y);

  return (
    <div style={{ position: "relative" }} ref={ref}>
      <div onClick={() => setOpen(o => !o)} style={{ ...inputStyle, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", color: value ? "#111827" : "#9ca3af" }}>
        <span>{formatDisplay(value)}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      </div>
      {open && (
        <div style={{ position: "absolute", top: "54px", left: 0, zIndex: 999, background: "#fff", borderRadius: "14px", boxShadow: "0 8px 30px rgba(0,0,0,0.15)", padding: "16px", width: "300px", border: "1px solid #e5e7eb" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <button onClick={prevMonth} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#6b7280", padding: "4px 8px" }}>‹</button>
            <div style={{ display: "flex", gap: "6px" }}>
              <button onClick={() => setMode(m => m === "month" ? "date" : "month")} style={{ background: mode === "month" ? "#6C3AED" : "#f3f4f6", color: mode === "month" ? "#fff" : "#111827", border: "none", borderRadius: "6px", padding: "4px 10px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>{MONTHS[viewMonth].slice(0, 3)}</button>
              <button onClick={() => setMode(m => m === "year" ? "date" : "year")} style={{ background: mode === "year" ? "#6C3AED" : "#f3f4f6", color: mode === "year" ? "#fff" : "#111827", border: "none", borderRadius: "6px", padding: "4px 10px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>{viewYear}</button>
            </div>
            <button onClick={nextMonth} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#6b7280", padding: "4px 8px" }}>›</button>
          </div>
          {mode === "month" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px", marginBottom: "8px" }}>
              {MONTHS.map((m, i) => (<button key={m} onClick={() => { setViewMonth(i); setMode("date"); }} style={{ padding: "8px", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600", background: viewMonth === i ? "#6C3AED" : "#f3f4f6", color: viewMonth === i ? "#fff" : "#374151" }}>{m.slice(0, 3)}</button>))}
            </div>
          )}
          {mode === "year" && (
            <div style={{ maxHeight: "180px", overflowY: "auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px", marginBottom: "8px" }}>
              {years.map(y => (<button key={y} onClick={() => { setViewYear(y); setMode("date"); }} style={{ padding: "8px", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600", background: viewYear === y ? "#6C3AED" : "#f3f4f6", color: viewYear === y ? "#fff" : "#374151" }}>{y}</button>))}
            </div>
          )}
          {mode === "date" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: "6px" }}>
                {DAYS.map(d => (<div key={d} style={{ textAlign: "center", fontSize: "11px", fontWeight: "700", color: "#9ca3af", padding: "4px 0" }}>{d}</div>))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
                {cells.map((day, idx) => (<button key={idx} onClick={() => day && !isDisabled(day) && handleDayClick(day)} disabled={!day || isDisabled(day)} style={{ height: "34px", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "500", cursor: day && !isDisabled(day) ? "pointer" : "default", background: isSelected(day) ? "#6C3AED" : "transparent", color: isSelected(day) ? "#fff" : isDisabled(day) ? "#d1d5db" : day ? "#374151" : "transparent" }}>{day || ""}</button>))}
              </div>
              <div style={{ marginTop: "10px", fontSize: "11px", color: "#9ca3af", textAlign: "center" }}>Must be 18 years or older</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function KycPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { kycStatus, kycData, refreshKyc } = useKyc();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // ── Sandbox verification states ──
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [panVerified, setPanVerified] = useState(false);
  const [bankVerified, setBankVerified] = useState(false);

  // Aadhaar OTP state
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [aadhaarReferenceId, setAadhaarReferenceId] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  // PAN state
  const [panLoading, setPanLoading] = useState(false);

  // Bank state
  const [bankLoading, setBankLoading] = useState(false);
  const [bankName, setBankName] = useState("");

  const [form, setForm] = useState({
    full_name: "", pan_number: "", aadhaar_number: "", address: "",
    date_of_birth: "", gender: "", marital_status: "", occupation: "",
    bank_account_number: "", ifsc_code: "", income_bracket: "BELOW_1L",
  });
  const [photo, setPhoto] = useState(null);
  const [signature, setSignature] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
  }, [navigate]);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === "photo") { setPhoto(file); setPhotoPreview(url); }
    else { setSignature(file); setSignaturePreview(url); }
  };

  const setField = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));
  const setFieldUpper = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value.toUpperCase() }));
  const setFieldDigits = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value.replace(/\D/g, "") }));

  // ── Step 1: Generate Aadhaar OTP ──
  const handleGenerateOtp = async () => {
    setError("");
    if (!/^\d{12}$/.test(aadhaarNumber)) { setError("Enter a valid 12-digit Aadhaar number."); return; }
    setOtpLoading(true);
    try {
      const res = await apiFetch(`${KYC_SERVICE_URL}/api/kyc/verify/aadhaar/generate-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhaar_number: aadhaarNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setAadhaarReferenceId(data.reference_id);
      setOtpSent(true);
      setForm(f => ({ ...f, aadhaar_number: aadhaarNumber }));
    } catch (err) { setError(err.message); }
    finally { setOtpLoading(false); }
  };

  // ── Step 1: Verify Aadhaar OTP ──
  const handleVerifyOtp = async () => {
    setError("");
    if (!otp || otp.length < 4) { setError("Enter the OTP sent to your Aadhaar-registered mobile."); return; }
    setOtpLoading(true);
    try {
      const res = await apiFetch(`${KYC_SERVICE_URL}/api/kyc/verify/aadhaar/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference_id: aadhaarReferenceId, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid OTP");

      // ✅ Auto-fill form with verified Aadhaar data
      const d = data.data;
      // Convert DOB from DD-MM-YYYY (Sandbox) to YYYY-MM-DD (HTML date input)
      let dob = d.date_of_birth || "";
      if (/^\d{2}-\d{2}-\d{4}$/.test(dob)) {
        const [dd, mm, yyyy] = dob.split("-");
        dob = `${yyyy}-${mm}-${dd}`;
      }
      setForm(f => ({
        ...f,
        full_name:     d.full_name || f.full_name,
        date_of_birth: dob || f.date_of_birth,
        gender:        d.gender || f.gender,
        address:       d.address || f.address,
      }));
      setAadhaarVerified(true);
    } catch (err) { setError(err.message); }
    finally { setOtpLoading(false); }
  };

  // ── Step 2: Verify PAN ──
  const handleVerifyPan = async () => {
    setError("");
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.pan_number.toUpperCase())) { setError("Enter a valid PAN number (e.g. ABCDE1234F)."); return; }
    if (!form.full_name) { setError("Complete Aadhaar verification first to get your full name."); return; }
    if (!form.date_of_birth) { setError("Date of birth is required for PAN verification."); return; }
    setPanLoading(true);
    try {
      const res = await apiFetch(`${KYC_SERVICE_URL}/api/kyc/verify/pan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pan_number:    form.pan_number.toUpperCase(),
          full_name:     form.full_name,
          date_of_birth: form.date_of_birth,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "PAN verification failed");
      setPanVerified(true);
    } catch (err) { setError(err.message); }
    finally { setPanLoading(false); }
  };

  // ── Step 3: Verify Bank Account ──
  const handleVerifyBank = async () => {
    setError("");
    if (!form.bank_account_number.trim()) { setError("Bank account number is required."); return; }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc_code.toUpperCase())) { setError("Enter a valid IFSC code (e.g. SBIN0001234)."); return; }
    setBankLoading(true);
    try {
      const res = await apiFetch(`${KYC_SERVICE_URL}/api/kyc/verify/bank`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bank_account_number: form.bank_account_number,
          ifsc_code:           form.ifsc_code.toUpperCase(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bank verification failed");
      setBankVerified(true);
      setBankName(data.name_at_bank || "");
    } catch (err) { setError(err.message); }
    finally { setBankLoading(false); }
  };

  const validateStep = () => {
    setError("");
    if (currentStep === 1) {
      if (!aadhaarVerified) { setError("Please complete Aadhaar OTP verification first."); return false; }
      if (!form.gender) { setError("Please select your gender."); return false; }
      if (!form.marital_status) { setError("Please select your marital status."); return false; }
      if (!form.occupation) { setError("Please select your occupation."); return false; }
    }
    if (currentStep === 2) {
      if (!panVerified) { setError("Please verify your PAN number first."); return false; }
    }
    if (currentStep === 3) {
      if (!bankVerified) { setError("Please verify your bank account first."); return false; }
    }
    if (currentStep === 4) {
      if (!photo) { setError("Please upload your photo."); return false; }
      if (!signature) { setError("Please upload your signature."); return false; }
    }
    return true;
  };

  const handleNext = () => { if (validateStep()) setCurrentStep(s => s + 1); };
  const handleBack = () => { setError(""); setCurrentStep(s => s - 1); };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append("kyc_photo", photo);
    fd.append("kyc_signature", signature);
    setSubmitting(true);
    try {
      const res = await apiFetch(`${KYC_SERVICE_URL}/api/kyc`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setSuccess(true);
      await refreshKyc();
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  if (kycStatus === "APPROVED") return (
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
            ["Date of Birth", kycData?.date_of_birth || "—"],
            ["Gender", kycData?.gender || "—"],
            ["Marital Status", kycData?.marital_status || "—"],
            ["Occupation", kycData?.occupation || "—"],
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

  if (kycStatus === "PENDING") return (
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

  if (success) return (
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

  return (
    <ProfileLayout pageTitle="KYC Details">
      <div className="mf-detail-card">
        <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>Complete Your KYC</h2>
        <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 28px" }}>As per SEBI regulations, KYC is mandatory to start investing.</p>

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "36px" }}>
          {STEPS.map((step, idx) => {
            const done = currentStep > step.id;
            const active = currentStep === step.id;
            return (
              <div key={step.id} style={{ display: "flex", alignItems: "center", flex: idx < STEPS.length - 1 ? 1 : "none" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: done ? "#22c55e" : active ? "#6C3AED" : "#e5e7eb", color: done || active ? "#fff" : "#9ca3af", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700", flexShrink: 0 }}>
                    {done ? "✓" : step.id}
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: "600", color: active ? "#6C3AED" : done ? "#22c55e" : "#9ca3af", whiteSpace: "nowrap" }}>{step.label}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: "2px", background: done ? "#22c55e" : "#e5e7eb", margin: "0 8px", marginBottom: "20px" }} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Step 1: Aadhaar OTP Verification ── */}
        {currentStep === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#6C3AED", margin: 0, paddingBottom: "10px", borderBottom: "1px solid #e5e7eb" }}>
              Step 1 — Aadhaar Verification
            </h3>

            {!aadhaarVerified ? (
              <>
                <p style={{ fontSize: "13px", color: "#6b7280", margin: "0" }}>
                  Enter your 12-digit Aadhaar number. An OTP will be sent to your Aadhaar-registered mobile number.
                </p>
                <Field label="Aadhaar Number (12 digits)">
                  <div style={{ display: "flex", gap: "10px" }}>
                    <input
                      type="text" style={{ ...inputStyle, flex: 1 }} placeholder="123456789012" maxLength={12}
                      value={aadhaarNumber} onChange={e => setAadhaarNumber(e.target.value.replace(/\D/g, ""))}
                      disabled={otpSent}
                    />
                    {!otpSent && (
                      <button type="button" onClick={handleGenerateOtp} disabled={otpLoading}
                        style={{ background: "#6C3AED", color: "#fff", border: "none", borderRadius: "10px", padding: "0 20px", fontSize: "13px", fontWeight: "700", cursor: otpLoading ? "not-allowed" : "pointer", whiteSpace: "nowrap", opacity: otpLoading ? 0.7 : 1 }}>
                        {otpLoading ? "Sending..." : "Send OTP"}
                      </button>
                    )}
                  </div>
                </Field>

                {otpSent && (
                  <>
                    <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#15803d" }}>
                      ✅ OTP sent to your Aadhaar-registered mobile number.
                    </div>
                    <Field label="Enter OTP">
                      <div style={{ display: "flex", gap: "10px" }}>
                        <input
                          type="text" style={{ ...inputStyle, flex: 1, letterSpacing: "0.2em", fontSize: "18px", textAlign: "center" }}
                          placeholder="- - - - - -" maxLength={6}
                          value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                        />
                        <button type="button" onClick={handleVerifyOtp} disabled={otpLoading}
                          style={{ background: "#6C3AED", color: "#fff", border: "none", borderRadius: "10px", padding: "0 20px", fontSize: "13px", fontWeight: "700", cursor: otpLoading ? "not-allowed" : "pointer", whiteSpace: "nowrap", opacity: otpLoading ? 0.7 : 1 }}>
                          {otpLoading ? "Verifying..." : "Verify OTP"}
                        </button>
                      </div>
                    </Field>
                    <button type="button" onClick={() => { setOtpSent(false); setOtp(""); setAadhaarReferenceId(null); }}
                      style={{ background: "none", border: "none", color: "#6C3AED", fontSize: "13px", cursor: "pointer", textAlign: "left", padding: 0, fontFamily: "inherit" }}>
                      ← Change Aadhaar number
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <VerifiedBadge text="Aadhaar Verified — Details auto-filled from UIDAI" />
                <div style={gridStyle}>
                  <Field label="Full Name (from Aadhaar)">
                    <input type="text" style={{ ...inputStyle, background: "#f9fafb" }} value={form.full_name} readOnly />
                  </Field>
                  <Field label="Date of Birth">
                    <DatePicker value={form.date_of_birth} onChange={val => setForm(f => ({ ...f, date_of_birth: val }))} />
                  </Field>
                </div>
                <div style={gridStyle}>
                  <Field label="Gender">
                    <select style={{ ...inputStyle, cursor: "pointer" }} value={form.gender} onChange={setField("gender")}>
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </Field>
                  <Field label="Marital Status">
                    <select style={{ ...inputStyle, cursor: "pointer" }} value={form.marital_status} onChange={setField("marital_status")}>
                      <option value="">Select Marital Status</option>
                      <option value="SINGLE">Single</option>
                      <option value="MARRIED">Married</option>
                      <option value="DIVORCED">Divorced</option>
                      <option value="WIDOWED">Widowed</option>
                    </select>
                  </Field>
                </div>
                <div style={gridStyle}>
                  <Field label="Occupation">
                    <select style={{ ...inputStyle, cursor: "pointer" }} value={form.occupation} onChange={setField("occupation")}>
                      <option value="">Select Occupation</option>
                      <option value="SALARIED">Salaried</option>
                      <option value="SELF_EMPLOYED">Self Employed</option>
                      <option value="BUSINESS">Business</option>
                      <option value="STUDENT">Student</option>
                      <option value="RETIRED">Retired</option>
                      <option value="HOMEMAKER">Homemaker</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </Field>
                  <Field label="Residential Address (from Aadhaar)">
                    <input type="text" style={{ ...inputStyle, background: "#f9fafb" }} value={form.address} onChange={setField("address")} />
                  </Field>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Step 2: PAN Verification ── */}
        {currentStep === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#6C3AED", margin: 0, paddingBottom: "10px", borderBottom: "1px solid #e5e7eb" }}>
              Step 2 — PAN Verification
            </h3>

            {panVerified ? (
              <VerifiedBadge text="PAN Verified — Name and DOB match confirmed" />
            ) : (
              <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
                Enter your PAN number. We'll verify it against your Aadhaar name and date of birth.
              </p>
            )}

            <Field label="PAN Number">
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text" style={{ ...inputStyle, flex: 1, background: panVerified ? "#f9fafb" : "#fff" }}
                  placeholder="ABCDE1234F" maxLength={10}
                  value={form.pan_number} onChange={setFieldUpper("pan_number")}
                  readOnly={panVerified}
                />
                {!panVerified && (
                  <button type="button" onClick={handleVerifyPan} disabled={panLoading}
                    style={{ background: "#6C3AED", color: "#fff", border: "none", borderRadius: "10px", padding: "0 20px", fontSize: "13px", fontWeight: "700", cursor: panLoading ? "not-allowed" : "pointer", whiteSpace: "nowrap", opacity: panLoading ? 0.7 : 1 }}>
                    {panLoading ? "Verifying..." : "Verify PAN"}
                  </button>
                )}
              </div>
            </Field>

            <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "14px 18px" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", marginBottom: "8px" }}>Aadhaar Details Used for Cross-Check</div>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "13px", color: "#374151" }}>
                <span><strong>Name:</strong> {form.full_name}</span>
                <span><strong>DOB:</strong> {form.date_of_birth}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Bank Account Verification ── */}
        {currentStep === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#6C3AED", margin: 0, paddingBottom: "10px", borderBottom: "1px solid #e5e7eb" }}>
              Step 3 — Bank Account Verification
            </h3>

            {bankVerified ? (
              <VerifiedBadge text={`Bank Account Verified — Account holder: ${bankName}`} />
            ) : (
              <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
                Enter your bank account details. We'll verify them by depositing ₹1 (penny drop).
              </p>
            )}

            <div style={gridStyle}>
              <Field label="Bank Account Number">
                <input type="text" style={{ ...inputStyle, background: bankVerified ? "#f9fafb" : "#fff" }}
                  placeholder="Enter account number"
                  value={form.bank_account_number} onChange={setField("bank_account_number")}
                  readOnly={bankVerified}
                />
              </Field>
              <Field label="IFSC Code">
                <input type="text" style={{ ...inputStyle, background: bankVerified ? "#f9fafb" : "#fff" }}
                  placeholder="SBIN0001234" maxLength={11}
                  value={form.ifsc_code} onChange={setFieldUpper("ifsc_code")}
                  readOnly={bankVerified}
                />
              </Field>
            </div>

            <Field label="Annual Income">
              <select style={{ ...inputStyle, cursor: "pointer" }} value={form.income_bracket} onChange={setField("income_bracket")}>
                <option value="BELOW_1L">Below ₹1 Lakh</option>
                <option value="1L_5L">₹1 – ₹5 Lakh</option>
                <option value="5L_10L">₹5 – ₹10 Lakh</option>
                <option value="ABOVE_10L">Above ₹10 Lakh</option>
              </select>
            </Field>

            {!bankVerified && (
              <button type="button" onClick={handleVerifyBank} disabled={bankLoading}
                style={{ background: "#6C3AED", color: "#fff", border: "none", borderRadius: "10px", padding: "12px 24px", fontSize: "14px", fontWeight: "700", cursor: bankLoading ? "not-allowed" : "pointer", opacity: bankLoading ? 0.7 : 1, alignSelf: "flex-start" }}>
                {bankLoading ? "Verifying..." : "Verify Bank Account"}
              </button>
            )}
          </div>
        )}

        {/* ── Step 4: Photo & Signature ── */}
        {currentStep === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#6C3AED", margin: 0, paddingBottom: "10px", borderBottom: "1px solid #e5e7eb" }}>
              Step 4 — Photo & Signature
            </h3>
            <div style={gridStyle}>
              <div>
                <label style={labelStyle}>Your Photo</label>
                <label style={{ border: `2px dashed ${photo ? "#22c55e" : "#d1d5db"}`, borderRadius: "10px", padding: "20px", textAlign: "center", cursor: "pointer", background: photo ? "#f0fdf4" : "#fafafa", display: "block" }}>
                  <input type="file" accept="image/jpeg,image/jpg,image/png" style={{ display: "none" }} onChange={e => handleFileChange(e, "photo")} />
                  {photoPreview ? (<img src={photoPreview} alt="Preview" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "50%", margin: "0 auto 8px", display: "block", border: "2px solid #22c55e" }} />) : <div style={{ fontSize: "32px", marginBottom: "8px" }}>🤳</div>}
                  <div style={{ fontSize: "13px", color: photo ? "#15803d" : "#6b7280", fontWeight: photo ? "600" : "400" }}>{photo ? photo.name : "Click to upload photo"}</div>
                  <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}>JPG, PNG — max 5MB</div>
                </label>
              </div>
              <div>
                <label style={labelStyle}>Your Signature</label>
                <label style={{ border: `2px dashed ${signature ? "#22c55e" : "#d1d5db"}`, borderRadius: "10px", padding: "20px", textAlign: "center", cursor: "pointer", background: signature ? "#f0fdf4" : "#fafafa", display: "block" }}>
                  <input type="file" accept="image/jpeg,image/jpg,image/png" style={{ display: "none" }} onChange={e => handleFileChange(e, "signature")} />
                  {signaturePreview ? (<img src={signaturePreview} alt="Signature" style={{ width: "120px", height: "60px", objectFit: "contain", margin: "0 auto 8px", display: "block", border: "1px solid #d1d5db", borderRadius: "6px" }} />) : <div style={{ fontSize: "32px", marginBottom: "8px" }}>✍️</div>}
                  <div style={{ fontSize: "13px", color: signature ? "#15803d" : "#6b7280", fontWeight: signature ? "600" : "400" }}>{signature ? signature.name : "Click to upload signature"}</div>
                  <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}>JPG, PNG — max 5MB</div>
                </label>
              </div>
            </div>

            {/* Review summary */}
            <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "14px 18px" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", marginBottom: "10px" }}>Verification Summary</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "8px", fontSize: "13px", color: "#374151" }}>
                <span>✅ <strong>Aadhaar:</strong> Verified</span>
                <span>✅ <strong>PAN:</strong> {form.pan_number}</span>
                <span>✅ <strong>Bank:</strong> ****{form.bank_account_number.slice(-4)}</span>
                <span>✅ <strong>Name:</strong> {form.full_name}</span>
                <span>✅ <strong>DOB:</strong> {form.date_of_birth}</span>
                <span>✅ <strong>Gender:</strong> {form.gender}</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "12px 16px", color: "#dc2626", fontSize: "13px", marginTop: "16px" }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "28px", gap: "12px" }}>
          {currentStep > 1 ? (
            <button type="button" onClick={handleBack}
              style={{ background: "transparent", color: "#6C3AED", border: "1.5px solid #6C3AED", borderRadius: "10px", padding: "12px 28px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>
              ← Back
            </button>
          ) : <div />}
          {currentStep < 4 ? (
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