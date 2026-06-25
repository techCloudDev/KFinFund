const pool = require("../config/db");

const createTransaction = async (
  userId,
  fundId,
  transactionType,
  amount,
  units,
  nav
) => {
  try {
    const query = `
      INSERT INTO transactions
      (user_id, fund_id, transaction_type, amount, units, nav)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [userId, fundId, transactionType, amount, units, nav];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("❌ Error creating transaction:", error.message);
    throw error;
  }
};

const getTransactionsByUser = async (userId) => {
  try {
    const query = `
      SELECT *
      FROM transactions
      WHERE user_id = $1
      ORDER BY transaction_date DESC;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  } catch (error) {
    console.error("❌ Error fetching transactions:", error.message);
    throw error;
  }
};

module.exports = {
  createTransaction,
  getTransactionsByUser
};
