-- Migration 023 — Catalogue plans Stripe (P3)
-- Stocke les 3 plans créés dans Stripe Dashboard / script setup
-- et leurs stripe_product_id / stripe_price_id associés.

BEGIN;

CREATE TABLE IF NOT EXISTS stripe_plans (
  id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_product_id  TEXT         NOT NULL UNIQUE,
  stripe_price_id    TEXT         NOT NULL UNIQUE,
  name               TEXT         NOT NULL,
  slug               TEXT         NOT NULL UNIQUE,   -- 'essentiel' | 'confort' | 'premium'
  amount             INTEGER      NOT NULL,           -- centimes HT (14900, 29900, 49900)
  currency           TEXT         NOT NULL DEFAULT 'eur',
  interval           TEXT         NOT NULL DEFAULT 'month',
  active             BOOLEAN      NOT NULL DEFAULT true,
  created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

ALTER TABLE stripe_plans ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'stripe_plans' AND policyname = 'managers read stripe_plans'
  ) THEN
    CREATE POLICY "managers read stripe_plans"
      ON stripe_plans FOR SELECT TO authenticated
      USING (public.is_ca_tech_manager());
  END IF;
END$$;

DO $$BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'stripe_plans' AND policyname = 'managers update stripe_plans'
  ) THEN
    CREATE POLICY "managers update stripe_plans"
      ON stripe_plans FOR UPDATE TO authenticated
      USING (public.is_ca_tech_manager())
      WITH CHECK (public.is_ca_tech_manager());
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_stripe_plans_active ON stripe_plans (active);

COMMIT;
