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

// ── Email de confirmation au client ──────────────────────────────────────────

export interface ClientConfirmationPayload {
  clientEmail: string
  clientName:  string
  devisNumber: string
  projet:      string
  budget?:     number
}

function buildClientHtml(p: ClientConfirmationPayload): string {
  const prenom = p.clientName.split(' ')[0] || 'vous'
  const budgetLine = p.budget
    ? `<tr><td style="padding:6px 0;font-size:12px;color:#94A3B8;font-weight:500;width:140px">💰 Budget indicatif</td><td style="padding:6px 0;font-size:13px;color:#1E293B;font-weight:500">${p.budget.toLocaleString('fr-FR')} €</td></tr>`
    : ''
  return `<!DOCTYPE html><html lang="fr">
<head><meta charset="UTF-8"/><title>Votre demande CA-TECH</title></head>
<body style="margin:0;padding:0;font-family:Inter,-apple-system,sans-serif;background:#F8FAFC">
<div style="max-width:560px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
  <div style="background:linear-gradient(135deg,#0A2540 0%,#0066FF 100%);padding:28px 32px">
    <div style="color:#fff;font-size:20px;font-weight:700">✅ Demande bien reçue !</div>
    <div style="color:rgba(255,255,255,.65);font-size:13px;margin-top:4px">CA-TECH — Agence Web & Design</div>
  </div>
  <div style="padding:24px 32px">
    <p style="font-size:15px;color:#1E293B;margin:0 0 20px">Bonjour <strong>${prenom}</strong>,</p>
    <p style="font-size:14px;color:#334155;line-height:1.6;margin:0 0 20px">
      Votre demande a bien été enregistrée. Notre équipe va étudier votre projet et vous recontactera sous <strong>24 heures</strong> avec un devis personnalisé.
    </p>
    <div style="background:#F8FAFC;border-radius:10px;border-left:3px solid #0066FF;padding:16px;margin-bottom:20px">
      <div style="font-size:11px;font-weight:700;color:#0066FF;text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px">Récapitulatif de votre demande</div>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:6px 0;font-size:12px;color:#94A3B8;font-weight:500;width:140px">📋 Référence</td><td style="padding:6px 0;font-size:13px;color:#1E293B;font-weight:700">${p.devisNumber}</td></tr>
        <tr><td style="padding:6px 0;font-size:12px;color:#94A3B8;font-weight:500">💼 Projet</td><td style="padding:6px 0;font-size:13px;color:#1E293B;font-weight:500">${p.projet}</td></tr>
        ${budgetLine}
      </table>
    </div>
    <p style="font-size:13px;color:#64748B;line-height:1.6;margin:0 0 20px">
      Des questions ? Répondez directement à cet email ou contactez-nous à <a href="mailto:contact@ca-tech.fr" style="color:#0066FF">contact@ca-tech.fr</a>
    </p>
  </div>
  <div style="padding:0 32px 28px">
    <a href="https://www.ca-tech.fr" style="display:inline-block;background:#0066FF;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-size:14px;font-weight:600">
      Visiter ca-tech.fr →
    </a>
  </div>
  <div style="padding:14px 32px;background:#F8FAFC;border-top:1px solid #E2E8F0;font-size:11px;color:#94A3B8">
    CA-TECH · Paris · Lyon · Dijon · Troyes · Réf. ${p.devisNumber}
  </div>
</div>
</body></html>`
}

export async function sendClientConfirmation(payload: ClientConfirmationPayload): Promise<{ ok: boolean; error?: string; provider: string }> {
  const subject = `✅ CA-TECH — Votre demande a bien été reçue (${payload.devisNumber})`
  const html    = buildClientHtml(payload)
  const text    = `Bonjour ${payload.clientName},\n\nVotre demande (${payload.devisNumber}) a bien été reçue.\nProjet : ${payload.projet}\nNous vous recontacterons sous 24h.\n\nCA-TECH — contact@ca-tech.fr`

  if (RESEND_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_KEY}` },
        body: JSON.stringify({ from: FROM_EMAIL, to: [payload.clientEmail], subject, html, text }),
      })
      if (res.ok) return { ok: true, provider: 'resend' }
      const err = await res.text()
      console.warn('[Loic/clientEmail] Resend failed:', err)
    } catch (e) { console.warn('[Loic/clientEmail] Resend error:', e) }
  }

  if (BREVO_KEY) {
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': BREVO_KEY },
        body: JSON.stringify({
          sender: { name: 'CA-TECH', email: FROM_EMAIL },
          to: [{ email: payload.clientEmail }],
          subject, htmlContent: html, textContent: text,
        }),
      })
      if (res.ok) return { ok: true, provider: 'brevo' }
      const err = await res.text()
      return { ok: false, error: `Brevo: ${err}`, provider: 'brevo' }
    } catch (e) { return { ok: false, error: String(e), provider: 'brevo' } }
  }

  return { ok: false, error: 'Aucune clé email configurée', provider: 'none' }
}

// ── Rapport de diagnostic IA au client ───────────────────────────────────────

export interface DiagnosticReportPayload {
  clientEmail:    string
  clientName:     string
  entreprise?:    string
  score:          number
  level:          string
  levelDescription: string
  dimensions: {
    processus:   number
    donnees:     number
    maturite_ia: number
    ambition:    number
  }
  recommandations: string[]
  reportContent:   string // Texte du rapport généré par Claude
}

function buildReportHtml(p: DiagnosticReportPayload): string {
  const prenom = p.clientName.split(' ')[0] || 'vous'
  const scoreColor = p.score >= 70 ? '#059669' : p.score >= 45 ? '#0066FF' : '#F59E0B'
  const dimBar = (val: number, max = 25) =>
    `<div style="background:#E2E8F0;border-radius:4px;height:6px;margin:4px 0 12px">
       <div style="background:${scoreColor};border-radius:4px;height:6px;width:${Math.round(val/max*100)}%"></div>
     </div>`

  const recoItems = p.recommandations.map((r, i) =>
    `<div style="display:flex;gap:12px;margin-bottom:12px;align-items:flex-start">
       <span style="background:#0066FF;color:#fff;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0">${i+1}</span>
       <span style="font-size:13px;color:#334155;line-height:1.5">${r}</span>
     </div>`
  ).join('')

  const reportLines = p.reportContent
    .split('\n')
    .map(l => `<p style="font-size:13px;color:#334155;line-height:1.7;margin:0 0 8px">${l}</p>`)
    .join('')

  return `<!DOCTYPE html><html lang="fr">
<head><meta charset="UTF-8"/><title>Votre rapport diagnostic IA — CA-TECH</title></head>
<body style="margin:0;padding:0;font-family:Inter,-apple-system,sans-serif;background:#F8FAFC">
<div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">

  <div style="background:linear-gradient(135deg,#0A2540 0%,#0066FF 100%);padding:32px">
    <div style="color:#fff;font-size:22px;font-weight:700">Votre rapport diagnostic IA</div>
    <div style="color:rgba(255,255,255,.65);font-size:13px;margin-top:6px">Établi par Loïc · CA-TECH</div>
  </div>

  <div style="padding:28px 32px 0">
    <p style="font-size:15px;color:#1E293B;margin:0 0 24px">Bonjour <strong>${prenom}</strong>,</p>
    <p style="font-size:14px;color:#475569;line-height:1.6;margin:0 0 28px">
      Voici votre rapport de maturité IA personnalisé, basé sur notre diagnostic. Il résume les opportunités identifiées et les premières actions recommandées pour votre entreprise.
    </p>
  </div>

  <!-- Score -->
  <div style="margin:0 32px 28px;background:#F8FAFC;border-radius:12px;padding:24px;text-align:center">
    <div style="font-size:52px;font-weight:800;color:${scoreColor};line-height:1">${p.score}</div>
    <div style="font-size:12px;color:#94A3B8;font-weight:600;margin-top:2px">/100</div>
    <div style="font-size:16px;font-weight:700;color:#1E293B;margin-top:10px">${p.level}</div>
    <div style="font-size:13px;color:#64748B;margin-top:4px">${p.levelDescription}</div>
  </div>

  <!-- Dimensions -->
  <div style="margin:0 32px 28px">
    <div style="font-size:12px;font-weight:700;color:#0066FF;text-transform:uppercase;letter-spacing:.5px;margin-bottom:16px">Analyse par dimension</div>
    <div style="font-size:12px;color:#64748B;font-weight:500;margin-bottom:2px">Processus <span style="float:right;color:#1E293B;font-weight:700">${p.dimensions.processus}/25</span></div>
    ${dimBar(p.dimensions.processus)}
    <div style="font-size:12px;color:#64748B;font-weight:500;margin-bottom:2px">Données & Outils <span style="float:right;color:#1E293B;font-weight:700">${p.dimensions.donnees}/25</span></div>
    ${dimBar(p.dimensions.donnees)}
    <div style="font-size:12px;color:#64748B;font-weight:500;margin-bottom:2px">Maturité IA <span style="float:right;color:#1E293B;font-weight:700">${p.dimensions.maturite_ia}/25</span></div>
    ${dimBar(p.dimensions.maturite_ia)}
    <div style="font-size:12px;color:#64748B;font-weight:500;margin-bottom:2px">Ambition & Budget <span style="float:right;color:#1E293B;font-weight:700">${p.dimensions.ambition}/25</span></div>
    ${dimBar(p.dimensions.ambition)}
  </div>

  <!-- Recommandations -->
  <div style="margin:0 32px 28px">
    <div style="font-size:12px;font-weight:700;color:#0066FF;text-transform:uppercase;letter-spacing:.5px;margin-bottom:16px">3 actions prioritaires</div>
    ${recoItems}
  </div>

  <!-- Rapport détaillé -->
  <div style="margin:0 32px 28px;padding:20px;background:#F8FAFC;border-radius:12px;border-left:3px solid #0066FF">
    <div style="font-size:12px;font-weight:700;color:#0066FF;text-transform:uppercase;letter-spacing:.5px;margin-bottom:14px">Analyse détaillée</div>
    ${reportLines}
  </div>

  <div style="padding:0 32px 28px">
    <a href="https://ca-tech.fr/contact" style="display:inline-block;background:#0066FF;color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:14px;font-weight:600">
      Planifier un appel découverte gratuit →
    </a>
  </div>

  <div style="padding:14px 32px;background:#F8FAFC;border-top:1px solid #E2E8F0;font-size:11px;color:#94A3B8">
    Rapport établi par Loïc, consultant IA · CA-TECH · contact@ca-tech.fr
  </div>
</div>
</body></html>`
}

export async function sendDiagnosticReport(payload: DiagnosticReportPayload): Promise<{ ok: boolean; error?: string; provider: string }> {
  const subject = `🎯 Votre rapport diagnostic IA — Score ${payload.score}/100 · CA-TECH`
  const html = buildReportHtml(payload)
  const text = [
    `Bonjour ${payload.clientName},`,
    '',
    `Votre score de maturité IA : ${payload.score}/100 — ${payload.level}`,
    `${payload.levelDescription}`,
    '',
    'Dimensions :',
    `  Processus       : ${payload.dimensions.processus}/25`,
    `  Données & Outils : ${payload.dimensions.donnees}/25`,
    `  Maturité IA     : ${payload.dimensions.maturite_ia}/25`,
    `  Ambition        : ${payload.dimensions.ambition}/25`,
    '',
    '3 actions prioritaires :',
    ...payload.recommandations.map((r, i) => `  ${i+1}. ${r}`),
    '',
    'Analyse :',
    payload.reportContent,
    '',
    'Planifier un appel découverte : https://ca-tech.fr/contact',
    '',
    'CA-TECH · contact@ca-tech.fr',
  ].join('\n')

  if (RESEND_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_KEY}` },
        body: JSON.stringify({ from: FROM_EMAIL, to: [payload.clientEmail], subject, html, text }),
      })
      if (res.ok) return { ok: true, provider: 'resend' }
      const err = await res.text()
      console.warn('[Loic/report] Resend failed:', err)
    } catch (e) { console.warn('[Loic/report] Resend error:', e) }
  }

  if (BREVO_KEY) {
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': BREVO_KEY },
        body: JSON.stringify({
          sender: { name: 'Loïc — CA-TECH', email: FROM_EMAIL },
          to: [{ email: payload.clientEmail }],
          subject, htmlContent: html, textContent: text,
        }),
      })
      if (res.ok) return { ok: true, provider: 'brevo' }
      const err = await res.text()
      return { ok: false, error: `Brevo: ${err}`, provider: 'brevo' }
    } catch (e) { return { ok: false, error: String(e), provider: 'brevo' } }
  }

  return { ok: false, error: 'Aucune clé email configurée', provider: 'none' }
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
