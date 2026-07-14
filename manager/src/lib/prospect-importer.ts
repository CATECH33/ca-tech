// Bulk import of ProspectImport[] into Supabase prospects table.
// Deduplicates by website domain. Creates prospect_contacts when provided.

import { supabase } from '@/lib/supabase'
import type { ProspectImport, ConnectorErrorDetail } from '../connectors/types'

export interface ImportReport {
  total:    number
  imported: number
  skipped:  number
  errors:   ConnectorErrorDetail[]
}

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

  // 2. Partition: skip duplicates, collect unique prospects to insert
  const toInsert: ProspectImport[] = []

  for (const p of prospects) {
    const domain = normalizeWebsite(p.website)
    if (domain && existingDomains.has(domain)) {
      // duplicate — skip
    } else {
      toInsert.push(p)
      if (domain) existingDomains.add(domain) // prevent intra-batch duplicates
    }
  }

  const skipped = prospects.length - toInsert.length

  // 3. Insert each prospect individually to capture ID for contacts
  let imported = 0

  for (const p of toInsert) {
    const { data: newProspect, error: insertErr } = await supabase
      .from('prospects')
      .insert({
        company_name: p.company_name,
        website:      p.website      || '',
        industry:     p.industry     || '',
        ...(p.company_size ? { company_size: p.company_size } : {}),
        country:      p.country      || '',
        city:         p.city         || '',
        status:       'new' as const,
        score:        0,
        source:       p.source,
        linkedin_url: p.linkedin_url || '',
        tags:         p.tags     ?? [],
        metadata:     p.metadata ?? {},
      })
      .select('id')
      .single()

    if (insertErr || !newProspect) {
      errors.push({
        code:      'INSERT_FAILED',
        message:   insertErr?.message ?? 'No data returned',
        at:        new Date().toISOString(),
        retryable: true,
      })
      continue
    }

    imported++

    // 4. Insert contacts if provided (phone, email from Google Maps etc.)
    if (p.contacts?.length) {
      const contactRows = p.contacts
        .filter(c => c.phone || c.email || c.first_name)
        .map(c => ({
          prospect_id: newProspect.id,
          first_name:  c.first_name  || '',
          last_name:   c.last_name   || '',
          email:       c.email       || null,
          phone:       c.phone       || null,
          job_title:   c.job_title   || null,
          linkedin_url: c.linkedin_url || null,
          is_primary:  c.is_primary  ?? true,
        }))

      if (contactRows.length) {
        const { error: contactErr } = await supabase
          .from('prospect_contacts')
          .insert(contactRows)

        if (contactErr) {
          errors.push({
            code:      'CONTACT_INSERT_FAILED',
            message:   contactErr.message,
            at:        new Date().toISOString(),
            retryable: false,
          })
        }
      }
    }
  }

  return { total: prospects.length, imported, skipped, errors }
}
