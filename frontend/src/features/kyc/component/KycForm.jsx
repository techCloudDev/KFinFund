import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../Kyc.css';

const KycForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [panError, setPanError] = useState('');
  const [bankAccountError, setBankAccountError] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const videoRefCallback = (node) => {
    if (node && streamRef.current) {
      node.srcObject = streamRef.current;
    }
    videoRef.current = node;
  };

  const [formData, setFormData] = useState({
    pan_number: '',
    full_name: '',
    fathers_name: '',
    gender: '',
    occupation: '',
    marital_status: '',
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
    let processedValue = type === 'checkbox' ? checked : value;

    if (name === 'pan_number' || name === 'ifsc_code') {
      processedValue = value.toUpperCase();
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    if (name === 'pan_number') {
      const trimmedValue = value.trim().toUpperCase();
      if (trimmedValue === '') {
        setPanError('');
      } else {
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (!panRegex.test(trimmedValue)) {
          setPanError('Invalid PAN format (expected structure: ABCDE1234F)');
        } else {
          setPanError('');
        }
      }
    }

    if (name === 'bank_account_number') {
      const val = value.trim();
      if (val === '') {
        setBankAccountError('');
      } else if (!/^\d+$/.test(val)) {
        setBankAccountError('Bank Account Number must contain digits only.');
      } else if (val.length < 9 || val.length > 18) {
        setBankAccountError(`Bank Account Number must be between 9 and 18 digits (current length: ${val.length}).`);
      } else {
        setBankAccountError('');
      }
    }
  };

  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      streamRef.current = stream;
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access camera. Please check permissions or upload a file.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
          setFormData(prev => ({ ...prev, kyc_photo: file }));
          setPhotoPreviewUrl(URL.createObjectURL(blob));
          stopCamera();
        }
      }, 'image/jpeg');
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
      if (name === 'kyc_photo') {
        setPhotoPreviewUrl(URL.createObjectURL(files[0]));
        stopCamera();
      }
    }
  };

  useEffect(() => {
    if (currentStep !== 3) {
      stopCamera();
    }
  }, [currentStep]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Step Validation Helper
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.full_name.trim()) {
          alert("Please enter your Full Legal Name.");
          return false;
        }
        if (!formData.fathers_name.trim()) {
          alert("Please enter your Father's Name.");
          return false;
        }
        if (!formData.pan_number.trim()) {
          alert("Please enter your PAN Number.");
          return false;
        }
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (!panRegex.test(formData.pan_number.trim().toUpperCase())) {
          alert("Please enter a valid 10-digit PAN Number (e.g. ABCDE1234F) based on actual PAN structure.");
          return false;
        }
        return true;

      case 2:
        if (!formData.fathers_name.trim()) {
          alert("Please enter your Father's Name.");
          return false;
        }
        if (!formData.gender) {
          alert("Please select your Gender.");
          return false;
        }
        if (!formData.occupation.trim()) {
          alert("Please select or enter your Occupation.");
          return false;
        }
        if (!formData.marital_status) {
          alert("Please select your Marital Status.");
          return false;
        }
        return true;

      case 3: // Selfie & signature uploads (old step 2)
        if (!formData.kyc_photo) {
          alert("Please upload or capture your Live Selfie / Profile Photo.");
          return false;
        }
        if (!formData.kyc_signature) {
          alert("Please upload your Live Signature.");
          return false;
        }
        return true;

      case 4: // Address (old step 3)
        if (!formData.aadhaar_number.trim() || formData.aadhaar_number.length !== 12) {
          alert("Please enter a valid 12-digit Aadhaar Card Number.");
          return false;
        }
        if (!formData.address.trim()) {
          alert("Please enter your Permanent Address.");
          return false;
        }
        return true;

      case 5: // Financial (old step 4)
        const bankAcc = formData.bank_account_number.trim();
        if (!bankAcc) {
          alert("Please enter your Bank Account Number.");
          return false;
        }
        if (!/^\d+$/.test(bankAcc)) {
          alert("Bank Account Number must contain digits only.");
          return false;
        }
        if (bankAcc.length < 9 || bankAcc.length > 18) {
          alert(`Bank Account Number must be between 9 and 18 digits (current length: ${bankAcc.length}).`);
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
      setCurrentStep(prev => Math.min(prev + 1, 6));
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
    <div className="auth-card" style={{ width: '480px', maxWidth: '480px', height: '720px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <Link to="/">
            <img src="/logo.png" alt="KFinFund Logo" style={{ height: '36px', cursor: 'pointer' }} />
          </Link>
        </div>
        <h2 className="auth-title" style={{ marginBottom: '10px' }}>KYC Details</h2>
        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
          Complete KYC details to unlock further features.
        </p>

        <div className="step-line">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div
              key={step}
              className={`step-circle ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'done' : ''}`}
            >
              {currentStep > step ? '✓' : step}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', minHeight: '0', marginTop: '10px' }}>
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px', marginBottom: '15px' }}>
          
          {/* Step 1: Identity */}
          {currentStep === 1 && (
            <>
              <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#111827' }}>Step 1: Identity Verification</h4>
              <div className="form-group">
                <label>Full Legal Name (as per PAN)</label>
                <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Father's Name</label>
                <input type="text" name="fathers_name" value={formData.fathers_name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>PAN Number</label>
                <input
                  type="text"
                  name="pan_number"
                  value={formData.pan_number}
                  onChange={handleChange}
                  required
                  maxLength={10}
                  className="uppercase"
                  placeholder="ABCDE1234F"
                />
                {panError && (
                  <span className="error-message" style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {panError}
                  </span>
                )}
              </div>
            </>
          )}

          {/* Step 2: Personal Profile */}
          {currentStep === 2 && (
            <>
              <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#111827' }}>Step 2: Personal Profile</h4>
              <div className="form-group">
                <label>Father's Name</label>
                <input type="text" name="fathers_name" value={formData.fathers_name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} required>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Occupation</label>
                <select name="occupation" value={formData.occupation} onChange={handleChange} required>
                  <option value="">Select Occupation</option>
                  <option value="Salaried">Salaried</option>
                  <option value="Self-Employed">Self-Employed</option>
                  <option value="Business">Business</option>
                  <option value="Professional">Professional</option>
                  <option value="Retired">Retired</option>
                  <option value="Housewife">Housewife</option>
                  <option value="Student">Student</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              <div className="form-group">
                <label>Marital Status</label>
                <select name="marital_status" value={formData.marital_status} onChange={handleChange} required>
                  <option value="">Select Marital Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
            </>
          )}

          {/* Step 3: Document Uploads */}
          {currentStep === 3 && (
            <>
              <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#111827' }}>Step 3: Document Uploads</h4>
              
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>Live Selfie / Profile Photo</label>
                
                {/* Webcam/Preview view container */}
                <div style={{
                  border: '1px solid #ddd',
                  borderRadius: '12px',
                  padding: '16px',
                  background: '#f9fafb',
                  textAlign: 'center',
                  marginBottom: '12px'
                }}>
                  {photoPreviewUrl ? (
                    <div>
                      <img
                        src={photoPreviewUrl}
                        alt="Selfie Preview"
                        style={{
                          width: '180px',
                          height: '180px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '3px solid #5521d9',
                          display: 'block',
                          margin: '0 auto 12px'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button
                          type="button"
                          onClick={startCamera}
                          style={{
                            background: '#5521d9',
                            color: '#fff',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '13px'
                          }}
                        >
                          Retake Photo
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoPreviewUrl('');
                            setFormData(prev => ({ ...prev, kyc_photo: null }));
                          }}
                          style={{
                            background: '#ef4444',
                            color: '#fff',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '13px'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : isCameraActive ? (
                    <div>
                      <video
                        ref={videoRefCallback}
                        autoPlay
                        playsInline
                        style={{
                          width: '100%',
                          maxWidth: '320px',
                          height: '240px',
                          borderRadius: '12px',
                          background: '#000',
                          display: 'block',
                          margin: '0 auto 12px',
                          transform: 'scaleX(-1)' // Mirror view for natural interaction
                        }}
                      />
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button
                          type="button"
                          onClick={capturePhoto}
                          style={{
                            background: '#10b981',
                            color: '#fff',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '13px'
                          }}
                        >
                          Capture Snapshot
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          style={{
                            background: '#6b7280',
                            color: '#fff',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '13px'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '12px 0' }}>
                      <p style={{ margin: '0 0 12px', fontSize: '14px', color: '#4b5563' }}>
                        Capture a live selfie from your webcam or upload an image file.
                      </p>
                      <button
                        type="button"
                        onClick={startCamera}
                        style={{
                          background: '#5521d9',
                          color: '#fff',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '14px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginBottom: '8px'
                        }}
                      >
                        📸 Open Webcam
                      </button>
                      {cameraError && (
                        <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0' }}>{cameraError}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Standard file input fallback */}
                {!isCameraActive && (
                  <div style={{ marginTop: '8px' }}>
                    <label style={{ fontSize: '13px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                      {photoPreviewUrl ? 'Or upload a different file:' : 'Or upload a file directly:'}
                    </label>
                    <input
                      type="file"
                      name="kyc_photo"
                      accept="image/*"
                      onChange={handleFileChange}
                      required={!formData.kyc_photo}
                      style={{ padding: '8px', height: 'auto', fontSize: '13px' }}
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Live Signature Upload (on white paper)</label>
                <input type="file" name="kyc_signature" accept="image/*" onChange={handleFileChange} required={!formData.kyc_signature} style={{ padding: '10px', height: 'auto' }} />
              </div>
            </>
          )}

          {/* Step 4: Address */}
          {currentStep === 4 && (
            <>
              <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#111827' }}>Step 4: Address Verification</h4>
              <div className="form-group">
                <label>Aadhaar Card Number</label>
                <input type="text" name="aadhaar_number" value={formData.aadhaar_number} onChange={handleChange} required maxLength={12} placeholder="XXXX-XXXX-XXXX" />
              </div>
              <div className="form-group">
                <label>Permanent Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} required placeholder="Enter full address" />
              </div>
            </>
          )}

          {/* Step 5: Financial Profile */}
          {currentStep === 5 && (
            <>
              <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#111827' }}>Step 5: Financial Mapping</h4>
              <div className="form-group">
                <label>Bank Account Number</label>
                <input 
                  type="text" 
                  name="bank_account_number" 
                  value={formData.bank_account_number} 
                  onChange={handleChange} 
                  required 
                  minLength={9}
                  maxLength={18}
                />
                {bankAccountError && (
                  <span className="error-message" style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {bankAccountError}
                  </span>
                )}
              </div>
              <div className="form-group">
                <label>IFSC Code</label>
                <input type="text" name="ifsc_code" value={formData.ifsc_code} onChange={handleChange} required className="uppercase" placeholder="SBIN0001234" />
              </div>
              <div className="form-group">
                <label>Annual Income Bracket</label>
                <select name="income_bracket" value={formData.income_bracket} onChange={handleChange} required>
                  <option value="">Select Bracket</option>
                  <option value="Below 1 Lakh">Below 1 Lakh</option>
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

          {/* Step 6: Review */}
          {currentStep === 6 && (
            <>
              <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#111827' }}>Step 6: Review & Confirm</h4>
              <div className="review-box">
                <div className="review-line"><span>Legal Name:</span> <strong>{formData.full_name}</strong></div>
                <div className="review-line"><span>Father's Name:</span> <strong>{formData.fathers_name}</strong></div>
                <div className="review-line"><span>PAN Number:</span> <strong>{formData.pan_number.toUpperCase()}</strong></div>
                <div className="review-line"><span>Gender:</span> <strong>{formData.gender}</strong></div>
                <div className="review-line"><span>Occupation:</span> <strong>{formData.occupation}</strong></div>
                <div className="review-line"><span>Marital Status:</span> <strong>{formData.marital_status}</strong></div>
                <div className="review-line"><span>Aadhaar:</span> <strong>[Stored Securely]</strong></div>
                <div className="review-line"><span>Bank Route:</span> <strong>{formData.ifsc_code.toUpperCase()}</strong></div>
                {photoPreviewUrl && (
                  <div className="review-line" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '16px' }}>
                    <span style={{ marginBottom: '8px' }}>Live Selfie Captured:</span>
                    <img
                      src={photoPreviewUrl}
                      alt="Selfie Review"
                      style={{
                        width: '90px',
                        height: '90px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid #5521d9'
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="terms-row">
                <input type="checkbox" id="terms_accepted" name="terms_accepted" checked={formData.terms_accepted} onChange={handleChange} />
                <label htmlFor="terms_accepted">I hereby declare that the details furnished above are authentic and correct.</label>
              </div>
            </>
          )}

        </div>

        {/* Action Button Control Rows */}
        {currentStep === 1 ? (
          <div className="button-row first-step-btn">
            <button type="button" onClick={nextStep}>Continue</button>
          </div>
        ) : (
          <div className="button-row">
            <button type="button" className="secondary-btn" onClick={prevStep}>Back</button>
            {currentStep < 6 ? (
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