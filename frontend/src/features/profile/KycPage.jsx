import { apiFetch } from "../../utils/api";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProfileLayout from "./ProfileLayout";

const KYC_SERVICE_URL = import.meta.env.VITE_KYC_API || "http://localhost:4002";

const STEPS = [
  { id: 1, label: "Identity" },
  { id: 2, label: "Bank Details" },
  { id: 3, label: "Documents" },
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

const selectStyle = {
  height: "48px", border: "1.5px solid #e5e7eb", borderRadius: "10px",
  padding: "0 16px", fontSize: "14px", outline: "none", color: "#111827",
  width: "100%", boxSizing: "border-box", background: "#fff",
  cursor: "pointer", fontFamily: "inherit",
};

const Field = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    <label style={labelStyle}>{label}</label>
    {children}
  </div>
);

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

// ✅ Custom Calendar Date Picker
function DatePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => value ? parseInt(value.split("-")[0]) : new Date().getFullYear() - 25);
  const [viewMonth, setViewMonth] = useState(() => value ? parseInt(value.split("-")[1]) - 1 : new Date().getMonth());
  const [mode, setMode] = useState("date"); // "date" | "month" | "year"
  const ref = useRef(null);

  const today = new Date();
  const maxYear = today.getFullYear() - 18; // must be 18+
  const minYear = 1940;

  // Close on outside click
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

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

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
    return selectedDate.getFullYear() === viewYear &&
           selectedDate.getMonth() === viewMonth &&
           selectedDate.getDate() === day;
  };

  const isDisabled = (day) => {
    if (!day) return false;
    const d = new Date(viewYear, viewMonth, day);
    const minAge = new Date();
    minAge.setFullYear(minAge.getFullYear() - 18);
    return d > minAge;
  };

  const years = [];
  for (let y = maxYear; y >= minYear; y--) years.push(y);

  return (
    <div style={{ position: "relative" }} ref={ref}>
      {/* Input trigger */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          ...inputStyle, display: "flex", alignItems: "center",
          justifyContent: "space-between", cursor: "pointer",
          color: value ? "#111827" : "#9ca3af",
        }}
      >
        <span>{formatDisplay(value)}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </div>

      {/* Calendar popup */}
      {open && (
        <div style={{
          position: "absolute", top: "54px", left: 0, zIndex: 999,
          background: "#fff", borderRadius: "14px", boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
          padding: "16px", width: "300px", border: "1px solid #e5e7eb",
        }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <button onClick={prevMonth} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#6b7280", padding: "4px 8px" }}>‹</button>
            <div style={{ display: "flex", gap: "6px" }}>
              {/* Month selector */}
              <button
                onClick={() => setMode(m => m === "month" ? "date" : "month")}
                style={{ background: mode === "month" ? "#6C3AED" : "#f3f4f6", color: mode === "month" ? "#fff" : "#111827", border: "none", borderRadius: "6px", padding: "4px 10px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}
              >
                {MONTHS[viewMonth].slice(0, 3)}
              </button>
              {/* Year selector */}
              <button
                onClick={() => setMode(m => m === "year" ? "date" : "year")}
                style={{ background: mode === "year" ? "#6C3AED" : "#f3f4f6", color: mode === "year" ? "#fff" : "#111827", border: "none", borderRadius: "6px", padding: "4px 10px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}
              >
                {viewYear}
              </button>
            </div>
            <button onClick={nextMonth} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#6b7280", padding: "4px 8px" }}>›</button>
          </div>

          {/* Month picker */}
          {mode === "month" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px", marginBottom: "8px" }}>
              {MONTHS.map((m, i) => (
                <button key={m} onClick={() => { setViewMonth(i); setMode("date"); }}
                  style={{ padding: "8px", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600",
                    background: viewMonth === i ? "#6C3AED" : "#f3f4f6",
                    color: viewMonth === i ? "#fff" : "#374151" }}>
                  {m.slice(0, 3)}
                </button>
              ))}
            </div>
          )}

          {/* Year picker */}
          {mode === "year" && (
            <div style={{ maxHeight: "180px", overflowY: "auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px", marginBottom: "8px" }}>
              {years.map(y => (
                <button key={y} onClick={() => { setViewYear(y); setMode("date"); }}
                  style={{ padding: "8px", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600",
                    background: viewYear === y ? "#6C3AED" : "#f3f4f6",
                    color: viewYear === y ? "#fff" : "#374151" }}>
                  {y}
                </button>
              ))}
            </div>
          )}

          {/* Date grid */}
          {mode === "date" && (
            <>
              {/* Day labels */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: "6px" }}>
                {DAYS.map(d => (
                  <div key={d} style={{ textAlign: "center", fontSize: "11px", fontWeight: "700", color: "#9ca3af", padding: "4px 0" }}>{d}</div>
                ))}
              </div>
              {/* Day cells */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
                {cells.map((day, idx) => (
                  <button key={idx}
                    onClick={() => day && !isDisabled(day) && handleDayClick(day)}
                    disabled={!day || isDisabled(day)}
                    style={{
                      height: "34px", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "500",
                      cursor: day && !isDisabled(day) ? "pointer" : "default",
                      background: isSelected(day) ? "#6C3AED" : "transparent",
                      color: isSelected(day) ? "#fff" : isDisabled(day) ? "#d1d5db" : day ? "#374151" : "transparent",
                    }}
                  >
                    {day || ""}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: "10px", fontSize: "11px", color: "#9ca3af", textAlign: "center" }}>
                Must be 18 years or older
              </div>
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
  const [kycStatus, setKycStatus] = useState(null);
  const [kycData, setKycData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

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
    apiFetch(`${KYC_SERVICE_URL}/api/kyc/status`)
      .then(r => r.json())
      .then(data => {
        setKycStatus(data.status || "NOT_SUBMITTED");
        if (data.status === "PENDING" || data.status === "APPROVED") {
          apiFetch(`${KYC_SERVICE_URL}/api/kyc`)
            .then(r => r.json()).then(setKycData).catch(() => {});
        }
      })
      .catch(() => setKycStatus("NOT_SUBMITTED"));
  }, [navigate, location.pathname]);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === "photo") { setPhoto(file); setPhotoPreview(url); }
    else { setSignature(file); setSignaturePreview(url); }
  };

  const validateStep = () => {
    setError("");
    if (currentStep === 1) {
      if (!form.full_name.trim()) { setError("Full name is required."); return false; }
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.pan_number.toUpperCase())) { setError("Enter a valid PAN number (e.g. ABCDE1234F)."); return false; }
      if (!/^\d{12}$/.test(form.aadhaar_number)) { setError("Aadhaar must be exactly 12 digits."); return false; }
      if (!form.date_of_birth) { setError("Date of birth is required."); return false; }
      if (!form.gender) { setError("Please select your gender."); return false; }
      if (!form.marital_status) { setError("Please select your marital status."); return false; }
      if (!form.occupation) { setError("Please select your occupation."); return false; }
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

  const handleNext = () => { if (validateStep()) setCurrentStep(s => s + 1); };
  const handleBack = () => { setError(""); setCurrentStep(s => s - 1); };

  const setField = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));
  const setFieldUpper = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value.toUpperCase() }));
  const setFieldDigits = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value.replace(/\D/g, "") }));

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
      setSuccess(true); setKycStatus("PENDING");
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  if (kycStatus === null) return (
    <ProfileLayout pageTitle="KYC Details">
      <div className="mf-detail-card" style={{ textAlign: "center", padding: "60px" }}>
        <p style={{ color: "#6b7280" }}>Loading KYC status...</p>
      </div>
    </ProfileLayout>
  );

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
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: done ? "#22c55e" : active ? "#6C3AED" : "#e5e7eb", color: done || active ? "#fff" : "#9ca3af", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700", transition: "all 0.3s", flexShrink: 0 }}>
                    {done ? "✓" : step.id}
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: "600", color: active ? "#6C3AED" : done ? "#22c55e" : "#9ca3af", whiteSpace: "nowrap" }}>{step.label}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: "2px", background: done ? "#22c55e" : "#e5e7eb", margin: "0 8px", marginBottom: "20px", transition: "background 0.3s" }} />
                )}
              </div>
            );
          })}
        </div>

        {currentStep === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#6C3AED", margin: 0, paddingBottom: "10px", borderBottom: "1px solid #e5e7eb" }}>
              Step 1 — Identity Details
            </h3>
            <div style={gridStyle}>
              <Field label="Full Name (as per PAN)">
                <input type="text" style={inputStyle} placeholder="Enter your full name"
                  value={form.full_name} onChange={setField("full_name")} />
              </Field>
              <Field label="PAN Number">
                <input type="text" style={inputStyle} placeholder="ABCDE1234F" maxLength={10}
                  value={form.pan_number} onChange={setFieldUpper("pan_number")} />
              </Field>
            </div>
            <div style={gridStyle}>
              <Field label="Aadhaar Number (12 digits)">
                <input type="text" style={inputStyle} placeholder="123456789012" maxLength={12}
                  value={form.aadhaar_number} onChange={setFieldDigits("aadhaar_number")} />
              </Field>
              {/* ✅ Custom calendar date picker */}
              <Field label="Date of Birth">
                <DatePicker
                  value={form.date_of_birth}
                  onChange={(val) => setForm(f => ({ ...f, date_of_birth: val }))}
                />
              </Field>
            </div>
            <div style={gridStyle}>
              <Field label="Gender">
                <select style={selectStyle} value={form.gender} onChange={setField("gender")}>
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </Field>
              <Field label="Marital Status">
                <select style={selectStyle} value={form.marital_status} onChange={setField("marital_status")}>
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
                <select style={selectStyle} value={form.occupation} onChange={setField("occupation")}>
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
              <Field label="Residential Address">
                <input type="text" style={inputStyle} placeholder="Full residential address"
                  value={form.address} onChange={setField("address")} />
              </Field>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#6C3AED", margin: 0, paddingBottom: "10px", borderBottom: "1px solid #e5e7eb" }}>
              Step 2 — Bank Details
            </h3>
            <div style={gridStyle}>
              <Field label="Bank Account Number">
                <input type="text" style={inputStyle} placeholder="Enter account number"
                  value={form.bank_account_number} onChange={setField("bank_account_number")} />
              </Field>
              <Field label="IFSC Code">
                <input type="text" style={inputStyle} placeholder="SBIN0001234" maxLength={11}
                  value={form.ifsc_code} onChange={setFieldUpper("ifsc_code")} />
              </Field>
            </div>
            <Field label="Annual Income">
              <select style={selectStyle} value={form.income_bracket} onChange={setField("income_bracket")}>
                <option value="BELOW_1L">Below ₹1 Lakh</option>
                <option value="1L_5L">₹1 – ₹5 Lakh</option>
                <option value="5L_10L">₹5 – ₹10 Lakh</option>
                <option value="ABOVE_10L">Above ₹10 Lakh</option>
              </select>
            </Field>
            <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "14px 18px" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", marginBottom: "8px" }}>Identity (Step 1 ✓)</div>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "13px", color: "#374151" }}>
                <span><strong>Name:</strong> {form.full_name}</span>
                <span><strong>PAN:</strong> {form.pan_number}</span>
                <span><strong>DOB:</strong> {form.date_of_birth}</span>
                <span><strong>Gender:</strong> {form.gender}</span>
                <span><strong>Occupation:</strong> {form.occupation}</span>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#6C3AED", margin: 0, paddingBottom: "10px", borderBottom: "1px solid #e5e7eb" }}>
              Step 3 — Photo & Signature
            </h3>
            <div style={gridStyle}>
              <div>
                <label style={labelStyle}>Your Photo</label>
                <label style={{ border: `2px dashed ${photo ? "#22c55e" : "#d1d5db"}`, borderRadius: "10px", padding: "20px", textAlign: "center", cursor: "pointer", background: photo ? "#f0fdf4" : "#fafafa", display: "block", transition: "all 0.2s" }}>
                  <input type="file" accept="image/jpeg,image/jpg,image/png" style={{ display: "none" }} onChange={e => handleFileChange(e, "photo")} />
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "50%", margin: "0 auto 8px", display: "block", border: "2px solid #22c55e" }} />
                  ) : <div style={{ fontSize: "32px", marginBottom: "8px" }}>🤳</div>}
                  <div style={{ fontSize: "13px", color: photo ? "#15803d" : "#6b7280", fontWeight: photo ? "600" : "400" }}>{photo ? photo.name : "Click to upload photo"}</div>
                  <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}>JPG, PNG — max 5MB</div>
                </label>
              </div>
              <div>
                <label style={labelStyle}>Your Signature</label>
                <label style={{ border: `2px dashed ${signature ? "#22c55e" : "#d1d5db"}`, borderRadius: "10px", padding: "20px", textAlign: "center", cursor: "pointer", background: signature ? "#f0fdf4" : "#fafafa", display: "block", transition: "all 0.2s" }}>
                  <input type="file" accept="image/jpeg,image/jpg,image/png" style={{ display: "none" }} onChange={e => handleFileChange(e, "signature")} />
                  {signaturePreview ? (
                    <img src={signaturePreview} alt="Signature" style={{ width: "120px", height: "60px", objectFit: "contain", margin: "0 auto 8px", display: "block", border: "1px solid #d1d5db", borderRadius: "6px" }} />
                  ) : <div style={{ fontSize: "32px", marginBottom: "8px" }}>✍️</div>}
                  <div style={{ fontSize: "13px", color: signature ? "#15803d" : "#6b7280", fontWeight: signature ? "600" : "400" }}>{signature ? signature.name : "Click to upload signature"}</div>
                  <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}>JPG, PNG — max 5MB</div>
                </label>
              </div>
            </div>
            <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "14px 18px" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", marginBottom: "10px" }}>Review Summary</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "8px", fontSize: "13px", color: "#374151" }}>
                <span>✓ <strong>Name:</strong> {form.full_name}</span>
                <span>✓ <strong>PAN:</strong> {form.pan_number}</span>
                <span>✓ <strong>DOB:</strong> {form.date_of_birth}</span>
                <span>✓ <strong>Gender:</strong> {form.gender}</span>
                <span>✓ <strong>Marital:</strong> {form.marital_status}</span>
                <span>✓ <strong>Occupation:</strong> {form.occupation}</span>
                <span>✓ <strong>Bank:</strong> ****{form.bank_account_number.slice(-4)}</span>
                <span>✓ <strong>IFSC:</strong> {form.ifsc_code}</span>
                <span>✓ <strong>Income:</strong> {form.income_bracket.replace(/_/g, " ")}</span>
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