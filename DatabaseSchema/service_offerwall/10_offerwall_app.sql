-- Offerwall App Table
-- Stores app information for offerwall

CREATE TABLE IF NOT EXISTS offerwall_app (
    advertiser_id VARCHAR(255) NOT NULL,
    app_id VARCHAR(255) NOT NULL, -- Id of the app
    app_package VARCHAR(255) NOT NULL, -- Package id of the app
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_offerwall_app_advertiser_id ON offerwall_app(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_offerwall_app_app_id ON offerwall_app(app_id);
CREATE INDEX IF NOT EXISTS idx_offerwall_app_package ON offerwall_app(app_package);
CREATE INDEX IF NOT EXISTS idx_offerwall_app_status ON offerwall_app(status);
CREATE INDEX IF NOT EXISTS idx_offerwall_app_created_at ON offerwall_app(created_at); 