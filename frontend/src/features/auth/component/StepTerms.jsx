import { useState } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useRef } from "react";

const HCAPTCHA_SITE_KEY = "a5d628f2-bed6-46e2-b0e6-170a6b588aee";

// ── Modal component ──
function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: "16px", maxWidth: "520px", width: "100%",
        maxHeight: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "20px 24px", borderBottom: "1px solid #e5e7eb" }}>
          <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "700", color: "#111827" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer",
            fontSize: "20px", color: "#6b7280", lineHeight: 1 }}>✕</button>
        </div>
        {/* Scrollable content */}
        <div style={{ padding: "20px 24px", overflowY: "auto", fontSize: "14px", color: "#374151", lineHeight: "1.7" }}>
          {children}
        </div>
        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #e5e7eb", textAlign: "right" }}>
          <button onClick={onClose} style={{
            background: "#6C3AED", color: "#fff", border: "none", borderRadius: "8px",
            padding: "10px 24px", fontSize: "14px", fontWeight: "700", cursor: "pointer",
          }}>I Understand</button>
        </div>
      </div>
    </div>
  );
}

const TERMS_CONTENT = (
  <>
    <p><strong>1. Accuracy of Information</strong><br/>Information provided during registration must be accurate, complete, and up to date. Any false information may result in account suspension.</p>
    <p><strong>2. OTP Verification</strong><br/>OTP verification is mandatory for secure account creation. The OTP is valid for 10 minutes only.</p>
    <p><strong>3. KYC Compliance</strong><br/>As per SEBI regulations, KYC verification is mandatory before making any investment. You must complete KYC within 30 days of account creation.</p>
    <p><strong>4. Investment Risk</strong><br/>Mutual fund investments are subject to market risks. Past performance does not guarantee future returns. Please read all scheme related documents carefully.</p>
    <p><strong>5. Account Security</strong><br/>You are responsible for maintaining the confidentiality of your account credentials. Notify us immediately of any unauthorized access.</p>
    <p><strong>6. Termination</strong><br/>KFinFund reserves the right to terminate accounts that violate these terms without prior notice.</p>
  </>
);

const PRIVACY_CONTENT = (
  <>
    <p><strong>1. Data Collection</strong><br/>We collect personal information including name, email, phone number, and financial details solely for account management and KYC verification purposes.</p>
    <p><strong>2. Data Usage</strong><br/>Your information is used to provide investment services, send transaction alerts, and comply with regulatory requirements (SEBI, RBI).</p>
    <p><strong>3. Third-Party Sharing</strong><br/>User information will not be shared with unauthorized third parties. We may share data with SEBI-registered entities and payment gateways as required.</p>
    <p><strong>4. Data Security</strong><br/>Sensitive data including passwords and bank details are encrypted using industry-standard AES-256 encryption and stored securely.</p>
    <p><strong>5. OTP & Activity Logs</strong><br/>OTP verification records and activity logs are maintained for up to 90 days for security and audit purposes.</p>
    <p><strong>6. Your Rights</strong><br/>You have the right to request access, correction, or deletion of your personal data by contacting kfintech@gmail.com.</p>
  </>
);

function StepTerms({ formData, updateData, nextStep, prevStep, loading }) {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const captchaRef = useRef(null);

  const allChecked = formData.terms && formData.privacy && (captchaToken || formData.captcha);

  const handleSubmit = () => {
    if (!formData.terms) { alert("Please accept the Terms & Conditions."); return; }
    if (!formData.privacy) { alert("Please accept the Privacy Policy."); return; }
    if (!captchaToken && !formData.captcha) { alert("Please complete the captcha verification."); return; }
    nextStep();
  };

  return (
    <>
      {/* Modals */}
      {showTerms && <Modal title="Terms & Conditions" onClose={() => setShowTerms(false)}>{TERMS_CONTENT}</Modal>}
      {showPrivacy && <Modal title="Privacy Policy" onClose={() => setShowPrivacy(false)}>{PRIVACY_CONTENT}</Modal>}

      {/* Review box */}
      <div className="review-box">
        {[
          ["Full Name", formData.fullName],
          ["Email", formData.email],
          ["Mobile Number", `+91 ${formData.phone}`],
          ["State", formData.state],
          ["City", formData.city],
        ].map(([label, value]) => (
          <div className="review-line" key={label}>
            <span>{label}:</span>
            <strong>{value || "—"}</strong>
          </div>
        ))}
      </div>

      {/* Terms checkbox with clickable link */}
      <div className="terms-row" style={{ alignItems: "flex-start", gap: "10px", marginBottom: "12px" }}>
        <input type="checkbox" id="terms-check" checked={formData.terms}
          onChange={e => updateData({ terms: e.target.checked })}
          style={{ marginTop: "2px", accentColor: "#6C3AED", width: "16px", height: "16px", flexShrink: 0 }} />
        <label htmlFor="terms-check" style={{ fontSize: "14px", color: "#374151", lineHeight: "1.5", cursor: "pointer" }}>
          I agree to the{" "}
          <button type="button" onClick={() => setShowTerms(true)}
            style={{ background: "none", border: "none", color: "#6C3AED", fontWeight: "700",
              cursor: "pointer", padding: 0, fontSize: "14px", textDecoration: "underline", fontFamily: "inherit" }}>
            Terms & Conditions
          </button>
        </label>
      </div>

      {/* Privacy checkbox with clickable link */}
      <div className="terms-row" style={{ alignItems: "flex-start", gap: "10px", marginBottom: "20px" }}>
        <input type="checkbox" id="privacy-check" checked={formData.privacy}
          onChange={e => updateData({ privacy: e.target.checked })}
          style={{ marginTop: "2px", accentColor: "#6C3AED", width: "16px", height: "16px", flexShrink: 0 }} />
        <label htmlFor="privacy-check" style={{ fontSize: "14px", color: "#374151", lineHeight: "1.5", cursor: "pointer" }}>
          I agree to the{" "}
          <button type="button" onClick={() => setShowPrivacy(true)}
            style={{ background: "none", border: "none", color: "#6C3AED", fontWeight: "700",
              cursor: "pointer", padding: 0, fontSize: "14px", textDecoration: "underline", fontFamily: "inherit" }}>
            Privacy Policy
          </button>
        </label>
      </div>

      {/* hCaptcha */}
      <div style={{ marginBottom: "20px" }}>
        <HCaptcha
          ref={captchaRef}
          sitekey={HCAPTCHA_SITE_KEY}
          onVerify={token => { setCaptchaToken(token); updateData({ captcha: true }); }}
          onExpire={() => { setCaptchaToken(""); updateData({ captcha: false }); }}
        />
      </div>

      <div className="button-row">
        <button className="secondary-btn" type="button" onClick={prevStep}>← Back</button>
        <button type="button" onClick={handleSubmit}
          disabled={!allChecked || loading}
          className={!allChecked || loading ? "disabled-btn" : ""}>
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </div>
    </>
  );
}

export default StepTerms;