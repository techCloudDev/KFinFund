import { useState } from "react";
import ProfileLayout from "./ProfileLayout";

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setMessage("Please fill in both fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }
    // Simulate successful password update
    setMessage("Password updated successfully!");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <ProfileLayout pageTitle="Change Password">
      <div className="mf-detail-card">
        <h2 className="mf-detail-card-title">Change Password</h2>
        <p className="mf-detail-card-subtitle">Ensure your account is secure by using a strong password.</p>

        {message && (
          <div 
            className="mf-alert-success" 
            style={message.includes("success") ? {} : { backgroundColor: "#FEF2F2", borderColor: "#FCA5A5", color: "#991B1B" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {message.includes("success") ? (
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              ) : (
                <circle cx="12" cy="12" r="10" />
              )}
              {message.includes("success") ? (
                <polyline points="22 4 12 14.01 9 11.01" />
              ) : (
                <>
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </>
              )}
            </svg>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ maxWidth: "480px" }}>
          {/* New Password */}
          <div className="mf-form-group">
            <label className="mf-form-label" htmlFor="new-password">New Password</label>
            <div className="mf-input-wrapper">
              <input
                id="new-password"
                type={showNew ? "text" : "password"}
                className="mf-form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
              <button
                type="button"
                className="mf-eye-button"
                onClick={() => setShowNew(!showNew)}
                aria-label={showNew ? "Hide password" : "Show password"}
              >
                {showNew ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mf-form-group">
            <label className="mf-form-label" htmlFor="confirm-password">Confirm New Password</label>
            <div className="mf-input-wrapper">
              <input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                className="mf-form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                className="mf-eye-button"
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="mf-form-btn">
            Update Password
          </button>
        </form>
      </div>
    </ProfileLayout>
  );
}
