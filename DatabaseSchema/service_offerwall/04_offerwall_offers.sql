-- Offerwall Offers Table
-- Stores offer information

CREATE TABLE IF NOT EXISTS offerwall_offers (
    offer_id VARCHAR(255) PRIMARY KEY,
    title_in_english VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    affiliate VARCHAR(255) NOT NULL, -- advertiser
    app_id VARCHAR(255) NOT NULL,
    offer_type VARCHAR(100) -- CPI, CPR, APK-REGISTER, etc.
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_offerwall_offers_affiliate ON offerwall_offers(affiliate);
CREATE INDEX IF NOT EXISTS idx_offerwall_offers_app_id ON offerwall_offers(app_id);
CREATE INDEX IF NOT EXISTS idx_offerwall_offers_type ON offerwall_offers(offer_type);
CREATE INDEX IF NOT EXISTS idx_offerwall_offers_created_at ON offerwall_offers(created_at); 