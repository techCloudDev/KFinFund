const Kyc = require("../models/kycModel");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.POSTGRES_USER_URL || `postgresql://postgres:postgres123@postgres-service:5432/kfinfund_users`,
});

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || "http://notification-service:3005";

const ensureKycColumn = async () => {
  try {
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_status VARCHAR(20) DEFAULT 'NOT_SUBMITTED'`);
  } catch (e) {
    console.error("Could not ensure kyc_status column:", e.message);
  }
};
ensureKycColumn();

// ✅ Internal server-to-server notification call. Failures here must
// NEVER block the actual KYC approval — wrapped so a notification-service
// outage can't break the core flow.
const notifyUser = async (userId, title, message, type) => {
  try {
    await fetch(`${NOTIFICATION_SERVICE_URL}/api/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: Number(userId), title, message, type }),
    });
  } catch (e) {
    console.error("⚠️ Failed to send notification (non-blocking):", e.message);
  }
};

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

const saveKycStatusToPG = async (userId, status) => {
  try {
    await pool.query(`UPDATE users SET kyc_status = $1 WHERE id = $2`, [status, userId]);
    console.log(`✅ KYC status saved to PostgreSQL: user ${userId} → ${status}`);
  } catch (e) {
    console.error("Failed to save KYC status to PostgreSQL:", e.message);
  }
};

const getKycStatusFromPG = async (userId) => {
  try {
    const result = await pool.query(`SELECT kyc_status FROM users WHERE id = $1`, [userId]);
    return result.rows[0]?.kyc_status || null;
  } catch (e) {
    console.error("Failed to get KYC status from PostgreSQL:", e.message);
    return null;
  }
};

const submitKyc = async (req, res) => {
  try {
    const userId = req.user.id;
    const pgStatus = await getKycStatusFromPG(userId);
    if (pgStatus === "APPROVED")
      return res.status(400).json({ error: "Your KYC is already approved. No resubmission needed." });

    const existingKyc = await Kyc.findOne({ user_id: userId });
    if (existingKyc)
      return res.status(400).json({ error: "KYC already submitted for this user." });

    const validationError = validateKycInputs(req.body, req.files);
    if (validationError) return res.status(400).json({ error: validationError });

    const {
      pan_number, full_name, aadhaar_number, address,
      bank_account_number, ifsc_code, income_bracket, pep_status,
      // ✅ New fields
      date_of_birth, gender, marital_status, occupation
    } = req.body;

    const newKyc = new Kyc({
      user_id: userId,
      full_name,
      pan_number: pan_number.toUpperCase(),
      aadhaar_number: `********${aadhaar_number.slice(-4)}`,
      address,
      // ✅ Save new fields
      date_of_birth: date_of_birth || null,
      gender: gender || null,
      marital_status: marital_status || null,
      occupation: occupation || null,
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
    await saveKycStatusToPG(userId, "PENDING");

    // ✅ Notify user their KYC was submitted and is under review
    notifyUser(
      userId,
      "KYC Submitted",
      "Your KYC documents have been submitted and are under review. This usually takes 1-2 working days.",
      "ALERT"
    );

    return res.status(201).json({ success: true, message: "KYC submitted successfully.", status: "PENDING" });
  } catch (error) {
    console.error("Submit KYC Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

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

const updateKyc = async (req, res) => {
  try {
    const userId = req.user.id;
    const pgStatus = await getKycStatusFromPG(userId);
    if (pgStatus === "APPROVED")
      return res.status(400).json({ error: "KYC is already approved and cannot be updated." });

    const validationError = validateKycInputs(req.body, req.files);
    if (validationError) return res.status(400).json({ error: validationError });

    let kycRecord = await Kyc.findOne({ user_id: userId });
    if (!kycRecord) return res.status(404).json({ error: "KYC record not found." });

    const {
      pan_number, full_name, aadhaar_number, address,
      bank_account_number, ifsc_code, income_bracket, pep_status,
      date_of_birth, gender, marital_status, occupation
    } = req.body;

    kycRecord.full_name = full_name;
    kycRecord.pan_number = pan_number.toUpperCase();
    kycRecord.aadhaar_number = `********${aadhaar_number.slice(-4)}`;
    kycRecord.address = address;
    kycRecord.date_of_birth = date_of_birth || null;
    kycRecord.gender = gender || null;
    kycRecord.marital_status = marital_status || null;
    kycRecord.occupation = occupation || null;
    kycRecord.documents.selfie_url = req.files['kyc_photo'][0].path;
    kycRecord.documents.signature_url = req.files['kyc_signature'][0].path;
    kycRecord.financials = {
      bank_account_number, ifsc_code: ifsc_code.toUpperCase(),
      income_bracket: income_bracket || "NOT_DECLARED", pep_status: pep_status === 'true'
    };
    kycRecord.status = "PENDING";

    await kycRecord.save();
    await saveKycStatusToPG(userId, "PENDING");

    return res.status(200).json({ success: true, message: "KYC updated successfully.", status: "PENDING" });
  } catch (error) {
    console.error("Update KYC Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

const getKycStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const pgStatus = await getKycStatusFromPG(userId);
    if (pgStatus === "APPROVED") return res.status(200).json({ status: "APPROVED" });
    const kycRecord = await Kyc.findOne({ user_id: userId });
    if (!kycRecord) {
      if (pgStatus === "PENDING") return res.status(200).json({ status: "PENDING" });
      return res.status(200).json({ status: "NOT_SUBMITTED" });
    }
    await saveKycStatusToPG(userId, kycRecord.status);
    return res.status(200).json({ status: kycRecord.status });
  } catch (error) {
    console.error("Get KYC Status Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

const approveKyc = async (req, res) => {
  try {
    const { userId } = req.params;
    const kycRecord = await Kyc.findOne({ user_id: userId });
    if (!kycRecord) return res.status(404).json({ error: "KYC record not found." });
    kycRecord.status = "APPROVED";
    await kycRecord.save();
    await saveKycStatusToPG(userId, "APPROVED");

    // ✅ Notify user their KYC was approved — this is the actual trigger
    // point. No admin clicks "send notification" — it fires automatically
    // the instant approval happens, same as Groww/Zerodha.
    notifyUser(
      userId,
      "KYC Verified ✅",
      "Congratulations! Your KYC has been verified. You can now start investing in mutual funds.",
      "ALERT"
    );

    return res.status(200).json({ success: true, message: "KYC approved successfully.", status: "APPROVED" });
  } catch (error) {
    console.error("Approve KYC Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { submitKyc, getKyc, updateKyc, getKycStatus, approveKyc };