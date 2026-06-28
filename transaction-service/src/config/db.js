const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

// ✅ Auto-create transactions table on startup
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        fund_id VARCHAR(255) NOT NULL,
        transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('BUY', 'REDEEM')),
        amount DECIMAL(15,2) NOT NULL,
        units DECIMAL(15,4) NOT NULL,
        nav DECIMAL(15,2) NOT NULL,
        transaction_date TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Transactions table ready");
  } catch (err) {
    console.error("❌ Failed to create transactions table:", err.message);
  }
};

pool.connect(async (err, client, release) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ Database connected successfully");
    release();
    await initDB();
  }
});

module.exports = pool;