-- Migration 020 — Colonne document_type sur la table documents
-- Permet de distinguer les pièces jointes normales des devis signés importés.
-- Opération ADDITIVE : les documents existants reçoivent la valeur 'attachment' par défaut.

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS document_type TEXT NOT NULL DEFAULT 'attachment'
    CHECK (document_type IN ('attachment', 'signed_quote'));

CREATE INDEX IF NOT EXISTS idx_documents_doc_type ON documents(document_type);

-- Note : à exécuter manuellement via Supabase Dashboard ou CLI après validation.
