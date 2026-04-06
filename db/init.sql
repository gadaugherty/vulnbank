-- VulnBank database initialization
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,  -- VULNERABILITY: Plaintext passwords (CWE-256)
    email VARCHAR(255),
    balance DECIMAL(10, 2) DEFAULT 1000.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    from_user_id INTEGER REFERENCES users(id),
    to_user_id INTEGER REFERENCES users(id),
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- VULNERABILITY: Default admin credentials (CWE-1393)
INSERT INTO users (username, password, email, balance)
VALUES
    ('admin', 'admin123', 'admin@vulnbank.com', 999999.99),
    ('alice', 'password', 'alice@example.com', 5000.00),
    ('bob', 'qwerty', 'bob@example.com', 3000.00)
ON CONFLICT (username) DO NOTHING;
