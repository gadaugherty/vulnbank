-- VulnBank database initialization — SECURED version

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    -- FIX: Store hashed password + salt, never plaintext
    password_hash VARCHAR(255) NOT NULL,
    password_salt VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    balance DECIMAL(10, 2) DEFAULT 1000.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    from_user_id INTEGER REFERENCES users(id),
    to_user_id INTEGER REFERENCES users(id),
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),  -- FIX: Constraint prevents negative transfers
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FIX: No default credentials inserted
-- Users must register through the application
-- Admin accounts should be provisioned through a separate secured process

-- FIX: Create index for common queries
CREATE INDEX IF NOT EXISTS idx_transactions_from_user ON transactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_to_user ON transactions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
