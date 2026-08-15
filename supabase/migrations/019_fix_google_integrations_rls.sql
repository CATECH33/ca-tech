-- Migration 019 — Correction RLS google_integrations
-- Problème : policy "google_integration_own" exige auth.uid() = user_id
-- Le record existant avait user_id = '00000000-0000-0000-0000-000000000000' (SOLO_UUID)
-- → l'admin authentifié (15f46bd9-...) ne voyait jamais la ligne → "Non connecté"
--
-- Corrections :
-- 1. Remplacer la policy restrictive par is_ca_tech_manager()
-- 2. Corriger le user_id du record existant vers le vrai UUID admin

BEGIN;

-- 1. Remplacer la RLS
DROP POLICY IF EXISTS "google_integration_own" ON google_integrations;

CREATE POLICY "google_integration_manager"
  ON google_integrations FOR ALL TO authenticated
  USING  (public.is_ca_tech_manager())
  WITH CHECK (public.is_ca_tech_manager());

-- 2. Corriger le user_id du record stocké avec le SOLO_UUID
UPDATE google_integrations
SET user_id = '15f46bd9-95bb-4f1b-b046-4b5da14c57b1'
WHERE user_id = '00000000-0000-0000-0000-000000000000';

COMMIT;
