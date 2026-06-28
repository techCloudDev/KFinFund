import { useState } from "react";

function StepPersonal({ formData, updateData, nextStep }) {
  const states = [
    "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
    "Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand",
    "Karnataka","Kerala","Madhya Pradesh","Maharashtra","Odisha",
    "Punjab","Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh",
    "Uttarakhand","West Bengal",
  ].sort();

  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!formData.firstName?.trim()) e.firstName = "First name is required.";
    if (!formData.lastName?.trim()) e.lastName = "Last name is required.";
    if (!formData.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "Enter a valid email address.";
    if (!formData.state) e.state = "Please select your state.";
    if (!formData.city.trim()) e.city = "City is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      // ✅ Combine first + last name into fullName before moving to next step
      updateData({ fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}` });
      nextStep();
    }
  };

  const inputStyle = (key) => ({
    height: "48px", width: "100%", boxSizing: "border-box",
    border: `1.5px solid ${errors[key] ? "#ef4444" : "#e5e7eb"}`,
    borderRadius: "10px", padding: "0 14px", fontSize: "14px",
    outline: "none", color: "#111827", background: "#fff",
    fontFamily: "inherit",
  });

  return (
    <>
      {/* ✅ First Name + Last Name side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div className="form-group">
          <label>First Name</label>
          <input type="text" style={inputStyle("firstName")} placeholder="Enter first name"
            value={formData.firstName || ""}
            onChange={e => { updateData({ firstName: e.target.value }); setErrors(p => ({ ...p, firstName: "" })); }} />
          {errors.firstName && <span style={{ color: "#ef4444", fontSize: "12px" }}>{errors.firstName}</span>}
        </div>

        <div className="form-group">
          <label>Last Name</label>
          <input type="text" style={inputStyle("lastName")} placeholder="Enter last name"
            value={formData.lastName || ""}
            onChange={e => { updateData({ lastName: e.target.value }); setErrors(p => ({ ...p, lastName: "" })); }} />
          {errors.lastName && <span style={{ color: "#ef4444", fontSize: "12px" }}>{errors.lastName}</span>}
        </div>
      </div>

      <div className="form-group">
        <label>Email</label>
        <input type="email" style={inputStyle("email")} placeholder="Enter your email"
          value={formData.email}
          onChange={e => { updateData({ email: e.target.value }); setErrors(p => ({ ...p, email: "" })); }} />
        {errors.email && <span style={{ color: "#ef4444", fontSize: "12px" }}>{errors.email}</span>}
      </div>

      <div className="form-group">
        <label>State</label>
        <select style={{ ...inputStyle("state"), cursor: "pointer" }}
          value={formData.state}
          onChange={e => { updateData({ state: e.target.value, city: "" }); setErrors(p => ({ ...p, state: "" })); }}>
          <option value="">Select State</option>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {errors.state && <span style={{ color: "#ef4444", fontSize: "12px" }}>{errors.state}</span>}
      </div>

      <div className="form-group">
        <label>City</label>
        <input type="text" style={inputStyle("city")}
          placeholder={formData.state ? "Enter your city" : "Select state first"}
          value={formData.city} disabled={!formData.state}
          onChange={e => { updateData({ city: e.target.value }); setErrors(p => ({ ...p, city: "" })); }} />
        {errors.city && <span style={{ color: "#ef4444", fontSize: "12px" }}>{errors.city}</span>}
      </div>

      <div className="button-row first-step-btn">
        <button type="button" onClick={handleNext}>Next →</button>
      </div>
    </>
  );
}

export default StepPersonal;