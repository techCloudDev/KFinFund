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

    const units = amount / nav;

    const transaction = await createTransaction(
      userId,
      fund_id,
      "BUY",
      amount,
      units,
      nav
    );

    res.status(201).json({
      message: "Fund purchased successfully",
      transaction
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
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

    const amount = units * nav;

    const transaction = await createTransaction(
      userId,
      fund_id,
      "REDEEM",
      amount,
      units,
      nav
    );

    res.status(201).json({
      message: "Fund redeemed successfully",
      transaction
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to redeem fund"
    });
  }
};

const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions =
      await getTransactionsByUser(userId);

    res.json(transactions);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch transaction history"
    });
  }
};

const getPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions =
      await getTransactionsByUser(userId);

    let totalInvestment = 0;

    transactions.forEach((txn) => {
      if (txn.transaction_type === "BUY") {
        totalInvestment += Number(txn.amount);
      }
    });

    res.json({
      userId,
      totalInvestment,
      totalTransactions: transactions.length
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
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
