-- apply_role_routing.sql
-- Makes auth tables domain-aware via a role column + trigger.
-- Safe to re-run. Requires superuser or owner privileges on target tables.

\set ON_ERROR_STOP on

-- ============================================================
-- Helpers available in the current session
-- ============================================================
DO $bootstrap$
BEGIN
  PERFORM 1;
END
$bootstrap$;

-- ============================================================
-- ========== service_dashboard (user/advertiser) =============
-- Table defined in your init script (dashboard_login)        -- see: :contentReference[oaicite:2]{index=2}
-- ============================================================
\connect service_dashboard

-- 1) Add role column (if missing) with constraint
ALTER TABLE public.dashboard_login
  ADD COLUMN IF NOT EXISTS role TEXT;

-- Ensure non-null + restricted values
ALTER TABLE public.dashboard_login
  ALTER COLUMN role SET DEFAULT 'user',
  ALTER COLUMN role SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'dashboard_login_role_ck'
  ) THEN
    ALTER TABLE public.dashboard_login
      ADD CONSTRAINT dashboard_login_role_ck
      CHECK (role IN ('user','admin'));
  END IF;
END$$;

-- 2) Backfill role for existing rows from email domain
UPDATE public.dashboard_login
SET role = CASE
  WHEN email ~* '@mobtions\.com$' THEN 'admin'
  ELSE 'user'
END
WHERE role IS DISTINCT FROM CASE
  WHEN email ~* '@mobtions\.com$' THEN 'admin'
  ELSE 'user'
END;

-- 3) Trigger to auto-set role on INSERT/UPDATE(email)
CREATE OR REPLACE FUNCTION public.fn_set_role_from_email_dashboard()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.role :=
    CASE WHEN NEW.email ~* '@mobtions\.com$' THEN 'admin' ELSE 'user' END;
  RETURN NEW;
END$$;

DROP TRIGGER IF EXISTS trg_set_role_from_email_dashboard ON public.dashboard_login;

CREATE TRIGGER trg_set_role_from_email_dashboard
BEFORE INSERT OR UPDATE OF email ON public.dashboard_login
FOR EACH ROW
EXECUTE FUNCTION public.fn_set_role_from_email_dashboard();

-- Optional: make emails case-insensitive unique (safe if you don’t already rely on mixed-case duplicates)
-- CREATE UNIQUE INDEX IF NOT EXISTS uq_dashboard_login_email_lower ON public.dashboard_login (lower(email));


-- ============================================================
-- ========== service_employee (admin/employee) ===============
-- Table defined in your init script (dashboard_login_employee) -- see: :contentReference[oaicite:3]{index=3}
-- ============================================================
\connect service_employee

-- 1) Add role column (if missing) with constraint
ALTER TABLE public.dashboard_login_employee
  ADD COLUMN IF NOT EXISTS role TEXT;

ALTER TABLE public.dashboard_login_employee
  ALTER COLUMN role SET DEFAULT 'user',
  ALTER COLUMN role SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'dashboard_login_employee_role_ck'
  ) THEN
    ALTER TABLE public.dashboard_login_employee
      ADD CONSTRAINT dashboard_login_employee_role_ck
      CHECK (role IN ('user','admin'));
  END IF;
END$$;

-- 2) Backfill role for existing rows from email domain
UPDATE public.dashboard_login_employee
SET role = CASE
  WHEN email ~* '@mobtions\.com$' THEN 'admin'
  ELSE 'user'
END
WHERE role IS DISTINCT FROM CASE
  WHEN email ~* '@mobtions\.com$' THEN 'admin'
  ELSE 'user'
END;

-- 3) Trigger to auto-set role on INSERT/UPDATE(email)
CREATE OR REPLACE FUNCTION public.fn_set_role_from_email_employee()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.role :=
    CASE WHEN NEW.email ~* '@mobtions\.com$' THEN 'admin' ELSE 'user' END;
  RETURN NEW;
END$$;

DROP TRIGGER IF EXISTS trg_set_role_from_email_employee ON public.dashboard_login_employee;

CREATE TRIGGER trg_set_role_from_email_employee
BEFORE INSERT OR UPDATE OF email ON public.dashboard_login_employee
FOR EACH ROW
EXECUTE FUNCTION public.fn_set_role_from_email_employee();

-- Optional: case-insensitive uniqueness for employee email
-- CREATE UNIQUE INDEX IF NOT EXISTS uq_dashboard_login_employee_email_lower ON public.dashboard_login_employee (lower(email));

-- ============================================================
-- Done
-- ============================================================
