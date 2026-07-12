import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export interface GmailSendInput {
  to: string
  toName?: string
  subject: string
  body: string
}

export interface GmailSendResult {
  messageId: string
  threadId: string
  sentAt: string
  from: string
}

export function useGmailSend() {
  return useMutation({
    mutationFn: async (input: GmailSendInput): Promise<GmailSendResult> => {
      let authToken = SUPABASE_ANON_KEY
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) authToken = session.access_token

      const res = await fetch(`${SUPABASE_URL}/functions/v1/gmail-send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(input),
      })

      const data = await res.json() as GmailSendResult & { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Erreur envoi Gmail')
      return data
    },
  })
}
