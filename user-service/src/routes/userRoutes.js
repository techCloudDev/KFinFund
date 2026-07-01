const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const {
  registerUser, loginUser, refreshTokenHandler, logoutUser,
  getProfile, updateProfile, changePassword,
  forgotPassword, resetPassword,
} = require("../controllers/userController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshTokenHandler);
router.post("/logout", logoutUser);

// ✅ Forgot / Reset password — public routes, no auth token needed
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);
router.put("/change-password", verifyToken, changePassword);

module.exports = router;