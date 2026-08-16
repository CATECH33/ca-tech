import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const GOOGLE_CLIENT_ID     = Deno.env.get('GOOGLE_CLIENT_ID')!
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE)

  // DELETE — déconnexion Google
  if (req.method === 'DELETE') {
    const { data: existing } = await supabase
      .from('google_integrations')
      .select('id')
      .limit(1)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from('google_integrations')
        .delete()
        .eq('id', existing.id)
      if (error) return json({ error: error.message }, 500)
    }

    return json({ ok: true })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  // POST — échange code → tokens
  let code: string, redirect_uri: string, client_id: string
  try {
    const body = await req.json()
    code = body.code
    redirect_uri = body.redirect_uri
    client_id = body.client_id ?? GOOGLE_CLIENT_ID
    if (!code || !redirect_uri || !client_id) throw new Error()
  } catch {
    return json({ error: 'Missing code, redirect_uri or client_id' }, 400)
  }

  // Échange auprès de Google
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      redirect_uri,
      grant_type: 'authorization_code',
    }),
  })
  const tokenData = await tokenRes.json()
  if (!tokenRes.ok || !tokenData.access_token) {
    console.error('Google token error:', JSON.stringify(tokenData))
    console.error('redirect_uri used:', redirect_uri)
    return json({ error: tokenData.error_description ?? 'Token exchange failed', code: tokenData.error }, 400)
  }

  // Récupération de l'email Google
  const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })
  const userData = await userRes.json()
  if (!userRes.ok || !userData.email) {
    return json({ error: 'Failed to get user info from Google' }, 400)
  }

  // user_id depuis le JWT Bearer de la requête
  const authHeader = req.headers.get('Authorization') ?? ''
  const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
  const user_id = user?.id ?? '00000000-0000-0000-0000-000000000000'

  const expires_at = tokenData.expires_in
    ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
    : null

  const record = {
    user_id,
    email: userData.email,
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token ?? null,
    token_type: tokenData.token_type ?? 'Bearer',
    scope: tokenData.scope ?? '',
    expires_at,
    connected_at: new Date().toISOString(),
  }

  // Upsert : mise à jour si l'enregistrement existe déjà, sinon insert
  const { data: existing } = await supabase
    .from('google_integrations')
    .select('id')
    .limit(1)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('google_integrations')
      .update(record)
      .eq('id', existing.id)
    if (error) return json({ error: error.message }, 500)
  } else {
    const { error } = await supabase
      .from('google_integrations')
      .insert(record)
    if (error) return json({ error: error.message }, 500)
  }

  return json({ ok: true, email: userData.email })
})
