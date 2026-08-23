import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export type ReminderStage = 'douce' | 'ferme' | 'mise_en_demeure' | 'escalade'

export interface InvoiceReminder {
  id: string
  invoice_id: string
  stage: ReminderStage
  sent_at: string
  message_id: string | null
  response_status: number | null
  created_at: string
}

export const STAGE_META: Record<ReminderStage, { label: string; color: string; bg: string; border: string }> = {
  douce: {
    label:  'Relance douce',
    color:  'text-blue-700',
    bg:     'bg-blue-50',
    border: 'border-blue-100',
  },
  ferme: {
    label:  'Relance ferme',
    color:  'text-amber-700',
    bg:     'bg-amber-50',
    border: 'border-amber-100',
  },
  mise_en_demeure: {
    label:  'Mise en demeure',
    color:  'text-orange-700',
    bg:     'bg-orange-50',
    border: 'border-orange-100',
  },
  escalade: {
    label:  'Escalade (in-app)',
    color:  'text-red-700',
    bg:     'bg-red-50',
    border: 'border-red-100',
  },
}

export function useInvoiceReminders(invoiceId: string) {
  return useQuery({
    queryKey: ['invoice-reminders', invoiceId],
    queryFn: async (): Promise<InvoiceReminder[]> => {
      const { data, error } = await supabase
        .from('invoice_reminders')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('sent_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as InvoiceReminder[]
    },
    enabled: Boolean(invoiceId),
  })
}
