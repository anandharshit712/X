-- Dashboard Details Table
-- Stores additional advertiser contact information

CREATE TABLE IF NOT EXISTS dashboard_details (
    advertiser_id VARCHAR(255) PRIMARY KEY, -- Unique_id of advertiser
    personal_email VARCHAR(255), -- Personal_email of the advertiser if there
    whatsapp_number VARCHAR(20), -- Whatsapp number of the advertiser
    skype_id VARCHAR(255), -- Skype_id of the advertiser
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dashboard_details_advertiser_id 
        FOREIGN KEY (advertiser_id) 
        REFERENCES dashboard_login(advertiser_id) 
        ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dashboard_details_personal_email ON dashboard_details(personal_email);
CREATE INDEX IF NOT EXISTS idx_dashboard_details_whatsapp ON dashboard_details(whatsapp_number);

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_dashboard_details_updated_at 
    BEFORE UPDATE ON dashboard_details 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 