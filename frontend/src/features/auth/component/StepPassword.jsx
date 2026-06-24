import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function StepPassword({ formData, updateData, nextStep, prevStep }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const hasMinLength = formData.password.length >= 8;
  const hasCapital = /[A-Z]/.test(formData.password);
  const hasLowercase = /[a-z]/.test(formData.password);
  const hasNumber = /[0-9]/.test(formData.password);
  const hasSpecial = /[!@#$%^&*_-]/.test(formData.password);

  const passwordValid =
    hasMinLength && hasCapital && hasLowercase && hasNumber && hasSpecial;

  const handleNext = () => {
    if (!formData.password || !formData.confirmPassword) {
      alert("Please fill both password fields");
      return;
    }

    if (!passwordValid) {
      alert("Password is not applicable. Please follow all password rules.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Password and Confirm Password do not match");
      return;
    }

    nextStep();
  };

  return (
    <>
      <div className="form-group">
        <label>Password</label>

        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            value={formData.password}
            onChange={(e) => updateData({ password: e.target.value })}
          />

          <span
            className="eye-icon"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
      </div>

      <div className="form-group">
        <label>Confirm Password</label>

        <div className="password-wrapper">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) => updateData({ confirmPassword: e.target.value })}
          />

          <span
            className="eye-icon"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
      </div>

      <div className="password-grey-box">
        <strong>Password must be -</strong>
        <div>• Length: Minimum of 8 characters</div>
        <div>• At least one uppercase letter (A–Z)</div>
        <div>• At least one lowercase letter (a–z)</div>
        <div>• At least one numeric digit (0–9)</div>
        <div>• At least one special character (Ex - ! @ # $ % ^ & * _ -)</div>
      </div>

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

export default StepPassword;