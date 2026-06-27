require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// User APIs
app.use("/api/users", userRoutes);

// Health Check API
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "User Service Running",
      databaseTime: result.rows[0].now
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Database connection failed"
    });
  }
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found"
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ User Service running on port ${PORT}`);
});