-- Offerwall Payments Status Table
-- Tracks payment status information

CREATE TABLE IF NOT EXISTS offerwall_payments_status (
    advertiser_id VARCHAR(255) NOT NULL,
    validate_revenue DECIMAL(10,2),
    app_id VARCHAR(255) NOT NULL, -- Id of the app
    status VARCHAR(50) NOT NULL, -- Status of the amount
    transaction_id VARCHAR(255) NOT NULL, -- Transaction id of the payment
    Date DATE NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_offerwall_payments_status_advertiser_id ON offerwall_payments_status(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_offerwall_payments_status_app_id ON offerwall_payments_status(app_id);
CREATE INDEX IF NOT EXISTS idx_offerwall_payments_status_status ON offerwall_payments_status(status);
CREATE INDEX IF NOT EXISTS idx_offerwall_payments_status_transaction_id ON offerwall_payments_status(transaction_id);
CREATE INDEX IF NOT EXISTS idx_offerwall_payments_status_date ON offerwall_payments_status(Date); 