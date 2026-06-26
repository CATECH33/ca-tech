// ── Notification Service — point d'entrée central ─────────────────────────
// Toutes les notifications passent par notify().
// Chaque canal est indépendant : l'échec d'un canal n'arrête pas les autres.

import { sendEmail, type EmailPayload }         from './email.ts'
import { sendTelegram, type TelegramPayload }   from './telegram.ts'
import { sendWhatsApp, type WhatsAppPayload }   from './whatsapp.ts'

export type NotificationTrigger =
  | 'create_lead'
  | 'show_quote'
  | 'propose_appointment'
  | 'escalate'
  | 'email_captured'
  | 'phone_captured'

export type Priority = 'high' | 'medium' | 'low'

export interface ProspectData {
  prenom?: string; nom?: string; entreprise?: string
  telephone?: string; email?: string; ville?: string
  projet?: string; budget?: number
}

export interface NotificationContext {
  prospect: ProspectData
  summary: string
  conversationId: string
  trigger: NotificationTrigger
}

export function getPriority(trigger: NotificationTrigger): Priority {
  if (trigger === 'create_lead' || trigger === 'escalate') return 'high'
  if (trigger === 'show_quote' || trigger === 'propose_appointment') return 'medium'
  return 'low'
}

export function getTriggerLabel(trigger: NotificationTrigger): string {
  const labels: Record<NotificationTrigger, string> = {
    create_lead:          'Prospect qualifié',
    show_quote:           'Devis demandé',
    propose_appointment:  'Rendez-vous demandé',
    escalate:             'Escalade humaine',
    email_captured:       'Email collecté',
    phone_captured:       'Téléphone collecté',
  }
  return labels[trigger]
}

export async function notify(ctx: NotificationContext, supabase: any): Promise<void> {
  const priority     = getPriority(ctx.trigger)
  const triggerLabel = getTriggerLabel(ctx.trigger)

  const emailPayload: EmailPayload = {
    prospect: ctx.prospect, summary: ctx.summary,
    conversationId: ctx.conversationId, priority, trigger: triggerLabel,
  }
  const telegramPayload: TelegramPayload = {
    prospect: ctx.prospect, summary: ctx.summary, priority, trigger: triggerLabel,
  }
  const whatsappPayload: WhatsAppPayload = {
    prospect: ctx.prospect, summary: ctx.summary, priority, trigger: triggerLabel,
  }

  const [emailRes, telegramRes, whatsappRes] = await Promise.allSettled([
    sendEmail(emailPayload),
    sendTelegram(telegramPayload),
    sendWhatsApp(whatsappPayload),
  ])

  const resolve = <T extends { ok: boolean; error?: string; provider?: string }>(
    r: PromiseSettledResult<T>, fallbackProvider: string
  ): T => r.status === 'fulfilled' ? r.value : { ok: false, error: String((r as any).reason), provider: fallbackProvider } as T

  const eR  = resolve(emailRes,    'unknown')
  const tR  = resolve(telegramRes, 'telegram')
  const wR  = resolve(whatsappRes, 'unknown')

  const logs = [
    {
      prospect_id: ctx.conversationId,
      type: 'email', provider: eR.provider ?? 'unknown',
      status: eR.ok ? 'sent' : 'failed',
      recipient: ctx.prospect.email ?? null,
      message: `Trigger: ${ctx.trigger} | Priority: ${priority}`,
      error: eR.ok ? null : (eR.error ?? null),
      metadata: { trigger: ctx.trigger, priority },
    },
    {
      prospect_id: ctx.conversationId,
      type: 'telegram', provider: 'telegram',
      status: tR.ok ? 'sent' : 'failed',
      recipient: 'CA-TECH Bot',
      message: `Trigger: ${ctx.trigger} | Priority: ${priority}`,
      error: tR.ok ? null : (tR.error ?? null),
      metadata: { trigger: ctx.trigger, priority },
    },
    {
      prospect_id: ctx.conversationId,
      type: 'whatsapp', provider: wR.provider ?? 'unknown',
      status: wR.ok ? 'sent' : 'failed',
      recipient: ctx.prospect.telephone ?? null,
      message: `Trigger: ${ctx.trigger} | Priority: ${priority}`,
      error: wR.ok ? null : (wR.error ?? null),
      metadata: { trigger: ctx.trigger, priority },
    },
  ]

  try {
    await supabase.from('notification_logs').insert(logs)
  } catch (e) {
    console.error('[Loic/notify] Log insert failed:', e)
  }
}
