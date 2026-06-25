function StepTerms({ formData, updateData, nextStep, prevStep }) {
  const allChecked = formData.terms && formData.privacy && formData.captcha;

  const handleSubmit = () => {
    if (!allChecked) {
      alert("Please accept all confirmations before creating account");
      return;
    }

    nextStep();
  };

  return (
    <>
      <div className="review-box">
        <div className="review-line">
          <span>Full Name:</span>
          <strong>{formData.fullName}</strong>
        </div>

        <div className="review-line">
          <span>Email:</span>
          <strong>{formData.email}</strong>
        </div>

        <div className="review-line">
          <span>Mobile Number:</span>
          <strong>+91 {formData.phone}</strong>
        </div>

        <div className="review-line">
          <span>State:</span>
          <strong>{formData.state}</strong>
        </div>

        <div className="review-line">
          <span>City:</span>
          <strong>{formData.city}</strong>
        </div>
      </div>

      <div className="terms-box">
  <h4>Terms & Conditions</h4>
  <p>1. Information provided must be accurate and up to date.</p>
  <p>2. OTP verification is mandatory for secure account creation.</p>
  <p>3. KYC verification is mandatory before investment.</p>
  <p>4. Mutual fund investments are subject to market risks.</p>

  <h4 className="privacy-heading">Privacy Policy</h4>
  <p>1. Personal information will be used only for account management and KYC verification.</p>
  <p>2. User information will not be shared with unauthorized third parties.</p>
  <p>3. Sensitive data will be encrypted and securely stored.</p>
  <p>4. OTP verification and activity logs may be maintained for security.</p>
</div>
      <div className="terms-row">
        <input
          type="checkbox"
          checked={formData.terms}
          onChange={(e) => updateData({ terms: e.target.checked })}
        />
        <label>I agree to Terms & Conditions</label>
      </div>

      <div className="terms-row">
        <input
          type="checkbox"
          checked={formData.privacy}
          onChange={(e) => updateData({ privacy: e.target.checked })}
        />
        <label>I agree to Privacy Policy</label>
      </div>

      <div className="captcha-box">
        <input
          type="checkbox"
          checked={formData.captcha}
          onChange={(e) => updateData({ captcha: e.target.checked })}
        />
        <span>I'm not a robot</span>
      </div>

      <div className="button-row">
        <button className="secondary-btn" type="button" onClick={prevStep}>
          ← Back
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!allChecked}
          className={!allChecked ? "disabled-btn" : ""}
        >
          Create Account
        </button>
      </div>
    </>
  );
}

export default StepTerms;