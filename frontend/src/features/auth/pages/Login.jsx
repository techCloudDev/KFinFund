import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!email) {
      alert("Please enter your email");
      return;
    }

    if (!password) {
      alert("Please enter your password");
      return;
    }

    if (!captcha) {
      alert("Please verify that you are not a robot");
      return;
    }

    alert("Backend login will be connected here.");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="login-logo-box">
          <img src="/logo.png" alt="KFinFund Logo" className="login-logo" />
        </div>

        <h2 className="login-title">Welcome Back!</h2>

        <p className="login-subtitle">
          Login to continue your investment journey
        </p>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Password</label>

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        <div className="forgot-password">Forgot Password?</div>

        <div className="captcha-box">
          <input
            type="checkbox"
            checked={captcha}
            onChange={(e) => setCaptcha(e.target.checked)}
          />
          <span>I'm not a robot</span>
        </div>

        <button className="login-btn" onClick={handleLogin}>
          Login
        </button>

        <div className="login-bottom-text">
          Don&apos;t have an account? <Link to="/">Register</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;