-- Migration 012 — Bucket Storage "catalogue"
-- Images pour catalogue_collaborateurs (et catalogue_services à terme)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'catalogue',
  'catalogue',
  true,
  5242880,  -- 5 MB
  ARRAY['image/jpeg','image/png','image/webp','image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Lecture publique (site public + manager)
CREATE POLICY "catalogue_public_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'catalogue');

-- Upload / remplacement (manager authentifié)
CREATE POLICY "catalogue_auth_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'catalogue');

CREATE POLICY "catalogue_auth_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'catalogue');

-- Suppression (manager authentifié)
CREATE POLICY "catalogue_auth_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'catalogue');
