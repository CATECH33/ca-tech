import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SOLO_USER_ID = '00000000-0000-0000-0000-000000000000'

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

// ── Token helper ──────────────────────────────────────────────────────────────

async function getAccessToken(supabase: ReturnType<typeof createClient>): Promise<{
  token: string
  scope: string
  email: string
}> {
  const { data: g, error } = await supabase
    .from('google_integrations')
    .select('access_token, refresh_token, expires_at, scope, email')
    .eq('user_id', SOLO_USER_ID)
    .maybeSingle()

  if (error || !g) throw new Error('Google non connecté')

  const expiresAt = g.expires_at ? new Date(g.expires_at as string).getTime() : 0
  if (expiresAt > Date.now() + 60_000) {
    return { token: g.access_token as string, scope: g.scope as string, email: g.email as string }
  }

  if (!g.refresh_token) throw new Error('Token expiré — reconnectez votre compte')

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
  if (!r.ok || tokens.error) throw new Error(`Refresh échoué : ${tokens.error}`)

  await supabase.from('google_integrations')
    .update({
      access_token: tokens.access_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    })
    .eq('user_id', SOLO_USER_ID)

  return { token: tokens.access_token, scope: g.scope as string, email: g.email as string }
}

// ── Service tests ─────────────────────────────────────────────────────────────

async function testGmail(token: string, scope: string) {
  if (!scope.includes('gmail')) return { ok: false, error: 'Scope Gmail manquant — reconnectez votre compte', needs_reconnect: true }
  const t0 = Date.now()
  const r = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
    headers: { Authorization: `Bearer ${token}` },
  })
  const d = await r.json() as Record<string, unknown>
  const latency_ms = Date.now() - t0
  if (!r.ok) return { ok: false, error: (d.error as { message?: string })?.message ?? 'Erreur Gmail', latency_ms }
  return {
    ok: true,
    latency_ms,
    details: { email: d.emailAddress, total_messages: d.messagesTotal, total_threads: d.threadsTotal },
  }
}

async function testCalendar(token: string, scope: string) {
  if (!scope.includes('calendar')) return { ok: false, error: 'Scope Calendar manquant — reconnectez votre compte', needs_reconnect: true }
  const t0 = Date.now()
  const r = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary', {
    headers: { Authorization: `Bearer ${token}` },
  })
  const d = await r.json() as Record<string, unknown>
  const latency_ms = Date.now() - t0
  if (!r.ok) return { ok: false, error: (d.error as { message?: string })?.message ?? 'Erreur Calendar', latency_ms }
  return {
    ok: true,
    latency_ms,
    details: { calendar_id: d.id, summary: d.summary, timezone: d.timeZone },
  }
}

async function testDrive(token: string, scope: string) {
  if (!scope.includes('drive')) return { ok: false, error: 'Scope Drive manquant — reconnectez votre compte', needs_reconnect: true }
  const t0 = Date.now()
  const r = await fetch('https://www.googleapis.com/drive/v3/about?fields=user,storageQuota', {
    headers: { Authorization: `Bearer ${token}` },
  })
  const d = await r.json() as Record<string, unknown>
  const latency_ms = Date.now() - t0
  if (!r.ok) return { ok: false, error: (d.error as { message?: string })?.message ?? 'Erreur Drive', latency_ms }
  const quota = d.storageQuota as Record<string, string> | null
  const used = quota?.usage ? Math.round(parseInt(quota.usage) / 1024 / 1024) : null
  const limit = quota?.limit ? Math.round(parseInt(quota.limit) / 1024 / 1024 / 1024) : null
  return {
    ok: true,
    latency_ms,
    details: { user: (d.user as Record<string, unknown>)?.displayName, storage_used_mb: used, storage_limit_gb: limit },
  }
}

async function testSheets(token: string, scope: string, supabase: ReturnType<typeof createClient>) {
  if (!scope.includes('spreadsheets')) return { ok: false, error: 'Scope Sheets manquant — reconnectez votre compte', needs_reconnect: true }
  const t0 = Date.now()

  const { data: cfg } = await supabase.from('sheets_sync_config').select('spreadsheet_id, spreadsheet_name').maybeSingle()

  if (cfg?.spreadsheet_id) {
    const r = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${cfg.spreadsheet_id}?fields=spreadsheetId,properties/title`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    const d = await r.json() as Record<string, unknown>
    const latency_ms = Date.now() - t0
    if (!r.ok) {
      const msg = (d.error as { message?: string; status?: string })?.message ?? 'Erreur Sheets'
      const apiDisabled = msg.includes('has not been used') || msg.includes('is disabled')
      return {
        ok: false,
        error: apiDisabled ? 'Google Sheets API non activée dans Google Cloud Console' : msg,
        api_disabled: apiDisabled,
        latency_ms,
      }
    }
    const props = d.properties as Record<string, unknown>
    return { ok: true, latency_ms, details: { spreadsheet: props?.title, id: cfg.spreadsheet_id } }
  }

  return {
    ok: true,
    latency_ms: Date.now() - t0,
    details: { note: 'Scope OK — aucun spreadsheet configuré, lancez une première synchronisation' },
  }
}

// ── Log helper ────────────────────────────────────────────────────────────────

async function logResult(
  supabase: ReturnType<typeof createClient>,
  service: string,
  action: string,
  result: { ok: boolean; error?: string; latency_ms?: number; details?: Record<string, unknown> },
) {
  await supabase.from('integration_logs').insert({
    service,
    action,
    status: result.ok ? 'success' : 'error',
    operations_count: 1,
    error_message: result.error ?? null,
    details: result.details ?? null,
    duration_ms: result.latency_ms ?? null,
  })
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  try {
    const body = await req.json().catch(() => ({})) as { action?: string; service?: string }
    const action = body.action ?? 'test_all'

    // ── STATUS ─────────────────────────────────────────────────────────────────
    if (action === 'status') {
      const [logsRes, sheetsRes] = await Promise.all([
        supabase.from('integration_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase.from('sheets_sync_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10),
      ])

      // Latest result per service
      const latest: Record<string, unknown> = {}
      for (const log of (logsRes.data ?? [])) {
        const s = log.service as string
        if (!latest[s]) latest[s] = log
      }

      return json({
        logs: logsRes.data ?? [],
        sheets_logs: sheetsRes.data ?? [],
        latest_per_service: latest,
      })
    }

    // ── AUTO-FIX ───────────────────────────────────────────────────────────────
    if (action === 'fix') {
      const fixes: string[] = []
      let tokenOk = false
      let tokenEmail = ''
      let scope = ''

      try {
        const r = await getAccessToken(supabase)
        tokenOk = true
        tokenEmail = r.email
        scope = r.scope
        fixes.push('Token rafraîchi avec succès')
      } catch (e) {
        fixes.push(`Erreur token : ${e instanceof Error ? e.message : String(e)}`)
      }

      if (tokenOk) {
        await supabase.from('integration_logs').insert({
          service: 'google',
          action: 'auto_fix',
          status: 'success',
          operations_count: 1,
          details: { fixes, email: tokenEmail, scope_services: scope.split(' ').filter(s => s.includes('google')) },
        })
      }

      return json({ success: tokenOk, fixes, needs_reconnect: !tokenOk })
    }

    // ── TEST (one or all) ──────────────────────────────────────────────────────
    let { token, scope, email } = { token: '', scope: '', email: '' }
    let tokenError: string | null = null

    try {
      const r = await getAccessToken(supabase)
      token = r.token
      scope = r.scope
      email = r.email
    } catch (e) {
      tokenError = e instanceof Error ? e.message : 'Erreur token'
    }

    if (tokenError) {
      return json({ error: tokenError, needs_reconnect: true }, 500)
    }

    const services = action === 'test_all'
      ? ['gmail', 'calendar', 'drive', 'sheets']
      : [action.replace('test_', '')]

    const results: Record<string, unknown> = {}

    for (const svc of services) {
      let result: Awaited<ReturnType<typeof testGmail>>

      if (svc === 'gmail')    result = await testGmail(token, scope)
      else if (svc === 'calendar') result = await testCalendar(token, scope)
      else if (svc === 'drive')    result = await testDrive(token, scope)
      else if (svc === 'sheets')   result = await testSheets(token, scope, supabase)
      else continue

      results[svc] = result
      await logResult(supabase, svc, 'test', result)
    }

    return json({ success: true, email, results })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erreur inattendue'
    return json({ error: msg }, 500)
  }
})
