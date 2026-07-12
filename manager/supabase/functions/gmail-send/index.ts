import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

// Encode en base64url (RFC 4648) pour Gmail API
function base64url(input: string): string {
  const bytes = new TextEncoder().encode(input)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function buildRFC2822(
  from: string,
  to: string,
  toName: string | undefined,
  subject: string,
  body: string,
): string {
  const toHeader = toName ? `"${toName}" <${to}>` : to
  return [
    `From: ${from}`,
    `To: ${toHeader}`,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset=UTF-8`,
    `Content-Transfer-Encoding: 8bit`,
    ``,
    body,
  ].join('\r\n')
}

async function refreshAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string,
): Promise<{ access_token: string; expires_in: number }> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Refresh token échoué : ${err}`)
  }
  return res.json()
}

// UUID fixe pour le mode solo (identique à google-oauth)
const SOLO_USER_ID = '00000000-0000-0000-0000-000000000000'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée' }, 405)

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Non autorisé' }, 401)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Résolution de l'utilisateur : session auth ou fallback mode solo
    let userId = SOLO_USER_ID
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)
    if (user?.id) userId = user.id

    const body = await req.json()
    const { to, toName, subject, body: emailBody, draftId } = body as {
      to: string
      toName?: string
      subject: string
      body: string
      draftId?: string
    }

    if (!to || !subject || !emailBody) {
      return json({ error: 'Paramètres manquants : to, subject, body requis' }, 400)
    }

    // Récupérer l'intégration Google (user_id connu ou SOLO_USER_ID)
    const { data: integration, error: intError } = await supabase
      .from('google_integrations')
      .select('access_token, refresh_token, expires_at, email')
      .eq('user_id', userId)
      .maybeSingle()

    if (intError || !integration) {
      return json({ error: 'Compte Google non connecté — connectez Gmail dans Paramètres > Intégrations' }, 400)
    }

    let accessToken = integration.access_token as string
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID')!
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')!

    // Rafraîchir le token si expiré (avec 5 min de marge)
    const expiresAt = integration.expires_at
      ? new Date(integration.expires_at as string).getTime()
      : 0

    if (expiresAt < Date.now() + 5 * 60 * 1000) {
      if (!integration.refresh_token) {
        return json({ error: 'Token expiré — reconnectez votre compte Google' }, 401)
      }
      const refreshed = await refreshAccessToken(
        integration.refresh_token as string,
        clientId,
        clientSecret,
      )
      accessToken = refreshed.access_token
      const newExpiry = new Date(Date.now() + refreshed.expires_in * 1000).toISOString()
      await supabase
        .from('google_integrations')
        .update({ access_token: accessToken, expires_at: newExpiry })
        .eq('user_id', userId)
    }

    // Construire le message RFC 2822 + encoder en base64url
    const raw = base64url(buildRFC2822(
      integration.email as string,
      to,
      toName,
      subject,
      emailBody,
    ))

    // Envoyer via Gmail API
    const gmailRes = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw }),
      },
    )

    const gmailData = await gmailRes.json() as { id?: string; threadId?: string; error?: { message: string } }

    const sentAt = new Date().toISOString()

    if (!gmailRes.ok) {
      const errMsg = gmailData.error?.message ?? 'Erreur Gmail API'
      // Marquer le brouillon comme échoué
      if (draftId) {
        await supabase.from('email_drafts').update({
          status: 'failed',
          metadata: { error: errMsg, failed_at: sentAt },
        }).eq('id', draftId)
      }
      return json({ error: errMsg }, gmailRes.status)
    }

    // Marquer le brouillon comme envoyé
    if (draftId) {
      await supabase.from('email_drafts').update({
        status: 'sent',
        sent_at: sentAt,
        metadata: {
          gmail_message_id: gmailData.id,
          gmail_thread_id: gmailData.threadId,
        },
      }).eq('id', draftId)
    }

    return json({
      success: true,
      messageId: gmailData.id,
      threadId: gmailData.threadId,
      sentAt,
      from: integration.email,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erreur inattendue'
    return json({ error: msg }, 500)
  }
})
