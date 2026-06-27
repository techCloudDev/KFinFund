import { useState } from "react";
import StepPersonal from "../component/StepPersonal";
import StepPassword from "../component/StepPassword";
import StepOTP from "../component/StepOTP";
import StepTerms from "../component/StepTerms";
import Success from "../component/Success";
import "../auth.css";

const USER_SERVICE_URL = import.meta.env.VITE_USER_API || "http://localhost:4001";

function Register() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${USER_SERVICE_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep(5);
      } else {
        setError(data.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {step <= 4 && (
          <>
            <div className="login-logo-box">
              <img src="/logo.png" alt="KFinFund Logo" className="login-logo" />
            </div>
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

        {error && (
          <p style={{ color: "red", fontSize: "13px", marginBottom: "10px" }}>
            {error}
          </p>
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
            nextStep={handleSubmit}
            prevStep={() => setStep(3)}
            loading={loading}
          />
        )}
        {step === 5 && <Success />}
      </div>
    </div>
  );
}

export default Register;