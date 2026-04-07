-- VulnBank database initialization
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    account_number VARCHAR(20) NOT NULL UNIQUE,
    routing_number VARCHAR(9) DEFAULT '021000089',
    balance DECIMAL(10, 2) DEFAULT 1000.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    from_account VARCHAR(20) NOT NULL,
    to_account VARCHAR(20) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed users with realistic account numbers
INSERT INTO users (username, password, email, account_number, balance) VALUES
('jsmith',       'Password1!',    'john.smith@gmail.com',       '4821-7390-0142', 24817.43),
('sarah.connor', 'terminator2',   'sconnor@protonmail.com',     '4821-7390-0258', 8432.19),
('mike.chen',    'dragon2024',    'mike.chen@outlook.com',      '4821-7390-0371', 156290.87),
('emily.r',      'sunshine99',    'emily.rodriguez@yahoo.com',  '4821-7390-0493', 3201.55),
('admin',        'admin123',      'admin@vulnbank.com',         '4821-7390-0500', 999999.99),
('david.kim',    'qwerty!@#',     'dkim@gmail.com',             '4821-7390-0614', 47823.61),
('lisa.wang',    'iloveyou2024',  'lisa.w@hotmail.com',         '4821-7390-0729', 12094.33),
('alex.jones',   'football99',    'ajones@gmail.com',           '4821-7390-0837', 890.12),
('priya.patel',  'Welcome1!',     'priya.p@outlook.com',        '4821-7390-0941', 67451.28),
('carlos.m',     'letmein2024',   'carlos.mendez@gmail.com',    '4821-7390-1056', 5520.00),
('jennifer.wu',  'P@ssw0rd',      'jwu@company.com',            '4821-7390-1168', 234100.50),
('robert.taylor','baseball1',     'rtaylor@yahoo.com',          '4821-7390-1273', 1843.77)
ON CONFLICT (username) DO NOTHING;

INSERT INTO transactions (from_account, to_account, amount, description, status) VALUES
('4821-7390-0142', '4821-7390-0258', 250.00,  'Dinner split',        'completed'),
('4821-7390-0371', '4821-7390-0142', 1500.00, 'Consulting payment',  'completed'),
('4821-7390-0500', '4821-7390-0493', 75.50,   'Refund',              'completed'),
('4821-7390-0258', '4821-7390-0614', 320.00,  'Rent share',          'completed'),
('4821-7390-0729', '4821-7390-0371', 89.99,   'Software license',    'completed'),
('4821-7390-0493', '4821-7390-0837', 45.00,   'Coffee and lunch',    'completed'),
('4821-7390-0941', '4821-7390-0142', 2000.00, 'Freelance project',   'completed'),
('4821-7390-0614', '4821-7390-1056', 150.00,  'Birthday gift',       'completed'),
('4821-7390-1168', '4821-7390-0500', 5000.00, 'Investment transfer',  'completed'),
('4821-7390-0142', '4821-7390-0729', 199.99,  'Online purchase',     'completed')
ON CONFLICT DO NOTHING;
