// ── Email notification — Resend (priorité) ou Brevo (fallback) ──────────────

const RESEND_KEY  = Deno.env.get('RESEND_API_KEY')
const BREVO_KEY   = Deno.env.get('BREVO_API_KEY')
const FROM_EMAIL  = Deno.env.get('NOTIFICATION_FROM_EMAIL') ?? 'loic@ca-tech.fr'
const TO_EMAIL    = Deno.env.get('NOTIFICATION_EMAIL')      ?? 'pemoustaskit@gmail.com'
const MANAGER_URL = Deno.env.get('MANAGER_URL')             ?? 'https://manager.ca-tech.fr'

export interface EmailPayload {
  prospect: {
    prenom?: string; nom?: string; entreprise?: string
    telephone?: string; email?: string; ville?: string
    projet?: string; budget?: number
  }
  summary: string
  conversationId: string
  priority: 'high' | 'medium' | 'low'
  trigger: string
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 0;font-size:12px;color:#94A3B8;font-weight:500;width:130px;vertical-align:top">${label}</td>
    <td style="padding:6px 0;font-size:13px;color:#1E293B;font-weight:500">${value}</td>
  </tr>`
}

function buildHtml(p: EmailPayload): string {
  const { prospect: pr, summary, conversationId, priority, trigger } = p
  const now   = new Date()
  const emoji = priority === 'high' ? '🔴' : priority === 'medium' ? '🟡' : '🟢'
  const name  = `${pr.prenom ?? ''} ${pr.nom ?? ''}`.trim() || 'Anonyme'

  return `<!DOCTYPE html><html lang="fr">
<head><meta charset="UTF-8"/><title>Nouveau prospect CA-TECH</title></head>
<body style="margin:0;padding:0;font-family:Inter,-apple-system,sans-serif;background:#F8FAFC">
<div style="max-width:560px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
  <div style="background:linear-gradient(135deg,#0A2540 0%,#0066FF 100%);padding:28px 32px">
    <div style="color:#fff;font-size:20px;font-weight:700">🚀 Nouveau prospect CA-TECH</div>
    <div style="color:rgba(255,255,255,.65);font-size:13px;margin-top:4px">Loïc a détecté un prospect sérieux</div>
  </div>
  <div style="padding:12px 32px;background:#F8FAFC;border-bottom:1px solid #E2E8F0">
    <span style="font-size:12px;font-weight:600;color:#64748B">${emoji} Priorité : ${priority === 'high' ? 'Haute' : priority === 'medium' ? 'Moyenne' : 'Normale'} &nbsp;·&nbsp; ${trigger}</span>
  </div>
  <div style="padding:24px 32px">
    <table style="width:100%;border-collapse:collapse">
      ${row('👤 Nom', name)}
      ${row('🏢 Entreprise', pr.entreprise || '—')}
      ${row('📞 Téléphone', pr.telephone || '—')}
      ${row('✉️ Email', pr.email || '—')}
      ${row('📍 Ville', pr.ville || '—')}
      ${row('💼 Service', pr.projet || '—')}
      ${row('💰 Budget', pr.budget ? pr.budget.toLocaleString('fr-FR') + ' €' : '—')}
      ${row('📅 Date', now.toLocaleDateString('fr-FR'))}
      ${row('⏰ Heure', now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))}
    </table>
    <div style="margin-top:20px;padding:16px;background:#F8FAFC;border-radius:10px;border-left:3px solid #0066FF">
      <div style="font-size:11px;font-weight:700;color:#0066FF;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Résumé de la conversation</div>
      <div style="font-size:13px;color:#334155;line-height:1.6">${summary}</div>
    </div>
  </div>
  <div style="padding:0 32px 28px">
    <a href="${MANAGER_URL}/loic" style="display:inline-block;background:#0066FF;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-size:14px;font-weight:600">
      Voir dans CA-TECH Manager →
    </a>
  </div>
  <div style="padding:14px 32px;background:#F8FAFC;border-top:1px solid #E2E8F0;font-size:11px;color:#94A3B8">
    Envoyé automatiquement par Loïc · CA-TECH · ID : ${conversationId}
  </div>
</div>
</body></html>`
}

function buildText(p: EmailPayload): string {
  const pr   = p.prospect
  const name = `${pr.prenom ?? ''} ${pr.nom ?? ''}`.trim() || 'Anonyme'
  const now  = new Date()
  return [
    `Nouveau prospect CA-TECH — ${p.trigger}`,
    '',
    `Nom        : ${name}`,
    `Entreprise : ${pr.entreprise || '—'}`,
    `Téléphone  : ${pr.telephone || '—'}`,
    `Email      : ${pr.email || '—'}`,
    `Ville      : ${pr.ville || '—'}`,
    `Service    : ${pr.projet || '—'}`,
    `Budget     : ${pr.budget ? pr.budget + ' €' : '—'}`,
    `Date       : ${now.toLocaleDateString('fr-FR')}`,
    `Heure      : ${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
    '',
    `Résumé : ${p.summary}`,
    '',
    `Voir le Manager : ${MANAGER_URL}/loic`,
  ].join('\n')
}

export async function sendEmail(payload: EmailPayload): Promise<{ ok: boolean; error?: string; provider: string }> {
  const subject = `🚀 Nouveau prospect${payload.prospect.prenom ? ` — ${payload.prospect.prenom}` : ''} | CA-TECH`
  const html    = buildHtml(payload)
  const text    = buildText(payload)

  if (RESEND_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_KEY}` },
        body: JSON.stringify({ from: FROM_EMAIL, to: [TO_EMAIL], subject, html, text }),
      })
      if (res.ok) return { ok: true, provider: 'resend' }
      const err = await res.text()
      console.warn('[Loic/email] Resend failed:', err)
    } catch (e) { console.warn('[Loic/email] Resend error:', e) }
  }

  if (BREVO_KEY) {
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': BREVO_KEY },
        body: JSON.stringify({
          sender: { name: 'Loïc — CA-TECH', email: FROM_EMAIL },
          to: [{ email: TO_EMAIL }],
          subject, htmlContent: html, textContent: text,
        }),
      })
      if (res.ok) return { ok: true, provider: 'brevo' }
      const err = await res.text()
      return { ok: false, error: `Brevo: ${err}`, provider: 'brevo' }
    } catch (e) { return { ok: false, error: String(e), provider: 'brevo' } }
  }

  return { ok: false, error: 'Aucune clé email configurée (RESEND_API_KEY ou BREVO_API_KEY)', provider: 'none' }
}
