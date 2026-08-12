-- Migration 015 — Contrainte UNIQUE partielle (devis_id, payment_type)
-- Corrige le FAIL #1 du STRIPE_FINAL_SECURITY_AUDIT : race condition TOCTOU
-- sur stripe-create-payment. La contrainte DB garantit l'unicité même si deux
-- requêtes simultanées passent le SELECT préalable.
-- Ne supprime aucune donnée existante.

-- ─── 1. Vérification des doublons avant création ─────────────────────────────
-- Si des doublons existent, la migration s'arrête avec un message explicite.
DO $$
DECLARE
  doublon_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO doublon_count
  FROM (
    SELECT devis_id, payment_type
    FROM invoices
    WHERE devis_id IS NOT NULL
      AND payment_type IN ('acompte', 'solde')
    GROUP BY devis_id, payment_type
    HAVING COUNT(*) > 1
  ) dupes;

  IF doublon_count > 0 THEN
    RAISE EXCEPTION
      'MIGRATION ANNULÉE : % doublon(s) (devis_id, payment_type) détecté(s). '
      'Identifier les lignes concernées avec : '
      'SELECT devis_id, payment_type, array_agg(id), array_agg(status) '
      'FROM invoices WHERE devis_id IS NOT NULL AND payment_type IN (''acompte'',''solde'') '
      'GROUP BY devis_id, payment_type HAVING COUNT(*) > 1;',
      doublon_count;
  END IF;

  RAISE NOTICE 'Aucun doublon détecté — création de la contrainte autorisée.';
END$$;

-- ─── 2. Index UNIQUE partiel (devis_id, payment_type) ────────────────────────
-- WHERE garantit que :
--   · les factures "unique" (hors devis) ne sont pas concernées
--   · NULL devis_id (factures ad hoc) n'est pas concerné
CREATE UNIQUE INDEX IF NOT EXISTS invoices_devis_payment_type_key
  ON invoices (devis_id, payment_type)
  WHERE devis_id IS NOT NULL
    AND payment_type IN ('acompte', 'solde');

-- ─── 3. Index de performance (requête useDevisInvoices) ──────────────────────
-- Couvre aussi le WARNING de l'audit : seq scan sur invoices WHERE devis_id = ?
CREATE INDEX IF NOT EXISTS idx_invoices_devis_id
  ON invoices (devis_id)
  WHERE devis_id IS NOT NULL;
