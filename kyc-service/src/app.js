require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const connectDB = require("./config/db");
const kycRoutes = require("./routes/kycRoutes");

const app = express();
const PORT = process.env.PORT || 3002;

// ── Connect to MongoDB ──
connectDB();

// ── Security Headers ──
app.use(helmet());

// ── CORS ──
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ── Body Parser ──
app.use(express.json({ limit: "10kb" }));

// ── XSS Protection ──
app.use(xss());

// ── NoSQL Injection Protection ──
app.use(mongoSanitize());

// ── Global Rate Limiter ──
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// ── KYC Rate Limiter (stricter for submissions) ──
const kycLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 12,
  message: { error: "Too many KYC requests, please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/kyc", kycLimiter);

// ── Serve uploaded KYC documents ──
app.use("/uploads", express.static("uploads"));

// ── KYC APIs ──
app.use("/api/kyc", kycRoutes);

// ── Health Check ──
app.get("/", (req, res) => {
  res.json({
    message: "KYC Service Running",
    port: PORT
  });
});

// ── 404 Handler ──
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Global Error Handler ──
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`✅ KYC Service running on port ${PORT}`);
});