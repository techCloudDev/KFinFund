import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import StepPersonal from "../component/StepPersonal";
import StepPassword from "../component/StepPassword";
import StepOTP from "../component/StepOTP";
import StepTerms from "../component/StepTerms";
import Success from "../component/Success";
import "../auth.css";

const USER_SERVICE_URL = import.meta.env.VITE_USER_API || "http://localhost:4001";

const STEP_LABELS = ["Personal", "Password", "Verify", "Review"];

function Register() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
  fullName: "", firstName: "", lastName: "",
  email: "", phone: "", state: "", city: "",
    password: "", confirmPassword: "", otp: "",
    terms: false, privacy: false, captcha: false,
  });

  const updateData = (newData) => setFormData(prev => ({ ...prev, ...newData }));

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${USER_SERVICE_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
        }),
      });
      const data = await res.json();
      if (res.ok) { setStep(5); }
      else { setError(data.error || "Registration failed. Please try again."); }
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {step <= 4 && (
          <>
            <button onClick={() => navigate("/")} style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "none", border: "none", cursor: "pointer",
              color: "#6C3AED", fontWeight: "600", fontSize: "14px",
              padding: "0", marginBottom: "20px", fontFamily: "inherit",
            }}>
              <FaArrowLeft size={12} /> Back to Home
            </button>

            <div className="login-logo-box">
              <img src="/logo.png" alt="KFinFund Logo" className="login-logo" />
            </div>

            {/* ── Step indicator with labels ── */}
            <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "28px" }}>
              {STEP_LABELS.map((label, idx) => {
                const num = idx + 1;
                const done = step > num;
                const active = step === num;
                return (
                  <div key={num} style={{ display: "flex", alignItems: "flex-start", flex: idx < 3 ? 1 : "none" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                      <div style={{
                        width: "34px", height: "34px", borderRadius: "50%",
                        background: done ? "#22c55e" : active ? "#6C3AED" : "#e5e7eb",
                        color: done || active ? "#fff" : "#9ca3af",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "13px", fontWeight: "700", flexShrink: 0, transition: "all 0.3s",
                      }}>
                        {done ? "✓" : num}
                      </div>
                      <span style={{
                        fontSize: "10px", fontWeight: "600", whiteSpace: "nowrap",
                        color: active ? "#6C3AED" : done ? "#22c55e" : "#9ca3af",
                      }}>{label}</span>
                    </div>
                    {idx < 3 && (
                      <div style={{
                        flex: 1, height: "2px", marginTop: "16px",
                        background: done ? "#22c55e" : "#e5e7eb",
                        transition: "background 0.3s",
                      }} />
                    )}
                  </div>
                );
              })}
            </div>

            <h2 className="auth-title">
              {step === 1 ? "Create Your Account"
               : step === 2 ? "Set a Password"
               : step === 3 ? "Verify Your Phone"
               : "Review & Confirm"}
            </h2>
          </>
        )}

        {error && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px",
            padding: "12px 16px", color: "#dc2626", fontSize: "13px", marginBottom: "14px",
          }}>
            ⚠️ {error}
          </div>
        )}

        {step === 1 && <StepPersonal formData={formData} updateData={updateData} nextStep={() => setStep(2)} />}
        {step === 2 && <StepPassword formData={formData} updateData={updateData} nextStep={() => setStep(3)} prevStep={() => setStep(1)} />}
        {step === 3 && <StepOTP formData={formData} updateData={updateData} nextStep={() => setStep(4)} prevStep={() => setStep(2)} />}
        {step === 4 && <StepTerms formData={formData} updateData={updateData} nextStep={handleSubmit} prevStep={() => setStep(3)} loading={loading} />}
        {step === 5 && <Success />}

        {step === 1 && (
          <div className="login-bottom-text" style={{ marginTop: "16px" }}>
            Already have an account? <Link to="/login">Login</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Register;