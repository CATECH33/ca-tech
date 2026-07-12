-- Configuration de synchronisation Google Sheets
CREATE TABLE IF NOT EXISTS sheets_sync_config (
  id                   uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  spreadsheet_id       text,
  spreadsheet_url      text,
  spreadsheet_name     text DEFAULT 'CA-TECH Prospects',
  last_sync_at         timestamptz,
  last_sync_direction  text,
  last_sync_rows       integer DEFAULT 0,
  last_sync_errors     integer DEFAULT 0,
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now()
);

-- Historique des synchronisations
CREATE TABLE IF NOT EXISTS sheets_sync_logs (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  direction        text NOT NULL,
  status           text NOT NULL,
  rows_exported    integer DEFAULT 0,
  rows_imported    integer DEFAULT 0,
  rows_created     integer DEFAULT 0,
  rows_updated     integer DEFAULT 0,
  rows_failed      integer DEFAULT 0,
  error_details    jsonb,
  spreadsheet_id   text,
  spreadsheet_url  text,
  duration_ms      integer,
  created_at       timestamptz DEFAULT now()
);

ALTER TABLE prospects ADD COLUMN IF NOT EXISTS sheets_row_index integer;

ALTER TABLE sheets_sync_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE sheets_sync_logs   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all" ON sheets_sync_config FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON sheets_sync_logs   FOR ALL TO anon USING (true) WITH CHECK (true);
