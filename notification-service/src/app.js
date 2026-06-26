require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Notification APIs
app.use("/api/notifications", notificationRoutes);

// Health Check
app.get("/", (req, res) => {
  res.json({
    message: "Notification Service Running"
  });
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found"
  });
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`✅ Notification Service running on port ${PORT}`);
});
