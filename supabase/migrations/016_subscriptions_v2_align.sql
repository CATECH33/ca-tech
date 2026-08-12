-- Migration 016 — Alignement subscriptions V1 → V2
-- Sprint 10.1 — Préparation abonnements maintenance CA-TECH
--
-- SÉCURITÉ : table vérifiée vide (0 lignes) avant rédaction.
-- NE SUPPRIME AUCUNE DONNÉE.
-- NE SUPPRIME PAS LA TABLE.
-- Colonnes V1 sans équivalent V2 (stripe_payment_link_id, date_debut, date_fin, notes)
-- sont conservées pour l'historique.
--
-- CORRECTION vs template initial :
-- Le template inversait les étapes 2 et 3 (UPDATE avant DROP CHECK),
-- ce qui aurait violé les contraintes CHECK sur une table non vide.
-- Ordre corrigé : DROP CHECK → UPDATE valeurs → ADD CHECK.

BEGIN;

-- ─── 0. Guard : compter les lignes ───────────────────────────────────────────
-- Log informatif — pas de blocage (table attendue vide).
DO $$
DECLARE
  lignes INTEGER;
  incompatibles_freq INTEGER;
  incompatibles_status INTEGER;
BEGIN
  SELECT COUNT(*) INTO lignes FROM subscriptions;
  RAISE NOTICE '[016] Lignes dans subscriptions : %', lignes;

  -- Vérifier valeurs de frequence non mappables (ni mensuel, ni annuel)
  SELECT COUNT(*) INTO incompatibles_freq
    FROM subscriptions
    WHERE frequence NOT IN ('mensuel', 'annuel');
  IF incompatibles_freq > 0 THEN
    RAISE EXCEPTION '[016] % ligne(s) avec frequence non mappable — migration annulée.', incompatibles_freq;
  END IF;

  -- Vérifier valeurs de status non mappables
  SELECT COUNT(*) INTO incompatibles_status
    FROM subscriptions
    WHERE status NOT IN ('pending', 'active', 'suspended', 'cancelled', 'expired');
  IF incompatibles_status > 0 THEN
    RAISE EXCEPTION '[016] % ligne(s) avec status non mappable — migration annulée.', incompatibles_status;
  END IF;

  RAISE NOTICE '[016] Vérifications OK — migration autorisée.';
END $$;

-- ─── 1. Renommer les colonnes V1 → V2 ────────────────────────────────────────
-- PostgreSQL met automatiquement à jour les CHECK qui référencent la colonne.
ALTER TABLE subscriptions RENAME COLUMN offre     TO name;
ALTER TABLE subscriptions RENAME COLUMN montant   TO amount;
ALTER TABLE subscriptions RENAME COLUMN frequence TO frequency;

-- ─── 2. Supprimer les anciens CHECK (avant toute modification de valeurs) ────
-- Ordre critique : DROP avant UPDATE pour ne pas violer les contraintes.
ALTER TABLE subscriptions DROP CONSTRAINT subscriptions_frequence_check;
ALTER TABLE subscriptions DROP CONSTRAINT subscriptions_status_check;

-- ─── 3. Transformer les valeurs existantes ───────────────────────────────────
-- No-op si table vide — sécurisé sur données existantes.
UPDATE subscriptions SET frequency = 'monthly' WHERE frequency = 'mensuel';
UPDATE subscriptions SET frequency = 'annual'  WHERE frequency = 'annuel';

UPDATE subscriptions SET status = 'active'    WHERE status = 'pending';
UPDATE subscriptions SET status = 'paused'    WHERE status = 'suspended';
UPDATE subscriptions SET status = 'cancelled' WHERE status = 'expired';
-- 'active' et 'cancelled' déjà valides dans V2 → pas de transformation nécessaire.

-- ─── 4. Appliquer les nouveaux CHECK ─────────────────────────────────────────
ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_frequency_check
  CHECK (frequency IN ('monthly', 'annual'));

ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_status_check
  CHECK (status IN ('active', 'paused', 'cancelled', 'past_due', 'trialing'));

-- ─── 5. Mettre à jour le DEFAULT status ──────────────────────────────────────
-- L'ancien default 'pending' serait invalide avec le nouveau CHECK.
ALTER TABLE subscriptions
  ALTER COLUMN status SET DEFAULT 'trialing';

-- ─── 6. Ajouter les 6 colonnes manquantes ────────────────────────────────────
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS devis_id                   UUID        REFERENCES devis(id),
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_price_id            TEXT,
  ADD COLUMN IF NOT EXISTS current_period_start       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS current_period_end         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_at               TIMESTAMPTZ;

-- ─── 7. Index UNIQUE sur stripe_subscription_id ──────────────────────────────
-- L'index existe déjà (non UNIQUE) — il sera remplacé par l'index UNIQUE.
-- Supprimer l'ancien index non-UNIQUE pour éviter la redondance.
DROP INDEX IF EXISTS idx_sub_stripe_subscription_id;

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_stripe_subscription_id_key
  ON subscriptions (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

-- ─── 8. Colonnes V1 conservées (ne pas supprimer) ────────────────────────────
-- stripe_payment_link_id UUID FK → stripe_payment_links (déjà nullable, conservé)
-- date_debut DATE (conservé — peut servir manuellement)
-- date_fin   DATE (conservé — peut servir manuellement)
-- notes TEXT (conservé — utile manuellement)
-- chk_sub_dates CHECK (date_fin >= date_debut) — toujours valide, conservé

COMMIT;
