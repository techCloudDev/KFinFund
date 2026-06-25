import ProfileLayout from "./ProfileLayout";

export default function BasicDetails() {
  const details = [
    { label: "Full Name", value: "Suman Rout" },
    { label: "Date of Birth", value: "**/**/7" },
    { label: "Mobile Number", value: "*******544" },
    { label: "Email Address", value: "bha*********4@gmail.com" },
    { label: "Marital Status", value: "Unmarried" },
    { label: "Gender", value: "Male" },
    { label: "Income Range", value: "Below 1 Lac" },
    { label: "Occupation", value: "Student" },
    { label: "Father's Name", value: "Bhaskar Rout" },
    { label: "Address", value: "Bhubaneswar, Odisha" }
  ];

  return (
    <ProfileLayout pageTitle="Personal Details">
      <div className="mf-detail-card">
        <h2 className="mf-detail-card-title">Personal Details</h2>
        <p className="mf-detail-card-subtitle">Verify your identity and personal records below.</p>

        <div className="mf-details-grid">
          {details.map((item, idx) => (
            <div key={idx} className="mf-detail-item">
              <span className="mf-detail-label">{item.label}</span>
              <span className={`mf-detail-value ${!item.value ? "empty" : ""}`}>
                {item.value || "Not Provided"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </ProfileLayout>
  );
}
