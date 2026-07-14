// Bulk import of ProspectImport[] into Supabase prospects table.
// Deduplicates by website domain. Returns counts + per-item errors.

import { supabase } from '@/lib/supabase'
import type { ProspectImport, ConnectorErrorDetail } from '../connectors/types'

export interface ImportReport {
  total:    number
  imported: number
  skipped:  number
  errors:   ConnectorErrorDetail[]
}

const BATCH_SIZE = 20

function normalizeWebsite(w: string | undefined): string | null {
  if (!w) return null
  try {
    const u = new URL(w.startsWith('http') ? w : `https://${w}`)
    return u.hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return w.toLowerCase()
  }
}

export async function bulkImportProspects(
  prospects: ProspectImport[],
): Promise<ImportReport> {
  const errors: ConnectorErrorDetail[] = []

  // 1. Fetch existing websites for deduplication
  const { data: existing } = await supabase
    .from('prospects')
    .select('website')
    .not('website', 'is', null)

  const existingDomains = new Set(
    (existing ?? []).map(p => normalizeWebsite(p.website)).filter(Boolean) as string[]
  )

  // 2. Partition into insert vs skip
  const toInsert: ProspectImport[] = []

  for (const p of prospects) {
    const domain = normalizeWebsite(p.website)
    if (domain && existingDomains.has(domain)) {
      // duplicate — skip
    } else {
      toInsert.push(p)
      if (domain) existingDomains.add(domain) // prevent duplicates within same batch
    }
  }

  const skipped = prospects.length - toInsert.length

  // 3. Insert in batches
  let imported = 0

  for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
    const batch = toInsert.slice(i, i + BATCH_SIZE)

    const rows = batch.map(p => ({
      company_name: p.company_name,
      website:      p.website      || '',
      industry:     p.industry     || '',
      // company_size has a CHECK constraint — omit if not a known value
      ...(p.company_size ? { company_size: p.company_size } : {}),
      country:      p.country      || '',
      city:         p.city         || '',
      status:       'new' as const,
      score:        0,
      source:       p.source,
      linkedin_url: p.linkedin_url || '',
      tags:         p.tags    ?? [],
      metadata:     p.metadata ?? {},
    }))

    const { error } = await supabase.from('prospects').insert(rows)

    if (error) {
      errors.push({
        code:      'BATCH_INSERT_FAILED',
        message:   error.message,
        at:        new Date().toISOString(),
        retryable: true,
      })
    } else {
      imported += batch.length
    }
  }

  return {
    total:    prospects.length,
    imported,
    skipped,
    errors,
  }
}
