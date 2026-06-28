import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Success() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown === 0) { navigate("/login"); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, navigate]);

  return (
    <div className="success-page">
      {/* Animated checkmark */}
      <div style={{
        width: "80px", height: "80px", borderRadius: "50%",
        background: "linear-gradient(135deg, #6C3AED, #8b5cf6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 24px", boxShadow: "0 8px 32px rgba(108,58,237,0.3)",
        fontSize: "36px", color: "#fff",
      }}>✓</div>

      <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: "0 0 12px" }}>
        Account Created Successfully!
      </h2>

      <p style={{ color: "#6b7280", fontSize: "14px", margin: "0 0 6px", lineHeight: "1.6" }}>
        Welcome to KFinFund! Your account is ready.
      </p>
      <p style={{ color: "#6b7280", fontSize: "14px", margin: "0 0 28px", lineHeight: "1.6" }}>
        Please login and complete your KYC to start investing.
      </p>

      {/* Countdown ring */}
      <div style={{
        width: "52px", height: "52px", borderRadius: "50%",
        border: "3px solid #e5e7eb", display: "flex", alignItems: "center",
        justifyContent: "center", margin: "0 auto 16px",
        background: `conic-gradient(#6C3AED ${(5 - countdown) / 5 * 100}%, #f3f4f6 0%)`,
      }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "50%", background: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "16px", fontWeight: "700", color: "#6C3AED",
        }}>{countdown}</div>
      </div>
      <p style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "20px" }}>
        Redirecting to login in {countdown}s...
      </p>

      <button onClick={() => navigate("/login")} style={{
        background: "#6C3AED", color: "#fff", border: "none", borderRadius: "10px",
        padding: "12px 32px", fontSize: "15px", fontWeight: "700", cursor: "pointer",
        width: "100%",
      }}>
        Go to Login →
      </button>
    </div>
  );
}

export default Success;