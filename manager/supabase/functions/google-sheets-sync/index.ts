import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SOLO_USER_ID = '00000000-0000-0000-0000-000000000000'
const SHEET_NAME   = 'Prospects'
const HEADERS      = ['ID', 'Société', 'Site web', 'Secteur', 'Taille', 'Pays', 'Ville', 'Statut', 'Score', 'Source', 'Tags', 'LinkedIn', 'Créé le']
const MAX_ROWS     = 5000

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

// ── Google OAuth token (refresh if needed) ───────────────────────────────────

async function getAccessToken(supabase: ReturnType<typeof createClient>): Promise<string> {
  const { data: g, error } = await supabase
    .from('google_integrations')
    .select('access_token, refresh_token, expires_at, scope')
    .eq('user_id', SOLO_USER_ID)
    .maybeSingle()

  if (error || !g) throw new Error('Google non connecté. Connectez votre compte depuis Paramètres > Intégrations.')

  if (!g.scope?.includes('spreadsheets')) {
    throw new Error('SCOPE_MISSING: Le scope Google Sheets n\'est pas accordé. Reconnectez votre compte Google pour activer Sheets.')
  }

  const expiresAt = g.expires_at ? new Date(g.expires_at as string).getTime() : 0
  if (expiresAt > Date.now() + 5 * 60 * 1000) return g.access_token as string

  if (!g.refresh_token) throw new Error('Token Google expiré — reconnectez votre compte.')

  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: g.refresh_token as string,
      client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
      client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
    }),
  })
  const tokens = await r.json() as { access_token: string; expires_in: number; error?: string }
  if (!r.ok || tokens.error) throw new Error(`Refresh Google échoué : ${tokens.error}`)

  await supabase.from('google_integrations')
    .update({ access_token: tokens.access_token, expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString() })
    .eq('user_id', SOLO_USER_ID)

  return tokens.access_token
}

// ── Get or create the spreadsheet ────────────────────────────────────────────

async function getOrCreateSheet(
  accessToken: string,
  supabase: ReturnType<typeof createClient>,
): Promise<{ id: string; url: string }> {
  const { data: cfg } = await supabase.from('sheets_sync_config').select('spreadsheet_id, spreadsheet_url').maybeSingle()

  if (cfg?.spreadsheet_id) {
    const check = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${cfg.spreadsheet_id}?fields=spreadsheetId`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )
    if (check.ok) return { id: cfg.spreadsheet_id as string, url: cfg.spreadsheet_url as string }
  }

  // Create fresh spreadsheet
  const r = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      properties: { title: 'CA-TECH Prospects' },
      sheets: [{
        properties: {
          title: SHEET_NAME,
          gridProperties: { frozenRowCount: 1, columnCount: HEADERS.length, rowCount: MAX_ROWS },
        },
      }],
    }),
  })
  const sheet = await r.json() as { spreadsheetId?: string; spreadsheetUrl?: string; error?: { message: string } }
  if (!r.ok) throw new Error(`Création spreadsheet échouée : ${sheet.error?.message}`)

  const id  = sheet.spreadsheetId!
  const url = sheet.spreadsheetUrl ?? `https://docs.google.com/spreadsheets/d/${id}`

  // Upsert config
  const { data: existing } = await supabase.from('sheets_sync_config').select('id').maybeSingle()
  if (existing) {
    await supabase.from('sheets_sync_config').update({ spreadsheet_id: id, spreadsheet_url: url, updated_at: new Date().toISOString() }).eq('id', existing.id)
  } else {
    await supabase.from('sheets_sync_config').insert({ spreadsheet_id: id, spreadsheet_url: url })
  }

  return { id, url }
}

// ── Row converters ────────────────────────────────────────────────────────────

type Prospect = Record<string, unknown>

function toRow(p: Prospect): string[] {
  return [
    String(p.id ?? ''),
    String(p.company_name ?? ''),
    String(p.website ?? ''),
    String(p.industry ?? ''),
    String(p.company_size ?? ''),
    String(p.country ?? ''),
    String(p.city ?? ''),
    String(p.status ?? ''),
    String(p.score ?? 0),
    String(p.source ?? ''),
    ((p.tags as string[] | null) ?? []).join(', '),
    String(p.linkedin_url ?? ''),
    p.created_at ? new Date(p.created_at as string).toLocaleDateString('fr-FR') : '',
  ]
}

function fromRow(row: string[]): Partial<Prospect> {
  const pad = (i: number) => (row[i] ?? '').trim()
  return {
    id:           pad(0) || null,
    company_name: pad(1) || null,
    website:      pad(2) || null,
    industry:     pad(3) || null,
    company_size: pad(4) || null,
    country:      pad(5) || null,
    city:         pad(6) || null,
    status:       pad(7) || 'new',
    score:        parseInt(pad(8), 10) || 0,
    source:       pad(9) || 'manual',
    tags:         pad(10) ? pad(10).split(',').map(t => t.trim()).filter(Boolean) : [],
    linkedin_url: pad(11) || null,
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  try {
    const body = await req.json().catch(() => ({})) as { action?: string }
    const action = body.action ?? 'sync'

    // ── STATUS ────────────────────────────────────────────────────────────────
    if (action === 'status') {
      const [cfgRes, logsRes] = await Promise.all([
        supabase.from('sheets_sync_config').select('*').maybeSingle(),
        supabase.from('sheets_sync_logs').select('*').order('created_at', { ascending: false }).limit(20),
      ])
      return json({ config: cfgRes.data, logs: logsRes.data ?? [] })
    }

    // ── AUTH + SHEET ──────────────────────────────────────────────────────────
    const accessToken = await getAccessToken(supabase)
    const { id: spreadsheetId, url: spreadsheetUrl } = await getOrCreateSheet(accessToken, supabase)
    const range = `${SHEET_NAME}!A1:M${MAX_ROWS}`
    const t0 = Date.now()

    let rowsExported = 0, rowsImported = 0, rowsCreated = 0, rowsUpdated = 0, rowsFailed = 0
    const errorDetails: Array<{ row?: number; id?: string; error: string }> = []

    // ── IMPORT: Sheets → CA-TECH ──────────────────────────────────────────────
    if (action === 'import' || action === 'sync') {
      const sr = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${SHEET_NAME}!A2:M${MAX_ROWS}?majorDimension=ROWS`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      )
      const sd = await sr.json() as { values?: string[][] }
      const rows = sd.values ?? []

      const { data: dbProspects } = await supabase.from('prospects')
        .select('id, company_name, website, industry, company_size, country, city, status, score, source, tags, linkedin_url')
      const byId = new Map((dbProspects ?? []).map(p => [p.id as string, p]))

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        if (!row || !row[0] && !row[1]) continue
        const data = fromRow(row)

        try {
          if (data.id && byId.has(data.id as string)) {
            // Existing prospect — update if sheet differs
            const existing = byId.get(data.id as string)!
            const changed = (
              data.company_name !== existing.company_name ||
              (data.website ?? '') !== (existing.website ?? '') ||
              (data.industry ?? '') !== (existing.industry ?? '') ||
              (data.company_size ?? '') !== (existing.company_size ?? '') ||
              (data.country ?? '') !== (existing.country ?? '') ||
              (data.city ?? '') !== (existing.city ?? '') ||
              data.status !== existing.status
            )
            if (changed) {
              const { error } = await supabase.from('prospects').update({
                company_name: data.company_name ?? existing.company_name,
                website:      data.website ?? null,
                industry:     data.industry ?? null,
                company_size: data.company_size ?? null,
                country:      data.country ?? null,
                city:         data.city ?? null,
                status:       data.status,
                score:        data.score as number,
                source:       data.source ?? null,
                tags:         data.tags as string[],
                linkedin_url: data.linkedin_url ?? null,
                updated_at:   new Date().toISOString(),
              }).eq('id', data.id as string)
              if (error) throw error
              rowsUpdated++
              rowsImported++
            }
          } else if (!data.id && data.company_name) {
            // New row in Sheet — create prospect
            const { error } = await supabase.from('prospects').insert({
              company_name: data.company_name,
              website:      data.website ?? null,
              industry:     data.industry ?? null,
              company_size: data.company_size ?? null,
              country:      data.country ?? null,
              city:         data.city ?? null,
              status:       data.status ?? 'new',
              score:        data.score ?? 0,
              source:       (data.source ?? 'manual') as string,
              tags:         (data.tags ?? []) as string[],
              linkedin_url: data.linkedin_url ?? null,
            })
            if (error) throw error
            rowsCreated++
            rowsImported++
          }
        } catch (e) {
          rowsFailed++
          errorDetails.push({ row: i + 2, error: e instanceof Error ? e.message : String(e) })
        }
      }
    }

    // ── EXPORT: CA-TECH → Sheets ──────────────────────────────────────────────
    if (action === 'export' || action === 'sync') {
      const { data: prospects, error: pErr } = await supabase
        .from('prospects')
        .select('*')
        .order('created_at', { ascending: false })
      if (pErr) throw pErr

      const dataRows = (prospects ?? []).map(toRow)
      const allRows  = [HEADERS, ...dataRows]

      // Write header + data in one PUT
      const wr = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ values: allRows, majorDimension: 'ROWS' }),
        },
      )
      if (!wr.ok) {
        const we = await wr.json() as { error?: { message: string } }
        throw new Error(`Écriture Sheets échouée : ${we.error?.message ?? wr.status}`)
      }

      rowsExported = dataRows.length

      // Clear stale rows below our data (best-effort)
      const clearStart = allRows.length + 1
      if (clearStart < MAX_ROWS) {
        await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${SHEET_NAME}!A${clearStart}:M${MAX_ROWS}:clear`,
          { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` } },
        ).catch(() => {})
      }
    }

    // ── Log & update config ───────────────────────────────────────────────────
    const durationMs = Date.now() - t0
    const totalRows  = rowsExported + rowsImported
    const status     = rowsFailed > 0 && totalRows === 0 ? 'error' : rowsFailed > 0 ? 'partial' : 'success'

    await supabase.from('sheets_sync_logs').insert({
      direction:      action,
      status,
      rows_exported:  rowsExported,
      rows_imported:  rowsImported,
      rows_created:   rowsCreated,
      rows_updated:   rowsUpdated,
      rows_failed:    rowsFailed,
      error_details:  errorDetails.length > 0 ? { errors: errorDetails.slice(0, 20) } : null,
      spreadsheet_id: spreadsheetId,
      spreadsheet_url: spreadsheetUrl,
      duration_ms:    durationMs,
    })

    const cfgPatch = {
      spreadsheet_id:       spreadsheetId,
      spreadsheet_url:      spreadsheetUrl,
      last_sync_at:         new Date().toISOString(),
      last_sync_direction:  action,
      last_sync_rows:       totalRows,
      last_sync_errors:     rowsFailed,
      updated_at:           new Date().toISOString(),
    }
    const { data: cfgRow } = await supabase.from('sheets_sync_config').select('id').maybeSingle()
    if (cfgRow) {
      await supabase.from('sheets_sync_config').update(cfgPatch).eq('id', cfgRow.id)
    } else {
      await supabase.from('sheets_sync_config').insert(cfgPatch)
    }

    return json({
      success:        status !== 'error',
      status,
      rows_exported:  rowsExported,
      rows_imported:  rowsImported,
      rows_created:   rowsCreated,
      rows_updated:   rowsUpdated,
      rows_failed:    rowsFailed,
      spreadsheet_id: spreadsheetId,
      spreadsheet_url: spreadsheetUrl,
      duration_ms:    durationMs,
      errors:         errorDetails.slice(0, 5),
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erreur inattendue'
    return json({ error: msg, scope_missing: msg.startsWith('SCOPE_MISSING') }, 500)
  }
})
