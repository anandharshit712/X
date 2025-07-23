-- Offerwall Users Table
-- Stores offerwall user information

CREATE TABLE IF NOT EXISTS offerwall_users (
    offerwall_user_id VARCHAR(255) PRIMARY KEY,
    parent_user_id VARCHAR(255) NOT NULL, -- advertiser app user ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    IP INET,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_offerwall_users_parent_id ON offerwall_users(parent_user_id);
CREATE INDEX IF NOT EXISTS idx_offerwall_users_created_at ON offerwall_users(created_at);
CREATE INDEX IF NOT EXISTS idx_offerwall_users_ip ON offerwall_users(IP);
CREATE INDEX IF NOT EXISTS idx_offerwall_users_country ON offerwall_users(country);
CREATE INDEX IF NOT EXISTS idx_offerwall_users_state ON offerwall_users(state);
CREATE INDEX IF NOT EXISTS idx_offerwall_users_city ON offerwall_users(city); 