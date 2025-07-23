-- Dashboard Login Table
-- Stores advertiser authentication and basic information

CREATE TABLE IF NOT EXISTS dashboard_login (
    advertiser_id VARCHAR(255) PRIMARY KEY, -- Unique_id of advertiser
    name TEXT NOT NULL, -- Name of the advertiser
    email VARCHAR(255) UNIQUE NOT NULL, -- Email of the advertiser (Auth)
    password VARCHAR(255) NOT NULL, -- Password of the advertiser
    account_type TEXT CHECK (Account_type IN ('Individual', 'Company')), -- Individual/Company
    company_name VARCHAR(255), -- If selected company
    address VARCHAR(255), -- Address of the advertiser
    city TEXT, -- City of the advertiser
    pincode VARCHAR(20), -- Pincode of the advertiser
    country TEXT, -- Country of the advertiser
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dashboard_login_email ON dashboard_login(E_mail);
CREATE INDEX IF NOT EXISTS idx_dashboard_login_account_type ON dashboard_login(Account_type);
CREATE INDEX IF NOT EXISTS idx_dashboard_login_country ON dashboard_login(Country);
CREATE INDEX IF NOT EXISTS idx_dashboard_login_city ON dashboard_login(City);

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_dashboard_login_updated_at 
    BEFORE UPDATE ON dashboard_login 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 