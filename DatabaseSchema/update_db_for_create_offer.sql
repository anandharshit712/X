\connect service_employee_advertisers
SET search_path TO public;

-- =========================
-- 1) CORE CHANGES (safe)
-- =========================
BEGIN;

-- Add/convert columns on public.dashboard_offers
DO $$
BEGIN
  -- Step 1
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='dashboard_offers' AND column_name='choose_app'
  ) THEN
    ALTER TABLE public.dashboard_offers
      ADD COLUMN choose_app TEXT[] DEFAULT '{}'::text[];
  END IF;

  -- offer_type as TEXT[] (migrate if scalar)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='dashboard_offers' AND column_name='offer_type'
  ) THEN
    IF EXISTS (
      SELECT 1
      FROM pg_attribute a
      JOIN pg_class c ON c.oid = a.attrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname='public' AND c.relname='dashboard_offers'
        AND a.attname='offer_type'
        AND format_type(a.atttypid, a.atttypmod) <> 'text[]'
    ) THEN
      ALTER TABLE public.dashboard_offers
        ALTER COLUMN offer_type TYPE TEXT[]
        USING (
          CASE
            WHEN offer_type IS NULL THEN NULL
            WHEN position(',' IN offer_type) > 0 THEN string_to_array(offer_type, ',')
            ELSE ARRAY[offer_type]
          END
        );
    END IF;
  ELSE
    ALTER TABLE public.dashboard_offers
      ADD COLUMN offer_type TEXT[] DEFAULT '{}'::text[];
  END IF;

  -- Common step-1 columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='dashboard_offers' AND column_name='cta_url') THEN
    ALTER TABLE public.dashboard_offers ADD COLUMN cta_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='dashboard_offers' AND column_name='preview_url') THEN
    ALTER TABLE public.dashboard_offers ADD COLUMN preview_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='dashboard_offers' AND column_name='description') THEN
    ALTER TABLE public.dashboard_offers ADD COLUMN description TEXT;
  END IF;

  -- Step 2 (JSONB block)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='dashboard_offers' AND column_name='reward') THEN
    ALTER TABLE public.dashboard_offers ADD COLUMN reward JSONB;
  END IF;

  -- Step 3
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='dashboard_offers' AND column_name='conversion_cap') THEN
    ALTER TABLE public.dashboard_offers ADD COLUMN conversion_cap INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='dashboard_offers' AND column_name='trending') THEN
    ALTER TABLE public.dashboard_offers ADD COLUMN trending BOOLEAN DEFAULT FALSE;
  END IF;

  -- Step 4
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='dashboard_offers' AND column_name='targeting_include') THEN
    ALTER TABLE public.dashboard_offers ADD COLUMN targeting_include JSONB;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='dashboard_offers' AND column_name='targeting_exclude') THEN
    ALTER TABLE public.dashboard_offers ADD COLUMN targeting_exclude JSONB;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='dashboard_offers' AND column_name='supply_group') THEN
    ALTER TABLE public.dashboard_offers ADD COLUMN supply_group TEXT[] DEFAULT '{}'::text[];
  END IF;

  -- Housekeeping
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='dashboard_offers' AND column_name='updated_at') THEN
    ALTER TABLE public.dashboard_offers ADD COLUMN updated_at TIMESTAMPTZ;
  END IF;

  -- Compatibility: some code expects `status`
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='dashboard_offers' AND column_name='status') THEN
    ALTER TABLE public.dashboard_offers ADD COLUMN status TEXT;
  END IF;
END$$;

-- Backfill & stamp
UPDATE public.dashboard_offers
   SET status = offer_status
 WHERE status IS NULL AND offer_status IS NOT NULL;

UPDATE public.dashboard_offers
   SET conversion_cap = caps
 WHERE conversion_cap IS NULL AND caps IS NOT NULL;

UPDATE public.dashboard_offers
   SET updated_at = NOW()
 WHERE updated_at IS NULL;

-- Trigger to sync status/offer_status + auto-updated_at
CREATE OR REPLACE FUNCTION public.trg_dashboard_offers_sync()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.status := COALESCE(NEW.status, NEW.offer_status);
  NEW.offer_status := COALESCE(NEW.offer_status, NEW.status);
  NEW.updated_at := NOW();
  RETURN NEW;
END$$;

DROP TRIGGER IF EXISTS trg_dashboard_offers_sync ON public.dashboard_offers;
CREATE TRIGGER trg_dashboard_offers_sync
BEFORE INSERT OR UPDATE ON public.dashboard_offers
FOR EACH ROW EXECUTE FUNCTION public.trg_dashboard_offers_sync();

-- Indexes
CREATE INDEX IF NOT EXISTS ix_dashboard_offers_status_coalesce
  ON public.dashboard_offers ((COALESCE(status, offer_status)));
CREATE INDEX IF NOT EXISTS ix_dashboard_offers_updated_at
  ON public.dashboard_offers (updated_at);
CREATE INDEX IF NOT EXISTS ix_dashboard_offers_targeting_include
  ON public.dashboard_offers USING GIN (targeting_include);
CREATE INDEX IF NOT EXISTS ix_dashboard_offers_targeting_exclude
  ON public.dashboard_offers USING GIN (targeting_exclude);

-- Rewards table expansion
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='dashboard_offer_reward' AND column_name='label') THEN
    ALTER TABLE public.dashboard_offer_reward ADD COLUMN label TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='dashboard_offer_reward' AND column_name='english_steps') THEN
    ALTER TABLE public.dashboard_offer_reward ADD COLUMN english_steps TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='dashboard_offer_reward' AND column_name='goal_value') THEN
    ALTER TABLE public.dashboard_offer_reward ADD COLUMN goal_value TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='dashboard_offer_reward' AND column_name='your_revenue') THEN
    ALTER TABLE public.dashboard_offer_reward ADD COLUMN your_revenue NUMERIC(12,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='dashboard_offer_reward' AND column_name='payout_inr') THEN
    ALTER TABLE public.dashboard_offer_reward ADD COLUMN payout_inr NUMERIC(12,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='dashboard_offer_reward' AND column_name='is_default') THEN
    ALTER TABLE public.dashboard_offer_reward ADD COLUMN is_default BOOLEAN DEFAULT FALSE;
  END IF;
END$$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_dashboard_offer_reward_default
  ON public.dashboard_offer_reward (offer_id)
  WHERE is_default;

COMMIT;

-- ============================================
-- 2) OPTIONAL FK (won't roll back core changes)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema='public'
      AND table_name='dashboard_offer_reward'
      AND constraint_type='FOREIGN KEY'
      AND constraint_name='fk_dashboard_offer_reward_offer'
  ) THEN
    BEGIN
      ALTER TABLE public.dashboard_offer_reward
        ADD CONSTRAINT fk_dashboard_offer_reward_offer
        FOREIGN KEY (offer_id)
        REFERENCES public.dashboard_offers (offer_id)
        ON DELETE CASCADE;
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'Skipping FK add: %', SQLERRM;
    END;
  END IF;
END$$;
