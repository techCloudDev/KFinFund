import React, { useState } from 'react';
import '../kyc.css';

const KycForm = () => {
    const [formData, setFormData] = useState({
        pan_number: '',
        aadhaar_number: '',
        address: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        const token = localStorage.getItem('token'); 

        if (!token) {
            setMessage({ type: 'error', text: 'Authentication token missing. Please log in again.' });
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:3002/api/kyc', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: `KYC Submitted Successfully! Status: ${data.status || 'Pending'}` });
                setFormData({ pan_number: '', aadhaar_number: '', address: '' });
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to submit KYC.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Server error. Please try again later.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="kyc-container">
            <form className="kyc-form" onSubmit={handleSubmit}>
                <h2>Verify Your KYC</h2>
                <p className="subtitle">Enter your details to complete verification and unlock investments.</p>
                
                {message.text && (
                    <div className={`alert ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="pan_number">PAN Number</label>
                    <input
                        type="text"
                        id="pan_number"
                        name="pan_number"
                        value={formData.pan_number}
                        onChange={handleChange}
                        placeholder="ABCDE1234F"
                        maxLength="10"
                        style={{ textTransform: 'uppercase' }}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="aadhaar_number">Aadhaar Number</label>
                    <input
                        type="text"
                        id="aadhaar_number"
                        name="aadhaar_number"
                        value={formData.aadhaar_number}
                        onChange={handleChange}
                        placeholder="123456789012"
                        maxLength="12"
                        pattern="\d{12}"
                        title="Aadhaar number must be exactly 12 digits"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="address">Permanent Address</label>
                    <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter your full address"
                        rows="3"
                        required
                    />
                </div>

                <button type="submit" disabled={loading} className="kyc-btn">
                    {loading ? 'Submitting...' : 'Submit Verification'}
                </button>
            </form>
        </div>
    );
};

export default KycForm;