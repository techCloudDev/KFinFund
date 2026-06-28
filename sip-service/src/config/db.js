const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// ✅ Auto-create sips table on startup
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sips (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        fund_name VARCHAR(255) NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        frequency VARCHAR(20) DEFAULT 'MONTHLY',
        start_date DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CANCELLED', 'PAUSED')),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ SIPs table ready");
  } catch (err) {
    console.error("❌ Failed to create sips table:", err.message);
  }
};

pool.connect()
  .then(async () => {
    console.log("✅ PostgreSQL Connected Successfully");
    await initDB();
  })
  .catch((error) => {
    console.error("❌ PostgreSQL Connection Failed");
    console.error("Reason:", error.message);
  });

module.exports = pool;