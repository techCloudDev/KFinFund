const Kyc = require("../models/kycModel");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.POSTGRES_USER_URL || `postgresql://postgres:postgres123@postgres-service:5432/kfinfund_users`,
});

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || "http://notification-service:3005";

// ── Sandbox credentials ────────────────────────────────────────────
const SANDBOX_API_KEY    = process.env.SANDBOX_API_KEY    || "";
const SANDBOX_API_SECRET = process.env.SANDBOX_API_SECRET || "";
const SANDBOX_BASE_URL   = "https://test-api.sandbox.co.in"; // test env

const ensureKycColumn = async () => {
  try {
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_status VARCHAR(20) DEFAULT 'NOT_SUBMITTED'`);
  } catch (e) {
    console.error("Could not ensure kyc_status column:", e.message);
  }
};
ensureKycColumn();

// ✅ Internal notification call — never blocks the main flow
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

// ── Sandbox helper: get access token (valid 24hrs, cached in memory) ──
let sandboxTokenCache = { token: null, expiresAt: 0 };

const getSandboxToken = async () => {
  // Reuse cached token if still valid (with 5-min buffer)
  if (sandboxTokenCache.token && Date.now() < sandboxTokenCache.expiresAt - 5 * 60 * 1000) {
    return sandboxTokenCache.token;
  }

  const res = await fetch(`${SANDBOX_BASE_URL}/authenticate`, {
    method: "POST",
    headers: {
      "x-api-key":     SANDBOX_API_KEY,
      "x-api-secret":  SANDBOX_API_SECRET,
      "x-api-version": "1.0",
      "Content-Type":  "application/json",
    },
  });

  const data = await res.json();
  if (!res.ok || !data?.data?.access_token) {
    throw new Error(data?.message || "Sandbox authentication failed");
  }

  sandboxTokenCache = {
    token:     data.data.access_token,
    expiresAt: Date.now() + 23 * 60 * 60 * 1000, // 23h to be safe
  };

  return sandboxTokenCache.token;
};

// ── EXISTING FUNCTIONS — completely unchanged ──────────────────────

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
      date_of_birth, gender, marital_status, occupation
    } = req.body;

    const newKyc = new Kyc({
      user_id: userId,
      full_name,
      pan_number: pan_number.toUpperCase(),
      aadhaar_number: `********${aadhaar_number.slice(-4)}`,
      address,
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

    notifyUser(userId, "KYC Submitted", "Your KYC documents have been submitted and are under review. This usually takes 1-2 working days.", "ALERT");

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

    notifyUser(userId, "KYC Verified ✅", "Congratulations! Your KYC has been verified. You can now start investing in mutual funds.", "ALERT");

    return res.status(200).json({ success: true, message: "KYC approved successfully.", status: "APPROVED" });
  } catch (error) {
    console.error("Approve KYC Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

// ── NEW: Sandbox KYC API functions ────────────────────────────────

// ✅ Step 1a — Generate Aadhaar OTP
// Sends OTP to the user's Aadhaar-registered mobile number.
// Returns reference_id which is needed for the verify step.
const generateAadhaarOtp = async (req, res) => {
  try {
    const { aadhaar_number } = req.body;
    if (!aadhaar_number || !/^\d{12}$/.test(aadhaar_number))
      return res.status(400).json({ error: "Valid 12-digit Aadhaar number is required." });

    const token = await getSandboxToken();

    const response = await fetch(`${SANDBOX_BASE_URL}/kyc/aadhaar/okyc/otp`, {
      method: "POST",
      headers: {
        "Authorization":  token,
        "x-api-key":      SANDBOX_API_KEY,
        "x-api-version":  "2.0",
        "Content-Type":   "application/json",
      },
      body: JSON.stringify({
        "@entity":       "in.co.sandbox.kyc.aadhaar.okyc.otp.request",
        "aadhaar_number": aadhaar_number,
        "consent":        "Y",
        "reason":         "KYC verification for KFinFund mutual fund investment platform",
      }),
    });

    const data = await response.json();
    if (!response.ok || data.code !== 200)
      return res.status(400).json({ error: data.message || "Failed to generate OTP. Please check your Aadhaar number." });

    return res.status(200).json({
      success: true,
      message: "OTP sent to your Aadhaar-registered mobile number.",
      reference_id: data.data.reference_id,
    });
  } catch (error) {
    console.error("Generate Aadhaar OTP Error:", error.message);
    return res.status(500).json({ error: "Failed to generate OTP. Please try again." });
  }
};

// ✅ Step 1b — Verify Aadhaar OTP
// Verifies OTP and returns full e-KYC data from UIDAI:
// name, date_of_birth, gender, address, photo (base64)
const verifyAadhaarOtp = async (req, res) => {
  try {
    const { reference_id, otp } = req.body;
    if (!reference_id || !otp)
      return res.status(400).json({ error: "Reference ID and OTP are required." });

    const token = await getSandboxToken();

    const response = await fetch(`${SANDBOX_BASE_URL}/kyc/aadhaar/okyc/otp/verify`, {
      method: "POST",
      headers: {
        "Authorization": token,
        "x-api-key":     SANDBOX_API_KEY,
        "x-api-version": "2.0",
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        "@entity":     "in.co.sandbox.kyc.aadhaar.okyc.request",
        "reference_id": String(reference_id),
        "otp":          String(otp),
      }),
    });

    const data = await response.json();
    if (!response.ok || data.code !== 200)
      return res.status(400).json({ error: data.message || "Invalid OTP. Please try again." });

    const kyc = data.data;

    // ✅ Return only the fields the frontend needs to auto-fill the KYC form.
    // We deliberately do NOT store the raw Aadhaar number or full photo on our servers.
    return res.status(200).json({
      success: true,
      aadhaar_verified: true,
      data: {
        full_name:     kyc.name,
        date_of_birth: kyc.date_of_birth,  // format: DD-MM-YYYY from Sandbox
        gender:        kyc.gender === "M" ? "MALE" : kyc.gender === "F" ? "FEMALE" : "OTHER",
        address:       kyc.full_address || `${kyc.address?.house || ""}, ${kyc.address?.street || ""}, ${kyc.address?.district || ""}, ${kyc.address?.state || ""} - ${kyc.address?.pincode || ""}`.trim(),
        photo:         kyc.photo || null, // base64 image for live photo comparison
      },
    });
  } catch (error) {
    console.error("Verify Aadhaar OTP Error:", error.message);
    return res.status(500).json({ error: "Failed to verify OTP. Please try again." });
  }
};

// ✅ Step 2 — Verify PAN
// Verifies PAN number and cross-checks name + DOB against Aadhaar data.
// date_of_birth must be in DD/MM/YYYY format for Sandbox PAN API.
const verifyPan = async (req, res) => {
  try {
    const { pan_number, full_name, date_of_birth } = req.body;

    if (!pan_number || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan_number.toUpperCase()))
      return res.status(400).json({ error: "Valid PAN number is required (e.g. ABCDE1234F)." });
    if (!full_name)
      return res.status(400).json({ error: "Full name is required for PAN verification." });
    if (!date_of_birth)
      return res.status(400).json({ error: "Date of birth is required for PAN verification." });

    const token = await getSandboxToken();

    // ✅ Sandbox PAN API needs DOB in DD/MM/YYYY format.
    // Aadhaar returns it as DD-MM-YYYY, frontend sends it as YYYY-MM-DD (HTML date input).
    // Normalise all formats to DD/MM/YYYY here.
    let dobFormatted = date_of_birth;
    if (/^\d{4}-\d{2}-\d{2}$/.test(date_of_birth)) {
      // YYYY-MM-DD → DD/MM/YYYY
      const [y, m, d] = date_of_birth.split("-");
      dobFormatted = `${d}/${m}/${y}`;
    } else if (/^\d{2}-\d{2}-\d{4}$/.test(date_of_birth)) {
      // DD-MM-YYYY → DD/MM/YYYY
      dobFormatted = date_of_birth.replace(/-/g, "/");
    }

    const response = await fetch(`${SANDBOX_BASE_URL}/kyc/pan/verify`, {
      method: "POST",
      headers: {
        "Authorization": token,
        "x-api-key":     SANDBOX_API_KEY,
        "x-api-version": "1.0",
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        "@entity":          "in.co.sandbox.kyc.pan_verification.request",
        "pan":              pan_number.toUpperCase(),
        "name_as_per_pan":  full_name,
        "date_of_birth":    dobFormatted,
        "consent":          "Y",
        "reason":           "PAN verification for KFinFund mutual fund investment platform",
      }),
    });

    const data = await response.json();
    if (!response.ok)
      return res.status(400).json({ error: data.message || "PAN verification failed." });

    const panData = data.data;

    if (panData.status !== "valid")
      return res.status(400).json({ error: "PAN number is invalid or does not exist." });

    return res.status(200).json({
      success: true,
      pan_verified: true,
      name_match:   panData.name_as_per_pan_match,
      dob_match:    panData.date_of_birth_match,
      pan_status:   panData.status,
      category:     panData.category,
    });
  } catch (error) {
    console.error("Verify PAN Error:", error.message);
    return res.status(500).json({ error: "Failed to verify PAN. Please try again." });
  }
};

// ✅ Step 3 — Verify Bank Account (Penny Drop)
// GETs https://test-api.sandbox.co.in/bank/{ifsc}/accounts/{account_number}/verify
// Returns account_exists and name_at_bank.
const verifyBankAccount = async (req, res) => {
  try {
    const { bank_account_number, ifsc_code } = req.body;

    if (!bank_account_number)
      return res.status(400).json({ error: "Bank account number is required." });
    if (!ifsc_code || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc_code.toUpperCase()))
      return res.status(400).json({ error: "Valid IFSC code is required (e.g. SBIN0001234)." });

    const token = await getSandboxToken();
    const ifsc    = ifsc_code.toUpperCase();
    const account = bank_account_number.trim();

    const response = await fetch(
      `${SANDBOX_BASE_URL}/bank/${ifsc}/accounts/${account}/verify`,
      {
        method: "GET",
        headers: {
          "Authorization": token,
          "x-api-key":     SANDBOX_API_KEY,
          "x-api-version": "1.0",
        },
      }
    );

    const data = await response.json();
    if (!response.ok)
      return res.status(400).json({ error: data.message || "Bank verification failed." });

    const bankData = data.data;

    if (!bankData.account_exists)
      return res.status(400).json({ error: "Bank account does not exist or is invalid." });

    return res.status(200).json({
      success:          true,
      bank_verified:    true,
      account_exists:   bankData.account_exists,
      name_at_bank:     bankData.name_at_bank,
      amount_deposited: bankData.amount_deposited,
    });
  } catch (error) {
    console.error("Verify Bank Account Error:", error.message);
    return res.status(500).json({ error: "Failed to verify bank account. Please try again." });
  }
};

module.exports = {
  // Existing
  submitKyc, getKyc, updateKyc, getKycStatus, approveKyc,
  // New Sandbox verification endpoints
  generateAadhaarOtp, verifyAadhaarOtp, verifyPan, verifyBankAccount,
};