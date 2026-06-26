const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const {
  createSipController,
  getAllSipsController,
  getSipByIdController,
  updateSipController,
  cancelSipController,
  getMySipsController
} = require("../controllers/sipController");

// Create SIP
router.post("/", verifyToken, createSipController);

// Get All SIPs (Admin only)
router.get("/", verifyToken, getAllSipsController);

// Get My SIPs
router.get("/my-sips", verifyToken, getMySipsController);

// Cancel SIP
router.patch("/:id/cancel", verifyToken, cancelSipController);

// Get SIP by ID
router.get("/:id", verifyToken, getSipByIdController);

// Update SIP
router.put("/:id", verifyToken, updateSipController);

module.exports = router;
