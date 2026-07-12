-- Add industry column to clients (secteur d'activité)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS industry text;
