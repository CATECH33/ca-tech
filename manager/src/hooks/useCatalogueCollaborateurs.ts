// Types uniquement — connexion Supabase à brancher ultérieurement

export type CollaborateurCategorie =
  | 'assistant'
  | 'agent'
  | 'analyste'
  | 'createur'
  | 'automatiseur'
  | 'autre'

export interface CatalogueCollaborateur {
  id:          string
  created_at:  string
  updated_at:  string
  nom:         string
  description: string
  categorie:   CollaborateurCategorie
  prix:        number
  visible:     boolean
  ordre:       number
  slug:                 string | null
  description_complete: string | null
  image_url:            string | null
  icone:                string | null
  prix_barre:           number | null
  cta_label:            string | null
  seo_title:            string | null
  seo_description:      string | null
}

export interface CatalogueCollaborateurPayload {
  nom:               string
  description_courte: string
  categorie:         CollaborateurCategorie
  prix:              number
  ordre:             number
  visible:           boolean
  slug:                 string
  description_complete: string
  image_url:            string | null
  icone:                string
  prix_barre:           number | null
  cta_label:            string
  seo_title:            string
  seo_description:      string
}
