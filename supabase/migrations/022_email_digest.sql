-- Migration 022 — Agrégateur emails + digest IA quotidien
-- Sprint 12.2 — Priorité 2
--
-- Ce que fait cette migration :
--   1. Crée la table email_digest_items — log de chaque email traité
--   2. RLS : lecture manager, écriture service_role uniquement
--   3. Index pour les requêtes fréquentes (frontend + edge function)

BEGIN;

-- ─── 1. Table email_digest_items ─────────────────────────────────────────────
-- Un enregistrement par email Gmail traité par la edge function email-digest-collect.
-- Dé-duplication garantie par gmail_message_id UNIQUE.

CREATE TABLE IF NOT EXISTS email_digest_items (
  id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  gmail_message_id  TEXT         NOT NULL UNIQUE,
  from_addr         TEXT         NOT NULL,
  subject           TEXT,
  category          TEXT         NOT NULL
                      CHECK (category IN ('Prospect', 'Client', 'Fournisseur', 'Administratif', 'Urgent')),
  summary           TEXT,        -- résumé 2-3 phrases généré par Claude Haiku
  action_needed     BOOLEAN      NOT NULL DEFAULT false,
  action_text       TEXT,        -- action suggérée par Claude (ex: "Répondre sous 24h")
  received_at       TIMESTAMPTZ  NOT NULL,
  processed_at      TIMESTAMPTZ, -- horodatage de classification par Claude
  gmail_link        TEXT,        -- https://mail.google.com/mail/u/0/#inbox/<gmail_message_id>
  is_processed      BOOLEAN      NOT NULL DEFAULT false, -- marqué "traité" par le manager
  reported          BOOLEAN      NOT NULL DEFAULT false, -- inclus dans un digest envoyé
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── 2. RLS ───────────────────────────────────────────────────────────────────
ALTER TABLE email_digest_items ENABLE ROW LEVEL SECURITY;

DO $$BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'email_digest_items'
      AND policyname = 'managers read email_digest_items'
  ) THEN
    CREATE POLICY "managers read email_digest_items"
      ON email_digest_items FOR SELECT TO authenticated
      USING (public.is_ca_tech_manager());
  END IF;
END$$;

DO $$BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'email_digest_items'
      AND policyname = 'managers update email_digest_items'
  ) THEN
    CREATE POLICY "managers update email_digest_items"
      ON email_digest_items FOR UPDATE TO authenticated
      USING (public.is_ca_tech_manager())
      WITH CHECK (public.is_ca_tech_manager());
  END IF;
END$$;

-- INSERT : service_role uniquement (edge function bypass RLS → pas de policy INSERT)

-- ─── 3. Index ─────────────────────────────────────────────────────────────────
-- Recherche par message Gmail (dé-duplication dans la edge function)
CREATE INDEX IF NOT EXISTS idx_email_digest_gmail_id
  ON email_digest_items (gmail_message_id);

-- Tri chronologique décroissant (vue frontend)
CREATE INDEX IF NOT EXISTS idx_email_digest_received_at
  ON email_digest_items (received_at DESC);

-- Requête digest-send : items non encore reportés
CREATE INDEX IF NOT EXISTS idx_email_digest_unreported
  ON email_digest_items (reported, received_at DESC)
  WHERE reported = false;

-- Requête frontend : items à traiter
CREATE INDEX IF NOT EXISTS idx_email_digest_unprocessed
  ON email_digest_items (is_processed, received_at DESC)
  WHERE is_processed = false;

-- Filtre par catégorie
CREATE INDEX IF NOT EXISTS idx_email_digest_category
  ON email_digest_items (category, received_at DESC);

COMMIT;

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION CRON — À EXÉCUTER MANUELLEMENT dans le SQL Editor Supabase
-- (ne pas inclure dans supabase db push)
--
-- Prérequis :
--   1. supabase functions deploy email-digest-collect --no-verify-jwt
--   2. supabase functions deploy email-digest-send --no-verify-jwt
--   3. CRON_SECRET déjà défini dans Project Settings → Edge Functions → Secrets
--   4. Remplacer [PROJECT_REF] et [CRON_SECRET] ci-dessous
--
-- ── Collect : toutes les 15 minutes ─────────────────────────────────────────
-- SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'email-digest-collect-15min';
-- SELECT cron.schedule(
--   'email-digest-collect-15min',
--   '*/15 * * * *',
--   $$
--   SELECT net.http_post(
--     url     := 'https://[PROJECT_REF].supabase.co/functions/v1/email-digest-collect',
--     headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer [CRON_SECRET]'),
--     body    := '{}'::jsonb
--   ) AS request_id;
--   $$
-- );
--
-- ── Send : 7h00 et 17h00 UTC ─────────────────────────────────────────────────
-- SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'email-digest-send-daily';
-- SELECT cron.schedule(
--   'email-digest-send-daily',
--   '0 7,17 * * *',
--   $$
--   SELECT net.http_post(
--     url     := 'https://[PROJECT_REF].supabase.co/functions/v1/email-digest-send',
--     headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer [CRON_SECRET]'),
--     body    := '{}'::jsonb
--   ) AS request_id;
--   $$
-- );
--
-- ── Vérifier les jobs ────────────────────────────────────────────────────────
-- SELECT jobid, jobname, schedule FROM cron.job WHERE jobname LIKE 'email-digest-%';
-- ═══════════════════════════════════════════════════════════════════════════════
