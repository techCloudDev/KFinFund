import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileLayout from "./ProfileLayout";

const USER_SERVICE_URL = import.meta.env.VITE_USER_API || "http://localhost:4001";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password strength checker
  const getStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"];
  const strength = getStrength(newPassword);

  const EyeIcon = ({ show }) => show ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    // Validations
    if (!oldPassword || !newPassword || !confirmPassword) {
      setMessage("Please fill in all fields."); setIsError(true); return;
    }
    if (newPassword.length < 8) {
      setMessage("New password must be at least 8 characters."); setIsError(true); return;
    }
    if (newPassword === oldPassword) {
      setMessage("New password must be different from current password."); setIsError(true); return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match."); setIsError(true); return;
    }

    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    setLoading(true);
    try {
      const res = await fetch(`${USER_SERVICE_URL}/api/users/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Password change failed");

      // Success — force logout like Zerodha
      setMessage("Password changed successfully! Logging you out for security...");
      setIsError(false);
      setOldPassword(""); setNewPassword(""); setConfirmPassword("");

      // Clear token and redirect to login after 2 seconds
      setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("watchlist");
        navigate("/login");
      }, 2000);

    } catch (err) {
      setMessage(err.message || "Something went wrong."); setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    height: "46px", width: "100%", border: "1.5px solid #e5e7eb",
    borderRadius: "8px", padding: "0 44px 0 14px",
    fontSize: "14px", outline: "none", color: "#111827",
    boxSizing: "border-box",
  };

  const eyeBtnStyle = {
    position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
    background: "none", border: "none", cursor: "pointer", color: "#9ca3af",
    display: "flex", alignItems: "center",
  };

  return (
    <ProfileLayout pageTitle="Change Password">
      <div className="mf-detail-card">
        <h2 className="mf-detail-card-title">Change Password</h2>
        <p className="mf-detail-card-subtitle">Ensure your account is secure by using a strong password.</p>

        {/* Security notice */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "12px 14px", marginBottom: "24px" }}>
          <span style={{ fontSize: "16px", flexShrink: 0 }}>🔐</span>
          <p style={{ margin: 0, fontSize: "13px", color: "#1e40af", lineHeight: "1.5" }}>
            For your security, you will be <strong>automatically logged out</strong> after changing your password and will need to log in again with your new password.
          </p>
        </div>

        {message && (
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: isError ? "#fef2f2" : "#f0fdf4",
            border: `1px solid ${isError ? "#fecaca" : "#86efac"}`,
            borderRadius: "8px", padding: "12px 14px", marginBottom: "20px",
            fontSize: "13px", color: isError ? "#dc2626" : "#15803d", fontWeight: "600",
          }}>
            {isError ? "⚠️" : "✅"} {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ maxWidth: "480px", display: "flex", flexDirection: "column", gap: "18px" }}>

          {/* Current Password */}
          <div>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>
              Current Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showOld ? "text" : "password"}
                placeholder="Enter current password"
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                style={inputStyle}
              />
              <button type="button" style={eyeBtnStyle} onClick={() => setShowOld(!showOld)}>
                <EyeIcon show={showOld} />
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>
              New Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showNew ? "text" : "password"}
                placeholder="Enter new password (min. 8 characters)"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                style={inputStyle}
              />
              <button type="button" style={eyeBtnStyle} onClick={() => setShowNew(!showNew)}>
                <EyeIcon show={showNew} />
              </button>
            </div>

            {/* Strength meter */}
            {newPassword.length > 0 && (
              <div style={{ marginTop: "8px" }}>
                <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{ flex: 1, height: "4px", borderRadius: "2px", background: i <= strength ? strengthColor[strength] : "#e5e7eb", transition: "background 0.2s" }} />
                  ))}
                </div>
                <span style={{ fontSize: "12px", color: strengthColor[strength], fontWeight: "600" }}>
                  {strengthLabel[strength]}
                </span>
              </div>
            )}

            {/* Password rules */}
            <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "3px" }}>
              {[
                { rule: newPassword.length >= 8, text: "At least 8 characters" },
                { rule: /[A-Z]/.test(newPassword), text: "One uppercase letter" },
                { rule: /[0-9]/.test(newPassword), text: "One number" },
                { rule: /[^A-Za-z0-9]/.test(newPassword), text: "One special character" },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: r.rule ? "#15803d" : "#9ca3af" }}>
                  <span>{r.rule ? "✓" : "○"}</span> {r.text}
                </div>
              ))}
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>
              Confirm New Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                style={{ ...inputStyle, borderColor: confirmPassword && confirmPassword !== newPassword ? "#ef4444" : "#e5e7eb" }}
              />
              <button type="button" style={eyeBtnStyle} onClick={() => setShowConfirm(!showConfirm)}>
                <EyeIcon show={showConfirm} />
              </button>
            </div>
            {confirmPassword && confirmPassword !== newPassword && (
              <span style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px", display: "block" }}>Passwords do not match</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? "#9ca3af" : "#6C3AED",
              color: "#fff", border: "none", borderRadius: "8px",
              padding: "12px", fontSize: "15px", fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer", marginTop: "4px",
            }}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </ProfileLayout>
  );
}