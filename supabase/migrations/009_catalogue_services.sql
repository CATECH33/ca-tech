-- Migration 009 — Catalogue services (site public)
-- Table distincte de "services" (CRM interne)

CREATE TABLE IF NOT EXISTS catalogue_services (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  nom         TEXT    NOT NULL,
  description TEXT    NOT NULL DEFAULT '',
  categorie   TEXT    NOT NULL DEFAULT 'web'
                CHECK (categorie IN ('web','ecommerce','seo','ia','branding','application','autre')),
  prix        NUMERIC(10,2) NOT NULL DEFAULT 0,
  visible     BOOLEAN NOT NULL DEFAULT false,
  ordre       INTEGER NOT NULL DEFAULT 0
);

-- Mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION update_catalogue_services_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_catalogue_services_updated_at
  BEFORE UPDATE ON catalogue_services
  FOR EACH ROW EXECUTE FUNCTION update_catalogue_services_updated_at();

-- RLS
ALTER TABLE catalogue_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_all" ON catalogue_services
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Index sur l'ordre d'affichage
CREATE INDEX idx_catalogue_services_ordre ON catalogue_services (ordre ASC);
