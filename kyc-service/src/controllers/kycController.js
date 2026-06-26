const Kyc = require("../models/kycModel");

const validateKycInputs = (body, files) => {
  const { pan_number, aadhaar_number, address, full_name, bank_account_number, ifsc_code } = body;

  if (!pan_number || !aadhaar_number || !address || !full_name || !bank_account_number || !ifsc_code) {
    return "All fields are required.";
  }

  if (!files || !files['kyc_photo'] || !files['kyc_signature']) {
    return "Photo and signature files are required.";
  }

  // Validate PAN format
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(pan_number.toUpperCase())) {
    return "Invalid PAN format. Expected format: ABCDE1234F";
  }

  // Validate Aadhaar format
  const aadhaarRegex = /^\d{12}$/;
  if (!aadhaarRegex.test(aadhaar_number)) {
    return "Aadhaar must be exactly 12 digits.";
  }

  // Validate IFSC format
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  if (!ifscRegex.test(ifsc_code.toUpperCase())) {
    return "Invalid IFSC code format.";
  }

  return null;
};

// Submit KYC
const submitKyc = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if KYC already submitted
    const existingKyc = await Kyc.findOne({ user_id: userId });
    if (existingKyc) {
      return res.status(400).json({ error: "KYC already submitted for this user." });
    }

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
      // Store only last 4 digits of Aadhaar for security
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
      message: "KYC submitted successfully.",
      status: newKyc.status
    });

  } catch (error) {
    console.error("Submit KYC Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

// Get KYC Record
const getKyc = async (req, res) => {
  try {
    const kycRecord = await Kyc.findOne({ user_id: req.user.id });
    if (!kycRecord) {
      return res.status(404).json({ error: "KYC record not found." });
    }
    return res.status(200).json(kycRecord);
  } catch (error) {
    console.error("Get KYC Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

// Update KYC Record
const updateKyc = async (req, res) => {
  try {
    const userId = req.user.id;

    const validationError = validateKycInputs(req.body, req.files);
    if (validationError) return res.status(400).json({ error: validationError });

    let kycRecord = await Kyc.findOne({ user_id: userId });
    if (!kycRecord) {
      return res.status(404).json({ error: "KYC record not found." });
    }

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

    kycRecord.full_name = full_name;
    kycRecord.pan_number = pan_number.toUpperCase();
    // Store only last 4 digits of Aadhaar for security
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
    kycRecord.status = "PENDING";

    await kycRecord.save();
    return res.status(200).json({
      success: true,
      message: "KYC updated successfully.",
      status: kycRecord.status
    });
  } catch (error) {
    console.error("Update KYC Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

// Get KYC Status
const getKycStatus = async (req, res) => {
  try {
    const kycRecord = await Kyc.findOne({ user_id: req.user.id });
    if (!kycRecord) {
      return res.status(200).json({ status: "NOT_SUBMITTED" });
    }
    return res.status(200).json({ status: kycRecord.status });
  } catch (error) {
    console.error("Get KYC Status Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

// Approve KYC (Admin only)
const approveKyc = async (req, res) => {
  try {
    const { userId } = req.params;
    const kycRecord = await Kyc.findOne({ user_id: userId });
    if (!kycRecord) {
      return res.status(404).json({ error: "KYC record not found." });
    }
    kycRecord.status = "APPROVED";
    await kycRecord.save();
    return res.status(200).json({
      success: true,
      message: "KYC approved successfully.",
      status: kycRecord.status
    });
  } catch (error) {
    console.error("Approve KYC Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { submitKyc, getKyc, updateKyc, getKycStatus, approveKyc };
