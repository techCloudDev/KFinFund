const express = require("express");
const router = express.Router();

const {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require("../controllers/notificationController");

router.post("/", createNotification);

// ✅ Specific routes BEFORE the dynamic /:userId catch-all, otherwise
// "/unread-count/5" style paths would never be reached.
router.get("/:userId/unread-count", getUnreadCount);
router.put("/:userId/read-all", markAllAsRead);

router.get("/:userId", getNotifications);

router.put(
  "/read/:id",
  markAsRead
);

router.delete(
  "/:id",
  deleteNotification
);

module.exports = router;