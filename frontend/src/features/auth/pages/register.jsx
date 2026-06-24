import { useState } from "react";
import StepPersonal from "../component/StepPersonal";
import StepPassword from "../component/StepPassword";
import StepOTP from "../component/StepOTP";
import StepTerms from "../component/StepTerms";
import Success from "../component/Success";
import "../auth.css";
function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    state: "",
    city: "",
    password: "",
    confirmPassword: "",
    otp: "",
    terms: false,
    privacy: false,
    captcha: false,
  });

  const updateData = (newData) => {
    setFormData({ ...formData, ...newData });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {step <= 4 && (
          <>
            <div className="step-line">
              {[1, 2, 3, 4].map((num) => (
                <div
                  key={num}
                  className={`step-circle ${
                    step === num ? "active" : step > num ? "done" : ""
                  }`}
                >
                  {step > num ? "✓" : num}
                </div>
              ))}
            </div>

            <h2 className="auth-title">
              {step === 3
                ? "Verify Your Phone"
                : step === 4
                ? "Review Your Details"
                : "Create Your Account"}
            </h2>
          </>
        )}

        {step === 1 && (
          <StepPersonal
            formData={formData}
            updateData={updateData}
            nextStep={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <StepPassword
            formData={formData}
            updateData={updateData}
            nextStep={() => setStep(3)}
            prevStep={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <StepOTP
            formData={formData}
            updateData={updateData}
            nextStep={() => setStep(4)}
            prevStep={() => setStep(2)}
          />
        )}

        {step === 4 && (
          <StepTerms
            formData={formData}
            updateData={updateData}
            nextStep={() => setStep(5)}
            prevStep={() => setStep(3)}
          />
        )}

        {step === 5 && <Success />}
      </div>
    </div>
  );
}

export default Register;