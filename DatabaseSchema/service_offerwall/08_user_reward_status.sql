-- User Reward Status Table
-- Tracks reward status for users

CREATE TABLE IF NOT EXISTS user_reward_status (
    offerwall_user_id VARCHAR(255) NOT NULL,
    offer_id VARCHAR(255) NOT NULL,
    reward_id VARCHAR(255) NOT NULL,
    status VARCHAR(100) NOT NULL, -- ONGOING LOCAL VERIFIED, SERVER_VERIFIED, etc.
    app_id VARCHAR(255) NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tracking_at TIMESTAMP,
    completed_at TIMESTAMP,
    PRIMARY KEY (offerwall_user_id, offer_id, reward_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_reward_status_user_id ON user_reward_status(offerwall_user_id);
CREATE INDEX IF NOT EXISTS idx_user_reward_status_offer_id ON user_reward_status(offer_id);
CREATE INDEX IF NOT EXISTS idx_user_reward_status_reward_id ON user_reward_status(reward_id);
CREATE INDEX IF NOT EXISTS idx_user_reward_status_status ON user_reward_status(status);
CREATE INDEX IF NOT EXISTS idx_user_reward_status_app_id ON user_reward_status(app_id);
CREATE INDEX IF NOT EXISTS idx_user_reward_status_started_at ON user_reward_status(started_at); 