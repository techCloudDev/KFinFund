require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
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

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
