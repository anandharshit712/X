-- Offerwall Clicks Table
-- Tracks user clicks on offers

CREATE TABLE IF NOT EXISTS offerwall_clicks (
    offer_id VARCHAR(255) NOT NULL,
    offerwall_user_id VARCHAR(255) NOT NULL,
    click_id VARCHAR(255) PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    IP INET,
    adv_id VARCHAR(255) NOT NULL,
    device_model VARCHAR(255),
    OS VARCHAR(100)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_offerwall_clicks_offer_id ON offerwall_clicks(offer_id);
CREATE INDEX IF NOT EXISTS idx_offerwall_clicks_user_id ON offerwall_clicks(offerwall_user_id);
CREATE INDEX IF NOT EXISTS idx_offerwall_clicks_adv_id ON offerwall_clicks(adv_id);
CREATE INDEX IF NOT EXISTS idx_offerwall_clicks_created_at ON offerwall_clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_offerwall_clicks_ip ON offerwall_clicks(IP); 