-- Dashboard Wallet Balance Tracking Table
-- Tracks wallet balance history

CREATE TABLE IF NOT EXISTS dashboard_wallet_balance_tracking (
    advertiser_id VARCHAR(255) NOT NULL, -- Unique id of advertiser
    wallet_id SERIAL PRIMARY KEY, -- Unique wallet id of the advertiser wallet
    current_balance DECIMAL(10,2) DEFAULT 0.00, -- Current balance of the wallet (dollars)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dashboard_wallet_balance_tracking_advertiser_id 
        FOREIGN KEY (advertiser_id) 
        REFERENCES dashboard_login(advertiser_id) 
        ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dashboard_wallet_balance_tracking_advertiser_id ON dashboard_wallet_balance_tracking(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_wallet_balance_tracking_created_at ON dashboard_wallet_balance_tracking(created_at); 