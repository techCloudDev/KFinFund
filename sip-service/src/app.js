require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

const app = express();

const sipRoutes = require("./routes/sipRoutes");

app.use(cors());
app.use(express.json());
app.use("/api/sips", sipRoutes);

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

const PORT = process.env.PORT || 3004;

app.listen(PORT, () => {
  console.log(`🚀 SIP Service running on port ${PORT}`);
});
