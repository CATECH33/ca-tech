import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  as string
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string

async function authHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token ?? SUPABASE_ANON
  return { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON }
}

export interface DriveFolderResult {
  folder_id: string
  folder_url: string
  subfolders: Record<string, string>
}

export function useCreateDriveFolder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { prospect_id: string; prospect_name: string }): Promise<DriveFolderResult> => {
      const headers = await authHeader()
      const res = await fetch(`${SUPABASE_URL}/functions/v1/google-drive`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const data = await res.json() as DriveFolderResult & { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Erreur création dossier Drive')
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['prospects'] })
    },
  })
}
