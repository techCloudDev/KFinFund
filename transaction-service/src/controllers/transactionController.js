const {
  createTransaction,
  getTransactionsByUser
} = require("../models/transactionModel");

const buyFund = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      fund_id,
      amount,
      nav
    } = req.body;

    if (!fund_id || !amount || !nav) {
      return res.status(400).json({
        error: "Fund ID, amount and NAV are required"
      });
    }

    if (nav <= 0) {
      return res.status(400).json({
        error: "NAV must be greater than zero"
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        error: "Amount must be greater than zero"
      });
    }

    const units = Number((amount / nav).toFixed(4));

    const transaction = await createTransaction(
      userId,
      fund_id,
      "BUY",
      amount,
      units,
      nav
    );

    return res.status(201).json({
      message: "Fund purchased successfully",
      transaction
    });

  } catch (error) {
    console.error("Buy Fund Error:", error);

    return res.status(500).json({
      error: "Failed to buy fund"
    });
  }
};

const redeemFund = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      fund_id,
      units,
      nav
    } = req.body;

    if (!fund_id || !units || !nav) {
      return res.status(400).json({
        error: "Fund ID, units and NAV are required"
      });
    }

    if (nav <= 0) {
      return res.status(400).json({
        error: "NAV must be greater than zero"
      });
    }

    if (units <= 0) {
      return res.status(400).json({
        error: "Units must be greater than zero"
      });
    }

    const amount = Number((units * nav).toFixed(2));

    const transaction = await createTransaction(
      userId,
      fund_id,
      "REDEEM",
      amount,
      units,
      nav
    );

    return res.status(201).json({
      message: "Fund redeemed successfully",
      transaction
    });

  } catch (error) {
    console.error("Redeem Fund Error:", error);

    return res.status(500).json({
      error: "Failed to redeem fund"
    });
  }
};

const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await getTransactionsByUser(userId);

    return res.status(200).json({
      count: transactions.length,
      transactions
    });

  } catch (error) {
    console.error("Transaction History Error:", error);

    return res.status(500).json({
      error: "Failed to fetch transaction history"
    });
  }
};

const getPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await getTransactionsByUser(userId);

    let totalInvestment = 0;

    transactions.forEach((txn) => {
      if (txn.transaction_type === "BUY") {
        totalInvestment += Number(txn.amount);
      } else if (txn.transaction_type === "REDEEM") {
        totalInvestment -= Number(txn.amount);
      }
    });

    return res.status(200).json({
      userId,
      totalInvestment: Number(totalInvestment.toFixed(2)),
      totalTransactions: transactions.length
    });

  } catch (error) {
    console.error("Portfolio Error:", error);

    return res.status(500).json({
      error: "Failed to fetch portfolio"
    });
  }
};

module.exports = {
  buyFund,
  redeemFund,
  getTransactionHistory,
  getPortfolio
};
