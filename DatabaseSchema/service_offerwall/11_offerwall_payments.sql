-- Offerwall Payments Table
-- Tracks payment information

CREATE TABLE IF NOT EXISTS offerwall_payments (
    advertiser_id VARCHAR(255) NOT NULL,
    app_id VARCHAR(255) NOT NULL, -- Id of the app
    revenue DECIMAL(10,2),
    Date DATE NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_offerwall_payments_advertiser_id ON offerwall_payments(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_offerwall_payments_app_id ON offerwall_payments(app_id);
CREATE INDEX IF NOT EXISTS idx_offerwall_payments_date ON offerwall_payments(Date);
CREATE INDEX IF NOT EXISTS idx_offerwall_payments_advertiser_date ON offerwall_payments(advertiser_id, Date); 