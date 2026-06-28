import { useState } from "react";
import DashboardLayout from "../mutual-fund/component/DashboardLayout";
import "./profile.css";

const faqs = [
  {
    q: "How do I redeem my mutual funds?",
    a: "Go to your Portfolio page, select the mutual fund scheme, click 'Redeem', enter the amount or units you wish to redeem, and confirm the transaction. The amount will be credited to your registered bank account within the stipulated time."
  },
  {
    q: "How long does it take for funds to reflect in my bank account?",
    a: "For liquid funds, redemption proceeds are credited within T+1 working days. For equity and hybrid funds, it typically takes T+2 to T+3 working days after the redemption request is processed."
  },
  {
    q: "Can I update my registered bank account details?",
    a: "Yes. You can initiate a bank account change request from the Profile section under Account Settings. Please note that changes may take 7–10 working days to reflect and are subject to verification."
  },
  {
    q: "Is my investment data secure on KfinFund?",
    a: "Absolutely. KfinFund uses industry-standard encryption (TLS/SSL) for all data in transit and stores sensitive information using secure hashing. Your financial data is never shared with third parties without your explicit consent."
  },
  {
    q: "How do I set up a SIP (Systematic Investment Plan)?",
    a: "Navigate to any mutual fund detail page, select the 'SIP' tab in the investment panel, choose your monthly amount and start date, then click 'Start Monthly SIP'. Your SIP will be activated after confirmation."
  },
  {
    q: "What is the minimum investment amount?",
    a: "The minimum investment amount varies by fund. Most equity funds allow lumpsum investments starting from ₹500 and SIPs from ₹100 per month. The specific minimum is displayed on each fund's detail page."
  },
  {
    q: "How do I complete my KYC verification?",
    a: "KYC can be completed from the Profile → KYC Details section. You will need a valid PAN card and Aadhaar number. Once submitted, verification is typically completed within 1–2 working days."
  },
];

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (idx) => setOpenIndex(openIndex === idx ? null : idx);

  return (
    <DashboardLayout pageTitle="Help & Support">
      <div style={{ maxWidth: "780px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: "0 0 8px" }}>
            How can we help you?
          </h2>
          <p style={{ color: "#6b7280", fontSize: "15px", margin: 0 }}>
            Browse our FAQs or reach out to our support team directly.
          </p>
        </div>

        {/* Email Support Card — single centered card */}
        <div style={{
          background: "linear-gradient(135deg, rgba(108,58,237,0.06) 0%, rgba(108,58,237,0.02) 100%)",
          border: "1.5px solid rgba(108,58,237,0.18)",
          borderRadius: "14px",
          padding: "24px 32px",
          display: "flex",
          alignItems: "center",
          gap: "20px",
          marginBottom: "36px",
        }}>
          {/* Icon */}
          <div style={{
            width: "52px", height: "52px", borderRadius: "12px",
            background: "rgba(108,58,237,0.1)", display: "flex",
            alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
              fill="none" stroke="#6C3AED" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>

          {/* Text */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
              Email Support
            </div>
            <a
              href="mailto:kfintech@gmail.com?subject=Support Query — KfinFund"
              style={{ fontSize: "17px", fontWeight: "700", color: "#6C3AED", textDecoration: "none" }}
            >
              kfintech@gmail.com
            </a>
            <div style={{ fontSize: "13px", color: "#9ca3af", marginTop: "4px" }}>
              We typically respond within 24 business hours.
            </div>
          </div>

          {/* CTA */}
          <a
            href="mailto:kfintech@gmail.com?subject=Support Query — KfinFund"
            style={{
              background: "#6C3AED", color: "#fff", border: "none", borderRadius: "8px",
              padding: "10px 20px", fontSize: "14px", fontWeight: "600",
              textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0,
            }}
          >
            Send Email →
          </a>
        </div>

        {/* FAQ Section */}
        <div style={{ marginBottom: "40px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>
            Frequently Asked Questions
          </h3>

          <div style={{ borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden", background: "#fff" }}>
            {faqs.map((faq, idx) => (
              <div key={idx} style={{ borderBottom: idx < faqs.length - 1 ? "1px solid #e5e7eb" : "none" }}>

                {/* Question row */}
                <button
                  onClick={() => toggle(idx)}
                  style={{
                    width: "100%", background: "none", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "18px 20px", gap: "16px", textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: "15px", fontWeight: "600", color: "#111827", lineHeight: "1.4" }}>
                    {faq.q}
                  </span>

                  {/* Animated chevron */}
                  <span style={{
                    flexShrink: 0, width: "28px", height: "28px", borderRadius: "50%",
                    background: openIndex === idx ? "#6C3AED" : "#f3f4f6",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s ease",
                  }}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg" width="14" height="14"
                      viewBox="0 0 24 24" fill="none"
                      stroke={openIndex === idx ? "#fff" : "#6b7280"}
                      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      style={{ transform: openIndex === idx ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s ease" }}
                    >
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </span>
                </button>

                {/* Answer — animated expand */}
                <div style={{
                  maxHeight: openIndex === idx ? "200px" : "0",
                  overflow: "hidden",
                  transition: "max-height 0.3s ease",
                }}>
                  <p style={{
                    margin: 0, padding: "0 20px 18px",
                    fontSize: "14px", color: "#6b7280", lineHeight: "1.7",
                  }}>
                    {faq.a}
                  </p>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Bottom note */}
        <div style={{
          background: "#f9fafb", borderRadius: "10px", padding: "16px 20px",
          border: "1px solid #e5e7eb", textAlign: "center",
        }}>
          <p style={{ margin: 0, fontSize: "13px", color: "#9ca3af" }}>
            Can't find what you're looking for?{" "}
            <a href="mailto:kfintech@gmail.com?subject=Support Query — KfinFund"
              style={{ color: "#6C3AED", fontWeight: "600", textDecoration: "none" }}>
              Email us directly
            </a>{" "}
            and our team will get back to you promptly.
          </p>
        </div>

      </div>
    </DashboardLayout>
  );
}