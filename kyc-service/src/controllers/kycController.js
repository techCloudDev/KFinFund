const Kyc = require("../models/kycModel");
const { Pool } = require("pg");

// ✅ Connect to PostgreSQL user DB to persist KYC status
const pool = new Pool({
  connectionString: process.env.POSTGRES_USER_URL || `postgresql://postgres:postgres123@postgres-service:5432/kfinfund_users`,
});

// ✅ Ensure kyc_status column exists in users table
const ensureKycColumn = async () => {
  try {
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_status VARCHAR(20) DEFAULT 'NOT_SUBMITTED'`);
  } catch (e) {
    console.error("Could not ensure kyc_status column:", e.message);
  }
};
ensureKycColumn();

const validateKycInputs = (body, files) => {
  const { pan_number, aadhaar_number, address, full_name, bank_account_number, ifsc_code } = body;
  if (!pan_number || !aadhaar_number || !address || !full_name || !bank_account_number || !ifsc_code)
    return "All fields are required.";
  if (!files || !files['kyc_photo'] || !files['kyc_signature'])
    return "Photo and signature files are required.";
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan_number.toUpperCase()))
    return "Invalid PAN format. Expected format: ABCDE1234F";
  if (!/^\d{12}$/.test(aadhaar_number))
    return "Aadhaar must be exactly 12 digits.";
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc_code.toUpperCase()))
    return "Invalid IFSC code format.";
  return null;
};

// ✅ Helper — save KYC status to PostgreSQL (survives MongoDB restart)
const saveKycStatusToPG = async (userId, status) => {
  try {
    await pool.query(
      `UPDATE users SET kyc_status = $1 WHERE id = $2`,
      [status, userId]
    );
    console.log(`✅ KYC status saved to PostgreSQL: user ${userId} → ${status}`);
  } catch (e) {
    console.error("Failed to save KYC status to PostgreSQL:", e.message);
  }
};

// ✅ Helper — get KYC status from PostgreSQL
const getKycStatusFromPG = async (userId) => {
  try {
    const result = await pool.query(
      `SELECT kyc_status FROM users WHERE id = $1`,
      [userId]
    );
    return result.rows[0]?.kyc_status || null;
  } catch (e) {
    console.error("Failed to get KYC status from PostgreSQL:", e.message);
    return null;
  }
};

// Submit KYC
const submitKyc = async (req, res) => {
  try {
    const userId = req.user.id;

    // ✅ If already APPROVED in PostgreSQL — don't allow resubmission
    const pgStatus = await getKycStatusFromPG(userId);
    if (pgStatus === "APPROVED") {
      return res.status(400).json({ error: "Your KYC is already approved. No resubmission needed." });
    }

    // Check if KYC already submitted in MongoDB
    const existingKyc = await Kyc.findOne({ user_id: userId });
    if (existingKyc) {
      return res.status(400).json({ error: "KYC already submitted for this user." });
    }

    const validationError = validateKycInputs(req.body, req.files);
    if (validationError) return res.status(400).json({ error: validationError });

    const { pan_number, full_name, aadhaar_number, address, bank_account_number, ifsc_code, income_bracket, pep_status } = req.body;

    const newKyc = new Kyc({
      user_id: userId,
      full_name,
      pan_number: pan_number.toUpperCase(),
      aadhaar_number: `********${aadhaar_number.slice(-4)}`,
      address,
      documents: {
        selfie_url: req.files['kyc_photo'][0].path,
        signature_url: req.files['kyc_signature'][0].path
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

    // ✅ Save PENDING to PostgreSQL too
    await saveKycStatusToPG(userId, "PENDING");

    return res.status(201).json({ success: true, message: "KYC submitted successfully.", status: "PENDING" });
  } catch (error) {
    console.error("Submit KYC Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

// Get KYC Record
const getKyc = async (req, res) => {
  try {
    const kycRecord = await Kyc.findOne({ user_id: req.user.id });
    if (!kycRecord) return res.status(404).json({ error: "KYC record not found." });
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

    // ✅ Block update if already APPROVED
    const pgStatus = await getKycStatusFromPG(userId);
    if (pgStatus === "APPROVED") {
      return res.status(400).json({ error: "KYC is already approved and cannot be updated." });
    }

    const validationError = validateKycInputs(req.body, req.files);
    if (validationError) return res.status(400).json({ error: validationError });

    let kycRecord = await Kyc.findOne({ user_id: userId });
    if (!kycRecord) return res.status(404).json({ error: "KYC record not found." });

    const { pan_number, full_name, aadhaar_number, address, bank_account_number, ifsc_code, income_bracket, pep_status } = req.body;

    kycRecord.full_name = full_name;
    kycRecord.pan_number = pan_number.toUpperCase();
    kycRecord.aadhaar_number = `********${aadhaar_number.slice(-4)}`;
    kycRecord.address = address;
    kycRecord.documents.selfie_url = req.files['kyc_photo'][0].path;
    kycRecord.documents.signature_url = req.files['kyc_signature'][0].path;
    kycRecord.financials = { bank_account_number, ifsc_code: ifsc_code.toUpperCase(), income_bracket: income_bracket || "NOT_DECLARED", pep_status: pep_status === 'true' };
    kycRecord.status = "PENDING";

    await kycRecord.save();
    await saveKycStatusToPG(userId, "PENDING");

    return res.status(200).json({ success: true, message: "KYC updated successfully.", status: "PENDING" });
  } catch (error) {
    console.error("Update KYC Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

// ✅ Get KYC Status — checks PostgreSQL FIRST, MongoDB second
const getKycStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    // ✅ Check PostgreSQL first — this survives MongoDB restarts
    const pgStatus = await getKycStatusFromPG(userId);
    if (pgStatus === "APPROVED") {
      return res.status(200).json({ status: "APPROVED" });
    }

    // Fall back to MongoDB
    const kycRecord = await Kyc.findOne({ user_id: userId });
    if (!kycRecord) {
      // ✅ If PG says PENDING but MongoDB is gone — still return PENDING
      if (pgStatus === "PENDING") {
        return res.status(200).json({ status: "PENDING" });
      }
      return res.status(200).json({ status: "NOT_SUBMITTED" });
    }

    // ✅ Sync MongoDB status back to PostgreSQL
    await saveKycStatusToPG(userId, kycRecord.status);

    return res.status(200).json({ status: kycRecord.status });
  } catch (error) {
    console.error("Get KYC Status Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

// Approve KYC (Admin) — ✅ also saves to PostgreSQL
const approveKyc = async (req, res) => {
  try {
    const { userId } = req.params;
    const kycRecord = await Kyc.findOne({ user_id: userId });
    if (!kycRecord) return res.status(404).json({ error: "KYC record not found." });

    kycRecord.status = "APPROVED";
    await kycRecord.save();

    // ✅ Save APPROVED to PostgreSQL — persists forever even if MongoDB restarts
    await saveKycStatusToPG(userId, "APPROVED");

    return res.status(200).json({ success: true, message: "KYC approved successfully.", status: "APPROVED" });
  } catch (error) {
    console.error("Approve KYC Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { submitKyc, getKyc, updateKyc, getKycStatus, approveKyc };