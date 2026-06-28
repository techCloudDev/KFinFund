const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

// ✅ Auto-create tables on startup
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        state VARCHAR(100),
        city VARCHAR(100),
        kyc_status VARCHAR(20) DEFAULT 'NOT_SUBMITTED',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Users table ready");
  } catch (err) {
    console.error("❌ Failed to create tables:", err.message);
  }
};

// Test connection and init tables
pool.connect(async (err, client, release) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Database connected successfully");
    release();
    await initDB();
  }
});

module.exports = pool;