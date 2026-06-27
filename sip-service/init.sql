-- Run this file to create the sips table in PostgreSQL
-- Command: psql -U postgres -d kfinfund -f init.sql

CREATE TABLE IF NOT EXISTS sips (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  fund_name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  frequency VARCHAR(20) NOT NULL,
  start_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
