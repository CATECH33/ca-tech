// Générateur automatique de brouillons post-analyse.
// Appelé après runAutoAnalyse() — ne jamais envoyer automatiquement.

import { supabase } from '@/lib/supabase'

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  as string
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// ── Types locaux (alignés sur DraftRow / useEmailDrafts) ─────────────────────

type TemplateType = 'vitrine' | 'ecommerce' | 'refonte' | 'seo' | 'maintenance'

// Format brut retourné par la Edge Function analyse-prospect
export interface AnalyseResult {
  has_website?:         boolean | null
  has_https?:           boolean | null
  is_responsive?:       boolean | null
  has_form?:            boolean | null
  has_google_business?: boolean | null
  social_networks?:     Record<string, boolean | null> | null
}

// ── Choix du template selon l'analyse ────────────────────────────────────────

function pickTemplate(a: AnalyseResult): TemplateType {
  if (a.has_website === false) return 'vitrine'

  // Site présent mais problèmes techniques
  if (a.has_https === false)      return 'refonte'
  if (a.is_responsive === false)  return 'refonte'

  // Site présent mais peu visible
  const hasSocial = a.social_networks
    ? Object.values(a.social_networks).some(v => v === true)
    : false
  if (!hasSocial && a.has_google_business !== true) return 'seo'

  // Défaut
  return 'vitrine'
}

// ── Appel à la Edge Function generate-email ──────────────────────────────────

interface GeneratedEmail {
  subject:      string
  body:         string
  ai_model:     string
  generated_at: string
  error?:       string
}

async function callGenerateEmail(
  prospect_id:   string,
  template_type: TemplateType,
): Promise<GeneratedEmail | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey:         SUPABASE_ANON,
        Authorization:  `Bearer ${SUPABASE_ANON}`,
      },
      body: JSON.stringify({ prospect_id, template_type, tone: 'professional' }),
    })
    const data = await res.json() as GeneratedEmail
    if (!res.ok || data.error) return null
    return data
  } catch {
    return null
  }
}

// ── Vérifier si un brouillon auto existe déjà pour ce prospect ───────────────

async function hasAutoDraft(prospect_id: string): Promise<boolean> {
  const { data } = await supabase
    .from('email_drafts')
    .select('id')
    .eq('prospect_id', prospect_id)
    .eq('status', 'draft')
    .like('metadata->>source', 'auto_analyse')
    .limit(1)
  return (data?.length ?? 0) > 0
}

// ── Création du brouillon dans Supabase ──────────────────────────────────────

async function insertDraft(
  prospect_id:    string,
  generated:      GeneratedEmail,
  template_type:  TemplateType,
): Promise<void> {
  await supabase.from('email_drafts').insert({
    prospect_id,
    subject:        generated.subject,
    body:           generated.body,
    status:         'draft',
    tone:           'professional',
    sequence_step:  1,
    ai_model:       generated.ai_model,
    metadata: {
      auto_generated: true,
      source:         'auto_analyse',
      template_type,
      generated_at:   generated.generated_at,
    },
  })
}

// ── Point d'entrée public ─────────────────────────────────────────────────────

/**
 * Génère un brouillon personnalisé pour un prospect analysé.
 * - Choisit le template selon les résultats d'analyse
 * - Appelle generate-email (Claude Haiku) pour rédiger l'email
 * - Insère dans email_drafts avec status 'draft'
 * - Ne crée pas de doublon si un brouillon auto existe déjà
 * - Ne jamais envoyer automatiquement
 */
export async function generateAutoDraft(
  prospect_id: string,
  analyse:     AnalyseResult,
): Promise<void> {
  // Éviter les doublons
  if (await hasAutoDraft(prospect_id)) return

  const template_type = pickTemplate(analyse)
  const generated     = await callGenerateEmail(prospect_id, template_type)
  if (!generated) return

  await insertDraft(prospect_id, generated, template_type)
}
