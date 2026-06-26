// ── Telegram Bot notification ──────────────────────────────────────────────

const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
const CHAT_ID   = Deno.env.get('TELEGRAM_CHAT_ID')

export interface TelegramPayload {
  prospect: {
    prenom?: string; nom?: string; entreprise?: string
    telephone?: string; email?: string; ville?: string
    projet?: string; budget?: number
  }
  summary: string
  priority: 'high' | 'medium' | 'low'
  trigger: string
}

// Escape special chars for Telegram MarkdownV2
function esc(s: string): string {
  return String(s).replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&')
}

function buildMessage(p: TelegramPayload): string {
  const { prospect: pr, summary, priority, trigger } = p
  const now   = new Date()
  const emoji = priority === 'high' ? '🔴' : priority === 'medium' ? '🟡' : '🟢'
  const name  = esc(`${pr.prenom ?? ''} ${pr.nom ?? ''}`.trim() || 'Anonyme')

  return [
    `🚀 *Nouveau prospect CA\\-TECH*`,
    ``,
    `👤 *Nom :* ${name}`,
    `🏢 *Entreprise :* ${esc(pr.entreprise || '—')}`,
    `📞 *Téléphone :* ${esc(pr.telephone || '—')}`,
    `✉️ *Email :* ${esc(pr.email || '—')}`,
    `📍 *Ville :* ${esc(pr.ville || '—')}`,
    `💼 *Service :* ${esc(pr.projet || '—')}`,
    `💰 *Budget :* ${pr.budget ? esc(pr.budget.toLocaleString('fr-FR') + ' €') : '—'}`,
    ``,
    `📝 *Résumé :*`,
    esc(summary.slice(0, 400) + (summary.length > 400 ? '…' : '')),
    ``,
    `📅 *Date :* ${esc(now.toLocaleDateString('fr-FR'))}`,
    `⏰ *Heure :* ${esc(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))}`,
    `${emoji} *Priorité :* ${esc(priority === 'high' ? 'Haute' : priority === 'medium' ? 'Moyenne' : 'Normale')}`,
    `🔔 *Déclencheur :* ${esc(trigger)}`,
  ].join('\n')
}

export async function sendTelegram(payload: TelegramPayload): Promise<{ ok: boolean; error?: string }> {
  if (!BOT_TOKEN || !CHAT_ID) {
    return { ok: false, error: 'TELEGRAM_BOT_TOKEN ou TELEGRAM_CHAT_ID non configurés' }
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: buildMessage(payload), parse_mode: 'MarkdownV2' }),
    })
    const data = await res.json()
    if (data.ok) return { ok: true }
    return { ok: false, error: data.description ?? 'Telegram API error' }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}
