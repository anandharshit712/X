-- Dashboard Wallet Spending Table
-- Tracks spending from advertiser wallets

CREATE TABLE IF NOT EXISTS dashboard_wallet_spending (
    advertiser_id VARCHAR(255) NOT NULL, -- Unique id of advertiser
    wallet_id SERIAL PRIMARY KEY, -- Unique wallet id of the advertiser wallet
    amount_spend DECIMAL(10,2) DEFAULT 0.00, -- Amount spent on the date of campaign
    conversion_count INTEGER DEFAULT 0, -- Conversion count of the campaign
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp for amount spend
    CONSTRAINT fk_dashboard_wallet_spending_advertiser_id 
        FOREIGN KEY (advertiser_id) 
        REFERENCES dashboard_login(advertiser_id) 
        ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dashboard_wallet_spending_advertiser_id ON dashboard_wallet_spending(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_wallet_spending_created_at ON dashboard_wallet_spending(created_at); 