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

async function getValidAccessToken(supabase: ReturnType<typeof createClient>): Promise<string> {
  const { data: integration, error } = await supabase
    .from('google_integrations')
    .select('access_token, refresh_token, expires_at')
    .eq('user_id', SOLO_USER_ID)
    .maybeSingle()

  if (error || !integration) throw new Error('Google non connecté — connectez Google Calendar dans Paramètres > Intégrations')

  const expiresAt = integration.expires_at ? new Date(integration.expires_at as string).getTime() : 0

  if (expiresAt > Date.now() + 5 * 60 * 1000) {
    return integration.access_token as string
  }

  if (!integration.refresh_token) throw new Error('Token expiré — reconnectez votre compte Google')

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: integration.refresh_token as string,
      client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
      client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
    }),
  })

  const tokens = await res.json() as { access_token: string; expires_in: number; error?: string }
  if (!res.ok || tokens.error) throw new Error(`Refresh token échoué : ${tokens.error}`)

  const newExpiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString()
  await supabase
    .from('google_integrations')
    .update({ access_token: tokens.access_token, expires_at: newExpiry })
    .eq('user_id', SOLO_USER_ID)

  return tokens.access_token
}

const COLOR_ID: Record<string, string> = { rdv: '1', relance: '5', demo: '3' }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const url = new URL(req.url)
  const action = url.searchParams.get('action')

  try {
    // ── LIST ──────────────────────────────────────────────────────────────────
    if (req.method === 'GET') {
      const prospectId = url.searchParams.get('prospect_id')
      if (!prospectId) return json({ error: 'prospect_id requis' }, 400)

      const { data: events, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('prospect_id', prospectId)
        .neq('status', 'cancelled')
        .order('start_at', { ascending: true })

      if (error) throw error
      return json({ events: events ?? [] })
    }

    const accessToken = await getValidAccessToken(supabase)

    // ── CREATE ────────────────────────────────────────────────────────────────
    if (req.method === 'POST' && !action) {
      const body = await req.json() as {
        prospect_id: string
        event_type: 'rdv' | 'relance' | 'demo'
        title: string
        description?: string
        start_at: string
        end_at: string
        location?: string
      }

      const { prospect_id, event_type, title, description, start_at, end_at, location } = body

      if (!prospect_id || !event_type || !title || !start_at || !end_at) {
        return json({ error: 'Paramètres manquants : prospect_id, event_type, title, start_at, end_at requis' }, 400)
      }

      const gcalEvent = {
        summary: title,
        description: description ?? '',
        location: location ?? '',
        start: { dateTime: start_at, timeZone: 'Europe/Paris' },
        end: { dateTime: end_at, timeZone: 'Europe/Paris' },
        colorId: COLOR_ID[event_type] ?? '1',
        source: { title: 'CA-TECH Manager', url: 'https://ca-tech.fr' },
      }

      const gcalRes = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(gcalEvent),
        },
      )

      const gcalData = await gcalRes.json() as { id?: string; htmlLink?: string; error?: { message: string } }
      if (!gcalRes.ok) throw new Error(gcalData.error?.message ?? 'Erreur Google Calendar API')

      const { data: event, error: dbError } = await supabase
        .from('calendar_events')
        .insert({
          prospect_id,
          event_type,
          title,
          description: description ?? null,
          start_at,
          end_at,
          location: location ?? null,
          google_event_id: gcalData.id,
          status: 'confirmed',
        })
        .select()
        .single()

      if (dbError) throw dbError

      return json({ event, google_link: gcalData.htmlLink })
    }

    // ── SYNC ──────────────────────────────────────────────────────────────────
    if (req.method === 'POST' && action === 'sync') {
      const body = await req.json() as { prospect_id: string }
      const { prospect_id } = body

      const { data: localEvents } = await supabase
        .from('calendar_events')
        .select('id, google_event_id, status')
        .eq('prospect_id', prospect_id)
        .not('google_event_id', 'is', null)
        .neq('status', 'cancelled')

      let synced = 0
      for (const ev of (localEvents ?? [])) {
        if (!ev.google_event_id) continue
        const res = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events/${ev.google_event_id}`,
          { headers: { Authorization: `Bearer ${accessToken}` } },
        )
        if (res.status === 404 || (res.ok && (await res.json() as { status?: string }).status === 'cancelled')) {
          await supabase.from('calendar_events').update({ status: 'cancelled' }).eq('id', ev.id)
          synced++
        }
      }

      return json({ success: true, synced })
    }

    // ── DELETE ────────────────────────────────────────────────────────────────
    if (req.method === 'DELETE') {
      const eventId = url.searchParams.get('event_id')
      const googleEventId = url.searchParams.get('google_event_id')

      if (!eventId) return json({ error: 'event_id requis' }, 400)

      if (googleEventId) {
        await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events/${googleEventId}`,
          { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } },
        )
      }

      const { error } = await supabase
        .from('calendar_events')
        .update({ status: 'cancelled' })
        .eq('id', eventId)

      if (error) throw error
      return json({ success: true })
    }

    return json({ error: 'Méthode non supportée' }, 405)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erreur inattendue'
    return json({ error: msg }, 500)
  }
})
