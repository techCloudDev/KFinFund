const pool = require("../config/db");

const createUser = async (full_name, email, password, phone) => {
  try {
    const query = `
      INSERT INTO users(full_name, email, password, phone)
      VALUES($1,$2,$3,$4)
      RETURNING id, full_name, email, phone, created_at
    `;
    const values = [full_name, email, password, phone];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("❌ Error creating user:", error.message);
    throw error;
  }
};

const getUserByEmail = async (email) => {
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    return result.rows[0];
  } catch (error) {
    console.error("❌ Error fetching user:", error.message);
    throw error;
  }
};

module.exports = { createUser, getUserByEmail };
