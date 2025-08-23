-- =====================================================================
-- EngageX Admin (Publisher) - Transactions Backend Bootstrap (PostgreSQL)
-- Creates DB (if needed), tables, sequence, helper functions, indexes,
-- and migrates data from legacy dashboard_payout_transactions.
--
-- Usage:
--   psql -U postgres -h localhost -d postgres -f admin_transactions_setup.sql
-- =====================================================================
\set ON_ERROR_STOP on

-- ---------- Ensure the admin/publisher DB exists ----------
SELECT 'CREATE DATABASE service_employee_publisher'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'service_employee_publisher')\gexec

-- ---------- Work inside the admin/publisher DB ----------
\connect service_employee_publisher

-- ---------- Schema ----------
CREATE SCHEMA IF NOT EXISTS public;

-- ---------- Reference: publishers (name PK) ----------
-- (kept compatible with your earlier bootstrap)
CREATE TABLE IF NOT EXISTS public.publishers (
  publisher_name TEXT PRIMARY KEY,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- NEW: admin_publisher_transactions
-- Designed to support the frontend (add/edit/delete/list/filter):
--   id, transaction_id (TXN-000001...), txn_date, description,
--   amount, publisher_name (company), paid_in_full, created_at/updated_at
-- =====================================================================

-- Sequence used by the TXN id generator
CREATE SEQUENCE IF NOT EXISTS public.admin_txn_seq START 1;

-- Generator function for human-friendly TXN IDs
CREATE OR REPLACE FUNCTION public.gen_admin_txn_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  n BIGINT;
BEGIN
  n := nextval('public.admin_txn_seq');
  RETURN 'TXN-' || LPAD(n::TEXT, 6, '0');
END;
$$;

-- Table
CREATE TABLE IF NOT EXISTS public.admin_publisher_transactions (
  id              BIGSERIAL PRIMARY KEY,
  transaction_id  TEXT UNIQUE NOT NULL DEFAULT public.gen_admin_txn_id(),
  txn_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  description     TEXT,
  amount          NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  publisher_name  TEXT NOT NULL REFERENCES public.publishers(publisher_name) ON UPDATE CASCADE ON DELETE RESTRICT,
  paid_in_full    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Updated-at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_admin_publisher_transactions_updated_at ON public.admin_publisher_transactions;
CREATE TRIGGER trg_admin_publisher_transactions_updated_at
BEFORE UPDATE ON public.admin_publisher_transactions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Useful indexes for filtering/searching in UI
CREATE INDEX IF NOT EXISTS idx_admin_txn_date       ON public.admin_publisher_transactions (txn_date DESC);
CREATE INDEX IF NOT EXISTS idx_admin_txn_company    ON public.admin_publisher_transactions (publisher_name);
CREATE INDEX IF NOT EXISTS idx_admin_txn_paid       ON public.admin_publisher_transactions (paid_in_full);

-- =====================================================================
-- OPTIONAL: migrate data from legacy "dashboard_payout_transactions"
-- (created by older bootstrap). We map legacy columns to the new ones.
-- Keeps legacy table intact (read-only migration); run once safely.
-- =====================================================================

DO $$
BEGIN
  IF to_regclass('public.dashboard_payout_transactions') IS NOT NULL THEN
    -- Create placeholder publishers for any missing publisher_name
    INSERT INTO public.publishers (publisher_name)
    SELECT DISTINCT dpt.publisher_name
    FROM public.dashboard_payout_transactions dpt
    WHERE dpt.publisher_name IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM public.publishers p WHERE p.publisher_name = dpt.publisher_name
      );

    -- Migrate rows that don't already exist (by description+amount+created_at)
    INSERT INTO public.admin_publisher_transactions
      (txn_date, description, amount, publisher_name, paid_in_full, created_at, updated_at)
    SELECT
      COALESCE(dpt.created_at::date, CURRENT_DATE) AS txn_date,
      dpt.description,
      COALESCE(dpt.payout_amount, 0)::NUMERIC(12,2) AS amount,
      COALESCE(dpt.publisher_name, 'UNKNOWN') AS publisher_name,
      COALESCE(dpt.paid_in_full, FALSE) AS paid_in_full,
      COALESCE(dpt.created_at, NOW()) AS created_at,
      COALESCE(dpt.created_at, NOW()) AS updated_at
    FROM public.dashboard_payout_transactions dpt
    WHERE NOT EXISTS (
      SELECT 1 FROM public.admin_publisher_transactions a
      WHERE a.description   IS NOT DISTINCT FROM dpt.description
        AND a.amount        IS NOT DISTINCT FROM dpt.payout_amount
        AND a.publisher_name IS NOT DISTINCT FROM dpt.publisher_name
        AND a.created_at    IS NOT DISTINCT FROM dpt.created_at
    );
  END IF;
END$$;

-- =====================================================================
-- Summary views (optional, helpful for “Total/Paid/Unpaid” cards)
-- =====================================================================
CREATE OR REPLACE VIEW public.v_admin_txn_totals AS
SELECT
  COALESCE(SUM(amount),0)::NUMERIC(12,2) AS total_amount,
  COALESCE(SUM(CASE WHEN paid_in_full THEN amount ELSE 0 END),0)::NUMERIC(12,2) AS paid_amount,
  COALESCE(SUM(CASE WHEN NOT paid_in_full THEN amount ELSE 0 END),0)::NUMERIC(12,2) AS unpaid_amount,
  COUNT(*) AS total_rows
FROM public.admin_publisher_transactions;

CREATE OR REPLACE VIEW public.v_admin_txn_totals_by_publisher AS
SELECT
  publisher_name,
  COALESCE(SUM(amount),0)::NUMERIC(12,2) AS total_amount,
  COALESCE(SUM(CASE WHEN paid_in_full THEN amount ELSE 0 END),0)::NUMERIC(12,2) AS paid_amount,
  COALESCE(SUM(CASE WHEN NOT paid_in_full THEN amount ELSE 0 END),0)::NUMERIC(12,2) AS unpaid_amount,
  COUNT(*) AS total_rows
FROM public.admin_publisher_transactions
GROUP BY publisher_name;

-- =====================================================================
-- Sanity demo (optional): insert one sample publisher if none exists
-- =====================================================================
INSERT INTO public.publishers (publisher_name)
SELECT 'Company 1'
WHERE NOT EXISTS (SELECT 1 FROM public.publishers WHERE publisher_name = 'Company 1');

-- =====================================================================
-- Done

-- =====================================================================
