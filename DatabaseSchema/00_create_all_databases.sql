-- Create all EngageX databases
-- This script creates all three databases for the EngageX platform

-- Create service_dashboard database
CREATE DATABASE IF NOT EXISTS service_dashboard;

-- Create service_offerwall database
CREATE DATABASE IF NOT EXISTS service_offerwall;

-- Create service_emailing database
CREATE DATABASE IF NOT EXISTS service_emailing;

-- Display created databases
SELECT datname FROM pg_database WHERE datname IN ('service_dashboard', 'service_offerwall', 'service_emailing'); 