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

const getUserById = async (id) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, email, phone, created_at
       FROM users
       WHERE id = $1`,
      [id]
    );

    return result.rows[0];
  } catch (error) {
    console.error("❌ Error fetching profile:", error.message);
    throw error;
  }
};
const updateUserProfile = async (
  id,
  full_name,
  phone
) => {
  try {
    const result = await pool.query(
      `
      UPDATE users
      SET full_name = $1,
          phone = $2
      WHERE id = $3
      RETURNING id,
                full_name,
                email,
                phone,
                created_at
      `,
      [full_name, phone, id]
    );

    return result.rows[0];

  } catch (error) {
    console.error(
      "❌ Error updating profile:",
      error.message
    );
    throw error;
  }
};
module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  updateUserProfile
};

