import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const BUCKET = 'client-documents'
const SIGNED_URL_TTL = 3600 // 1 heure

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DocumentRecord {
  id: string
  entity_type?: string
  entity_id?: string
  prospect_id?: string
  quote_id?: string
  original_filename?: string
  stored_filename?: string
  mime_type?: string
  extension?: string
  size?: number
  storage_path?: string
  uploaded_by?: string
  created_at: string
  // legacy columns
  name?: string
  file_url?: string
  file_type?: string
  file_size?: number
}

export interface UploadOptions {
  entityType: string
  entityId: string
  quoteId?: string
  prospectId?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fileExt(name: string): string {
  return (name.split('.').pop() ?? '').toLowerCase()
}

// ─── Core async functions ─────────────────────────────────────────────────────

export async function uploadDocument(
  file: File,
  opts: UploadOptions,
): Promise<DocumentRecord> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  const ext        = fileExt(file.name)
  const storedName = `${crypto.randomUUID()}.${ext}`
  const path       = `${opts.entityType}/${opts.entityId}/${storedName}`

  // Upload vers le bucket
  const { error: storageErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false })

  if (storageErr) throw storageErr

  // Enregistrement en base
  const { data, error: dbErr } = await supabase
    .from('documents')
    .insert({
      entity_type:       opts.entityType,
      entity_id:         opts.entityId,
      quote_id:          opts.quoteId          ?? null,
      prospect_id:       opts.prospectId       ?? null,
      original_filename: file.name,
      stored_filename:   storedName,
      mime_type:         file.type,
      extension:         ext,
      size:              file.size,
      storage_path:      path,
      uploaded_by:       user.id,
      // colonnes legacy conservées pour compatibilité
      name:      file.name,
      file_url:  path,
      file_type: file.type,
      file_size: file.size,
    })
    .select()
    .single()

  if (dbErr) {
    // Rollback storage si l'insert échoue
    await supabase.storage.from(BUCKET).remove([path])
    throw dbErr
  }

  return data as DocumentRecord
}

export async function getSignedUrl(
  storagePath: string,
  expiresIn = SIGNED_URL_TTL,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, expiresIn)
  if (error) throw error
  return data.signedUrl
}

export async function deleteDocument(id: string, storagePath: string): Promise<void> {
  // Storage d'abord, puis DB
  const { error: storageErr } = await supabase.storage
    .from(BUCKET)
    .remove([storagePath])
  if (storageErr) throw storageErr

  const { error: dbErr } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)
  if (dbErr) throw dbErr
}

// ─── React Query hooks ────────────────────────────────────────────────────────

export function useDocuments(entityType: string, entityId: string | undefined) {
  return useQuery({
    queryKey: ['documents', entityType, entityId],
    queryFn: async (): Promise<DocumentRecord[]> => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId!)
        .not('storage_path', 'is', null)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as DocumentRecord[]
    },
    enabled: !!entityId,
    staleTime: 30_000,
  })
}

export function useUploadDocuments() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ file, opts }: { file: File; opts: UploadOptions }) =>
      uploadDocument(file, opts),
    onSuccess: (_, { opts }) => {
      qc.invalidateQueries({ queryKey: ['documents', opts.entityType, opts.entityId] })
    },
  })
}

export function useDeleteDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      storagePath,
    }: {
      id: string
      storagePath: string
      entityType: string
      entityId: string
    }) => deleteDocument(id, storagePath),
    onSuccess: (_, { entityType, entityId }) => {
      qc.invalidateQueries({ queryKey: ['documents', entityType, entityId] })
      qc.invalidateQueries({ queryKey: ['all-documents'] })
    },
  })
}

// ─── All-documents hook (page Documents) ──────────────────────────────────────

export interface DocumentWithContext extends DocumentRecord {
  lead?: { first_name: string; last_name: string; email: string } | null
  quote?: { quote_number: string; total: number } | null
}

const QA = ['all-documents'] as const

export function useAllDocuments() {
  const qc = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel('all-documents-rt')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'documents' },
        () => { qc.invalidateQueries({ queryKey: QA }) },
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [qc])

  return useQuery({
    queryKey: QA,
    queryFn: async (): Promise<DocumentWithContext[]> => {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          lead:leads!prospect_id(first_name, last_name, email),
          quote:quotes!quote_id(quote_number, total)
        `)
        .not('storage_path', 'is', null)
        .order('created_at', { ascending: false })
        .limit(500)
      if (error) throw error
      return (data ?? []) as DocumentWithContext[]
    },
    staleTime: 15_000,
  })
}

export function useDocumentInsertListener(onInsert: (doc: DocumentRecord) => void) {
  useEffect(() => {
    const channel = supabase
      .channel('document-insert-notify')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'documents' },
        (payload) => { onInsert(payload.new as DocumentRecord) },
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [onInsert])
}
