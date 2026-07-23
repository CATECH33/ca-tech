import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_KEY       = Deno.env.get('RESEND_API_KEY')
const BREVO_KEY        = Deno.env.get('BREVO_API_KEY')
const FROM_EMAIL       = Deno.env.get('NOTIFICATION_FROM_EMAIL') ?? 'contact@ca-tech.fr'
const ADMIN_EMAIL      = 'contact@ca-tech.fr'
const MANAGER_URL      = Deno.env.get('MANAGER_URL') ?? 'https://manager.ca-tech.fr'

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ─── Email helpers ─────────────────────────────────────────────────────────────

async function sendEmail(to: string, toName: string, subject: string, html: string, text: string): Promise<boolean> {
  if (RESEND_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_KEY}` },
        body: JSON.stringify({
          from: `CA-TECH <${FROM_EMAIL}>`,
          to: [to],
          reply_to: ADMIN_EMAIL,
          subject, html, text,
        }),
      })
      if (res.ok) return true
      console.warn('[contact-form/resend]', await res.text())
    } catch (e) { console.warn('[contact-form/resend]', e) }
  }

  if (BREVO_KEY) {
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': BREVO_KEY },
        body: JSON.stringify({
          sender: { name: 'CA-TECH', email: FROM_EMAIL },
          to: [{ email: to, name: toName }],
          replyTo: { email: ADMIN_EMAIL },
          subject, htmlContent: html, textContent: text,
        }),
      })
      if (res.ok) return true
      console.warn('[contact-form/brevo]', await res.text())
    } catch (e) { console.warn('[contact-form/brevo]', e) }
  }

  return false
}

// ─── Email admin (notification interne) ───────────────────────────────────────

function adminHtml(d: { name: string; email: string; phone?: string; company?: string; subject: string; message: string; ip?: string }): string {
  const now  = new Date()
  const date = now.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  const row = (icon: string, label: string, value: string, link?: string) => `
    <tr>
      <td style="padding:8px 0 8px;font-size:12px;color:#94A3B8;font-weight:600;width:130px;vertical-align:top">${icon} ${label}</td>
      <td style="padding:8px 0 8px;font-size:14px;color:#1E293B">${link ? `<a href="${link}" style="color:#0066FF;text-decoration:none">${value}</a>` : value}</td>
    </tr>`

  return `<!DOCTYPE html><html lang="fr">
<head><meta charset="UTF-8"/><title>Nouveau message — CA-TECH</title></head>
<body style="margin:0;padding:0;font-family:Inter,-apple-system,sans-serif;background:#F8FAFC">
<div style="max-width:580px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
  <div style="background:linear-gradient(135deg,#0A2540 0%,#0066FF 100%);padding:28px 32px">
    <div style="color:#fff;font-size:20px;font-weight:700">📩 Nouveau message — CA-TECH</div>
    <div style="color:rgba(255,255,255,.65);font-size:13px;margin-top:4px">Formulaire de contact · ${date} à ${time}</div>
  </div>
  <div style="padding:24px 32px">
    <table style="width:100%;border-collapse:collapse">
      ${row('👤', 'Nom', d.name)}
      ${d.company ? row('🏢', 'Entreprise', d.company) : ''}
      ${row('✉️', 'Email', d.email, `mailto:${d.email}?subject=Re: ${encodeURIComponent(d.subject)}`)}
      ${d.phone ? row('📞', 'Téléphone', d.phone, `tel:${d.phone}`) : ''}
      ${row('📋', 'Sujet', d.subject)}
      ${d.ip ? row('🌐', 'Adresse IP', d.ip) : ''}
    </table>
    <div style="margin-top:20px;padding:16px 20px;background:#F8FAFC;border-radius:10px;border-left:3px solid #0066FF">
      <div style="font-size:11px;font-weight:700;color:#0066FF;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">Message</div>
      <div style="font-size:14px;color:#334155;line-height:1.7;white-space:pre-wrap">${d.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
    </div>
  </div>
  <div style="padding:4px 32px 28px;display:flex;gap:12px">
    <a href="mailto:${d.email}?subject=Re: ${encodeURIComponent(d.subject)}" style="display:inline-block;background:#0066FF;color:#fff;text-decoration:none;padding:11px 22px;border-radius:10px;font-size:14px;font-weight:600">Répondre →</a>
    <a href="${MANAGER_URL}/messages" style="display:inline-block;background:#F1F5F9;color:#334155;text-decoration:none;padding:11px 22px;border-radius:10px;font-size:14px;font-weight:600">Voir dans Manager</a>
  </div>
  <div style="padding:14px 32px;background:#F8FAFC;border-top:1px solid #E2E8F0;font-size:11px;color:#94A3B8">
    CA-TECH · contact@ca-tech.fr · <a href="${MANAGER_URL}" style="color:#94A3B8">${MANAGER_URL}</a>
  </div>
</div>
</body></html>`
}

// ─── Email client (accusé de réception) ───────────────────────────────────────

function clientAckHtml(name: string, subject: string): string {
  const prenom = name.split(' ')[0] || 'vous'
  return `<!DOCTYPE html><html lang="fr">
<head><meta charset="UTF-8"/><title>Votre message a bien été reçu — CA-TECH</title></head>
<body style="margin:0;padding:0;font-family:Inter,-apple-system,sans-serif;background:#F8FAFC">
<div style="max-width:560px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
  <div style="background:linear-gradient(135deg,#0A2540 0%,#0066FF 100%);padding:28px 32px">
    <div style="color:#fff;font-size:20px;font-weight:700">✅ Message bien reçu !</div>
    <div style="color:rgba(255,255,255,.65);font-size:13px;margin-top:4px">CA-TECH — Agence Web & Design</div>
  </div>
  <div style="padding:24px 32px">
    <p style="font-size:15px;color:#1E293B;margin:0 0 16px">Bonjour <strong>${prenom}</strong>,</p>
    <p style="font-size:14px;color:#334155;line-height:1.7;margin:0 0 20px">
      Votre message a bien été reçu. Notre équipe l'a pris en compte et vous répondra sous <strong>24 heures ouvrées</strong>.
    </p>
    <div style="background:#F8FAFC;border-radius:10px;border-left:3px solid #0066FF;padding:16px 20px;margin-bottom:20px">
      <div style="font-size:11px;font-weight:700;color:#0066FF;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Votre demande</div>
      <div style="font-size:14px;color:#334155;font-weight:500">${subject}</div>
    </div>
    <p style="font-size:13px;color:#64748B;line-height:1.6;margin:0 0 8px">
      En attendant, n'hésitez pas à appeler directement au <strong>+33 7 75 66 49 75</strong> (Lun–Ven · 9h–19h).
    </p>
    <p style="font-size:13px;color:#64748B;margin:0">
      Pour toute question urgente : <a href="mailto:contact@ca-tech.fr" style="color:#0066FF">contact@ca-tech.fr</a>
    </p>
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

// ─── Handler ───────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { name, email, phone, company, subject, message } = await req.json()

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Champs requis manquants' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? req.headers.get('cf-connecting-ip')
      ?? undefined

    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE)
    const { data: msg, error: dbErr } = await sb
      .from('messages')
      .insert([{
        from_name:  name,
        from_email: email,
        phone:      phone    || null,
        company:    company  || null,
        subject:    subject  || 'Contact depuis le site',
        body:       message,
        source:     'Formulaire',
        ip_address: ip       || null,
        is_read:    false,
        is_replied: false,
        is_archived: false,
      }])
      .select()
      .single()

    if (dbErr) throw dbErr

    const subjectStr = subject || 'Contact depuis le site'

    await Promise.allSettled([
      sendEmail(
        ADMIN_EMAIL,
        'CA-TECH',
        `📩 Nouveau message — ${name}${company ? ` (${company})` : ''}`,
        adminHtml({ name, email, phone, company, subject: subjectStr, message, ip }),
        `Nouveau message de ${name} <${email}>${company ? ` — ${company}` : ''}\nSujet : ${subjectStr}\n\n${message}`,
      ),
      sendEmail(
        email,
        name,
        `✅ CA-TECH — Votre message a bien été reçu`,
        clientAckHtml(name, subjectStr),
        `Bonjour ${name.split(' ')[0]},\n\nVotre message a bien été reçu. Notre équipe vous répondra sous 24h ouvrées.\n\nCA-TECH — contact@ca-tech.fr`,
      ),
    ])

    return new Response(JSON.stringify({ ok: true, id: msg.id }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('[contact-form]', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
