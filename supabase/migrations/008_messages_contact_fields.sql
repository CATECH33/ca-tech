-- Ajout des champs entreprise, téléphone et IP pour le formulaire de contact
ALTER TABLE messages ADD COLUMN IF NOT EXISTS company     text;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS phone       text;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS ip_address  text;
