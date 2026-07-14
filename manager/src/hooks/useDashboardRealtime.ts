import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

/**
 * Subscribes to all tables powering the commercial dashboard.
 * Any INSERT/UPDATE/DELETE on prospects, email_drafts, campaigns or devis
 * instantly invalidates the matching React Query cache keys, triggering
 * a refetch without any polling delay.
 *
 * Usage: call once at the top of the dashboard component.
 *
 * ── Future data sources to wire here ──────────────────────────────────────
 * When you connect an external tool, add a channel listener below:
 *
 *   // Stripe (paiements)
 *   .on('postgres_changes', { event: '*', schema: 'public', table: 'paiements' },
 *     () => qc.invalidateQueries({ queryKey: ['paiements'] }))
 *
 *   // Open-rate tracking (Brevo / Mailchimp / Resend webhooks → email_events table)
 *   .on('postgres_changes', { event: '*', schema: 'public', table: 'email_events' },
 *     () => qc.invalidateQueries({ queryKey: ['email-events'] }))
 *
 *   // CRM sync (HubSpot / Salesforce → crm_contacts table)
 *   .on('postgres_changes', { event: '*', schema: 'public', table: 'crm_contacts' },
 *     () => qc.invalidateQueries({ queryKey: ['crm-contacts'] }))
 */
export function useDashboardRealtime() {
  const qc = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel('commercial_dashboard_v1')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'prospects' },
        () => qc.invalidateQueries({ queryKey: ['prospects'] }))
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'prospect_activities' },
        () => qc.invalidateQueries({ queryKey: ['prospects'] }))
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'email_drafts' },
        () => {
          qc.invalidateQueries({ queryKey: ['email-drafts'] })
          qc.invalidateQueries({ queryKey: ['relance-drafts'] })
        })
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'campaigns' },
        () => qc.invalidateQueries({ queryKey: ['campaigns'] }))
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'devis' },
        () => qc.invalidateQueries({ queryKey: ['devis'] }))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [qc])
}

// ── Future: open-rate data shape ───────────────────────────────────────────────
// Once you connect an email service provider (Brevo, Mailchimp, Resend…),
// expect this interface from the `email_events` table or a webhook endpoint:
export interface EmailEvent {
  id:         string
  draft_id:   string
  type:       'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed'
  created_at: string
  metadata:   Record<string, unknown>
}

// Placeholder hook — returns zeroes until integration is wired up
export function useEmailEvents(): { opens: number; openRate: number } {
  // FUTURE: replace with useQuery({ queryKey: ['email-events'], queryFn: fetchEmailEvents })
  return { opens: 0, openRate: 0 }
}
