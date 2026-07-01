require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

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

// ✅ NOTE: express-mongo-sanitize REMOVED — it crashes with
// "Cannot set property query of #<IncomingMessage>" on newer
// Express/Node since req.query is a read-only getter. Same bug
// was found and fixed in kyc-service and transaction-service earlier.

// ── Global Rate Limiter ──
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// ── Notification Rate Limiter ──
// ✅ Raised from 12 → 200 — same fix applied to kyc-service earlier.
// The bell icon polls /unread-count periodically, so 12 req/15min
// would hit the limit almost immediately during normal use.
const notificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: "Too many notification requests, please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/notifications", notificationLimiter);

// ── Notification APIs ──
app.use("/api/notifications", notificationRoutes);

// ── Health Check ──
app.get("/", (req, res) => {
  res.json({ message: "Notification Service Running" });
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

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`✅ Notification Service running on port ${PORT}`);
});