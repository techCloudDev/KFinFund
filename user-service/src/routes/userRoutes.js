const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile
} = require("../controllers/userController");

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/profile", verifyToken, getProfile);
router.put(
  "/profile",
  verifyToken,
  updateProfile
);

module.exports = router;
