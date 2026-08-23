-- Migration 021 — Relances automatiques factures impayées
-- Sprint 12.1 — Priorité 1 : module cron-invoice-reminders
--
-- Ce que fait cette migration :
--   1. Ajoute `skip_reminders` sur invoices → protège les 4 factures historiques
--   2. Crée la table invoice_reminders (log de chaque relance envoyée)
--   3. RLS + index
--   4. Section cron (commentée — à exécuter manuellement après avoir défini
--      CRON_SECRET dans Supabase Secrets et noté le Project Reference ID)
--
-- Contraintes respectées :
--   - 0 donnée supprimée, 0 logique Stripe modifiée
--   - Les 4 factures FAC-2026-0001 à 0004 seront marquées skip_reminders=true
--   - verify_jwt = false sur l'edge function (cron n'a pas de JWT user),
--     auth via CRON_SECRET header

BEGIN;

-- ─── 1. Colonne skip_reminders sur invoices ───────────────────────────────────
-- Opération additive : toutes les factures existantes reçoivent false par défaut.
-- Seules les 4 factures historiques (drift amount_paid=180 sans payment record)
-- reçoivent true → elles ne seront jamais relancées.

ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS skip_reminders BOOLEAN NOT NULL DEFAULT false;

UPDATE invoices
  SET skip_reminders = true
  WHERE invoice_number IN (
    'FAC-2026-0001',
    'FAC-2026-0002',
    'FAC-2026-0003',
    'FAC-2026-0004'
  );

-- ─── 2. Table invoice_reminders ───────────────────────────────────────────────
-- Log immuable de chaque relance envoyée. Écrit uniquement par la edge function
-- cron-invoice-reminders (via service_role → RLS bypassée en écriture).
-- Lecture accessible aux managers CA-TECH via RLS.

CREATE TABLE IF NOT EXISTS invoice_reminders (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id      UUID         NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  stage           TEXT         NOT NULL
                    CHECK (stage IN ('douce', 'ferme', 'mise_en_demeure', 'escalade')),
  sent_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  message_id      TEXT,        -- Gmail messageId retourné par gmail-send (NULL pour escalade)
  response_status INTEGER,     -- HTTP status de la réponse gmail-send (NULL pour escalade)
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── 3. RLS ───────────────────────────────────────────────────────────────────
ALTER TABLE invoice_reminders ENABLE ROW LEVEL SECURITY;

-- Lecture : manager CA-TECH uniquement (réutilise is_ca_tech_manager() de migration 018)
DO $$BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'invoice_reminders'
      AND policyname = 'managers read invoice_reminders'
  ) THEN
    CREATE POLICY "managers read invoice_reminders"
      ON invoice_reminders FOR SELECT TO authenticated
      USING (public.is_ca_tech_manager());
  END IF;
END$$;

-- Écriture : service_role uniquement (edge function bypass RLS → pas de policy INSERT)
-- Les inserts sont faits avec SUPABASE_SERVICE_ROLE_KEY dans la edge function.

-- ─── 4. Index ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_invoice_reminders_invoice_id
  ON invoice_reminders (invoice_id);

CREATE INDEX IF NOT EXISTS idx_invoice_reminders_stage
  ON invoice_reminders (invoice_id, stage);

CREATE INDEX IF NOT EXISTS idx_invoice_reminders_sent_at
  ON invoice_reminders (sent_at DESC);

COMMIT;

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION CRON — À EXÉCUTER MANUELLEMENT dans le SQL Editor Supabase
-- (ne pas inclure dans supabase db push)
--
-- Prérequis avant d'exécuter ces commandes :
--   1. Déployer la edge function : supabase functions deploy cron-invoice-reminders
--   2. Dans Supabase Dashboard → Project Settings → Edge Functions → Secrets :
--        CRON_SECRET = <valeur générée : openssl rand -hex 32>
--   3. Récupérer le Project Reference ID dans Settings → General → Reference ID
--   4. Remplacer [PROJECT_REF] et [CRON_SECRET] ci-dessous
--
-- ── Extension pg_net (activée par défaut sur Supabase) ──────────────────────
-- CREATE EXTENSION IF NOT EXISTS pg_net;
--
-- ── Supprimer le job s'il existe déjà (idempotent) ──────────────────────────
-- SELECT cron.unschedule(jobid)
--   FROM cron.job
--   WHERE jobname = 'cron-invoice-reminders-daily';
--
-- ── Créer le job cron : 8h00 UTC = 9h hiver / 10h été (Paris) ───────────────
-- SELECT cron.schedule(
--   'cron-invoice-reminders-daily',
--   '0 8 * * *',
--   $$
--   SELECT net.http_post(
--     url     := 'https://[PROJECT_REF].supabase.co/functions/v1/cron-invoice-reminders',
--     headers := jsonb_build_object(
--       'Content-Type',  'application/json',
--       'Authorization', 'Bearer [CRON_SECRET]'
--     ),
--     body    := '{}'::jsonb
--   ) AS request_id;
--   $$
-- );
--
-- ── Vérifier que le job est bien enregistré ──────────────────────────────────
-- SELECT jobid, jobname, schedule, command
--   FROM cron.job
--   WHERE jobname = 'cron-invoice-reminders-daily';
-- ═══════════════════════════════════════════════════════════════════════════════
