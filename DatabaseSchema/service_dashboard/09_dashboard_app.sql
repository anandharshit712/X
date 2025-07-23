-- Dashboard App Table
-- Stores advertiser app information

CREATE TABLE IF NOT EXISTS dashboard_app (
    advertiser_id VARCHAR(255) NOT NULL, -- Unique id of advertiser
    app_name VARCHAR(255) NOT NULL, -- Name of the app
    app_id VARCHAR(255) NOT NULL, -- package_id
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp for amount spend
    CONSTRAINT fk_dashboard_app_advertiser_id 
        FOREIGN KEY (advertiser_id) 
        REFERENCES dashboard_login(advertiser_id) 
        ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dashboard_app_advertiser_id ON dashboard_app(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_app_app_id ON dashboard_app(app_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_app_created_at ON dashboard_app(created_at); 