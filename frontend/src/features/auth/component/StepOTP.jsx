import { useState, useEffect } from "react";

function StepOTP({ formData, updateData, nextStep, prevStep }) {
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown === 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendOTP = () => {
    if (!formData.phone || formData.phone.length !== 10) {
      alert("Please enter a valid 10 digit mobile number");
      return;
    }

    alert("OTP sent successfully. Use demo OTP: 123456");
    updateData({ otp: "" }); // Clear previously entered OTP
    setCooldown(30); // Start 30 seconds cooldown
  };

  const handleResend = () => {
    if (cooldown > 0) return;
    handleSendOTP();
  };

  const handleNext = () => {
    if (!formData.otp || formData.otp.length !== 6) {
      alert("Please enter 6 digit OTP");
      return;
    }

    if (formData.otp !== "123456") {
      alert("Invalid OTP. Use demo OTP: 123456");
      return;
    }

    nextStep();
  };

  const handleOtpChange = (value, index) => {
    const otpArray = Array.from({ length: 6 }, (_, i) => formData.otp[i] || "");
    otpArray[index] = value.replace(/\D/g, "");
    const newOtp = otpArray.join("");
    updateData({ otp: newOtp });

    const nextInput = document.getElementById(`otp-${index + 1}`);
    if (value && nextInput) {
      nextInput.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      const otpArray = Array.from({ length: 6 }, (_, i) => formData.otp[i] || "");
      if (!otpArray[index] && index > 0) {
        otpArray[index - 1] = "";
        updateData({ otp: otpArray.join("") });
        const prevInput = document.getElementById(`otp-${index - 1}`);
        if (prevInput) {
          prevInput.focus();
        }
      }
    }
  };

  return (
    <>
      <div className="form-group">
        <label>Mobile Number</label>

        <div className="mobile-wrapper">
          <div className="country-select">+91</div>

          <input
            type="tel"
            placeholder="Enter mobile number"
            value={formData.phone}
            maxLength="10"
            onChange={(e) =>
              updateData({ phone: e.target.value.replace(/\D/g, "") })
            }
          />
        </div>
      </div>

      <button type="button" className="send-otp-btn" onClick={handleSendOTP}>
        Send OTP
      </button>

      <div className="otp-block">
        <label>Enter OTP</label>

        <div className="otp-boxes">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength="1"
              value={formData.otp[index] || ""}
              onChange={(e) => handleOtpChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            />
          ))}
        </div>
      </div>

      <p className="resend-text">
        Didn&apos;t receive OTP?{" "}
        {cooldown > 0 ? (
          <span style={{ color: "#9ca3af", cursor: "not-allowed", fontWeight: 600 }}>
            Resend in {cooldown}s
          </span>
        ) : (
          <span onClick={handleResend} style={{ cursor: "pointer" }}>
            Resend
          </span>
        )}
      </p>

      <div className="button-row">
        <button className="secondary-btn" type="button" onClick={prevStep}>
          ← Back
        </button>

        <button type="button" onClick={handleNext}>
          Next →
        </button>
      </div>
    </>
  );
}

export default StepOTP;