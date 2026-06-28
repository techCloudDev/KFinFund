const {
  createTransaction,
  getTransactionsByUser
} = require("../models/transactionModel");

const buyFund = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fund_id, amount, nav } = req.body;

    if (!fund_id || !amount || !nav)
      return res.status(400).json({ error: "Fund ID, amount and NAV are required" });
    if (nav <= 0)
      return res.status(400).json({ error: "NAV must be greater than zero" });
    if (amount <= 0)
      return res.status(400).json({ error: "Amount must be greater than zero" });

    const units = Number((amount / nav).toFixed(4));
    const transaction = await createTransaction(userId, fund_id, "BUY", amount, units, nav);

    return res.status(201).json({ message: "Fund purchased successfully", transaction });
  } catch (error) {
    console.error("Buy Fund Error:", error);
    return res.status(500).json({ error: "Failed to buy fund" });
  }
};

const redeemFund = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fund_id, units, nav } = req.body;

    if (!fund_id || !units || !nav)
      return res.status(400).json({ error: "Fund ID, units and NAV are required" });
    if (nav <= 0)
      return res.status(400).json({ error: "NAV must be greater than zero" });
    if (units <= 0)
      return res.status(400).json({ error: "Units must be greater than zero" });

    // ✅ Check user has enough units before redeeming
    const transactions = await getTransactionsByUser(userId);
    let heldUnits = 0;
    transactions.forEach(txn => {
      if (txn.fund_id === fund_id) {
        if (txn.transaction_type === "BUY")    heldUnits += Number(txn.units);
        if (txn.transaction_type === "REDEEM") heldUnits -= Number(txn.units);
      }
    });
    heldUnits = Number(heldUnits.toFixed(4));

    if (units > heldUnits) {
      return res.status(400).json({
        error: `Insufficient units. You hold ${heldUnits} units of this fund.`
      });
    }

    const amount = Number((units * nav).toFixed(2));
    const transaction = await createTransaction(userId, fund_id, "REDEEM", amount, units, nav);

    return res.status(201).json({ message: "Fund redeemed successfully", transaction });
  } catch (error) {
    console.error("Redeem Fund Error:", error);
    return res.status(500).json({ error: "Failed to redeem fund" });
  }
};

const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactions = await getTransactionsByUser(userId);
    return res.status(200).json({ count: transactions.length, transactions });
  } catch (error) {
    console.error("Transaction History Error:", error);
    return res.status(500).json({ error: "Failed to fetch transaction history" });
  }
};

const getPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactions = await getTransactionsByUser(userId);

    let totalInvestment = 0;
    const portfolioMap = {};

    transactions.forEach((txn) => {
      if (!portfolioMap[txn.fund_id]) {
        portfolioMap[txn.fund_id] = {
          fund_id: txn.fund_id,
          total_units: 0,   // ✅ renamed from units → total_units for frontend
          invested: 0,
          avg_nav: 0,
          buy_count: 0,
        };
      }

      if (txn.transaction_type === "BUY") {
        portfolioMap[txn.fund_id].total_units += Number(txn.units);
        portfolioMap[txn.fund_id].invested    += Number(txn.amount);
        portfolioMap[txn.fund_id].avg_nav     += Number(txn.nav);
        portfolioMap[txn.fund_id].buy_count   += 1;
        totalInvestment += Number(txn.amount);
      } else if (txn.transaction_type === "REDEEM") {
        portfolioMap[txn.fund_id].total_units -= Number(txn.units);
        portfolioMap[txn.fund_id].invested    -= Number(txn.amount);
        totalInvestment -= Number(txn.amount);
      }

      portfolioMap[txn.fund_id].total_units = Number(portfolioMap[txn.fund_id].total_units.toFixed(4));
      portfolioMap[txn.fund_id].invested    = Number(portfolioMap[txn.fund_id].invested.toFixed(2));
    });

    // Calculate avg_nav per fund and remove funds with 0 units (fully redeemed)
    const portfolio = Object.values(portfolioMap)
      .filter(f => f.total_units > 0)
      .map(f => ({
        fund_id:     f.fund_id,
        total_units: f.total_units,
        invested:    f.invested,
        avg_nav:     f.buy_count > 0 ? Number((f.avg_nav / f.buy_count).toFixed(2)) : 0,
      }));

    return res.status(200).json({
      userId,
      totalInvestment: Number(totalInvestment.toFixed(2)),
      totalTransactions: transactions.length,
      portfolio,
    });
  } catch (error) {
    console.error("Portfolio Error:", error);
    return res.status(500).json({ error: "Failed to fetch portfolio" });
  }
};

module.exports = { buyFund, redeemFund, getTransactionHistory, getPortfolio };