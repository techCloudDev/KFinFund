import { Link, useNavigate } from "react-router-dom";
import logoImg from "/logo.png";

export default function PublicLayout({ children, pageTitle = "Mutual Funds" }) {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9ff" }}>
      {/* Public Navbar */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 200,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid #e5e7eb",
        padding: "0 1.5rem",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <img src={logoImg} alt="KfinFund" style={{ width: "36px", height: "36px", objectFit: "contain" }} />
          <span style={{ fontWeight: 900, fontSize: "1.2rem", color: "#111827", letterSpacing: "-0.02em" }}>KfinFund</span>
        </Link>

        {/* Page Title */}
        <h1 style={{ fontSize: "16px", fontWeight: 700, color: "#111827", margin: 0 }}>{pageTitle}</h1>

        {/* Auth Buttons */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {isLoggedIn ? (
            <button
              onClick={() => navigate("/dashboard")}
              style={{
                background: "linear-gradient(135deg, #6C3AED, #8B5CF6)",
                color: "white",
                border: "none",
                borderRadius: "999px",
                padding: "8px 20px",
                fontWeight: 700,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                style={{
                  background: "linear-gradient(135deg, #6C3AED, #8B5CF6)",
                  color: "white",
                  border: "none",
                  borderRadius: "999px",
                  padding: "8px 20px",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                style={{
                  background: "transparent",
                  color: "#6C3AED",
                  border: "2px solid #6C3AED",
                  borderRadius: "999px",
                  padding: "8px 20px",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 1.5rem" }}>
        {children}
      </main>
    </div>
  );
}