-- Dashboard Images Table
-- Stores logo and banner images for advertisers

CREATE TABLE IF NOT EXISTS dashboard_images (
    advertiser_id VARCHAR(255) PRIMARY KEY, -- Unique ID of advertiser
    logo VARCHAR(255), -- Logo of the app
    Banner VARCHAR(255), -- Banner of the app
    logo_created_at TIMESTAMP, -- Timestamp of uploading logo
    banner_created_at TIMESTAMP, -- Timestamp of uploading banner
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dashboard_images_advertiser_id 
        FOREIGN KEY (advertiser_id) 
        REFERENCES dashboard_login(advertiser_id) 
        ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dashboard_images_logo_created_at ON dashboard_images(logo_created_at);
CREATE INDEX IF NOT EXISTS idx_dashboard_images_banner_created_at ON dashboard_images(banner_created_at); 