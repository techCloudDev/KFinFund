const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  submitKyc, getKyc, updateKyc, getKycStatus, approveKyc,
  // ✅ New Sandbox verification endpoints
  generateAadhaarOtp, verifyAadhaarOtp, verifyPan, verifyBankAccount,
} = require("../controllers/kycController");

// Create uploads folder if it doesn't exist
if (!fs.existsSync("uploads/kyc_documents")) {
  fs.mkdirSync("uploads/kyc_documents", { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/kyc_documents/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = req.user.id + "-" + Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only JPEG, JPG, and PNG images are supported!"));
  }
};

const uploadKycFiles = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
}).fields([
  { name: "kyc_photo", maxCount: 1 },
  { name: "kyc_signature", maxCount: 1 }
]);

// ── Existing routes — completely unchanged ─────────────────────────
router.route("/")
  .post(protect, uploadKycFiles, submitKyc)
  .get(protect, getKyc)
  .put(protect, uploadKycFiles, updateKyc);

router.get("/status", protect, getKycStatus);

// Admin route to approve KYC
router.patch("/approve/:userId", protect, approveKyc);

// ── New Sandbox verification routes ───────────────────────────────
// All require auth (protect middleware) since they're part of the
// logged-in KYC flow. No file uploads needed for these — JSON only.

// Step 1a: Send OTP to Aadhaar-registered mobile
router.post("/verify/aadhaar/generate-otp", protect, generateAadhaarOtp);

// Step 1b: Verify OTP → returns name, DOB, gender, address, photo
router.post("/verify/aadhaar/verify-otp", protect, verifyAadhaarOtp);

// Step 2: Verify PAN number + cross-check name/DOB
router.post("/verify/pan", protect, verifyPan);

// Step 3: Penny drop — verify bank account + IFSC
router.post("/verify/bank", protect, verifyBankAccount);

module.exports = router;