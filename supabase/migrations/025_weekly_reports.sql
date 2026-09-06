-- Migration 025 — Rapport hebdomadaire automatisé
-- Sprint 12.5 : table weekly_reports, RLS manager

BEGIN;

CREATE TABLE IF NOT EXISTS weekly_reports (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start          DATE        NOT NULL,
  week_end            DATE        NOT NULL,
  generated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  pdf_drive_url       TEXT,
  pdf_drive_file_id   TEXT,
  email_sent_at       TIMESTAMPTZ,
  summary_json        JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT weekly_reports_week_start_unique UNIQUE (week_start)
);

CREATE INDEX IF NOT EXISTS idx_weekly_reports_week_start
  ON weekly_reports (week_start DESC);

ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'weekly_reports' AND policyname = 'managers read weekly_reports'
  ) THEN
    CREATE POLICY "managers read weekly_reports"
      ON weekly_reports FOR SELECT TO authenticated
      USING (public.is_ca_tech_manager());
  END IF;
END $$;

-- ─── pg_cron — à décommenter après déploiement ───────────────────────────────
-- Exécuter manuellement dans SQL Editor Supabase en remplaçant les placeholders.
--
-- SELECT cron.schedule(
--   'weekly-report-generator',
--   '0 18 * * 0',   -- Dimanche 18h00 UTC (20h Paris été, 19h Paris hiver)
--   $$
--   SELECT net.http_post(
--     url     := 'https://[PROJECT_REF].supabase.co/functions/v1/weekly-report-generator',
--     headers := '{"Content-Type":"application/json","Authorization":"Bearer [CRON_SECRET]"}'::jsonb,
--     body    := '{}'::jsonb
--   );
--   $$
-- );

COMMIT;
