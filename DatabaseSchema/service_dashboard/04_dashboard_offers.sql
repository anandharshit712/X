-- Dashboard Offers Table
-- Stores advertising campaign information

CREATE TABLE IF NOT EXISTS dashboard_offers (
    advertiser_id VARCHAR(255) NOT NULL, -- Unique ID of advertiser
    employee_id VARCHAR(255), -- Email ID of the employee who accepted the campaign bid
    campaign_name VARCHAR(255) NOT NULL, -- Name of the offer advertiser wants to create
    app VARCHAR(255), -- Package ID of the app
    app_category VARCHAR(100), -- Examples include entertainment, finance, etc.
    description TEXT, -- Description of the campaign
    bid_requested DECIMAL(10,2) NOT NULL, -- Bid amount requested by the advertiser in dollars
    bid_accepted DECIMAL(10,2), -- Bid amount accepted by the employee and advertiser in dollars
    tracking_type VARCHAR(50) DEFAULT 'third_party' CHECK (tracking_type IN ('third_party', 'mmp')), -- Third party, mmp
    Capping INTEGER, -- Cap of the campaign
    tracking_url TEXT, -- Tracking URL of the campaign
    offer_type VARCHAR(20) NOT NULL CHECK (offer_type IN ('CPI', 'CPR', 'CPA')), -- CPI, CPR, CPA
    offer_status VARCHAR(20) DEFAULT 'created' CHECK (offer_status IN ('review', 'pause', 'created', 'live', 'stopped')), -- Status of the offer (review, pause, created, live, stopped)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp of the campaign created
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dashboard_offers_advertiser_id 
        FOREIGN KEY (advertiser_id) 
        REFERENCES dashboard_login(advertiser_id) 
        ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dashboard_offers_advertiser_id ON dashboard_offers(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_offers_employee_id ON dashboard_offers(employee_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_offers_app ON dashboard_offers(app);
CREATE INDEX IF NOT EXISTS idx_dashboard_offers_category ON dashboard_offers(app_category);
CREATE INDEX IF NOT EXISTS idx_dashboard_offers_type ON dashboard_offers(offer_type);
CREATE INDEX IF NOT EXISTS idx_dashboard_offers_status ON dashboard_offers(offer_status);
CREATE INDEX IF NOT EXISTS idx_dashboard_offers_created_at ON dashboard_offers(created_at);

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_dashboard_offers_updated_at 
    BEFORE UPDATE ON dashboard_offers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 