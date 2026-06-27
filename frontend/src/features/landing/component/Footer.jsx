import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoImg from "../../../assets/Logo.png";

const FUND_CATEGORIES = [
  { label: "Large Cap", to: "/mutual-fund?category=largecap" },
  { label: "Mid Cap", to: "/mutual-fund?category=midcap" },
  { label: "Small Cap", to: "/mutual-fund?category=smallcap" },
  { label: "Tax Saving (ELSS)", to: "/mutual-fund?category=elss" },
  { label: "Liquid Fund", to: "/mutual-fund?category=liquid" },
];

const LEGAL_CONTENT = {
  "Privacy Policy": `KfinFund is committed to protecting your privacy. We collect personal information such as name, email, PAN, and Aadhaar solely for KYC and investment purposes. Your data is encrypted and never sold to third parties. We use industry-standard security measures to protect your information. You have the right to access, update, or delete your personal data at any time by contacting us at kfinfund@gmail.com.`,
  "Terms of Use": `By using KfinFund, you agree to our terms of service. You must be 18 years or older and a resident of India. All investments are subject to market risks. KfinFund is not responsible for investment losses. You agree not to misuse the platform for fraudulent activities. We reserve the right to suspend accounts that violate our policies. These terms are governed by the laws of India.`,
  "Disclaimer": `Mutual Fund investments are subject to market risks. Please read all scheme-related documents carefully before investing. Past performance is not indicative of future returns. KfinFund is a technology platform and does not provide financial advice. Please consult a SEBI-registered investment advisor before making investment decisions. NAV data is sourced from mfapi.in and may be delayed.`,
  "Grievance Policy": `If you have any grievance regarding our services, please contact us at kfinfund@gmail.com with the subject 'Grievance'. We will acknowledge your complaint within 24 business hours and resolve it within 7 working days. If unsatisfied, you may escalate to SEBI's SCORES platform at scores.gov.in. Our Grievance Officer can be reached at the same email address.`,
};

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
  const [activeModal, setActiveModal] = useState(null);

  return (
    <>
      {/* Legal Modal */}
      {activeModal && (
        <div
          onClick={() => setActiveModal(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#1e1b4b",
              borderRadius: "16px",
              padding: "32px",
              maxWidth: "560px",
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto",
              border: "1px solid rgba(139, 92, 246, 0.2)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ color: "#fff", fontSize: "18px", fontWeight: 700, margin: 0 }}>{activeModal}</h3>
              <button
                onClick={() => setActiveModal(null)}
                style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "20px", cursor: "pointer", padding: "4px" }}
              >✕</button>
            </div>
            <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.8", margin: 0 }}>
              {LEGAL_CONTENT[activeModal]}
            </p>
            <button
              onClick={() => setActiveModal(null)}
              style={{
                marginTop: "24px", width: "100%", padding: "12px",
                background: "linear-gradient(135deg, #6C3AED, #8B5CF6)",
                color: "#fff", border: "none", borderRadius: "8px",
                fontWeight: 700, fontSize: "14px", cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <footer className="lp-footer">
        <div className="lp-container">
          {/* Main Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: "40px",
            padding: "48px 0 32px",
          }}
            className="lp-footer-grid-responsive"
          >
            {/* Brand */}
            <div>
              <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                <img src={logoImg} alt="KfinFund logo" style={{ width: "32px", height: "32px", objectFit: "contain", filter: "brightness(0) invert(1)" }} />
                <span style={{ fontSize: "18px", fontWeight: 700, color: "#fff" }}>KfinFund</span>
              </Link>
              <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: "1.7", margin: 0 }}>
                Empowering millions of Indians to achieve their financial goals
                through smart, simple investments. Built with ❤️ for India.
              </p>
            </div>

            {/* Address */}
            <div>
              <h4 style={{ color: "#fff", fontSize: "13px", fontWeight: 700, marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Address
              </h4>
              <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: "1.9", margin: 0 }}>
                📍 Lane L-4,<br />
                Jaganmohan Nagar,<br />
                Jagamara,<br />
                Bhubaneswar - 751030,<br />
                Odisha, India
              </p>
            </div>

            {/* Contact */}
            <div>
              <h4 style={{ color: "#fff", fontSize: "13px", fontWeight: 700, marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Contact Us
              </h4>
              <a
                href="mailto:kfinfund@gmail.com?subject=Query from KfinFund Website"
                style={{ color: "#94a3b8", fontSize: "13px", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#a78bfa"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}
              >
                ✉️ kfinfund@gmail.com
              </a>
              <p style={{ color: "#64748b", fontSize: "12px", lineHeight: "1.6", margin: 0, borderLeft: "2px solid rgba(139,92,246,0.3)", paddingLeft: "8px" }}>
                We typically respond within 24 business hours.
              </p>
            </div>

            {/* Fund Categories */}
            <div>
              <h4 style={{ color: "#fff", fontSize: "13px", fontWeight: 700, marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
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

          {/* Bottom Bar */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: "20px",
            paddingBottom: "20px",
          }}>
            {/* Legal Links */}
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px 20px",
              justifyContent: "center",
              marginBottom: "16px",
            }}>
              {Object.keys(LEGAL_CONTENT).map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveModal(item)}
                  style={{
                    background: "none", border: "1px solid rgba(139,92,246,0.25)",
                    color: "#94a3b8", fontSize: "12px", cursor: "pointer",
                    padding: "4px 12px", borderRadius: "999px",
                    transition: "all 0.2s", fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#a78bfa";
                    e.currentTarget.style.borderColor = "rgba(139,92,246,0.6)";
                    e.currentTarget.style.background = "rgba(139,92,246,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#94a3b8";
                    e.currentTarget.style.borderColor = "rgba(139,92,246,0.25)";
                    e.currentTarget.style.background = "none";
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
            <p style={{ color: "#64748b", fontSize: "12px", margin: "0 0 6px", textAlign: "center" }}>
              © {new Date().getFullYear()} KfinFund Financial Services. All rights reserved.
            </p>
            <p style={{ color: "#475569", fontSize: "11px", margin: 0, textAlign: "center", lineHeight: "1.6" }}>
              Mutual Fund investments are subject to market risks. Please read all scheme-related documents carefully before investing.
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 900px) {
          .lp-footer-grid-responsive {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 600px) {
          .lp-footer-grid-responsive {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </>
  );
}