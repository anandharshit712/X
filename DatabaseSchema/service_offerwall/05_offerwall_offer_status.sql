-- Offerwall Offer Status Table
-- Tracks the status of offers for users

CREATE TABLE IF NOT EXISTS offerwall_offer_status (
    offerwall_user_id VARCHAR(255) NOT NULL,
    offer_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL, -- ONGOING, COMPLETED, etc.
    app_id VARCHAR(255) NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    expire_at TIMESTAMP,
    PRIMARY KEY (offerwall_user_id, offer_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_offerwall_offer_status_user_id ON offerwall_offer_status(offerwall_user_id);
CREATE INDEX IF NOT EXISTS idx_offerwall_offer_status_offer_id ON offerwall_offer_status(offer_id);
CREATE INDEX IF NOT EXISTS idx_offerwall_offer_status_status ON offerwall_offer_status(status);
CREATE INDEX IF NOT EXISTS idx_offerwall_offer_status_app_id ON offerwall_offer_status(app_id);
CREATE INDEX IF NOT EXISTS idx_offerwall_offer_status_started_at ON offerwall_offer_status(started_at); 