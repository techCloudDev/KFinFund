const express = require("express");

const router = express.Router();

const {
  buyFund,
  redeemFund,
  getTransactionHistory,
  getPortfolio
} = require("../controllers/transactionController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/buy", authMiddleware, buyFund);

router.post("/redeem", authMiddleware, redeemFund);

router.get("/history", authMiddleware, getTransactionHistory);

router.get("/portfolio", authMiddleware, getPortfolio);

module.exports = router;
