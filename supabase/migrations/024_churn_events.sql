-- Migration 024 — Anti-churn P4
-- Sprint 12.4 : compteur d'échecs, table churn_events, feature flag auto_suspend
--
-- Contraintes :
--   - 4 factures FAC-2026-0001 à 0004 intouchables (non concernées ici)
--   - RLS activée sur nouvelles tables
--   - verify_jwt = true sur les lectures (les edge functions utilisent service_role)

BEGIN;

-- ─── 1. consecutive_failures sur subscriptions ────────────────────────────────
-- Opération additive — les abonnements existants commencent à 0.
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS consecutive_failures INTEGER NOT NULL DEFAULT 0;

-- ─── 2. Table churn_events ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS churn_events (
  id                            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id               UUID        NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  event_type                    TEXT        NOT NULL CHECK (event_type IN (
                                              'payment_failed',
                                              'payment_recovered',
                                              'auto_suspended',
                                              'manually_reactivated'
                                            )),
  consecutive_failures_at_event INTEGER     NOT NULL DEFAULT 0,
  metadata                      JSONB,
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE churn_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'churn_events' AND policyname = 'managers read churn_events'
  ) THEN
    CREATE POLICY "managers read churn_events"
      ON churn_events FOR SELECT TO authenticated
      USING (public.is_ca_tech_manager());
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_churn_events_subscription_id
  ON churn_events (subscription_id);

CREATE INDEX IF NOT EXISTS idx_churn_events_created_at
  ON churn_events (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_churn_events_event_type
  ON churn_events (event_type, created_at DESC);

-- ─── 3. Table global_settings (feature flags globaux) ───────────────────────
-- Note : app_settings est déjà prise par les paramètres utilisateur.
CREATE TABLE IF NOT EXISTS global_settings (
  key        TEXT        PRIMARY KEY,
  value      JSONB       NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'global_settings' AND policyname = 'managers read global_settings'
  ) THEN
    CREATE POLICY "managers read global_settings"
      ON global_settings FOR SELECT TO authenticated
      USING (public.is_ca_tech_manager());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'global_settings' AND policyname = 'managers update global_settings'
  ) THEN
    CREATE POLICY "managers update global_settings"
      ON global_settings FOR UPDATE TO authenticated
      USING (public.is_ca_tech_manager())
      WITH CHECK (public.is_ca_tech_manager());
  END IF;
END $$;

-- Feature flag auto_suspend activé par défaut
INSERT INTO global_settings (key, value)
  VALUES ('auto_suspend', 'true'::jsonb)
  ON CONFLICT (key) DO NOTHING;

COMMIT;
