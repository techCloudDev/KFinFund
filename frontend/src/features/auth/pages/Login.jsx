import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import "../auth.css";

const USER_SERVICE_URL = import.meta.env.VITE_USER_API || "http://localhost:4001";
const HCAPTCHA_SITE_KEY = "a5d628f2-bed6-46e2-b0e6-170a6b588aee";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const captchaRef = useRef(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");

    // ✅ Specific validation messages
    if (!email.trim()) { setError("Please enter your email address."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email address."); return; }
    if (!password) { setError("Please enter your password."); return; }
    if (!captchaToken) { setError("Please complete the captcha verification."); return; }

    setLoading(true);
    try {
      const response = await fetch(`${USER_SERVICE_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        // ✅ Save refresh token for silent refresh
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }
        localStorage.removeItem("kycStatus"); // ✅ Clear KYC cache on new login
        navigate("/dashboard");
      } else {
        // ✅ Map backend error codes to friendly messages
        const status = response.status;
        if (status === 401) {
          setError("Incorrect email or password. Please try again.");
        } else if (status === 404) {
          setError("No account found with this email. Please register first.");
        } else if (status === 429) {
          setError("Too many login attempts. Please wait 15 minutes and try again.");
        } else if (status === 500) {
          setError("Server is temporarily unavailable. Please try again in a moment.");
        } else {
          setError(data.error || "Login failed. Please try again.");
        }
        setCaptchaToken("");
        captchaRef.current?.resetCaptcha();
      }
    } catch (err) {
      // ✅ Network error
      setError("Unable to connect to server. Please check your internet connection.");
      setCaptchaToken("");
      captchaRef.current?.resetCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => { if (e.key === "Enter") handleLogin(); };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", color: "#6C3AED", fontWeight: "600", fontSize: "14px", padding: "0", marginBottom: "20px", fontFamily: "inherit" }}>
          <FaArrowLeft size={12} /> Back to Home
        </button>

        <div className="login-logo-box">
          <img src="/logo.png" alt="KFinFund Logo" className="login-logo" />
        </div>

        <h2 className="login-title">Welcome Back!</h2>
        <p className="login-subtitle">Login to continue your investment journey</p>

        <div className="form-group">
          <label>Email</label>
          <input type="email" placeholder="Enter your email"
            value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }}
            onKeyPress={handleKeyPress} />
        </div>

        <div className="form-group">
          <label>Password</label>
          <div className="password-wrapper">
            <input type={showPassword ? "text" : "password"} placeholder="Enter your password"
              value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }}
              onKeyPress={handleKeyPress} />
            <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
          <Link to="/forgot-password" style={{ color: "#5521d9", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>
            Forgot Password?
          </Link>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <HCaptcha sitekey={HCAPTCHA_SITE_KEY}
            onVerify={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken("")}
            ref={captchaRef} />
        </div>

        {/* ✅ Styled error box */}
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "10px 14px", marginBottom: "14px", fontSize: "13px", color: "#dc2626", display: "flex", alignItems: "center", gap: "8px" }}>
            ⚠️ {error}
          </div>
        )}

        <button className="login-btn" onClick={handleLogin} disabled={loading}
          style={{ opacity: loading ? 0.7 : 1 }}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="login-bottom-text">
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;