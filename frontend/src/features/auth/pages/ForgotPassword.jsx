import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "../auth.css";

const USER_SERVICE_URL = import.meta.env.VITE_USER_API || "http://localhost:4001";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!email.trim()) { setError("Please enter your email address."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email address."); return; }

    setLoading(true);
    try {
      const res = await fetch(`${USER_SERVICE_URL}/api/users/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setSent(true);
    } catch (err) {
      setError(err.message || "Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <button onClick={() => navigate("/login")} style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", color: "#6C3AED", fontWeight: "600", fontSize: "14px", padding: "0", marginBottom: "20px", fontFamily: "inherit" }}>
          <FaArrowLeft size={12} /> Back to Login
        </button>

        <div className="login-logo-box">
          <img src="/logo.png" alt="KFinFund Logo" className="login-logo" />
        </div>

        {!sent ? (
          <>
            <h2 className="login-title">Forgot Password?</h2>
            <p className="login-subtitle">Enter your registered email and we'll send you a reset link.</p>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "10px 14px", marginBottom: "14px", fontSize: "13px", color: "#dc2626", display: "flex", alignItems: "center", gap: "8px" }}>
                ⚠️ {error}
              </div>
            )}

            <button className="login-btn" onClick={handleSubmit} disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <div className="login-bottom-text">
              Remember your password? <Link to="/login">Login</Link>
            </div>
          </>
        ) : (
          // ✅ Success state — shown after email is sent
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "52px", marginBottom: "16px" }}>📧</div>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: "0 0 8px" }}>Check Your Email</h2>
            <p style={{ color: "#6b7280", fontSize: "14px", lineHeight: "1.6", margin: "0 0 24px" }}>
              If <strong>{email}</strong> is registered with KFinFund, you'll receive a password reset link shortly. Check your spam folder if you don't see it.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="login-btn"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}