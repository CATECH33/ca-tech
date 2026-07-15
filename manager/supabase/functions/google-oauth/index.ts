import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// UUID fixe pour le mode solo (pas d'utilisateur authentifié)
const SOLO_USER_ID = '00000000-0000-0000-0000-000000000000'

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // DELETE — déconnexion Gmail
  if (req.method === 'DELETE') {
    try {
      const { error } = await supabase
        .from('google_integrations')
        .delete()
        .eq('user_id', SOLO_USER_ID)
      if (error) throw error
      return json({ success: true })
    } catch (e) {
      return json({ error: e instanceof Error ? e.message : 'Erreur' }, 500)
    }
  }

  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée' }, 405)

  try {
    const body = await req.json()
    const { code, redirect_uri } = body as { code: string; redirect_uri: string }

    if (!code || !redirect_uri) {
      return json({ error: 'Paramètres manquants : code et redirect_uri requis' }, 400)
    }

    const clientId = Deno.env.get('GOOGLE_CLIENT_ID')!
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')!

    // Échanger le code OAuth contre des tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri,
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await tokenRes.json() as {
      access_token: string
      refresh_token?: string
      token_type: string
      expires_in: number
      scope: string
      error?: string
      error_description?: string
    }

    if (!tokenRes.ok || tokens.error) {
      return json({ error: tokens.error_description ?? tokens.error ?? 'Échange de code OAuth échoué' }, 400)
    }

    // Récupérer l'email associé au compte Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const userInfo = await userRes.json() as {
      email: string
      error?: { message: string }
    }

    if (!userRes.ok || !userInfo.email) {
      return json({ error: userInfo.error?.message ?? 'Impossible de récupérer le profil Google' }, 400)
    }

    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

    // Upsert — mode solo : user_id fixe, unique constraint garantit un seul enregistrement
    const { error: upsertError } = await supabase
      .from('google_integrations')
      .upsert(
        {
          user_id: SOLO_USER_ID,
          email: userInfo.email,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token ?? null,
          token_type: tokens.token_type ?? 'Bearer',
          expires_at: expiresAt,
          scope: tokens.scope,
          connected_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      )

    if (upsertError) throw upsertError

    return json({ success: true, email: userInfo.email })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erreur inattendue'
    return json({ error: msg }, 500)
  }
})
