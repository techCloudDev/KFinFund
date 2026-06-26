const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  createNotification,
  getNotifications,
  markAsRead,
  deleteNotification
} = require("../controllers/notificationController");

router.post("/", protect, createNotification);
router.get("/:userId", protect, getNotifications);
router.put("/read/:id", protect, markAsRead);
router.delete("/:id", protect, deleteNotification);

module.exports = router;
