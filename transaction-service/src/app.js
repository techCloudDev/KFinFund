require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const pool = require("./config/db");
const transactionRoutes = require("./routes/transactionRoutes");

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

// ── Global Rate Limiter ──
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// ── Transaction Rate Limiter ──
const transactionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 12,
  message: { error: "Too many transaction requests, please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/transactions/buy", transactionLimiter);
app.use("/api/transactions/redeem", transactionLimiter);

// ── Transaction APIs ──
app.use("/api/transactions", transactionRoutes);

// ── Health Check ──
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ message: "Transaction Service Running", databaseTime: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ error: "Database connection failed" });
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

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`✅ Transaction Service running on port ${PORT}`);
});