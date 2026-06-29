const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const {
  registerUser, loginUser, refreshTokenHandler, logoutUser,
  getProfile, updateProfile, changePassword
} = require("../controllers/userController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshTokenHandler);  // ✅ New
router.post("/logout", logoutUser);                  // ✅ New

router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);
router.put("/change-password", verifyToken, changePassword);

module.exports = router;