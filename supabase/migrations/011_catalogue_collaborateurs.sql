-- Migration 011 — Catalogue collaborateurs IA
-- Table distincte de "catalogue_services"

CREATE TABLE IF NOT EXISTS catalogue_collaborateurs (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Identité
  nom                  TEXT NOT NULL,
  slug                 TEXT,
  description          TEXT NOT NULL DEFAULT '',   -- description_courte (affiché dans les cartes)
  description_complete TEXT NOT NULL DEFAULT '',
  mission              TEXT NOT NULL DEFAULT '',
  icone                TEXT NOT NULL DEFAULT '',
  image_url            TEXT,

  -- Contenu structuré
  fonctionnalites      TEXT[]  NOT NULL DEFAULT '{}',
  secteurs             TEXT[]  NOT NULL DEFAULT '{}',
  outils_compatibles   TEXT[]  NOT NULL DEFAULT '{}',
  resultats_attendus   TEXT[]  NOT NULL DEFAULT '{}',
  faq                  JSONB   NOT NULL DEFAULT '[]',  -- [{question, reponse}]

  -- Catégorie
  categorie            TEXT NOT NULL DEFAULT 'assistant'
                       CHECK (categorie IN ('assistant','agent','analyste','createur','automatiseur','autre')),

  -- Tarification
  prix                 NUMERIC(10,2) NOT NULL DEFAULT 0,
  prix_barre           NUMERIC(10,2),
  temps_installation   TEXT NOT NULL DEFAULT '',

  -- CTA
  cta_label            TEXT NOT NULL DEFAULT 'Activer ce collaborateur',
  cta_secondaire       TEXT NOT NULL DEFAULT '',

  -- SEO
  seo_title            TEXT NOT NULL DEFAULT '',
  seo_description      TEXT NOT NULL DEFAULT '',

  -- Publication
  visible              BOOLEAN NOT NULL DEFAULT false,
  ordre                INTEGER NOT NULL DEFAULT 0
);

-- updated_at auto
CREATE OR REPLACE FUNCTION update_catalogue_collaborateurs_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_catalogue_collaborateurs_updated_at
  BEFORE UPDATE ON catalogue_collaborateurs
  FOR EACH ROW EXECUTE FUNCTION update_catalogue_collaborateurs_updated_at();

-- Index
CREATE UNIQUE INDEX IF NOT EXISTS idx_catalogue_collaborateurs_slug
  ON catalogue_collaborateurs (slug)
  WHERE slug IS NOT NULL;

CREATE INDEX idx_catalogue_collaborateurs_ordre
  ON catalogue_collaborateurs (ordre ASC);

CREATE INDEX idx_catalogue_collaborateurs_visible
  ON catalogue_collaborateurs (visible);

-- RLS
ALTER TABLE catalogue_collaborateurs ENABLE ROW LEVEL SECURITY;

-- Authenticated : lecture + écriture complète (manager)
CREATE POLICY "collab_auth_all" ON catalogue_collaborateurs
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Anon : lecture seule des collaborateurs visibles (site public)
CREATE POLICY "collab_anon_read" ON catalogue_collaborateurs
  FOR SELECT TO anon
  USING (visible = true);
