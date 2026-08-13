-- Migration 018 — Rôles Manager + RLS subscriptions restrictive
-- Sprint 10.5 — Corrections W1 (RLS trop permissive) + W4 (IDOR prerequisite)
--
-- Contexte :
--   W1 (audit Sprint 10.4) : policy "auth users manage subscriptions" autorise
--   tout utilisateur Supabase authentifié à lire/modifier tous les abonnements.
--   W4 : pas de vérification côté serveur que l'appelant est un manager.
--
-- Solution :
--   1. Créer manager_users — table de vérité des accès Manager CA-TECH.
--   2. Créer is_ca_tech_manager() SECURITY DEFINER — évite la récursion RLS.
--   3. Insérer l'admin CA-TECH (pemoustaskit@gmail.com) si présent.
--   4. Remplacer l'ancienne policy par des policies restrictives (manager only).
--
-- Note :
--   Les edge functions utilisent SUPABASE_SERVICE_ROLE_KEY → RLS bypassée.
--   Le contrôle IDOR applicatif (manager_users check dans le code) complète la RLS.

BEGIN;

-- ─── 1. Table manager_users ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS manager_users (
  user_id    UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT        NOT NULL DEFAULT 'admin'
               CHECK (role IN ('admin', 'manager')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE manager_users ENABLE ROW LEVEL SECURITY;

-- Lecture autorisée pour tous les authenticated (UUIDs uniquement, pas de données sensibles).
-- Les écritures sont réservées au service_role (migrations, Supabase Admin API).
CREATE POLICY "manager_users_authenticated_select"
  ON manager_users FOR SELECT TO authenticated
  USING (true);

-- ─── 2. Fonction SECURITY DEFINER ─────────────────────────────────────────────
-- Évite la récursion RLS : les policies subscriptions appellent cette fonction
-- qui lit manager_users avec les droits DEFINER (élevés), pas les droits INVOKER.
CREATE OR REPLACE FUNCTION public.is_ca_tech_manager()
  RETURNS BOOLEAN
  LANGUAGE sql
  SECURITY DEFINER
  STABLE
  SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.manager_users WHERE user_id = auth.uid()
  );
$$;

-- ─── 3. Premier admin ─────────────────────────────────────────────────────────
-- Insère l'admin CA-TECH si le compte existe déjà dans auth.users.
-- Si absent (première installation avant signup), l'insertion sera faite
-- manuellement via : INSERT INTO manager_users (user_id, role) VALUES ('<uid>', 'admin');
DO $$
DECLARE
  v_uid UUID;
BEGIN
  SELECT id INTO v_uid
    FROM auth.users
   WHERE email = 'pemoustaskit@gmail.com'
   LIMIT 1;

  IF v_uid IS NOT NULL THEN
    INSERT INTO manager_users (user_id, role)
    VALUES (v_uid, 'admin')
    ON CONFLICT (user_id) DO NOTHING;
    RAISE NOTICE '[018] Admin inséré dans manager_users : %', v_uid;
  ELSE
    RAISE NOTICE '[018] Utilisateur pemoustaskit@gmail.com introuvable dans auth.users — insertion manuelle requise.';
  END IF;
END $$;

-- ─── 4. Remplacer la RLS subscriptions ───────────────────────────────────────
-- Suppression de l'ancienne policy trop permissive
DROP POLICY IF EXISTS "auth users manage subscriptions" ON subscriptions;

-- SELECT : uniquement les membres de manager_users
CREATE POLICY "manager_subscriptions_select"
  ON subscriptions FOR SELECT TO authenticated
  USING (public.is_ca_tech_manager());

-- INSERT : uniquement les membres de manager_users
-- (couvre l'accès direct à la DB ; les edge functions bypassent via service_role)
CREATE POLICY "manager_subscriptions_insert"
  ON subscriptions FOR INSERT TO authenticated
  WITH CHECK (public.is_ca_tech_manager());

-- UPDATE : uniquement les membres de manager_users
CREATE POLICY "manager_subscriptions_update"
  ON subscriptions FOR UPDATE TO authenticated
  USING  (public.is_ca_tech_manager())
  WITH CHECK (public.is_ca_tech_manager());

COMMIT;
