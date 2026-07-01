import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const criteria = [
  { key: "hasMinLength",  label: "Minimum 8 characters" },
  { key: "hasCapital",    label: "At least one uppercase letter (A–Z)" },
  { key: "hasLowercase",  label: "At least one lowercase letter (a–z)" },
  { key: "hasNumber",     label: "At least one numeric digit (0–9)" },
  { key: "hasSpecial",    label: "At least one special character (! @ # $ % ^ & * _ -)" },
];

function StepPassword({ formData, updateData, nextStep, prevStep }) {
  const [showPassword, setShowPassword]             = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError]                           = useState("");

  const checks = {
    hasMinLength: formData.password.length >= 8,
    hasCapital:   /[A-Z]/.test(formData.password),
    hasLowercase: /[a-z]/.test(formData.password),
    hasNumber:    /[0-9]/.test(formData.password),
    hasSpecial:   /[!@#$%^&*_-]/.test(formData.password),
  };

  const passwordValid = Object.values(checks).every(Boolean);
  // Only show criteria box once the user has started typing
  const showCriteria = formData.password.length > 0;

  const handleNext = () => {
    setError("");
    if (!formData.password) { setError("Please enter a password."); return; }
    if (!passwordValid) { setError("Your password doesn't meet all the requirements below."); return; }
    if (!formData.confirmPassword) { setError("Please confirm your password."); return; }
    if (formData.password !== formData.confirmPassword) { setError("Passwords do not match."); return; }
    nextStep();
  };

  return (
    <>
      <div className="form-group">
        <label>Password</label>
        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            value={formData.password}
            onChange={(e) => { updateData({ password: e.target.value }); setError(""); }}
          />
          <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
      </div>

      {/* ✅ Live criteria box — only shown once user starts typing */}
      {showCriteria && (
        <div style={{
          background: "#f9fafb", border: "1px solid #e5e7eb",
          borderRadius: "10px", padding: "14px 16px", marginBottom: "4px",
        }}>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "#374151", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Password requirements
          </div>
          {criteria.map(c => {
            const passed = checks[c.key];
            return (
              <div key={c.key} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <span style={{
                  width: "18px", height: "18px", borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: passed ? "#22c55e" : "#f3f4f6",
                  border: passed ? "none" : "1.5px solid #d1d5db",
                  fontSize: "11px", fontWeight: "700",
                  color: passed ? "#fff" : "#9ca3af",
                  transition: "all 0.2s",
                }}>
                  {passed ? "✓" : ""}
                </span>
                <span style={{ fontSize: "13px", color: passed ? "#15803d" : "#6b7280", fontWeight: passed ? "600" : "400", transition: "all 0.2s" }}>
                  {c.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="form-group" style={{ marginTop: "12px" }}>
        <label>Confirm Password</label>
        <div className="password-wrapper">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) => { updateData({ confirmPassword: e.target.value }); setError(""); }}
          />
          <span className="eye-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        {/* ✅ Live confirm match indicator */}
        {formData.confirmPassword.length > 0 && (
          <div style={{ marginTop: "6px", fontSize: "12px", fontWeight: "600",
            color: formData.password === formData.confirmPassword ? "#15803d" : "#dc2626",
            display: "flex", alignItems: "center", gap: "6px" }}>
            {formData.password === formData.confirmPassword
              ? <><span style={{ background: "#22c55e", color: "#fff", borderRadius: "50%", width: "16px", height: "16px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "10px" }}>✓</span> Passwords match</>
              : <><span style={{ color: "#dc2626" }}>✕</span> Passwords do not match</>
            }
          </div>
        )}
      </div>

      {/* ✅ Inline error — no more alert() */}
      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#dc2626", display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          ⚠️ {error}
        </div>
      )}

      <div className="button-row">
        <button className="secondary-btn" type="button" onClick={prevStep}>← Back</button>
        <button type="button" onClick={handleNext}>Next →</button>
      </div>
    </>
  );
}

export default StepPassword;