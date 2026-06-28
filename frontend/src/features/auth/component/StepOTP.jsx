import { useState, useEffect } from "react";

function StepOTP({ formData, updateData, nextStep, prevStep }) {
  const [cooldown, setCooldown] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [sendMsg, setSendMsg] = useState("");

  useEffect(() => {
    if (cooldown === 0) return;
    const timer = setInterval(() => setCooldown(p => p - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendOTP = () => {
    if (!formData.phone || formData.phone.length !== 10) {
      setSendMsg("❌ Please enter a valid 10-digit mobile number.");
      return;
    }
    updateData({ otp: "" });
    setCooldown(30);
    setOtpSent(true);
    setOtpError("");
    setSendMsg(`✅ OTP sent to +91 ${formData.phone}. Use demo OTP: 123456`);
  };

  const handleNext = () => {
    if (!otpSent) { setOtpError("Please send OTP first."); return; }
    if (!formData.otp || formData.otp.length !== 6) { setOtpError("Please enter the 6-digit OTP."); return; }
    if (formData.otp !== "123456") { setOtpError("Invalid OTP. Use demo OTP: 123456"); return; }
    setOtpError("");
    nextStep();
  };

  const handleOtpChange = (value, index) => {
    setOtpError("");
    const otpArray = Array.from({ length: 6 }, (_, i) => formData.otp[i] || "");
    otpArray[index] = value.replace(/\D/g, "");
    updateData({ otp: otpArray.join("") });
    if (value) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      const otpArray = Array.from({ length: 6 }, (_, i) => formData.otp[i] || "");
      if (!otpArray[index] && index > 0) {
        otpArray[index - 1] = "";
        updateData({ otp: otpArray.join("") });
        document.getElementById(`otp-${index - 1}`)?.focus();
      }
    }
  };

  return (
    <>
      <div className="form-group">
        <label>Mobile Number</label>
        <div className="mobile-wrapper">
          <div className="country-select">+91</div>
          <input type="tel" placeholder="Enter mobile number"
            value={formData.phone} maxLength="10"
            onChange={e => { updateData({ phone: e.target.value.replace(/\D/g, "") }); setSendMsg(""); }} />
        </div>
      </div>

      <button type="button" className="send-otp-btn" onClick={handleSendOTP}>
        {otpSent && cooldown > 0 ? `Resend OTP in ${cooldown}s` : otpSent ? "Resend OTP" : "Send OTP"}
      </button>

      {/* Inline send message */}
      {sendMsg && (
        <div style={{ fontSize: "13px", color: sendMsg.startsWith("✅") ? "#15803d" : "#dc2626",
          background: sendMsg.startsWith("✅") ? "#f0fdf4" : "#fef2f2",
          border: `1px solid ${sendMsg.startsWith("✅") ? "#86efac" : "#fecaca"}`,
          borderRadius: "8px", padding: "10px 14px", marginBottom: "12px" }}>
          {sendMsg}
        </div>
      )}

      <div className="otp-block">
        <label>Enter OTP</label>
        <div className="otp-boxes">
          {[0,1,2,3,4,5].map(index => (
            <input key={index} id={`otp-${index}`} type="text" maxLength="1"
              value={formData.otp[index] || ""}
              onChange={e => handleOtpChange(e.target.value, index)}
              onKeyDown={e => handleKeyDown(e, index)}
              style={{ borderColor: otpError ? "#ef4444" : undefined }}
            />
          ))}
        </div>
        {otpError && <div style={{ color: "#dc2626", fontSize: "12px", marginTop: "6px" }}>⚠️ {otpError}</div>}
      </div>

      <p className="resend-text">
        Didn&apos;t receive OTP?{" "}
        {cooldown > 0 ? (
          <span style={{ color: "#9ca3af", cursor: "not-allowed", fontWeight: 600 }}>Resend in {cooldown}s</span>
        ) : (
          <span onClick={handleSendOTP} style={{ cursor: "pointer", color: "#6C3AED", fontWeight: 600 }}>Resend OTP</span>
        )}
      </p>

      <div className="button-row">
        <button className="secondary-btn" type="button" onClick={prevStep}>← Back</button>
        <button type="button" onClick={handleNext}>Next →</button>
      </div>
    </>
  );
}

export default StepOTP;