-- Offerwall Billing Details Table
-- Stores billing information for advertisers

CREATE TABLE IF NOT EXISTS offerwall_billing_details (
    advertiser_id VARCHAR(255) PRIMARY KEY,
    beneficiary_name VARCHAR(255) NOT NULL, -- Beneficiary name of the billing account
    account_number VARCHAR(50) NOT NULL, -- Account number of the account
    IFSC_code VARCHAR(20) NOT NULL, -- IFSC code of the account
    PAN VARCHAR(20) NOT NULL, -- PAN number of the account
    GSTIN VARCHAR(20), -- GST number
    Bank_name VARCHAR(100) NOT NULL, -- Bank name of the account
    SWIFT_CODE VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Time stamp of details entered
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_offerwall_billing_details_created_at ON offerwall_billing_details(created_at);
CREATE INDEX IF NOT EXISTS idx_offerwall_billing_details_bank_name ON offerwall_billing_details(Bank_name); 