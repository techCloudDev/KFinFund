const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const kycRoutes = require("./routes/kycRoutes");

const app = express();
const PORT = process.env.PORT || 3002;

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Serve uploaded KYC documents as static files
app.use("/uploads", express.static("uploads"));

// KYC APIs
app.use("/api/kyc", kycRoutes);

// Health Check
app.get("/", (req, res) => {
  res.json({
    message: "KYC Service Running",
    port: PORT
  });
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found"
  });
});

app.listen(PORT, () => {
  console.log(`✅ KYC Service running on port ${PORT}`);
});
