-- Offerwall Postback Table
-- Records postback information for conversions

CREATE TABLE IF NOT EXISTS offerwall_postback (
    offerwall_user_id VARCHAR(255) NOT NULL,
    offer_id VARCHAR(255) NOT NULL,
    reward_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    IP INET
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_offerwall_postback_user_id ON offerwall_postback(offerwall_user_id);
CREATE INDEX IF NOT EXISTS idx_offerwall_postback_offer_id ON offerwall_postback(offer_id);
CREATE INDEX IF NOT EXISTS idx_offerwall_postback_reward_id ON offerwall_postback(reward_id);
CREATE INDEX IF NOT EXISTS idx_offerwall_postback_created_at ON offerwall_postback(created_at);
CREATE INDEX IF NOT EXISTS idx_offerwall_postback_ip ON offerwall_postback(IP); 