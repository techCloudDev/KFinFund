const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const kycRoutes = require("./routes/kycRoutes");

const app = express();
const PORT = process.env.PORT || 3002;

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/kyc", kycRoutes);

app.listen(PORT, () => {
  console.log(`KYC Service active on port ${PORT}`);
});