-- =====================================================================
-- EngageX Employee/Publisher/Advertiser Databases Bootstrap (psql-friendly)
-- Creates databases and core tables for: service_employee, service_employee_publisher, service_employee_advertisers
-- Usage:
--   psql -U postgres -h localhost -d postgres -f init_engagex_employee_dbs.sql
-- NOTE: Cross-database foreign keys are not supported in PostgreSQL. Wherever the
--       PDF/workflow imply cross-db relationships (e.g., employee_emailid linking back
--       to service_employee.dashboard_login_employee.email), we add indexes and comments.
-- =====================================================================
\set ON_ERROR_STOP on

-- ---------- Create databases if they don't exist ----------
SELECT 'CREATE DATABASE service_employee'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'service_employee')\gexec

SELECT 'CREATE DATABASE service_employee_publisher'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'service_employee_publisher')\gexec

SELECT 'CREATE DATABASE service_employee_advertisers'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'service_employee_advertisers')\gexec

-- =====================================================================
-- Database 1 : service_employee
-- =====================================================================
\connect service_employee

CREATE SCHEMA IF NOT EXISTS public;

-- Table 1 : dashboard_login_employee
-- Source: EngageX employee DB (Database 1)
-- Primary key per PDF: employee_id
CREATE TABLE IF NOT EXISTS public.dashboard_login_employee (
  employee_id        BIGSERIAL PRIMARY KEY,
  name               TEXT,
  email              VARCHAR(255) UNIQUE NOT NULL,
  password           VARCHAR(255) NOT NULL,
  access_type        VARCHAR(50) DEFAULT 'Employee',  -- as per PDF
  created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at      TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE public.dashboard_login_employee IS 'Employee auth table (PDF: Database 1).';
COMMENT ON COLUMN public.dashboard_login_employee.email IS 'Auth email. Referenced logically by employee_emailid columns in other DBs.';

-- =====================================================================
-- Database 2 : service_employee_publisher
-- =====================================================================
\connect service_employee_publisher

CREATE SCHEMA IF NOT EXISTS public;

-- Optional lookup: publishers (for enforceable FKs on publisher_name)
CREATE TABLE IF NOT EXISTS public.publishers (
  publisher_name     TEXT PRIMARY KEY,
  created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 1 : dashboard_validation
-- Primary key per instruction: employee_emailid
CREATE TABLE IF NOT EXISTS public.dashboard_validation (
  employee_emailid   VARCHAR(255) PRIMARY KEY,
  publisher_name     TEXT REFERENCES public.publishers(publisher_name),
  actual_payout      NUMERIC(12,2),
  deduction          NUMERIC(12,2),
  billable_payout    NUMERIC(12,2),
  gst_amount         NUMERIC(12,2),
  billable_payout_nongst NUMERIC(12,2),
  created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  month              SMALLINT,
  year               SMALLINT
);

-- Table 2 : dashboard_invoices
-- employee_emailid is PK as per instruction. invoice_number unique.
CREATE TABLE IF NOT EXISTS public.dashboard_invoices (
  employee_emailid   VARCHAR(255) PRIMARY KEY,
  publisher_name     TEXT REFERENCES public.publishers(publisher_name),
  invoice_number     TEXT UNIQUE,
  payout_amount      NUMERIC(12,2),
  invoice_status     TEXT,
  notes              TEXT,
  submitted_at       TIMESTAMP WITH TIME ZONE,
  updated_at         TIMESTAMP WITH TIME ZONE,
  month_invoice      SMALLINT,
  year_invoice       SMALLINT
);

-- Table 3 : dashboard_payout_transactions
CREATE TABLE IF NOT EXISTS public.dashboard_payout_transactions (
  employee_emailid   VARCHAR(255) PRIMARY KEY,
  publisher_name     TEXT REFERENCES public.publishers(publisher_name),
  payout_amount      NUMERIC(12,2),
  description        TEXT,
  paid_in_full       BOOLEAN,
  created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 4 : dashboard_pub_approval
CREATE TABLE IF NOT EXISTS public.dashboard_pub_approval (
  employee_emailid   VARCHAR(255) PRIMARY KEY,
  approval_status    TEXT,   -- pending/approved/rejected
  approved_at        TIMESTAMP WITH TIME ZONE
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_validation_pub ON public.dashboard_validation(publisher_name);
CREATE INDEX IF NOT EXISTS idx_invoices_pub ON public.dashboard_invoices(publisher_name);

COMMENT ON TABLE public.dashboard_validation IS 'Publisher validation entries (PDF: Database 2).';
COMMENT ON TABLE public.dashboard_invoices IS 'Invoices with approval state (PDF: Database 2).';
COMMENT ON TABLE public.dashboard_payout_transactions IS 'Payout transactions to publishers (PDF: Database 2).';
COMMENT ON TABLE public.dashboard_pub_approval IS 'Publisher approvals (PDF: Database 2).';

-- Logical (cross-db) relationship note
COMMENT ON COLUMN public.dashboard_validation.employee_emailid IS 'Logical FK to service_employee.public.dashboard_login_employee.email (cross-db; not enforced).';
COMMENT ON COLUMN public.dashboard_invoices.employee_emailid IS 'Logical FK to service_employee.public.dashboard_login_employee.email (cross-db; not enforced).';
COMMENT ON COLUMN public.dashboard_payout_transactions.employee_emailid IS 'Logical FK to service_employee.public.dashboard_login_employee.email (cross-db; not enforced).';
COMMENT ON COLUMN public.dashboard_pub_approval.employee_emailid IS 'Logical FK to service_employee.public.dashboard_login_employee.email (cross-db; not enforced).';

-- =====================================================================
-- Database 3 : service_employee_advertisers
-- =====================================================================
\connect service_employee_advertisers

CREATE SCHEMA IF NOT EXISTS public;

-- Lookup: advertisers (id + unique name) to support FKs from approval tables.
CREATE TABLE IF NOT EXISTS public.advertisers (
  advertiser_id      BIGSERIAL PRIMARY KEY,
  advertiser_name    TEXT UNIQUE NOT NULL,
  created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 1 : dashboard_offers
CREATE TABLE IF NOT EXISTS public.dashboard_offers (
  employee_emailid   VARCHAR(255) PRIMARY KEY,
  offer_id           BIGSERIAL UNIQUE,
  offer_name         TEXT,
  advertiser_name    TEXT REFERENCES public.advertisers(advertiser_name),
  offer_type         TEXT,  -- CPI/CPR/CPA/APK-Register
  preview_url        TEXT,
  cta_url            TEXT,
  caps               INTEGER,
  description        TEXT,
  offer_status       TEXT,
  offer_revenue      NUMERIC(12,2),
  created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 2 : dashboard_offer_reward
CREATE TABLE IF NOT EXISTS public.dashboard_offer_reward (
  employee_emailid   VARCHAR(255) PRIMARY KEY,
  reward_id          BIGSERIAL UNIQUE,
  offer_id           BIGINT REFERENCES public.dashboard_offers(offer_id),
  created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at         TIMESTAMP WITH TIME ZONE
);

-- Table 3 : dashboard_offer_approval
CREATE TABLE IF NOT EXISTS public.dashboard_offer_approval (
  employee_emailid   VARCHAR(255) PRIMARY KEY,
  advertiser_id      BIGINT REFERENCES public.advertisers(advertiser_id),
  offer_name         TEXT,
  bid_requested      NUMERIC(12,2),
  bid_accepted       NUMERIC(12,2),
  offer_type         TEXT, -- CPI/CPR/…
  requested_at       TIMESTAMP WITH TIME ZONE,
  updated_at         TIMESTAMP WITH TIME ZONE
);
CREATE INDEX IF NOT EXISTS idx_offer_approval_offer_name ON public.dashboard_offer_approval(offer_name);

-- Table 4 : dashboard_notification_approval
CREATE TABLE IF NOT EXISTS public.dashboard_notification_approval (
  employee_emailid   VARCHAR(255) PRIMARY KEY,
  advertiser_id      BIGINT REFERENCES public.advertisers(advertiser_id),
  app_name           TEXT,
  timeslot_requested TEXT,
  timeslot_accepted  TEXT,
  priority           TEXT, -- low/medium/high
  notification_status TEXT, -- sent/pending
  requested_at       TIMESTAMP WITH TIME ZONE,
  updated_at         TIMESTAMP WITH TIME ZONE
);

-- Logical cross-db FK notes
COMMENT ON COLUMN public.dashboard_offers.employee_emailid IS 'Logical FK to service_employee.public.dashboard_login_employee.email (cross-db; not enforced).';
COMMENT ON COLUMN public.dashboard_offer_reward.employee_emailid IS 'Logical FK to service_employee.public.dashboard_login_employee.email (cross-db; not enforced).';
COMMENT ON COLUMN public.dashboard_offer_approval.employee_emailid IS 'Logical FK to service_employee.public.dashboard_login_employee.email (cross-db; not enforced).';
COMMENT ON COLUMN public.dashboard_notification_approval.employee_emailid IS 'Logical FK to service_employee.public.dashboard_login_employee.email (cross-db; not enforced).';
