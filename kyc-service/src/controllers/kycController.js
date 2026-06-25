const Kyc = require("../models/kycModel");

const validateKycInputs = (body, files) => {
  const { pan_number, aadhaar_number, address, full_name, bank_account_number, ifsc_code } = body;

  if (!pan_number || !aadhaar_number || !address || !full_name || !bank_account_number || !ifsc_code) {
    return "All multi-step structural text fields are mandatory.";
  }
  
  if (!files || !files['kyc_photo'] || !files['kyc_signature']) {
    return "Missing required photo or signature file attachments.";
  }
  
  // Format verification checking rules
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(pan_number.toUpperCase())) {
    return "Invalid PAN format (Expected: ABCDE1234F).";
  }

  const aadhaarRegex = /^\d{12}$/;
  if (!aadhaarRegex.test(aadhaar_number)) {
    return "Aadhaar must be exactly 12 digits.";
  }

  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  if (!ifscRegex.test(ifsc_code.toUpperCase())) {
    return "Invalid Indian Bank IFSC standard code format.";
  }

  return null;
};

const submitKyc = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check for existing profile registry record
    const existingKyc = await Kyc.findOne({ user_id: userId });
    if (existingKyc) return res.status(400).json({ error: "KYC already submitted for this user account." });

    // Validate textual and physical parameters combined
    const validationError = validateKycInputs(req.body, req.files);
    if (validationError) return res.status(400).json({ error: validationError });

    const { 
      pan_number, 
      full_name, 
      aadhaar_number, 
      address, 
      bank_account_number, 
      ifsc_code, 
      income_bracket, 
      pep_status 
    } = req.body;

    
    const photoPath = req.files['kyc_photo'][0].path;
    const signaturePath = req.files['kyc_signature'][0].path;

    
    const newKyc = new Kyc({
      user_id: userId,
      full_name,
      pan_number: pan_number.toUpperCase(),
      // Securely masking sensitive demographic data segments at database engine ingestion level
      aadhaar_number: `********${aadhaar_number.slice(-4)}`, 
      address,
      documents: {
        selfie_url: photoPath,
        signature_url: signaturePath
      },
      financials: {
        bank_account_number,
        ifsc_code: ifsc_code.toUpperCase(),
        income_bracket: income_bracket || "NOT_DECLARED",
        pep_status: pep_status === 'true'
      },
      status: "PENDING"
    });

    await newKyc.save();
    return res.status(201).json({
      success: true,
      message: "All 5 multi-step phases processed and compiled successfully.",
      status: newKyc.status
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Fetch KYC Record Entry
const getKyc = async (req, res) => {
  try {
    const kycRecord = await Kyc.findOne({ user_id: req.user.id });
    if (!kycRecord) return res.status(404).json({ error: "KYC record tracking entry not found." });
    return res.status(200).json(kycRecord);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Update KYC Data Framework
const updateKyc = async (req, res) => {
  try {
    const userId = req.user.id;

    const validationError = validateKycInputs(req.body, req.files);
    if (validationError) return res.status(400).json({ error: validationError });

    let kycRecord = await Kyc.findOne({ user_id: userId });
    if (!kycRecord) return res.status(404).json({ error: "KYC record profile entry not found." });

    const { 
      pan_number, 
      full_name, 
      aadhaar_number, 
      address, 
      bank_account_number, 
      ifsc_code, 
      income_bracket, 
      pep_status 
    } = req.body;

    // Apply configuration field alterations
    kycRecord.full_name = full_name;
    kycRecord.pan_number = pan_number.toUpperCase();
    kycRecord.aadhaar_number = `********${aadhaar_number.slice(-4)}`;
    kycRecord.address = address;
    
    kycRecord.documents.selfie_url = req.files['kyc_photo'][0].path;
    kycRecord.documents.signature_url = req.files['kyc_signature'][0].path;
    
    kycRecord.financials = {
      bank_account_number,
      ifsc_code: ifsc_code.toUpperCase(),
      income_bracket: income_bracket || "NOT_DECLARED",
      pep_status: pep_status === 'true'
    };

    kycRecord.status = "PENDING_VERIFICATION"; 

    await kycRecord.save();
    return res.status(200).json({
      success: true,
      message: "KYC records reassessed and updated.",
      status: kycRecord.status
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Fetch Dynamic Account Status Identifier Tag
const getKycStatus = async (req, res) => {
  try {
    const kycRecord = await Kyc.findOne({ user_id: req.user.id });
    if (!kycRecord) return res.status(200).json({ status: "NOT_SUBMITTED" });
    return res.status(200).json({ status: kycRecord.status });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { submitKyc, getKyc, updateKyc, getKycStatus };