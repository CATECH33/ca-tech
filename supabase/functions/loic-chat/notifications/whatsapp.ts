// ── WhatsApp notification ─────────────────────────────────────────────────
// DÉSACTIVÉ par défaut — activer en définissant WHATSAPP_PROVIDER + identifiants
//
// Providers supportés :
//   - 'meta'   → WhatsApp Cloud API (Meta)
//   - 'twilio' → Twilio WhatsApp
//
// Secrets à configurer dans Supabase :
//   Meta   : WHATSAPP_PROVIDER=meta, WHATSAPP_PHONE_ID, WHATSAPP_TOKEN, WHATSAPP_TO
//   Twilio : WHATSAPP_PROVIDER=twilio, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN,
//            TWILIO_WHATSAPP_FROM (whatsapp:+14155238886), TWILIO_WHATSAPP_TO

const PROVIDER     = Deno.env.get('WHATSAPP_PROVIDER')       // 'meta' | 'twilio' | undefined
const META_PHONE   = Deno.env.get('WHATSAPP_PHONE_ID')
const META_TOKEN   = Deno.env.get('WHATSAPP_TOKEN')
const META_TO      = Deno.env.get('WHATSAPP_TO')             // ex: 33612345678
const TWI_SID      = Deno.env.get('TWILIO_ACCOUNT_SID')
const TWI_TOKEN    = Deno.env.get('TWILIO_AUTH_TOKEN')
const TWI_FROM     = Deno.env.get('TWILIO_WHATSAPP_FROM')    // whatsapp:+14155238886
const TWI_TO       = Deno.env.get('TWILIO_WHATSAPP_TO')      // whatsapp:+33XXXXXXXXX

export interface WhatsAppPayload {
  prospect: {
    prenom?: string; nom?: string; entreprise?: string
    telephone?: string; email?: string; projet?: string; budget?: number
  }
  summary: string
  priority: 'high' | 'medium' | 'low'
  trigger: string
}

function buildBody(p: WhatsAppPayload): string {
  const pr   = p.prospect
  const name = `${pr.prenom ?? ''} ${pr.nom ?? ''}`.trim() || 'Anonyme'
  const now  = new Date()
  const emoji = p.priority === 'high' ? '🔴' : p.priority === 'medium' ? '🟡' : '🟢'
  return [
    `🚀 Nouveau prospect CA-TECH`,
    ``,
    `Nom : ${name}`,
    `Entreprise : ${pr.entreprise || '—'}`,
    `Téléphone : ${pr.telephone || '—'}`,
    `Email : ${pr.email || '—'}`,
    `Service : ${pr.projet || '—'}`,
    `Budget : ${pr.budget ? pr.budget.toLocaleString('fr-FR') + ' €' : '—'}`,
    ``,
    `Résumé : ${p.summary.slice(0, 250)}`,
    ``,
    `${emoji} Priorité : ${p.priority === 'high' ? 'Haute' : p.priority === 'medium' ? 'Moyenne' : 'Normale'}`,
    `Déclencheur : ${p.trigger}`,
    `Date : ${now.toLocaleDateString('fr-FR')} ${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
  ].join('\n')
}

export async function sendWhatsApp(payload: WhatsAppPayload): Promise<{ ok: boolean; error?: string; provider: string }> {
  if (!PROVIDER) {
    return { ok: false, error: 'WhatsApp non configuré — définir WHATSAPP_PROVIDER (meta ou twilio)', provider: 'none' }
  }

  const body = buildBody(payload)

  // ── Meta WhatsApp Cloud API ──
  if (PROVIDER === 'meta') {
    if (!META_PHONE || !META_TOKEN || !META_TO) {
      return { ok: false, error: 'Identifiants Meta manquants (WHATSAPP_PHONE_ID, WHATSAPP_TOKEN, WHATSAPP_TO)', provider: 'meta' }
    }
    try {
      const res = await fetch(`https://graph.facebook.com/v18.0/${META_PHONE}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${META_TOKEN}` },
        body: JSON.stringify({ messaging_product: 'whatsapp', to: META_TO, type: 'text', text: { body } }),
      })
      const data = await res.json()
      if (res.ok && data.messages?.length) return { ok: true, provider: 'meta' }
      return { ok: false, error: JSON.stringify(data), provider: 'meta' }
    } catch (e) { return { ok: false, error: String(e), provider: 'meta' } }
  }

  // ── Twilio WhatsApp ──
  if (PROVIDER === 'twilio') {
    if (!TWI_SID || !TWI_TOKEN || !TWI_FROM || !TWI_TO) {
      return { ok: false, error: 'Identifiants Twilio manquants', provider: 'twilio' }
    }
    try {
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWI_SID}/Messages.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${btoa(`${TWI_SID}:${TWI_TOKEN}`)}`,
        },
        body: new URLSearchParams({ From: TWI_FROM, To: TWI_TO, Body: body }),
      })
      const data = await res.json()
      if (res.ok) return { ok: true, provider: 'twilio' }
      return { ok: false, error: data.message ?? JSON.stringify(data), provider: 'twilio' }
    } catch (e) { return { ok: false, error: String(e), provider: 'twilio' } }
  }

  return { ok: false, error: `Provider inconnu : ${PROVIDER}`, provider: PROVIDER }
}
