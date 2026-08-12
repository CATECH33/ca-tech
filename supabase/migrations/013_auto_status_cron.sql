-- Sprint 9.4 — automatisations pg_cron
-- Auto-expire devis passés leur date de validité
-- Auto-passer les factures en retard

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Supprimer les jobs existants si on redéploie (idempotent)
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname IN ('auto-expire-devis', 'auto-overdue-invoices');

-- Job 1 : expire les devis dont valid_until est dépassé
SELECT cron.schedule(
  'auto-expire-devis',
  '0 2 * * *',
  $$
    UPDATE devis
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'sent'
      AND valid_until IS NOT NULL
      AND valid_until < CURRENT_DATE;
  $$
);

-- Job 2 : passe les factures en retard quand due_date est dépassé
SELECT cron.schedule(
  'auto-overdue-invoices',
  '0 2 * * *',
  $$
    UPDATE invoices
    SET status = 'overdue', updated_at = NOW()
    WHERE status IN ('sent', 'partial')
      AND due_date IS NOT NULL
      AND due_date < CURRENT_DATE;
  $$
);
