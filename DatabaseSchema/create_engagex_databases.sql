-- =====================================================
-- EngageX Database Creation Script
-- Creates main engagex database and all service databases
-- =====================================================

-- Connect to PostgreSQL as superuser first
-- psql -U postgres

-- Drop existing databases if they exist (be careful with this in production!)
DROP DATABASE IF EXISTS engagex CASCADE;
DROP DATABASE IF EXISTS service_dashboard CASCADE;
DROP DATABASE IF EXISTS service_offerwall CASCADE;
DROP DATABASE IF EXISTS service_emailing CASCADE;

-- Create main engagex database
CREATE DATABASE engagex
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Create service_dashboard database
CREATE DATABASE service_dashboard
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Create service_offerwall database
CREATE DATABASE service_offerwall
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Create service_emailing database
CREATE DATABASE service_emailing
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- =====================================================
-- Connect to service_dashboard database and create tables
-- =====================================================

\c service_dashboard;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. dashboard_login table
CREATE TABLE dashboard_login (
    id SERIAL PRIMARY KEY,
    advertiser_id VARCHAR(255) UNIQUE NOT NULL,
    Name TEXT NOT NULL,
    E_mail VARCHAR(255) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Account_type VARCHAR(50) CHECK (Account_type IN ('Individual', 'Company')) NOT NULL,
    Address TEXT,
    City VARCHAR(100),
    State VARCHAR(100),
    Country VARCHAR(100),
    Phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. dashboard_details table
CREATE TABLE dashboard_details (
    id SERIAL PRIMARY KEY,
    advertiser_id VARCHAR(255) REFERENCES dashboard_login(advertiser_id) ON DELETE CASCADE,
    Personal_email VARCHAR(255),
    WhatsApp VARCHAR(20),
    Skype VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. dashboard_transactions table
CREATE TABLE dashboard_transactions (
    id SERIAL PRIMARY KEY,
    advertiser_id VARCHAR(255) REFERENCES dashboard_login(advertiser_id) ON DELETE CASCADE,
    transaction_id VARCHAR(255) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) CHECK (payment_method IN ('UPI', 'Credit card', 'Debit card')) NOT NULL,
    transaction_status VARCHAR(50) DEFAULT 'pending',
    idempotency_token VARCHAR(255) UNIQUE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. dashboard_offers table
CREATE TABLE dashboard_offers (
    id SERIAL PRIMARY KEY,
    advertiser_id VARCHAR(255) REFERENCES dashboard_login(advertiser_id) ON DELETE CASCADE,
    campaign_name VARCHAR(255) NOT NULL,
    bid_requested DECIMAL(10,2) NOT NULL,
    offer_type VARCHAR(10) CHECK (offer_type IN ('CPI', 'CPR', 'CPA')) NOT NULL,
    employee_id VARCHAR(255),
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. dashboard_wallet table
CREATE TABLE dashboard_wallet (
    id SERIAL PRIMARY KEY,
    advertiser_id VARCHAR(255) REFERENCES dashboard_login(advertiser_id) ON DELETE CASCADE,
    balance DECIMAL(10,2) DEFAULT 0.00,
    amount_in_INR DECIMAL(10,2) DEFAULT 0.00,
    transaction_type VARCHAR(50) CHECK (transaction_type IN ('CREDIT', 'TRANSACTION_REVERSAL', 'REFUND')) NOT NULL,
    employee_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. dashboard_images table
CREATE TABLE dashboard_images (
    id SERIAL PRIMARY KEY,
    advertiser_id VARCHAR(255) REFERENCES dashboard_login(advertiser_id) ON DELETE CASCADE,
    logo_url TEXT,
    banner_url TEXT,
    logo_uploaded_at TIMESTAMP,
    banner_uploaded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. dashboard_wallet_balance_tracking table
CREATE TABLE dashboard_wallet_balance_tracking (
    id SERIAL PRIMARY KEY,
    wallet_id INTEGER REFERENCES dashboard_wallet(id) ON DELETE CASCADE,
    previous_balance DECIMAL(10,2) NOT NULL,
    new_balance DECIMAL(10,2) NOT NULL,
    change_amount DECIMAL(10,2) NOT NULL,
    change_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. dashboard_wallet_spending table
CREATE TABLE dashboard_wallet_spending (
    id SERIAL PRIMARY KEY,
    wallet_id INTEGER REFERENCES dashboard_wallet(id) ON DELETE CASCADE,
    campaign_id VARCHAR(255),
    amount_spent DECIMAL(10,2) NOT NULL,
    conversions_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. dashboard_app table
CREATE TABLE dashboard_app (
    id SERIAL PRIMARY KEY,
    advertiser_id VARCHAR(255) REFERENCES dashboard_login(advertiser_id) ON DELETE CASCADE,
    package_id VARCHAR(255) NOT NULL,
    app_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for service_dashboard
CREATE INDEX idx_dashboard_login_email ON dashboard_login(E_mail);
CREATE INDEX idx_dashboard_login_advertiser_id ON dashboard_login(advertiser_id);
CREATE INDEX idx_dashboard_transactions_advertiser_id ON dashboard_transactions(advertiser_id);
CREATE INDEX idx_dashboard_transactions_status ON dashboard_transactions(transaction_status);
CREATE INDEX idx_dashboard_offers_advertiser_id ON dashboard_offers(advertiser_id);
CREATE INDEX idx_dashboard_offers_approved ON dashboard_offers(is_approved);
CREATE INDEX idx_dashboard_wallet_advertiser_id ON dashboard_wallet(advertiser_id);
CREATE INDEX idx_dashboard_wallet_balance ON dashboard_wallet(balance);

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_dashboard_login_updated_at BEFORE UPDATE ON dashboard_login FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dashboard_details_updated_at BEFORE UPDATE ON dashboard_details FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dashboard_transactions_updated_at BEFORE UPDATE ON dashboard_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dashboard_offers_updated_at BEFORE UPDATE ON dashboard_offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dashboard_wallet_updated_at BEFORE UPDATE ON dashboard_wallet FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dashboard_images_updated_at BEFORE UPDATE ON dashboard_images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dashboard_wallet_spending_updated_at BEFORE UPDATE ON dashboard_wallet_spending FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dashboard_app_updated_at BEFORE UPDATE ON dashboard_app FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Connect to service_offerwall database and create tables
-- =====================================================

\c service_offerwall;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. offerwall_clicks table
CREATE TABLE offerwall_clicks (
    id SERIAL PRIMARY KEY,
    offerwall_user_id VARCHAR(255) NOT NULL,
    offer_id VARCHAR(255) NOT NULL,
    click_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    device_type VARCHAR(50),
    country VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. offerwall_conversions table
CREATE TABLE offerwall_conversions (
    id SERIAL PRIMARY KEY,
    offerwall_user_id VARCHAR(255) NOT NULL,
    offer_id VARCHAR(255) NOT NULL,
    click_id INTEGER REFERENCES offerwall_clicks(id) ON DELETE CASCADE,
    conversion_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payout_amount DECIMAL(10,2) NOT NULL,
    conversion_status VARCHAR(50) DEFAULT 'pending',
    transaction_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. offerwall_offers table
CREATE TABLE offerwall_offers (
    id SERIAL PRIMARY KEY,
    offer_id VARCHAR(255) UNIQUE NOT NULL,
    offer_name VARCHAR(255) NOT NULL,
    description TEXT,
    payout_amount DECIMAL(10,2) NOT NULL,
    offer_type VARCHAR(50),
    advertiser_id VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. offerwall_offer_status table
CREATE TABLE offerwall_offer_status (
    id SERIAL PRIMARY KEY,
    offerwall_user_id VARCHAR(255) NOT NULL,
    offer_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) CHECK (status IN ('available', 'completed', 'in_progress', 'expired')) NOT NULL,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. offerwall_postback table
CREATE TABLE offerwall_postback (
    id SERIAL PRIMARY KEY,
    offerwall_user_id VARCHAR(255) NOT NULL,
    offer_id VARCHAR(255) NOT NULL,
    postback_url TEXT NOT NULL,
    postback_data TEXT,
    response_status INTEGER,
    response_message TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. offerwall_users table
CREATE TABLE offerwall_users (
    id SERIAL PRIMARY KEY,
    offerwall_user_id VARCHAR(255) UNIQUE NOT NULL,
    user_email VARCHAR(255),
    user_name VARCHAR(255),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. user_reward_status table
CREATE TABLE user_reward_status (
    id SERIAL PRIMARY KEY,
    offerwall_user_id VARCHAR(255) NOT NULL,
    offer_id VARCHAR(255) NOT NULL,
    reward_amount DECIMAL(10,2) NOT NULL,
    reward_status VARCHAR(50) CHECK (reward_status IN ('pending', 'approved', 'rejected', 'paid')) DEFAULT 'pending',
    approved_by VARCHAR(255),
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. offerwall_revenue table
CREATE TABLE offerwall_revenue (
    id SERIAL PRIMARY KEY,
    offer_id VARCHAR(255) NOT NULL,
    advertiser_id VARCHAR(255),
    revenue_amount DECIMAL(10,2) NOT NULL,
    revenue_date DATE NOT NULL,
    conversion_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. offerwall_app table
CREATE TABLE offerwall_app (
    id SERIAL PRIMARY KEY,
    app_id VARCHAR(255) UNIQUE NOT NULL,
    app_name VARCHAR(255) NOT NULL,
    package_name VARCHAR(255),
    app_version VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. offerwall_payments table
CREATE TABLE offerwall_payments (
    id SERIAL PRIMARY KEY,
    offerwall_user_id VARCHAR(255) NOT NULL,
    payment_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    payment_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. offerwall_payments_status table
CREATE TABLE offerwall_payments_status (
    id SERIAL PRIMARY KEY,
    payment_id INTEGER REFERENCES offerwall_payments(id) ON DELETE CASCADE,
    status VARCHAR(50) CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
    status_message TEXT,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. offerwall_billing_details table
CREATE TABLE offerwall_billing_details (
    id SERIAL PRIMARY KEY,
    advertiser_id VARCHAR(255) NOT NULL,
    billing_name VARCHAR(255) NOT NULL,
    billing_email VARCHAR(255),
    billing_address TEXT,
    billing_city VARCHAR(100),
    billing_state VARCHAR(100),
    billing_country VARCHAR(100),
    billing_phone VARCHAR(20),
    tax_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. offerwall_invoice_upload table
CREATE TABLE offerwall_invoice_upload (
    id SERIAL PRIMARY KEY,
    advertiser_id VARCHAR(255) NOT NULL,
    invoice_file_path TEXT NOT NULL,
    invoice_number VARCHAR(255),
    invoice_date DATE,
    invoice_amount DECIMAL(10,2),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for service_offerwall
CREATE INDEX idx_offerwall_clicks_user_id ON offerwall_clicks(offerwall_user_id);
CREATE INDEX idx_offerwall_clicks_offer_id ON offerwall_clicks(offer_id);
CREATE INDEX idx_offerwall_clicks_timestamp ON offerwall_clicks(click_timestamp);
CREATE INDEX idx_offerwall_conversions_user_id ON offerwall_conversions(offerwall_user_id);
CREATE INDEX idx_offerwall_conversions_offer_id ON offerwall_conversions(offer_id);
CREATE INDEX idx_offerwall_conversions_status ON offerwall_conversions(conversion_status);
CREATE INDEX idx_offerwall_offers_offer_id ON offerwall_offers(offer_id);
CREATE INDEX idx_offerwall_offers_active ON offerwall_offers(is_active);
CREATE INDEX idx_offerwall_users_user_id ON offerwall_users(offerwall_user_id);
CREATE INDEX idx_offerwall_users_email ON offerwall_users(user_email);

-- Apply triggers to service_offerwall tables
CREATE TRIGGER update_offerwall_offers_updated_at BEFORE UPDATE ON offerwall_offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_offerwall_offer_status_updated_at BEFORE UPDATE ON offerwall_offer_status FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_offerwall_users_updated_at BEFORE UPDATE ON offerwall_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_reward_status_updated_at BEFORE UPDATE ON user_reward_status FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_offerwall_app_updated_at BEFORE UPDATE ON offerwall_app FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_offerwall_payments_status_updated_at BEFORE UPDATE ON offerwall_payments_status FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_offerwall_billing_details_updated_at BEFORE UPDATE ON offerwall_billing_details FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Connect to service_emailing database and create tables
-- =====================================================

\c service_emailing;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. email_clicks table
CREATE TABLE email_clicks (
    id SERIAL PRIMARY KEY,
    email_id VARCHAR(255) NOT NULL,
    offerwall_user_id VARCHAR(255) NOT NULL,
    offer_id VARCHAR(255) NOT NULL,
    click_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    campaign_id VARCHAR(255),
    email_template VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for service_emailing
CREATE INDEX idx_email_clicks_email_id ON email_clicks(email_id);
CREATE INDEX idx_email_clicks_user_id ON email_clicks(offerwall_user_id);
CREATE INDEX idx_email_clicks_offer_id ON email_clicks(offer_id);
CREATE INDEX idx_email_clicks_timestamp ON email_clicks(click_timestamp);
CREATE INDEX idx_email_clicks_campaign_id ON email_clicks(campaign_id);

-- =====================================================
-- Connect back to main engagex database
-- =====================================================

\c engagex;

-- Create a summary table to track all databases
CREATE TABLE database_summary (
    id SERIAL PRIMARY KEY,
    database_name VARCHAR(100) NOT NULL,
    table_count INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert summary data
INSERT INTO database_summary (database_name, table_count) VALUES
('service_dashboard', 9),
('service_offerwall', 13),
('service_emailing', 1);

-- =====================================================
-- Final verification queries
-- =====================================================

-- Display database summary
SELECT * FROM database_summary;

-- Display all databases
SELECT datname FROM pg_database WHERE datname LIKE '%engagex%' OR datname LIKE '%service_%';

-- =====================================================
-- Success message
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'EngageX Database Setup Completed Successfully!';
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'Created databases:';
    RAISE NOTICE '- engagex (main database)';
    RAISE NOTICE '- service_dashboard (9 tables)';
    RAISE NOTICE '- service_offerwall (13 tables)';
    RAISE NOTICE '- service_emailing (1 table)';
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'Total tables created: 23';
    RAISE NOTICE 'All indexes and triggers configured';
    RAISE NOTICE '====================================================';
END $$; 