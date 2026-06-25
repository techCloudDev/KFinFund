const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { submitKyc, getKyc, updateKyc, getKycStatus } = require("../controllers/kycController");

router.route("/")
  .post(protect, submitKyc)
  .get(protect, getKyc)
  .put(protect, updateKyc);

router.get("/status", protect, getKycStatus);

module.exports = router;