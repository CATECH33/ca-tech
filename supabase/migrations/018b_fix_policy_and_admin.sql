-- Migration 018b — Correction post-018 : policy résiduelle + admin CA-TECH
-- Sprint 10.5 — Appliqué immédiatement après 018
--
-- Problèmes détectés après application de 018 :
--   1. La policy permissive existante sur subscriptions avait le nom
--      "sub_authenticated_all" en production (et non "auth users manage subscriptions"
--      comme dans migration 014). La DROP de 018 n'avait donc pas eu d'effet.
--   2. L'admin CA-TECH utilise l'email contact@ca-tech.fr dans auth.users
--      (pas pemoustaskit@gmail.com). Le DO block de 018 n'a pas inséré l'admin.

BEGIN;

-- Supprimer la policy permissive résiduelle (nom réel en prod)
DROP POLICY IF EXISTS "sub_authenticated_all" ON subscriptions;

-- Insérer l'admin CA-TECH avec le bon email
INSERT INTO manager_users (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'contact@ca-tech.fr'
ON CONFLICT (user_id) DO NOTHING;

COMMIT;
