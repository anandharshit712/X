-- Dashboard Wallet Table
-- Stores wallet transaction information

CREATE TABLE IF NOT EXISTS dashboard_wallet (
    advertiser_id VARCHAR(255) NOT NULL, -- Unique ID of advertiser
    employee_id VARCHAR(255), -- Email ID of the employee who is handling that advertiser
    balance DECIMAL(10,2) DEFAULT 0.00, -- Balance of the wallet (Dollars)
    amount_in_INR DECIMAL(10,2) DEFAULT 0.00, -- Amount of the amount adding to wallet
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('CREDIT', 'TRANSACTION_REVERSAL', 'REFUND')), -- CREDIT/TRANSACTION_REVERSAL/REFUND
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp of transaction status
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp of status updated
    CONSTRAINT fk_dashboard_wallet_advertiser_id 
        FOREIGN KEY (advertiser_id) 
        REFERENCES dashboard_login(advertiser_id) 
        ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dashboard_wallet_advertiser_id ON dashboard_wallet(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_wallet_employee_id ON dashboard_wallet(employee_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_wallet_transaction_type ON dashboard_wallet(transaction_type);
CREATE INDEX IF NOT EXISTS idx_dashboard_wallet_created_at ON dashboard_wallet(created_at);

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_dashboard_wallet_updated_at 
    BEFORE UPDATE ON dashboard_wallet 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 