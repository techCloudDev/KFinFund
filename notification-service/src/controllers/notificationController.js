const Notification = require("../models/Notification");
const sendEmail = require("../services/emailService");

// Create Notification
const createNotification = async (req, res) => {
  try {
    const { email, title, message, userId } = req.body;

    // Input validation
    if (!email || !title || !message || !userId) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const notification = await Notification.create({ email, title, message, userId });

    await sendEmail(
      notification.email,
      notification.title,
      notification.message
    );

    res.status(201).json({
      message: "Notification created and email sent",
      notification
    });
  } catch (error) {
    console.error("Create Notification Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Get Notifications by User
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.params.userId
    });
    res.json(notifications);
  } catch (error) {
    console.error("Get Notifications Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Mark Notification as Read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    console.error("Mark As Read Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Delete Notification
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Delete Notification Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  deleteNotification
};
