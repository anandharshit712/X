-- =====================================================================
-- EngageX Databases Bootstrap (psql-friendly, no dblink)
-- Creates databases and core tables for: service_dashboard, service_offerwall, service_emailing
-- Usage:
--   psql -U postgres -h localhost -d postgres -f init_engagex_dbs.sql
-- =====================================================================

\set ON_ERROR_STOP on

-- ---------- Create databases if they don't exist ----------
SELECT 'CREATE DATABASE service_dashboard'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'service_dashboard')\gexec

SELECT 'CREATE DATABASE service_offerwall'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'service_offerwall')\gexec

SELECT 'CREATE DATABASE service_emailing'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'service_emailing')\gexec

-- =====================================================================
-- ===============  service_dashboard  =================================
-- =====================================================================
\connect service_dashboard

CREATE SCHEMA IF NOT EXISTS public;

CREATE TABLE IF NOT EXISTS public.dashboard_login (
  advertiser_id        BIGSERIAL PRIMARY KEY,
  name                 TEXT,
  email                VARCHAR(255) UNIQUE,
  password             VARCHAR(255),
  account_type         TEXT,
  company_name         VARCHAR(255),
  address              VARCHAR(255),
  city                 TEXT,
  pincode              VARCHAR(20),
  country              TEXT
);

CREATE TABLE IF NOT EXISTS public.dashboard_details (
  advertiser_id        BIGINT PRIMARY KEY REFERENCES public.dashboard_login(advertiser_id) ON DELETE CASCADE,
  personal_email       VARCHAR(255),
  whatsapp_number      VARCHAR(50),
  skype_id             VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS public.dashboard_transactions (
  transaction_id       BIGSERIAL PRIMARY KEY,
  advertiser_id        BIGINT REFERENCES public.dashboard_login(advertiser_id) ON DELETE CASCADE,
  amount               NUMERIC(12,2),
  transaction_status   TEXT,
  transaction_type     TEXT,
  coupon_code          TEXT,
  created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at         TIMESTAMP WITH TIME ZONE,
  idempotency_token    TEXT
);

CREATE TABLE IF NOT EXISTS public.dashboard_offers (
  id                   BIGSERIAL PRIMARY KEY,
  advertiser_id        BIGINT REFERENCES public.dashboard_login(advertiser_id) ON DELETE CASCADE,
  employee_id          TEXT,
  campaign_name        TEXT,
  app                  TEXT,
  app_category         TEXT,
  description          TEXT,
  bid_requested        NUMERIC(12,2),
  bid_accepted         NUMERIC(12,2),
  tracking_type        TEXT,
  capping              INTEGER,
  tracking_url         TEXT,
  offer_type           TEXT,
  offer_status         TEXT,
  created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.dashboard_wallet (
  id                   BIGSERIAL PRIMARY KEY,
  advertiser_id        BIGINT REFERENCES public.dashboard_login(advertiser_id) ON DELETE CASCADE,
  employee_id          TEXT,
  balance              NUMERIC(12,2),
  amount_in_inr        NUMERIC(12,2),
  transaction_type     TEXT,
  created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at           TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.dashboard_images (
  id                   BIGSERIAL PRIMARY KEY,
  advertiser_id        BIGINT REFERENCES public.dashboard_login(advertiser_id) ON DELETE CASCADE,
  logo                 TEXT,
  banner               TEXT,
  logo_created_at      TIMESTAMP WITH TIME ZONE,
  banner_created_at    TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.dashboard_wallet_balance_tracking (
  id                   BIGSERIAL PRIMARY KEY,
  advertiser_id        BIGINT REFERENCES public.dashboard_login(advertiser_id) ON DELETE CASCADE,
  wallet_id            BIGINT,
  current_balance      NUMERIC(12,2)
);

CREATE TABLE IF NOT EXISTS public.dashboard_wallet_spending (
  id                   BIGSERIAL PRIMARY KEY,
  advertiser_id        BIGINT REFERENCES public.dashboard_login(advertiser_id) ON DELETE CASCADE,
  wallet_id            BIGINT,
  amount_spend         NUMERIC(12,2),
  conversion_count     INTEGER,
  created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.dashboard_app (
  id                   BIGSERIAL PRIMARY KEY,
  advertiser_id        BIGINT REFERENCES public.dashboard_login(advertiser_id) ON DELETE CASCADE,
  app_name             TEXT,
  app_id               TEXT,
  created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================================
-- ===============  service_offerwall  =================================
-- =====================================================================
\connect service_offerwall

CREATE SCHEMA IF NOT EXISTS public;

CREATE TABLE IF NOT EXISTS public.offerwall_clicks (
  id                   BIGSERIAL PRIMARY KEY,
  offer_id             TEXT,
  offerwall_user_id    TEXT,
  click_id             TEXT,
  created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip                   INET,
  adv_id               TEXT,
  device_model         TEXT,
  os                   TEXT
);

CREATE TABLE IF NOT EXISTS public.offerwall_conversions (
  id                   BIGSERIAL PRIMARY KEY,
  offer_id             TEXT,
  offerwall_user_id    TEXT,
  click_id             TEXT,
  conversion_id        TEXT,
  created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip                   INET,
  adv_id               TEXT,
  device_model         TEXT,
  os                   TEXT
);

CREATE TABLE IF NOT EXISTS public.offerwall_offers (
  offer_id             BIGSERIAL PRIMARY KEY,
  title_in_english     TEXT,
  description          TEXT,
  created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  affiliate            TEXT,
  app_id               TEXT,
  offer_type           TEXT
);

CREATE TABLE IF NOT EXISTS public.offerwall_offer_status (
  id                   BIGSERIAL PRIMARY KEY,
  offerwall_user_id    TEXT,
  offer_id             BIGINT REFERENCES public.offerwall_offers(offer_id) ON DELETE CASCADE,
  status               TEXT,
  app_id               TEXT,
  started_at           TIMESTAMP WITH TIME ZONE,
  completed_at         TIMESTAMP WITH TIME ZONE,
  expire_at            TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.offerwall_postback (
  id                   BIGSERIAL PRIMARY KEY,
  offerwall_user_id    TEXT,
  offer_id             BIGINT REFERENCES public.offerwall_offers(offer_id) ON DELETE SET NULL,
  reward_id            TEXT,
  created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip                   INET
);

CREATE TABLE IF NOT EXISTS public.offerwall_users (
  offerwall_user_id    TEXT PRIMARY KEY,
  parent_user_id       TEXT,
  created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip                   INET,
  city                 TEXT,
  state                TEXT,
  country              TEXT
);

CREATE TABLE IF NOT EXISTS public.user_reward_status (
  id                   BIGSERIAL PRIMARY KEY,
  offerwall_user_id    TEXT,
  offer_id             BIGINT,
  reward_id            TEXT,
  status               TEXT,
  app_id               TEXT,
  started_at           TIMESTAMP WITH TIME ZONE,
  tracking_at          TIMESTAMP WITH TIME ZONE,
  completed_at         TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.offerwall_revenue (
  id                   BIGSERIAL PRIMARY KEY,
  advertiser_id        BIGINT,
  revenue_in_dollars   NUMERIC(12,2),
  revenue_in_inr       NUMERIC(12,2),
  app_package          TEXT,
  dau                  INTEGER,
  clicks               INTEGER,
  conversions          INTEGER,
  day                  DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS public.offerwall_app (
  id                   BIGSERIAL PRIMARY KEY,
  advertiser_id        BIGINT,
  app_id               TEXT,
  app_package          TEXT,
  status               TEXT,
  created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.offerwall_payments (
  id                   BIGSERIAL PRIMARY KEY,
  advertiser_id        BIGINT,
  app_id               TEXT,
  revenue              NUMERIC(12,2),
  date                 DATE
);

CREATE TABLE IF NOT EXISTS public.offerwall_payments_status (
  id                   BIGSERIAL PRIMARY KEY,
  advertiser_id        BIGINT,
  validate_revenue     TEXT,
  app_id               TEXT,
  status               TEXT,
  transaction_id       TEXT,
  date                 DATE
);

CREATE TABLE IF NOT EXISTS public.offerwall_billing_details (
  id                   BIGSERIAL PRIMARY KEY,
  advertiser_id        BIGINT,
  beneficiary_name     TEXT,
  account_number       TEXT,
  ifsc_code            TEXT,
  pan                  TEXT,
  gstin                TEXT,
  bank_name            TEXT,
  swift_code           TEXT,
  created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.offerwall_invoice_upload (
  id                   BIGSERIAL PRIMARY KEY,
  advertiser_id        BIGINT,
  invoice_number       TEXT,
  pdf                  BYTEA,
  uploaded_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================================
-- ===============  service_emailing  ==================================
-- =====================================================================
\connect service_emailing

CREATE SCHEMA IF NOT EXISTS public;

CREATE TABLE IF NOT EXISTS public.email_clicks (
  id                   BIGSERIAL PRIMARY KEY,
  offer_id             TEXT,
  offerwall_user_id    TEXT,
  click_id             TEXT,
  created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip                   INET,
  adv_id               TEXT,
  device_model         TEXT,
  os                   TEXT
);
