const pool = require("../config/db");

const createSip = async (
  user_id,
  fund_name,
  amount,
  frequency,
  start_date
) => {
  try {

    const query = `
      INSERT INTO sips
      (user_id, fund_name, amount, frequency, start_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const values = [
      user_id,
      fund_name,
      amount,
      frequency,
      start_date
    ];

    const result = await pool.query(query, values);

    return result.rows[0];

  } catch (error) {

    console.error("❌ Error creating SIP:");
    console.error(error.message);

    throw error;
  }
};
const getAllSips = async () => {
  try {

    const result = await pool.query(
      "SELECT * FROM sips ORDER BY id"
    );

    return result.rows;

  } catch (error) {

    console.error(
      "❌ Error fetching SIPs:"
    );

    console.error(
      error.message
    );

    throw error;
  }
};
const getSipById = async (id) => {
  try {

    const result = await pool.query(
      "SELECT * FROM sips WHERE id = $1",
      [id]
    );

    return result.rows[0];

  } catch (error) {

    console.error(
      "❌ Error fetching SIP:"
    );

    console.error(
      error.message
    );

    throw error;
  }
};
const updateSip = async (
  id,
  fund_name,
  amount,
  frequency,
  start_date
) => {
  try {

    const result = await pool.query(
      `UPDATE sips
       SET fund_name = $1,
           amount = $2,
           frequency = $3,
           start_date = $4
       WHERE id = $5
       RETURNING *`,
      [
        fund_name,
        amount,
        frequency,
        start_date,
        id
      ]
    );

    return result.rows[0];

  } catch (error) {

    console.error(
      "❌ Error updating SIP:"
    );

    console.error(
      error.message
    );

    throw error;
  }
};
const cancelSip = async (id) => {
  try {

    const result = await pool.query(
      `UPDATE sips
       SET status = 'CANCELLED'
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    return result.rows[0];

  } catch (error) {

    console.error(
      "❌ Error cancelling SIP:"
    );

    console.error(
      error.message
    );

    throw error;
  }
};
const getUserSips = async (user_id) => {
  try {

    const result = await pool.query(
      "SELECT * FROM sips WHERE user_id = $1 ORDER BY id",
      [user_id]
    );

    return result.rows;

  } catch (error) {

    console.error(
      "❌ Error fetching user SIPs:"
    );

    console.error(
      error.message
    );

    throw error;
  }
};
    
module.exports = {
  createSip,
  getAllSips,
  getSipById,
  updateSip,
  cancelSip,
  getUserSips
};

