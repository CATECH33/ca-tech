/**
 * Architecture extensible pour l'envoi d'emails.
 *
 * Pour connecter un provider :
 *   1. Implémenter l'interface MailProvider (voir examples ci-dessous)
 *   2. Instancier le provider et l'affecter à `mailProvider`
 *   3. MAIL_STATUS.isConnected deviendra true automatiquement
 *
 * Aucun email ne sera jamais envoyé automatiquement.
 * L'utilisateur valide chaque envoi manuellement depuis l'interface.
 */

export interface SendMailParams {
  to: string
  toName?: string
  replyTo?: string
  subject: string
  body: string
  draftId: string
}

export interface SendMailResult {
  messageId: string
  threadId?: string
  sentAt: string
}

export interface MailProvider {
  id: 'gmail' | 'smtp' | 'sendgrid' | 'mailjet' | (string & {})
  name: string
  isConnected: boolean
  send(params: SendMailParams): Promise<SendMailResult>
}

// ── Providers futurs ──────────────────────────────────────────────────────────
// FUTURE Gmail:
//   import { GmailProvider } from './providers/gmail'
//   export const mailProvider: MailProvider = new GmailProvider({ ... })
//
// FUTURE SMTP:
//   import { SmtpProvider } from './providers/smtp'
//   export const mailProvider: MailProvider = new SmtpProvider({ host, port, ... })
// ─────────────────────────────────────────────────────────────────────────────

export const mailProvider: MailProvider | null = null

export const MAIL_STATUS = {
  isConnected: mailProvider !== null,
  providerName: (mailProvider as MailProvider | null)?.name ?? null,
  disabledReason: 'Connexion Gmail non configurée — à développer dans une prochaine étape',
} as const
