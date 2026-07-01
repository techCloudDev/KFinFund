const pool = require("../config/db");

// ✅ Auto-add scheme_code column if it doesn't exist (safe on every restart)
const ensureSchemeCodeColumn = async () => {
  try {
    await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS scheme_code VARCHAR(20);`);
    console.log("✅ scheme_code column ready on transactions table");
  } catch (err) {
    console.error("❌ Failed to add scheme_code column:", err.message);
  }
};
ensureSchemeCodeColumn();

const createTransaction = async (
  userId,
  fundId,
  transactionType,
  amount,
  units,
  nav,
  schemeCode = null
) => {
  try {
    const query = `
      INSERT INTO transactions
      (user_id, fund_id, transaction_type, amount, units, nav, scheme_code)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [userId, fundId, transactionType, amount, units, nav, schemeCode];
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