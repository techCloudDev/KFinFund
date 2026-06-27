function StepPersonal({ formData, updateData, nextStep }) {
  const states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Odisha",
    "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh",
    "Uttarakhand", "West Bengal",
  ].sort();

  const handleNext = () => {
    if (!formData.fullName) { alert("Please enter your full name"); return; }
    if (!formData.email) { alert("Please enter your email"); return; }
    if (!formData.email.includes("@")) { alert("Please enter a valid email"); return; }
    if (!formData.state) { alert("Please select your state"); return; }
    if (!formData.city) { alert("Please enter your city"); return; }
    nextStep();
  };

  return (
    <>
      <div className="form-group">
        <label>Full Name</label>
        <input
          type="text"
          placeholder="Enter your full name"
          value={formData.fullName}
          onChange={(e) => updateData({ fullName: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => updateData({ email: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>State</label>
        <select
          value={formData.state}
          onChange={(e) => updateData({ state: e.target.value, city: "" })}
        >
          <option value="">Select State</option>
          {states.map((state) => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>City</label>
        <input
          type="text"
          placeholder={formData.state ? "Enter your city" : "Select state first"}
          value={formData.city}
          disabled={!formData.state}
          onChange={(e) => updateData({ city: e.target.value })}
        />
      </div>

      <div className="button-row first-step-btn">
        <button type="button" onClick={handleNext}>
          Next →
        </button>
      </div>
    </>
  );
}

export default StepPersonal;