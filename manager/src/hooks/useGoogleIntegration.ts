import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { buildGoogleOAuthUrl } from '@/lib/googleOAuth'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const Q = ['google-integration'] as const

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface GoogleIntegrationRow {
  id: string
  email: string
  scope: string
  connected_at: string
  expires_at: string | null
}

/* ─── Fetch ──────────────────────────────────────────────────────────────── */

async function fetchIntegration(): Promise<GoogleIntegrationRow | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('google_integrations')
    .select('id, email, scope, connected_at, expires_at')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) throw error
  return data as GoogleIntegrationRow | null
}

/* ─── Hook ───────────────────────────────────────────────────────────────── */

export function useGoogleIntegration() {
  const qc = useQueryClient()
  const { data: integration, isLoading } = useQuery({
    queryKey: Q,
    queryFn: fetchIntegration,
  })

  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connect = () => {
    setConnecting(true)
    setError(null)

    const left = Math.max(0, Math.round((window.screen.width - 520) / 2))
    const top = Math.max(0, Math.round((window.screen.height - 650) / 2))

    const popup = window.open(
      buildGoogleOAuthUrl(),
      'google-oauth',
      `width=520,height=650,popup=yes,left=${left},top=${top}`,
    )

    let closeCheck: ReturnType<typeof setInterval>

    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (event.data?.type !== 'google-oauth-callback') return

      clearInterval(closeCheck)
      window.removeEventListener('message', handleMessage)

      if (event.data.error) {
        setError(`Connexion refusée : ${event.data.error}`)
        setConnecting(false)
        return
      }

      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) throw new Error('Session expirée — reconnectez-vous')

        const res = await fetch(`${SUPABASE_URL}/functions/v1/google-oauth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            code: event.data.code,
            redirect_uri: `${window.location.origin}/manager/auth/google/callback`,
          }),
        })

        const result = await res.json()
        if (!res.ok) throw new Error(result.error ?? 'Erreur serveur')

        await qc.invalidateQueries({ queryKey: Q })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur inattendue')
      } finally {
        setConnecting(false)
      }
    }

    window.addEventListener('message', handleMessage)

    closeCheck = setInterval(() => {
      if (popup?.closed) {
        clearInterval(closeCheck)
        window.removeEventListener('message', handleMessage)
        setConnecting(false)
      }
    }, 1000)
  }

  const disconnect = async () => {
    setDisconnecting(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Session expirée')

      const res = await fetch(`${SUPABASE_URL}/functions/v1/google-oauth`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })

      if (!res.ok) {
        const result = await res.json()
        throw new Error(result.error ?? 'Erreur lors de la déconnexion')
      }

      await qc.invalidateQueries({ queryKey: Q })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inattendue')
    } finally {
      setDisconnecting(false)
    }
  }

  return {
    integration: integration ?? null,
    isConnected: !!integration,
    isLoading,
    connecting,
    disconnecting,
    error,
    clearError: () => setError(null),
    connect,
    disconnect,
  }
}
