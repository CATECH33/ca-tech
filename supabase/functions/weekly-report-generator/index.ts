import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { PDFDocument, rgb, StandardFonts, PageSizes } from 'https://esm.sh/pdf-lib@1.17.1?target=deno'

const SUPABASE_URL    = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SVC    = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ANTHROPIC_KEY   = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
const CRON_SECRET     = Deno.env.get('CRON_SECRET')!
const GOOGLE_CLIENT_ID     = Deno.env.get('GOOGLE_CLIENT_ID') ?? ''
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET') ?? ''

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReportData {
  weekStart:          Date
  weekEnd:            Date
  weekStartFmt:       string
  weekEndFmt:         string
  caTotal:            number
  paymentsCount:      number
  payments:           { client: string; amount: number; paid_at: string; method: string }[]
  devis:              { envoye: number; accepte: number; refuse: number; totalEnvoye: number; totalAccepte: number }
  leads:              { total: number; bySource: Record<string, number> }
  overdueCount:       number
  overdueTotal:       number
  overdueList:        { number: string; client: string; amount: number; due_date: string }[]
  pendingActions:     number
  pendingList:        { subject: string; from_addr: string; action_text: string | null }[]
  aiComment:          string
}

// ─── Helpers date ─────────────────────────────────────────────────────────────

function getLastWeekBounds(): { start: Date; end: Date } {
  const now = new Date()
  const dow  = now.getUTCDay() // 0=Sunday
  const daysFromMonday = dow === 0 ? 6 : dow - 1
  const thisMonday = new Date(now)
  thisMonday.setUTCDate(now.getUTCDate() - daysFromMonday)
  thisMonday.setUTCHours(0, 0, 0, 0)

  const lastMonday = new Date(thisMonday)
  lastMonday.setUTCDate(thisMonday.getUTCDate() - 7)

  const lastSunday = new Date(thisMonday)
  lastSunday.setUTCDate(thisMonday.getUTCDate() - 1)
  lastSunday.setUTCHours(23, 59, 59, 999)

  return { start: lastMonday, end: lastSunday }
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' })
}

function fmtEur(n: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

// ─── Google token ─────────────────────────────────────────────────────────────

async function getGoogleToken(sb: ReturnType<typeof createClient>): Promise<{ token: string; email: string }> {
  const { data: g, error } = await sb
    .from('google_integrations')
    .select('access_token, refresh_token, expires_at, email')
    .limit(1)
    .single()
  if (error || !g) throw new Error('Google integration introuvable')

  if (new Date(g.expires_at).getTime() > Date.now() + 5 * 60 * 1000) {
    return { token: g.access_token, email: g.email }
  }
  if (!g.refresh_token || !GOOGLE_CLIENT_ID) throw new Error('Impossible de rafraîchir le token Google')

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token', client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET, refresh_token: g.refresh_token,
    }),
  })
  const data = await res.json()
  if (!res.ok || !data.access_token) throw new Error(`Token refresh échoué: ${JSON.stringify(data)}`)

  await sb.from('google_integrations').update({
    access_token: data.access_token,
    expires_at:   new Date(Date.now() + data.expires_in * 1000).toISOString(),
  }).eq('email', g.email)

  return { token: data.access_token, email: g.email }
}

// ─── Google Drive helpers ─────────────────────────────────────────────────────

async function driveGetOrCreateFolder(token: string, name: string, parentId?: string): Promise<string> {
  const q = [
    `name='${name}'`,
    `mimeType='application/vnd.google-apps.folder'`,
    `trashed=false`,
    parentId ? `'${parentId}' in parents` : `'root' in parents`,
  ].join(' and ')

  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  const searchData = await searchRes.json()
  if (searchData.files?.length > 0) return searchData.files[0].id

  const body: Record<string, unknown> = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
  }
  if (parentId) body.parents = [parentId]

  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const created = await createRes.json()
  return created.id as string
}

async function driveUploadPdf(
  token: string,
  pdfBytes: Uint8Array,
  filename: string,
  folderId: string,
): Promise<{ id: string; webViewLink: string }> {
  const metadata = JSON.stringify({ name: filename, parents: [folderId], mimeType: 'application/pdf' })
  const boundary = '===CA_TECH_PDF_BOUNDARY==='

  const body = [
    `--${boundary}\r\n`,
    `Content-Type: application/json; charset=UTF-8\r\n\r\n`,
    `${metadata}\r\n`,
    `--${boundary}\r\n`,
    `Content-Type: application/pdf\r\n\r\n`,
  ].join('')

  const bodyEncoder = new TextEncoder()
  const bodyPart1 = bodyEncoder.encode(body)
  const bodyPart2 = pdfBytes
  const closingPart = bodyEncoder.encode(`\r\n--${boundary}--`)

  const combined = new Uint8Array(bodyPart1.length + bodyPart2.length + closingPart.length)
  combined.set(bodyPart1, 0)
  combined.set(bodyPart2, bodyPart1.length)
  combined.set(closingPart, bodyPart1.length + bodyPart2.length)

  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary="${boundary}"`,
      },
      body: combined,
    },
  )
  const uploaded = await uploadRes.json()

  // Rendre lisible par lien (accès lecture)
  await fetch(`https://www.googleapis.com/drive/v3/files/${uploaded.id}/permissions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'reader', type: 'anyone' }),
  })

  return { id: uploaded.id, webViewLink: uploaded.webViewLink ?? `https://drive.google.com/file/d/${uploaded.id}/view` }
}

// ─── Gmail — envoi avec PDF joint ─────────────────────────────────────────────

function toBase64Url(buf: Uint8Array | string): string {
  let bin: string
  if (typeof buf === 'string') {
    bin = buf
  } else {
    bin = ''
    buf.forEach(b => bin += String.fromCharCode(b))
  }
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function sendEmailWithPdf(
  token: string,
  from: string,
  to: string,
  subject: string,
  html: string,
  pdfBytes: Uint8Array,
  pdfFilename: string,
): Promise<void> {
  const boundary = '====CA_TECH_MAIL_BOUNDARY===='

  const enc = new TextEncoder()
  // base64 encode PDF
  let pdfBin = ''
  pdfBytes.forEach(b => pdfBin += String.fromCharCode(b))
  const pdfBase64 = btoa(pdfBin).replace(/(.{76})/g, '$1\r\n')

  const mime = [
    `From: CA-TECH <${from}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: quoted-printable`,
    ``,
    html,
    ``,
    `--${boundary}`,
    `Content-Type: application/pdf`,
    `Content-Transfer-Encoding: base64`,
    `Content-Disposition: attachment; filename="${pdfFilename}"`,
    ``,
    pdfBase64,
    `--${boundary}--`,
  ].join('\r\n')

  const raw = toBase64Url(enc.encode(mime))
  await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw }),
  })
}

// ─── PDF helpers ──────────────────────────────────────────────────────────────

function wrapText(text: string, font: Awaited<ReturnType<PDFDocument['embedFont']>>, size: number, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (font.widthOfTextAtSize(test, size) > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

async function generatePDF(data: ReportData): Promise<Uint8Array> {
  const doc  = await PDFDocument.create()
  const page = doc.addPage(PageSizes.A4)
  const { width, height } = page.getSize()

  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)
  const fontReg  = await doc.embedFont(StandardFonts.Helvetica)

  const BRAND = rgb(0, 102 / 255, 1)           // #0066FF
  const DARK  = rgb(10 / 255, 37 / 255, 64 / 255) // #0A2540
  const GRAY  = rgb(107 / 255, 114 / 255, 128 / 255)
  const BLACK = rgb(17 / 255, 24 / 255, 39 / 255)
  const WHITE = rgb(1, 1, 1)
  const LIGHT = rgb(249 / 255, 250 / 255, 251 / 255)

  const ML = 50
  const MR = 50
  const CW = width - ML - MR

  // ─── Accent bar + header ──────────────────────────────────────
  page.drawRectangle({ x: 0, y: height - 4,  width, height: 4,  color: BRAND })
  page.drawRectangle({ x: 0, y: height - 54, width, height: 50, color: DARK  })
  page.drawText('CA-TECH', { x: ML, y: height - 38, size: 18, font: fontBold, color: WHITE })
  const tagline = 'Rapport Hebdomadaire'
  page.drawText(tagline, {
    x: width - MR - fontReg.widthOfTextAtSize(tagline, 9),
    y: height - 28, size: 9, font: fontReg, color: rgb(0.7, 0.8, 0.9),
  })

  let y = height - 80

  // ─── Titre semaine ────────────────────────────────────────────
  const weekTitle = `Semaine du ${data.weekStartFmt} au ${data.weekEndFmt}`
  page.drawText(weekTitle, { x: ML, y, size: 14, font: fontBold, color: DARK })
  y -= 8
  page.drawLine({ start: { x: ML, y }, end: { x: width - MR, y }, thickness: 1, color: rgb(0.9, 0.92, 0.95) })
  y -= 20

  // ─── KPI row ──────────────────────────────────────────────────
  const kpis = [
    { label: 'CA semaine', value: fmtEur(data.caTotal) },
    { label: 'Paiements reçus', value: String(data.paymentsCount) },
    { label: 'Devis acceptés', value: `${data.devis.accepte} (${fmtEur(data.devis.totalAccepte)})` },
  ]
  const kpiW = CW / kpis.length
  kpis.forEach((kpi, i) => {
    const kx = ML + i * kpiW
    page.drawRectangle({ x: kx, y: y - 42, width: kpiW - 8, height: 46, color: LIGHT, borderColor: rgb(0.9, 0.92, 0.95), borderWidth: 1 })
    page.drawText(kpi.label, { x: kx + 8, y: y - 12, size: 8, font: fontReg, color: GRAY })
    page.drawText(kpi.value, { x: kx + 8, y: y - 30, size: 12, font: fontBold, color: DARK })
  })
  y -= 60

  // Helpers locaux
  const sectionTitle = (title: string) => {
    page.drawText(title.toUpperCase(), { x: ML, y, size: 8, font: fontBold, color: BRAND })
    y -= 6
    page.drawLine({ start: { x: ML, y }, end: { x: width - MR, y }, thickness: 0.5, color: rgb(0.85, 0.9, 1) })
    y -= 12
  }

  const kv = (k: string, v: string, indent = 0) => {
    page.drawText(k, { x: ML + indent, y, size: 8, font: fontReg, color: GRAY })
    page.drawText(v, { x: ML + indent + 120, y, size: 8, font: fontBold, color: BLACK })
    y -= 13
  }

  // ─── Devis ────────────────────────────────────────────────────
  sectionTitle('Devis')
  kv('Envoyés', `${data.devis.envoye} — ${fmtEur(data.devis.totalEnvoye)}`)
  kv('Acceptés', `${data.devis.accepte} — ${fmtEur(data.devis.totalAccepte)}`)
  kv('Refusés', String(data.devis.refuse))
  y -= 6

  // ─── Leads ────────────────────────────────────────────────────
  sectionTitle('Nouveaux leads')
  kv('Total', String(data.leads.total))
  for (const [source, count] of Object.entries(data.leads.bySource).slice(0, 5)) {
    kv(source || 'Direct', String(count), 16)
  }
  y -= 6

  // ─── Paiements ────────────────────────────────────────────────
  sectionTitle('Paiements reçus')
  if (data.payments.length === 0) {
    page.drawText('Aucun paiement cette semaine', { x: ML, y, size: 8, font: fontReg, color: GRAY })
    y -= 13
  }
  for (const p of data.payments.slice(0, 6)) {
    const datePart = p.paid_at.slice(0, 10)
    kv(`${p.client} — ${datePart}`, fmtEur(p.amount))
  }
  y -= 6

  // ─── Factures échues ──────────────────────────────────────────
  sectionTitle(`Factures échues non réglées (${data.overdueCount})`)
  if (data.overdueCount === 0) {
    page.drawText('Aucune facture en retard', { x: ML, y, size: 8, font: fontReg, color: GRAY })
    y -= 13
  }
  for (const inv of data.overdueList.slice(0, 5)) {
    kv(`${inv.number} — ${inv.client} — échéance ${inv.due_date}`, fmtEur(inv.amount))
  }
  if (data.overdueCount > 5) {
    page.drawText(`+ ${data.overdueCount - 5} autres…`, { x: ML + 16, y, size: 7, font: fontReg, color: GRAY })
    y -= 12
  }
  y -= 6

  // ─── Actions en attente ───────────────────────────────────────
  sectionTitle(`Actions emails en attente (${data.pendingActions})`)
  if (data.pendingList.length === 0) {
    page.drawText('Aucune action en attente', { x: ML, y, size: 8, font: fontReg, color: GRAY })
    y -= 13
  }
  for (const item of data.pendingList.slice(0, 3)) {
    const label = item.subject ? item.subject.slice(0, 40) : item.from_addr
    kv(label, item.action_text?.slice(0, 30) ?? '—')
  }
  y -= 10

  // ─── Commentaire IA ───────────────────────────────────────────
  if (y < 120) {
    // Nouvelle page si plus assez de place
    const page2 = doc.addPage(PageSizes.A4)
    // simple footer
    page2.drawText('CA-TECH — Confidentiel', { x: ML, y: 30, size: 7, font: fontReg, color: GRAY })
    // continuer sur page2 n'est pas trivial avec pdf-lib sans refactoring majeur
    // on coupe le commentaire si trop long
  }

  page.drawRectangle({ x: ML - 4, y: y - (data.aiComment.length > 400 ? 90 : 60), width: CW + 8, height: data.aiComment.length > 400 ? 94 : 64, color: LIGHT, borderColor: rgb(0.85, 0.9, 1), borderWidth: 1 })
  sectionTitle('Analyse IA — Claude Sonnet')

  const aiLines = wrapText(data.aiComment, fontReg, 8, CW - 8)
  for (const line of aiLines.slice(0, 10)) {
    if (y < 50) break
    page.drawText(line, { x: ML + 4, y, size: 8, font: fontReg, color: BLACK })
    y -= 12
  }

  // ─── Footer ───────────────────────────────────────────────────
  const footer = `CA-TECH — contact@ca-tech.fr — Rapport confidentiel — Généré le ${new Date().toLocaleDateString('fr-FR')}`
  page.drawLine({ start: { x: ML, y: 45 }, end: { x: width - MR, y: 45 }, thickness: 0.5, color: rgb(0.85, 0.9, 0.95) })
  page.drawText(footer, { x: ML, y: 32, size: 7, font: fontReg, color: GRAY })

  return doc.save()
}

// ─── Claude Sonnet — commentaire dirigeant ────────────────────────────────────

async function generateAIComment(data: ReportData): Promise<string> {
  const fallback = `CA semaine : ${fmtEur(data.caTotal)}. ${data.devis.accepte} devis accepté(s) pour ${fmtEur(data.devis.totalAccepte)}. ${data.leads.total} nouveaux lead(s). ${data.overdueCount} facture(s) en retard (${fmtEur(data.overdueTotal)}). ${data.pendingActions} action(s) email en attente.`
  if (!ANTHROPIC_KEY) return fallback

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 400,
        messages: [{
          role: 'user',
          content: `Tu es l'assistant du dirigeant de CA-TECH, une ESN spécialisée en web et IA.
Rédige un commentaire de synthèse hebdomadaire en 2 paragraphes concis (max 80 mots chacun), ton dirigeant, positif mais honnête.

Données de la semaine du ${data.weekStartFmt} au ${data.weekEndFmt} :
- CA encaissé : ${fmtEur(data.caTotal)} (${data.paymentsCount} paiements)
- Devis envoyés : ${data.devis.envoye} (${fmtEur(data.devis.totalEnvoye)}), acceptés : ${data.devis.accepte} (${fmtEur(data.devis.totalAccepte)}), refusés : ${data.devis.refuse}
- Nouveaux leads : ${data.leads.total}
- Factures en retard : ${data.overdueCount} (${fmtEur(data.overdueTotal)})
- Actions emails en attente : ${data.pendingActions}

Réponds UNIQUEMENT le texte brut des 2 paragraphes séparés par une ligne vide, sans titre ni markdown.`,
        }],
      }),
    })
    if (!res.ok) throw new Error()
    const json = await res.json()
    return (json.content?.[0]?.text ?? fallback).trim()
  } catch {
    return fallback
  }
}

// ─── Agrégats SQL ─────────────────────────────────────────────────────────────

async function fetchReportData(sb: ReturnType<typeof createClient>, weekStart: Date, weekEnd: Date): Promise<ReportData> {
  const startISO = weekStart.toISOString()
  const endISO   = weekEnd.toISOString()

  // 1. Paiements
  const { data: paymentsRaw } = await sb
    .from('payments')
    .select('amount, paid_at, method, client_id, clients(first_name, last_name)')
    .gte('paid_at', startISO)
    .lte('paid_at', endISO)
    .eq('status', 'completed')
    .order('paid_at', { ascending: false })

  const payments = (paymentsRaw ?? []).map((p: any) => ({
    client: p.clients ? `${p.clients.first_name} ${p.clients.last_name}` : 'Inconnu',
    amount: p.amount,
    paid_at: p.paid_at,
    method: p.method,
  }))
  const caTotal      = payments.reduce((s, p) => s + p.amount, 0)
  const paymentsCount = payments.length

  // 2. Devis
  const { data: devisRaw } = await sb
    .from('devis')
    .select('status, total')
    .gte('updated_at', startISO)
    .lte('updated_at', endISO)

  const devisItems = devisRaw ?? []
  const devis = {
    envoye:       devisItems.filter((d: any) => d.status === 'envoye').length,
    accepte:      devisItems.filter((d: any) => d.status === 'accepte').length,
    refuse:       devisItems.filter((d: any) => d.status === 'refuse').length,
    totalEnvoye:  devisItems.filter((d: any) => d.status === 'envoye').reduce((s: number, d: any) => s + (d.total ?? 0), 0),
    totalAccepte: devisItems.filter((d: any) => d.status === 'accepte').reduce((s: number, d: any) => s + (d.total ?? 0), 0),
  }

  // 3. Leads
  const { data: leadsRaw } = await sb
    .from('leads')
    .select('source')
    .gte('created_at', startISO)
    .lte('created_at', endISO)

  const leadsItems = leadsRaw ?? []
  const bySource: Record<string, number> = {}
  leadsItems.forEach((l: any) => {
    const s = l.source ?? 'Direct'
    bySource[s] = (bySource[s] ?? 0) + 1
  })
  const leads = { total: leadsItems.length, bySource }

  // 4. Factures échues non réglées
  const today = new Date().toISOString().slice(0, 10)
  const { data: overdueRaw } = await sb
    .from('invoices')
    .select('number, total, due_date, clients(first_name, last_name)')
    .lt('due_date', today)
    .in('status', ['envoyee', 'en_retard'])
    .eq('skip_reminders', false)
    .order('due_date', { ascending: true })
    .limit(20)

  const overdueList = (overdueRaw ?? []).map((inv: any) => ({
    number:   inv.number,
    client:   inv.clients ? `${inv.clients.first_name} ${inv.clients.last_name}` : '—',
    amount:   inv.total ?? 0,
    due_date: inv.due_date,
  }))
  const overdueTotal = overdueList.reduce((s, i) => s + i.amount, 0)

  // 5. Actions digest en attente
  const { data: actionsRaw } = await sb
    .from('email_digest_items')
    .select('subject, from_addr, action_text')
    .eq('action_needed', true)
    .eq('is_processed', false)
    .order('received_at', { ascending: false })
    .limit(5)

  const pendingList = (actionsRaw ?? []).map((a: any) => ({
    subject:     a.subject ?? '',
    from_addr:   a.from_addr,
    action_text: a.action_text,
  }))

  const data: ReportData = {
    weekStart,
    weekEnd,
    weekStartFmt:  fmtDate(weekStart),
    weekEndFmt:    fmtDate(weekEnd),
    caTotal,
    paymentsCount,
    payments,
    devis,
    leads,
    overdueCount:  overdueList.length,
    overdueTotal,
    overdueList,
    pendingActions: pendingList.length,
    pendingList,
    aiComment:     '',
  }

  data.aiComment = await generateAIComment(data)
  return data
}

// ─── Email HTML recap ─────────────────────────────────────────────────────────

function buildEmailHtml(data: ReportData, driveUrl: string): string {
  return `<!DOCTYPE html><html lang="fr"><body style="font-family:sans-serif;max-width:600px;margin:32px auto;padding:0 16px;">
<div style="background:#0A2540;padding:24px 32px;border-radius:8px 8px 0 0;border-top:4px solid #0066FF;">
  <h1 style="color:#fff;margin:0;font-size:20px;font-weight:600;">CA<span style="color:#0066FF;">-TECH</span></h1>
  <p style="color:#8ca6c4;margin:4px 0 0;font-size:12px;">Rapport hebdomadaire — ${data.weekStartFmt} au ${data.weekEndFmt}</p>
</div>
<div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:32px;border-radius:0 0 8px 8px;">
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:24px;">
    <div style="background:#f9fafb;border-radius:8px;padding:16px;text-align:center;">
      <p style="font-size:11px;color:#6b7280;margin:0 0 4px;">CA semaine</p>
      <p style="font-size:20px;font-weight:700;color:#0A2540;margin:0;">${fmtEur(data.caTotal)}</p>
    </div>
    <div style="background:#f9fafb;border-radius:8px;padding:16px;text-align:center;">
      <p style="font-size:11px;color:#6b7280;margin:0 0 4px;">Devis acceptés</p>
      <p style="font-size:20px;font-weight:700;color:#0A2540;margin:0;">${data.devis.accepte}</p>
    </div>
    <div style="background:#f9fafb;border-radius:8px;padding:16px;text-align:center;">
      <p style="font-size:11px;color:#6b7280;margin:0 0 4px;">Leads</p>
      <p style="font-size:20px;font-weight:700;color:#0A2540;margin:0;">${data.leads.total}</p>
    </div>
  </div>
  <p style="font-size:13px;color:#374151;line-height:1.6;">${data.aiComment.replace(/\n\n/g, '</p><p style="font-size:13px;color:#374151;line-height:1.6;">')}</p>
  ${data.overdueCount > 0 ? `<div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:12px 16px;margin-top:16px;"><p style="font-size:12px;color:#92400e;margin:0;">⚠️ ${data.overdueCount} facture(s) en retard — total ${fmtEur(data.overdueTotal)}</p></div>` : ''}
  <div style="margin-top:24px;text-align:center;">
    <a href="${driveUrl}" style="display:inline-block;background:#0066FF;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;">Télécharger le rapport PDF</a>
  </div>
  <p style="font-size:11px;color:#9ca3af;text-align:center;margin-top:16px;">CA-TECH — contact@ca-tech.fr</p>
</div>
</body></html>`
}

// ─── Handler principal ────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })

  try {
    // ─ Auth dual : CRON_SECRET ou JWT manager ─────────────────
    const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '')
    const isCron = token === CRON_SECRET

    if (!isCron) {
      const sb = createClient(SUPABASE_URL, SUPABASE_SVC)
      const { error } = await sb.auth.admin.getUserById(token).catch(() => ({ error: new Error('invalid') }))
      // getUserById attendrait un UUID, on vérifie différemment
      const { data: { user }, error: jwtErr } = await createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY') ?? SUPABASE_SVC).auth.getUser(token)
      if (jwtErr || !user) return new Response('Non autorisé', { status: 401 })
    }

    const sb = createClient(SUPABASE_URL, SUPABASE_SVC)

    // ─ Calcul semaine ─────────────────────────────────────────
    const { start: weekStart, end: weekEnd } = getLastWeekBounds()
    const weekStartDate = isoDate(weekStart)
    const weekEndDate   = isoDate(weekEnd)

    console.log(`[weekly-report] Génération semaine ${weekStartDate} → ${weekEndDate}`)

    // ─ Agrégats ───────────────────────────────────────────────
    const data = await fetchReportData(sb, weekStart, weekEnd)

    // ─ PDF ────────────────────────────────────────────────────
    const pdfBytes  = await generatePDF(data)
    const pdfName   = `rapport-hebdo-${weekStartDate}.pdf`

    // ─ Google Drive ───────────────────────────────────────────
    const { token: gToken, email: gEmail } = await getGoogleToken(sb)

    const rootFolderId    = await driveGetOrCreateFolder(gToken, 'Rapports')
    const hebdoFolderId   = await driveGetOrCreateFolder(gToken, 'Hebdomadaires', rootFolderId)
    const yearFolderId    = await driveGetOrCreateFolder(gToken, String(weekStart.getUTCFullYear()), hebdoFolderId)

    const { id: driveFileId, webViewLink: driveUrl } = await driveUploadPdf(gToken, pdfBytes, pdfName, yearFolderId)
    console.log(`[weekly-report] PDF uploadé : ${driveUrl}`)

    // ─ Email ──────────────────────────────────────────────────
    const emailSubject = `Rapport hebdomadaire CA-TECH — semaine du ${data.weekStartFmt} au ${data.weekEndFmt}`
    const emailHtml    = buildEmailHtml(data, driveUrl)
    await sendEmailWithPdf(gToken, gEmail, 'contact@ca-tech.fr', emailSubject, emailHtml, pdfBytes, pdfName)
    const emailSentAt = new Date().toISOString()

    // ─ INSERT / UPSERT weekly_reports ─────────────────────────
    const summaryJson = {
      ca_total:      data.caTotal,
      payments_count: data.paymentsCount,
      devis:         data.devis,
      leads:         data.leads,
      overdue_count: data.overdueCount,
      overdue_total: data.overdueTotal,
      pending_actions: data.pendingActions,
      ai_comment:    data.aiComment,
    }

    const { error: upsertErr } = await sb
      .from('weekly_reports')
      .upsert({
        week_start:        weekStartDate,
        week_end:          weekEndDate,
        generated_at:      new Date().toISOString(),
        pdf_drive_url:     driveUrl,
        pdf_drive_file_id: driveFileId,
        email_sent_at:     emailSentAt,
        summary_json:      summaryJson,
      }, { onConflict: 'week_start' })

    if (upsertErr) console.error('[weekly-report] Erreur upsert:', upsertErr)

    // ─ Notification in-app ────────────────────────────────────
    await sb.from('notifications').insert({
      type:    'info',
      title:   `Rapport hebdomadaire généré — semaine du ${data.weekStartFmt}`,
      message: `CA : ${fmtEur(data.caTotal)} — PDF disponible sur Google Drive`,
      link:    '/rapports-hebdo',
      is_read: false,
      metadata: { week_start: weekStartDate, drive_url: driveUrl },
    })

    console.log(`[weekly-report] Terminé — CA ${fmtEur(data.caTotal)}`)
    return new Response(JSON.stringify({ ok: true, week: weekStartDate, caTotal: data.caTotal, driveUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('[weekly-report] Erreur:', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
})
