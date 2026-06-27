require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");

const pool = require("./config/db");
const sipRoutes = require("./routes/sipRoutes");

const app = express();

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

// ── SIP Rate Limiter ──
const sipLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 12,
  message: { error: "Too many SIP requests, please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/sips", sipLimiter);

// ── SIP APIs ──
app.use("/api/sips", sipRoutes);

// ── Health Check ──
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "SIP Service Running",
      databaseTime: result.rows[0].now
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({
      error: "Database connection failed",
      reason: error.message
    });
  }
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

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`✅ SIP Service running on port ${PORT}`);
});