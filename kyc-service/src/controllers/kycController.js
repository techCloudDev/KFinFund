const Kyc = require("../models/kycModel");

const validateKycInputs = (pan, aadhaar, address) => {
  if (!pan || !aadhaar || !address) {
    return "All fields are mandatory.";
  }
  
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(pan.toUpperCase())) {
    return "Invalid PAN format (Expected: ABCDE1234F).";
  }

  const aadhaarRegex = /^\d{12}$/;
  if (!aadhaarRegex.test(aadhaar)) {
    return "Aadhaar must be exactly 12 digits.";
  }

  return null;
};

const submitKyc = async (req, res) => {
  try {
    const { pan_number, aadhaar_number, address } = req.body;
    const userId = req.user.id;

    const validationError = validateKycInputs(pan_number, aadhaar_number, address);
    if (validationError) return res.status(400).json({ error: validationError });

    const existingKyc = await Kyc.findOne({ user_id: userId });
    if (existingKyc) return res.status(400).json({ error: "KYC already submitted for this user." });

    const newKyc = new Kyc({
      user_id: userId,
      pan_number: pan_number.toUpperCase(),
      aadhaar_number,
      address
    });

    await newKyc.save();
    return res.status(201).json(newKyc);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getKyc = async (req, res) => {
  try {
    const kycRecord = await Kyc.findOne({ user_id: req.user.id });
    if (!kycRecord) return res.status(404).json({ error: "KYC record not found." });
    return res.status(200).json(kycRecord);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// 3. Update KYC
const updateKyc = async (req, res) => {
  try {
    const { pan_number, aadhaar_number, address } = req.body;
    const userId = req.user.id;

    const validationError = validateKycInputs(pan_number, aadhaar_number, address);
    if (validationError) return res.status(400).json({ error: validationError });

    let kycRecord = await Kyc.findOne({ user_id: userId });
    if (!kycRecord) return res.status(404).json({ error: "KYC record not found." });

    kycRecord.pan_number = pan_number.toUpperCase();
    kycRecord.aadhaar_number = aadhaar_number;
    kycRecord.address = address;
    kycRecord.status = "PENDING"; // Reset back to pending upon modification

    await kycRecord.save();
    return res.status(200).json(kycRecord);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


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