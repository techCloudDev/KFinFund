const Notification = require("../models/Notification");

// Create Notification
const createNotification = async (req, res) => {
    console.log("BODY RECEIVED:", req.body);
  try {
    const notification = await Notification.create(req.body);

    res.status(201).json({
      message: "Notification created",
      notification
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

// Get Notifications by User
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.params.userId
    }).sort({ createdAt: -1 }); // ✅ newest first

    res.json(notifications);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

// ✅ Get Unread Count — lightweight, used by the bell icon for polling
// instead of fetching the full notification list every time.
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.params.userId,
      isRead: false
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

// Mark Notification as Read
const markAsRead = async (req, res) => {
  try {
    const notification =
      await Notification.findByIdAndUpdate(
        req.params.id,
        { isRead: true },
        { new: true }
      );

    res.json(notification);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

// ✅ Mark ALL notifications as read for a user — used when bell dropdown opens
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.params.userId, isRead: false },
      { isRead: true }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

// Delete Notification
const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message: "Notification deleted"
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
};