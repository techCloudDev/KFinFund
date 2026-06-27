import { Link, useNavigate } from "react-router-dom";
import logoImg from "../../../assets/Logo.png";

const QUICK_LINKS = [
  { label: "Browse Funds", to: "/mutual-fund", auth: false },
  { label: "My Portfolio", to: "/portfolio", auth: true },
  { label: "My SIPs", to: "/user/sip", auth: true },
  { label: "Transactions", to: "/transactions", auth: true },
  { label: "KYC Verification", to: "/user/profile/kyc", auth: true },
];

const FUND_CATEGORIES = [
  { label: "Large Cap", to: "/mutual-fund?category=largecap" },
  { label: "Mid Cap", to: "/mutual-fund?category=midcap" },
  { label: "Small Cap", to: "/mutual-fund?category=smallcap" },
  { label: "Tax Saving (ELSS)", to: "/mutual-fund?category=elss" },
  { label: "Liquid Fund", to: "/mutual-fund?category=liquid" },
];

const linkStyle = {
  color: "#94a3b8",
  fontSize: "14px",
  cursor: "pointer",
  padding: "5px 0",
  display: "block",
  transition: "color 0.2s",
  textDecoration: "none",
};

export default function Footer() {
  const navigate = useNavigate();

  const handleLink = (to, auth) => {
    if (auth && !localStorage.getItem("token")) {
      navigate("/login");
    } else {
      navigate(to);
    }
  };

  return (
    <footer className="lp-footer">
      <div className="lp-container">
        <div
          className="lp-footer__grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.8fr 1fr 1fr 1fr 1fr",
            gap: "40px",
            padding: "48px 0 32px",
          }}
        >
          {/* Brand */}
          <div>
            <Link
              to="/"
              style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}
            >
              <img src={logoImg} alt="KfinFund logo" style={{ width: "32px", height: "32px", objectFit: "contain", filter: "brightness(0) invert(1)" }} />
              <span className="lp-footer__brand-name" style={{ fontSize: "18px", fontWeight: "700", color: "#fff" }}>KfinFund</span>
            </Link>
            <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: "1.7", marginBottom: "0" }}>
              Empowering millions of Indians to achieve their financial goals
              through smart, simple investments. Built with ❤️ for India.
            </p>
          </div>

          {/* Address */}
          <div>
            <h4 className="lp-footer__heading" style={{ color: "#fff", fontSize: "14px", fontWeight: "600", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Address
            </h4>
            <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: "1.8", margin: 0 }}>
              📍 Lane L-4, Jaganmohan Nagar,<br />
              Jagamara,<br />
              Bhubaneswar - 751030,<br />
              Odisha, India
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="lp-footer__heading" style={{ color: "#fff", fontSize: "14px", fontWeight: "600", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Contact Us
            </h4>
            <a
              href="mailto:kfinfund@gmail.com?subject=Query from KfinFund Website"
              style={{ ...linkStyle, display: "flex", alignItems: "center", gap: "8px" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#a78bfa"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}
            >
              ✉️ kfinfund@gmail.com
            </a>
            <p style={{ color: "#94a3b8", fontSize: "12px", marginTop: "8px", lineHeight: "1.6" }}>
              We typically respond within 24 business hours.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="lp-footer__heading" style={{ color: "#fff", fontSize: "14px", fontWeight: "600", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Quick Links
            </h4>
            {QUICK_LINKS.map((link) => (
              <div
                key={link.label}
                onClick={() => handleLink(link.to, link.auth)}
                style={linkStyle}
                onMouseEnter={(e) => e.currentTarget.style.color = "#a78bfa"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}
              >
                {link.label}
              </div>
            ))}
          </div>

          {/* Fund Categories */}
          <div>
            <h4 className="lp-footer__heading" style={{ color: "#fff", fontSize: "14px", fontWeight: "600", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Fund Categories
            </h4>
            {FUND_CATEGORIES.map((link) => (
              <div
                key={link.label}
                onClick={() => navigate(link.to)}
                style={linkStyle}
                onMouseEnter={(e) => e.currentTarget.style.color = "#a78bfa"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}
              >
                {link.label}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="lp-footer__bottom"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: "20px",
            paddingBottom: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", gap: "24px", marginBottom: "8px" }}>
            {["Privacy Policy", "Terms of Use", "Disclaimer", "Grievance Policy"].map((item) => (
              <span
                key={item}
                style={{ color: "#64748b", fontSize: "12px", cursor: "pointer" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#a78bfa"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#64748b"}
              >
                {item}
              </span>
            ))}
          </div>
          <p style={{ color: "#64748b", fontSize: "12px", margin: 0 }}>
            © {new Date().getFullYear()} KfinFund Financial Services. All rights reserved.
          </p>
          <p style={{ color: "#475569", fontSize: "11px", margin: 0, textAlign: "center" }}>
            Mutual Fund investments are subject to market risks. Please read all scheme-related documents carefully before investing.
          </p>
        </div>
      </div>
    </footer>
  );
}