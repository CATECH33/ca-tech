-- Migration 010 — Catalogue services : champs étendus
-- Ajoute slug, description_complete, image_url, icone,
-- prix_barre, cta_label, seo_title, seo_description

ALTER TABLE catalogue_services
  ADD COLUMN IF NOT EXISTS slug                 TEXT,
  ADD COLUMN IF NOT EXISTS description_complete TEXT    NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS image_url            TEXT,
  ADD COLUMN IF NOT EXISTS icone                TEXT    NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS prix_barre           NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS cta_label            TEXT    NOT NULL DEFAULT 'Demander un devis',
  ADD COLUMN IF NOT EXISTS seo_title            TEXT    NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS seo_description      TEXT    NOT NULL DEFAULT '';

-- Index sur le slug pour les lookups côté site public
CREATE UNIQUE INDEX IF NOT EXISTS idx_catalogue_services_slug
  ON catalogue_services (slug)
  WHERE slug IS NOT NULL;
