const RESEND_KEY  = Deno.env.get('RESEND_API_KEY')
const BREVO_KEY   = Deno.env.get('BREVO_API_KEY')
const FROM_EMAIL  = Deno.env.get('NOTIFICATION_FROM_EMAIL') ?? 'contact@ca-tech.fr'
const REPLY_TO    = 'contact@ca-tech.fr'

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function replyHtml(toName: string, originalSubject: string, replyBody: string): string {
  const prenom    = toName.split(' ')[0] || 'vous'
  const safeBody  = replyBody
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>')

  return `<!DOCTYPE html><html lang="fr">
<head><meta charset="UTF-8"/><title>Réponse de CA-TECH</title></head>
<body style="margin:0;padding:0;font-family:Inter,-apple-system,sans-serif;background:#F8FAFC">
<div style="max-width:560px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
  <div style="background:linear-gradient(135deg,#0A2540 0%,#0066FF 100%);padding:28px 32px">
    <div style="color:#fff;font-size:20px;font-weight:700">💬 Réponse de CA-TECH</div>
    <div style="color:rgba(255,255,255,.65);font-size:13px;margin-top:4px">Re : ${originalSubject || 'Votre message'}</div>
  </div>
  <div style="padding:28px 32px">
    <p style="font-size:15px;color:#1E293B;margin:0 0 20px">Bonjour <strong>${prenom}</strong>,</p>
    <div style="font-size:14px;color:#334155;line-height:1.8">${safeBody}</div>
    <div style="margin-top:28px;padding-top:20px;border-top:1px solid #E2E8F0">
      <p style="font-size:13px;color:#64748B;margin:0 0 6px">
        Pour toute question supplémentaire, répondez à cet email ou appelez-nous au <strong>+33 7 75 66 49 75</strong> (Lun–Ven · 9h–19h).
      </p>
      <p style="font-size:13px;color:#64748B;margin:0">
        <a href="mailto:contact@ca-tech.fr" style="color:#0066FF">contact@ca-tech.fr</a>
      </p>
    </div>
  </div>
  <div style="padding:4px 32px 28px">
    <a href="https://www.ca-tech.fr" style="display:inline-block;background:#0066FF;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-size:14px;font-weight:600">Visiter ca-tech.fr →</a>
  </div>
  <div style="padding:14px 32px;background:#F8FAFC;border-top:1px solid #E2E8F0;font-size:11px;color:#94A3B8">
    CA-TECH · Paris · Lyon · Dijon · Troyes · <a href="https://www.ca-tech.fr" style="color:#94A3B8">ca-tech.fr</a>
  </div>
</div>
</body></html>`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { to_email, to_name, reply_body, original_subject } = await req.json()

    if (!to_email || !reply_body) {
      return new Response(JSON.stringify({ error: 'Champs requis manquants' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const subject = `Re : ${original_subject || 'Votre message'} — CA-TECH`
    const html    = replyHtml(to_name || '', original_subject || '', reply_body)
    const text    = `Bonjour ${(to_name || '').split(' ')[0] || ''},\n\n${reply_body}\n\n--\nCA-TECH · contact@ca-tech.fr · +33 7 75 66 49 75`

    let sent = false

    if (RESEND_KEY) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_KEY}` },
          body: JSON.stringify({
            from:     `CA-TECH <${FROM_EMAIL}>`,
            to:       [to_email],
            reply_to: REPLY_TO,
            subject, html, text,
          }),
        })
        if (res.ok) sent = true
        else console.warn('[send-reply/resend]', await res.text())
      } catch (e) { console.warn('[send-reply/resend]', e) }
    }

    if (!sent && BREVO_KEY) {
      try {
        const res = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'api-key': BREVO_KEY },
          body: JSON.stringify({
            sender:  { name: 'CA-TECH', email: FROM_EMAIL },
            to:      [{ email: to_email, name: to_name || '' }],
            replyTo: { email: REPLY_TO },
            subject, htmlContent: html, textContent: text,
          }),
        })
        if (res.ok) sent = true
        else console.warn('[send-reply/brevo]', await res.text())
      } catch (e) { console.warn('[send-reply/brevo]', e) }
    }

    return new Response(JSON.stringify({ ok: sent }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('[send-reply-email]', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
