import { useState, useEffect } from "react";
import ProfileLayout from "./ProfileLayout";

const getTokenData = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try { return JSON.parse(atob(token.split(".")[1])); }
  catch { return null; }
};

export default function BasicDetails() {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const tokenData = getTokenData();
    if (tokenData?.email) {
      setUserEmail(tokenData.email);
      setUserName(tokenData.email.split("@")[0]);
    }
  }, []);

  const details = [
    { label: "Username", value: userName || "—" },
    { label: "Email Address", value: userEmail || "—" },
    { label: "Full Name", value: "—" },
    { label: "Date of Birth", value: "—" },
    { label: "Mobile Number", value: "—" },
    { label: "Marital Status", value: "—" },
    { label: "Gender", value: "—" },
    { label: "Income Range", value: "—" },
    { label: "Occupation", value: "—" },
    { label: "Address", value: "—" },
  ];

  return (
    <ProfileLayout pageTitle="Personal Details">
      <div className="mf-detail-card">
        <h2 className="mf-detail-card-title">Personal Details</h2>
        <p className="mf-detail-card-subtitle">Your account information from registration.</p>
        <div className="mf-details-grid">
          {details.map((item, idx) => (
            <div key={idx} className="mf-detail-item">
              <span className="mf-detail-label">{item.label}</span>
              <span className={`mf-detail-value ${item.value === "—" ? "empty" : ""}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </ProfileLayout>
  );
}