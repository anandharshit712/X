-- Create service_offerwall database
-- This database contains offerwall-related tables for the EngageX platform

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS service_offerwall;

-- Use the database
\c service_offerwall;

-- Create extension for UUID generation (if not exists)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the update_updated_at_column function for all tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql'; 