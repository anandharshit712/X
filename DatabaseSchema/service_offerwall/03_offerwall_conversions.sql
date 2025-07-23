-- Offerwall Conversions Table
-- Tracks user conversions on offers

CREATE TABLE IF NOT EXISTS offerwall_conversions (
    offer_id VARCHAR(255) NOT NULL,
    offerwall_user_id VARCHAR(255) NOT NULL,
    click_id VARCHAR(255) NOT NULL,
    conversion_id VARCHAR(255) PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    IP INET,
    adv_id VARCHAR(255) NOT NULL,
    device_model VARCHAR(255),
    OS VARCHAR(100)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_offerwall_conversions_offer_id ON offerwall_conversions(offer_id);
CREATE INDEX IF NOT EXISTS idx_offerwall_conversions_user_id ON offerwall_conversions(offerwall_user_id);
CREATE INDEX IF NOT EXISTS idx_offerwall_conversions_click_id ON offerwall_conversions(click_id);
CREATE INDEX IF NOT EXISTS idx_offerwall_conversions_adv_id ON offerwall_conversions(adv_id);
CREATE INDEX IF NOT EXISTS idx_offerwall_conversions_created_at ON offerwall_conversions(created_at);
CREATE INDEX IF NOT EXISTS idx_offerwall_conversions_ip ON offerwall_conversions(IP); 