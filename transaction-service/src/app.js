require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

const transactionRoutes = require("./routes/transactionRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Transaction APIs
app.use("/api/transactions", transactionRoutes);

// Health Check API
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "Transaction Service Running",
      databaseTime: result.rows[0].now
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Database connection failed"
    });
  }
});

// Unknown Routes
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found"
  });
});

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(
    `✅ Transaction Service running on port ${PORT}`
  );
});
