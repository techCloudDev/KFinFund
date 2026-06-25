import React, { useState } from 'react';
import '../Kyc.css'; 

const KycForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    pan_number: '',
    full_name: '',
    kyc_photo: null,
    kyc_signature: null,
    aadhaar_number: '',
    address: '',
    bank_account_number: '',
    ifsc_code: '',
    income_bracket: '',
    pep_status: 'false',
    terms_accepted: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  // Step Validation Helper
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.full_name.trim()) {
          alert("Please enter your Full Legal Name.");
          return false;
        }
        if (!formData.pan_number.trim()) {
          alert("Please enter your PAN Number.");
          return false;
        }
        return true;

      case 2:
        if (!formData.kyc_photo) {
          alert("Please upload your Live Selfie / Profile Photo.");
          return false;
        }
        if (!formData.kyc_signature) {
          alert("Please upload your Live Signature.");
          return false;
        }
        return true;

      case 3:
        if (!formData.aadhaar_number.trim() || formData.aadhaar_number.length !== 12) {
          alert("Please enter a valid 12-digit Aadhaar Card Number.");
          return false;
        }
        if (!formData.address.trim()) {
          alert("Please enter your Permanent Address.");
          return false;
        }
        return true;

      case 4:
        if (!formData.bank_account_number.trim()) {
          alert("Please enter your Bank Account Number.");
          return false;
        }
        if (!formData.ifsc_code.trim()) {
          alert("Please enter your IFSC Code.");
          return false;
        }
        if (!formData.income_bracket) {
          alert("Please select your Annual Income Bracket.");
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const nextStep = () => {
    // Only allow proceeding if current step passes validation
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };
  
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check for final terms acceptance
    if (!formData.terms_accepted) {
      alert("Please check the declaration box to sign off.");
      return;
    }

    const dataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      // Use [Aadhaar Redacted] for the ID field if needed in your form data
      if (key !== 'kyc_photo' && key !== 'kyc_signature') {
        dataToSend.append(key, formData[key]);
      }
    });
    
    if (formData.kyc_photo) dataToSend.append('kyc_photo', formData.kyc_photo);
    if (formData.kyc_signature) dataToSend.append('kyc_signature', formData.kyc_signature);

    try {
      const response = await fetch('http://localhost:3002/api/kyc', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: dataToSend
      });

      const result = await response.json();

      if (response.ok) {
        alert('KYC Verification uploaded successfully!');
      } else {
        // ERROR ALERT: Triggered when server rejects the submission
        alert(`Submission Failed: ${result.message || 'Please check your information and try again.'}`);
      }
    } catch (error) {
      // ERROR ALERT: Triggered on network failure
      console.error("Submission Error:", error);
      alert('Unable to connect to the server. Please check your internet connection and try again later.');
    }
  };

  return (
    <div className="auth-card">
      <h2 className="auth-title" style={{ marginBottom: '10px' }}>KYC Core Engine</h2>
      <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
        Complete compliance profiling to unlock validation status.
      </p>

      <div className="step-line">
        {[1, 2, 3, 4, 5].map((step) => (
          <div 
            key={step} 
            className={`step-circle ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'done' : ''}`}
          >
            {currentStep > step ? '✓' : step}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        
        {/* Step 1: Identity */}
        {currentStep === 1 && (
          <>
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#111827' }}>Step 1: Identity Verification</h4>
            <div className="form-group">
              <label>Full Legal Name (as per PAN)</label>
              <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>PAN Number</label>
              <input type="text" name="pan_number" value={formData.pan_number} onChange={handleChange} required className="uppercase" placeholder="ABCDE1234F" />
            </div>
          </>
        )}

        {/* Step 2: Attachments */}
        {currentStep === 2 && (
          <>
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#111827' }}>Step 2: Document Uploads</h4>
            <div className="form-group">
              <label>Live Selfie / Profile Photo</label>
              <input type="file" name="kyc_photo" accept="image/*" onChange={handleFileChange} required style={{ padding: '10px', height: 'auto' }} />
            </div>
            <div className="form-group">
              <label>Live Signature Upload (on white paper)</label>
              <input type="file" name="kyc_signature" accept="image/*" onChange={handleFileChange} required style={{ padding: '10px', height: 'auto' }} />
            </div>
          </>
        )}

        {/* Step 3: Address */}
        {currentStep === 3 && (
          <>
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#111827' }}>Step 3: Address Verification</h4>
            <div className="form-group">
              <label>Aadhaar Card Number</label>
              <input type="text" name="aadhaar_number" value={formData.aadhaar_number} onChange={handleChange} required maxLength={12} placeholder="12-digit number" />
            </div>
            <div className="form-group">
              <label>Permanent Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} required placeholder="Enter full address" />
            </div>
          </>
        )}

        {/* Step 4: Financial Profile */}
        {currentStep === 4 && (
          <>
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#111827' }}>Step 4: Financial Mapping</h4>
            <div className="form-group">
              <label>Bank Account Number</label>
              <input type="text" name="bank_account_number" value={formData.bank_account_number} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>IFSC Code</label>
              <input type="text" name="ifsc_code" value={formData.ifsc_code} onChange={handleChange} required className="uppercase" placeholder="SBIN0001234" />
            </div>
            <div className="form-group">
              <label>Annual Income Bracket</label>
              <select name="income_bracket" value={formData.income_bracket} onChange={handleChange} required>
                <option value="">Select Bracket</option>
                <option value="1-5 Lakhs">1-5 Lakhs</option>
                <option value="5-10 Lakhs">5-10 Lakhs</option>
                <option value="10-25 Lakhs">10-25 Lakhs</option>
                <option value="25+ Lakhs">25+ Lakhs</option>
              </select>
            </div>
            <div className="form-group">
              <label>Politically Exposed Person (PEP) Status</label>
              <select name="pep_status" value={formData.pep_status} onChange={handleChange}>
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
          </>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
          <>
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#111827' }}>Step 5: Review & Confirm</h4>
            <div className="review-box">
              <div className="review-line"><span>Legal Name:</span> <strong>{formData.full_name}</strong></div>
              <div className="review-line"><span>PAN Number:</span> <strong>{formData.pan_number.toUpperCase()}</strong></div>
              <div className="review-line"><span>Aadhaar:</span> <strong>[Stored Securely]</strong></div>
              <div className="review-line"><span>Bank Route:</span> <strong>{formData.ifsc_code.toUpperCase()}</strong></div>
            </div>

            <div className="terms-row">
              <input type="checkbox" id="terms_accepted" name="terms_accepted" checked={formData.terms_accepted} onChange={handleChange} />
              <label htmlFor="terms_accepted">I hereby declare that the details furnished above are authentic and correct.</label>
            </div>
          </>
        )}

        {/* Action Button Control Rows */}
        {currentStep === 1 ? (
          <div className="button-row first-step-btn">
            <button type="button" onClick={nextStep}>Continue</button>
          </div>
        ) : (
          <div className="button-row">
            <button type="button" className="secondary-btn" onClick={prevStep}>Back</button>
            {currentStep < 5 ? (
              <button type="button" onClick={nextStep}>Continue</button>
            ) : (
              <button type="submit">Submit KYC</button>
            )}
          </div>
        )}

      </form>
    </div>
  );
};

export default KycForm;