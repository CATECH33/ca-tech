-- Migration 005 — Sécurisation notification_settings
-- L'API (service_role) bypass RLS automatiquement.
-- Le manager React utilise Supabase Auth → rôle authenticated.

ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Lecture : utilisateurs authentifiés seulement
CREATE POLICY "authenticated_select"
  ON public.notification_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Mise à jour : utilisateurs authentifiés seulement
CREATE POLICY "authenticated_update"
  ON public.notification_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
