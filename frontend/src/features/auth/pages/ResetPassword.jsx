import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../auth.css";

const USER_SERVICE_URL = import.meta.env.VITE_USER_API || "http://localhost:4001";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // ✅ If no token in URL, show error immediately
  useEffect(() => {
    if (!token) setError("Invalid or missing reset link. Please request a new one.");
  }, [token]);

  const handleSubmit = async () => {
    setError("");
    if (!newPassword) { setError("Please enter a new password."); return; }
    if (newPassword.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }

    setLoading(true);
    try {
      const res = await fetch(`${USER_SERVICE_URL}/api/users/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Unable to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="login-logo-box">
          <img src="/logo.png" alt="KFinFund Logo" className="login-logo" />
        </div>

        {success ? (
          // ✅ Success state
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "52px", marginBottom: "16px" }}>✅</div>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#15803d", margin: "0 0 8px" }}>Password Reset!</h2>
            <p style={{ color: "#6b7280", fontSize: "14px", lineHeight: "1.6", margin: "0 0 24px" }}>
              Your password has been updated successfully. Please login with your new password.
            </p>
            <button onClick={() => navigate("/login")} className="login-btn">
              Login Now →
            </button>
          </div>
        ) : (
          <>
            <h2 className="login-title">Set New Password</h2>
            <p className="login-subtitle">Enter and confirm your new password below.</p>

            <div className="form-group">
              <label>New Password</label>
              <div className="password-wrapper">
                <input
                  type={showNew ? "text" : "password"}
                  placeholder="Enter new password (min 6 characters)"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
                  onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                  disabled={!token}
                />
                <span className="eye-icon" onClick={() => setShowNew(!showNew)}>
                  {showNew ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <div className="password-wrapper">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                  onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                  disabled={!token}
                />
                <span className="eye-icon" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "10px 14px", marginBottom: "14px", fontSize: "13px", color: "#dc2626", display: "flex", alignItems: "center", gap: "8px" }}>
                ⚠️ {error}
                {!token && (
                  <Link to="/forgot-password" style={{ color: "#6C3AED", fontWeight: "600", marginLeft: "4px" }}>
                    Request new link →
                  </Link>
                )}
              </div>
            )}

            <button
              className="login-btn"
              onClick={handleSubmit}
              disabled={loading || !token}
              style={{ opacity: (loading || !token) ? 0.7 : 1 }}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <div className="login-bottom-text">
              Remembered it? <Link to="/login">Back to Login</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}