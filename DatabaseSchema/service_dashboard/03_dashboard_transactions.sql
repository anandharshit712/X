-- Dashboard Transactions Table
-- Stores payment transaction records

CREATE TABLE IF NOT EXISTS dashboard_transactions (
    advertiser_id VARCHAR(255) NOT NULL, -- Unique_id of advertiser
    transaction_id SERIAL PRIMARY KEY, -- Unique_id of the transaction
    amount DECIMAL(10,2) NOT NULL, -- Amount of the transaction
    transaction_status VARCHAR(50) DEFAULT 'pending' CHECK (transaction_status IN ('pending', 'completed', 'failed', 'cancelled')), -- Status of the transaction
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('UPI', 'Credit card', 'debit card')), -- UPI, Credit card, debit card
    Coupon_code VARCHAR(50), -- If there
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp of the transaction initiated
    completed_at TIMESTAMP, -- Timestamp of the transaction completed
    idempotency_token VARCHAR(255) UNIQUE, -- Idempotency token of the transaction
    CONSTRAINT fk_dashboard_transactions_advertiser_id 
        FOREIGN KEY (advertiser_id) 
        REFERENCES dashboard_login(advertiser_id) 
        ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dashboard_transactions_advertiser_id ON dashboard_transactions(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_transactions_status ON dashboard_transactions(transaction_status);
CREATE INDEX IF NOT EXISTS idx_dashboard_transactions_type ON dashboard_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_dashboard_transactions_created_at ON dashboard_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_dashboard_transactions_idempotency ON dashboard_transactions(idempotency_token); 