-- Migration 017 — Contrainte UNIQUE abonnement actif par client et plan
-- Sprint 10.3 — Protection DB-level contre les doublons d'abonnements
--
-- Contexte : stripe-create-subscription effectue déjà un check applicatif
-- (client_id + name + status IN (active, trialing)) mais sans verrou DB,
-- une race condition TOCTOU reste possible si deux requêtes arrivent
-- simultanément. Cet index UNIQUE partiel ferme cette fenêtre côté PostgreSQL.
--
-- Pourquoi un index partiel (WHERE) plutôt qu'un UNIQUE classique ?
-- Un client peut avoir plusieurs abonnements dans le temps (ex : un
-- abonnement annulé puis un nouveau). La contrainte ne doit bloquer que
-- les lignes concurrent es avec status actif ou en cours d'essai.

BEGIN;

-- ─── Guard : vérifier qu'aucun doublon n'existe déjà ──────────────────────────
DO $$
DECLARE
  doublons INTEGER;
BEGIN
  SELECT COUNT(*) INTO doublons
  FROM (
    SELECT client_id, name, COUNT(*) AS cnt
    FROM subscriptions
    WHERE status IN ('active', 'trialing')
    GROUP BY client_id, name
    HAVING COUNT(*) > 1
  ) t;

  IF doublons > 0 THEN
    RAISE EXCEPTION '[017] % doublon(s) actif(s) détecté(s) — migration annulée. Résoudre manuellement avant de relancer.', doublons;
  END IF;

  RAISE NOTICE '[017] Aucun doublon détecté — création de la contrainte autorisée.';
END $$;

-- ─── Index UNIQUE partiel sur (client_id, name) pour les abonnements actifs ──
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_one_active_per_client_plan
  ON subscriptions (client_id, name)
  WHERE status IN ('active', 'trialing');

COMMIT;
