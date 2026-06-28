-- Migration 004 — Système de devis CA-TECH
-- Tables : devis, devis_items, devis_relances

-- ─── devis ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS devis (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  devis_number   TEXT UNIQUE NOT NULL,
  status         TEXT NOT NULL DEFAULT 'draft'
                   CHECK (status IN ('draft','sent','accepted','refused','expired')),

  -- Contact prospect
  contact_name   TEXT NOT NULL DEFAULT '',
  contact_email  TEXT NOT NULL DEFAULT '',
  contact_phone  TEXT,
  company_name   TEXT,

  -- Projet
  project_type   TEXT,           -- site-vitrine | site-ecommerce | landing-page | logo | flyer | identite-visuelle | sur-mesure | ia-automatisation
  activity       TEXT,           -- secteur d'activité libre
  features       JSONB DEFAULT '[]',
  budget_range   TEXT,
  deadline       TEXT,
  notes          TEXT,

  -- Options
  seo_option          BOOLEAN DEFAULT false,
  maintenance_option  TEXT    DEFAULT 'none',   -- none | vitrine | ecommerce
  hosting_option      BOOLEAN DEFAULT false,
  branding_option     BOOLEAN DEFAULT false,

  -- Tarification (TTC)
  items          JSONB    DEFAULT '[]',          -- snapshot des lignes
  subtotal       NUMERIC(10,2) DEFAULT 0,        -- HT
  discount       NUMERIC(10,2) DEFAULT 0,
  tax_rate       NUMERIC(5,2)  DEFAULT 20,
  tax_amount     NUMERIC(10,2) DEFAULT 0,
  total          NUMERIC(10,2) DEFAULT 0,        -- TTC

  -- Relations (optionnelles)
  lead_id           UUID,
  client_id         UUID REFERENCES clients(id),
  conversation_id   UUID,

  -- Dates
  valid_until       DATE        DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
  sent_at           TIMESTAMPTZ,
  accepted_at       TIMESTAMPTZ,
  refused_at        TIMESTAMPTZ,
  last_reminder_at  TIMESTAMPTZ,

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── devis_items ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS devis_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  devis_id    UUID NOT NULL REFERENCES devis(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity    INTEGER      DEFAULT 1,
  unit_price  NUMERIC(10,2) NOT NULL,   -- HT
  total       NUMERIC(10,2) NOT NULL,   -- HT
  sort_order  INTEGER      DEFAULT 0,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- ─── devis_relances ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS devis_relances (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  devis_id  UUID NOT NULL REFERENCES devis(id) ON DELETE CASCADE,
  channel   TEXT NOT NULL CHECK (channel IN ('email','telegram','whatsapp')),
  sent_at   TIMESTAMPTZ DEFAULT NOW(),
  status    TEXT DEFAULT 'sent'
);

-- ─── Trigger updated_at ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_devis_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_devis_updated ON devis;
CREATE TRIGGER trg_devis_updated
  BEFORE UPDATE ON devis
  FOR EACH ROW EXECUTE FUNCTION update_devis_updated_at();

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_devis_status     ON devis(status);
CREATE INDEX IF NOT EXISTS idx_devis_email      ON devis(contact_email);
CREATE INDEX IF NOT EXISTS idx_devis_created    ON devis(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_devis_items_did  ON devis_items(devis_id);
CREATE INDEX IF NOT EXISTS idx_devis_rel_did    ON devis_relances(devis_id);

-- ─── RLS (service_role bypass côté API) ──────────────────────────────────────
ALTER TABLE devis          ENABLE ROW LEVEL SECURITY;
ALTER TABLE devis_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE devis_relances ENABLE ROW LEVEL SECURITY;
