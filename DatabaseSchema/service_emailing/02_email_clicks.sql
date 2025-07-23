-- Email Clicks Table
-- Tracks email click information

CREATE TABLE IF NOT EXISTS email_clicks (
    offer_id VARCHAR(255) NOT NULL,
    offerwall_user_id VARCHAR(255) NOT NULL,
    click_id VARCHAR(255) PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp of the user clicked on offer
    IP INET, -- IP of the click id
    adv_id VARCHAR(255) NOT NULL, -- Advertiser id of the user clicked
    device_model VARCHAR(255), -- Device model of the user device who clicked
    OS VARCHAR(100) -- Operating System of the user device who clicked
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_clicks_offer_id ON email_clicks(offer_id);
CREATE INDEX IF NOT EXISTS idx_email_clicks_user_id ON email_clicks(offerwall_user_id);
CREATE INDEX IF NOT EXISTS idx_email_clicks_adv_id ON email_clicks(adv_id);
CREATE INDEX IF NOT EXISTS idx_email_clicks_created_at ON email_clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_email_clicks_ip ON email_clicks(IP); 