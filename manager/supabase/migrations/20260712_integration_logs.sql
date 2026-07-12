-- Journal unifié des opérations par service d'intégration
CREATE TABLE IF NOT EXISTS integration_logs (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  service         text NOT NULL,           -- 'gmail' | 'calendar' | 'drive' | 'sheets'
  action          text NOT NULL,           -- 'test' | 'send' | 'sync' | 'upload' | 'auto_fix'
  status          text NOT NULL DEFAULT 'success', -- 'success' | 'error' | 'warning'
  operations_count integer DEFAULT 1,
  error_message   text,
  details         jsonb,
  duration_ms     integer,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS integration_logs_service_created
  ON integration_logs (service, created_at DESC);

ALTER TABLE integration_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON integration_logs FOR ALL TO anon USING (true) WITH CHECK (true);
