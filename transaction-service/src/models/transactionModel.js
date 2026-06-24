const pool = require("../config/db");

const createTransaction = async (
  userId,
  fundId,
  transactionType,
  amount,
  units,
  nav
) => {
  const query = `
    INSERT INTO transactions
    (user_id, fund_id, transaction_type, amount, units, nav)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;

  const values = [
    userId,
    fundId,
    transactionType,
    amount,
    units,
    nav
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

const getTransactionsByUser = async (userId) => {
  const query = `
    SELECT *
    FROM transactions
    WHERE user_id = $1
    ORDER BY transaction_date DESC;
  `;

  const result = await pool.query(query, [userId]);

  return result.rows;
};

module.exports = {
  createTransaction,
  getTransactionsByUser
};
