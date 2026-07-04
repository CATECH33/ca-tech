import {
  useState, useCallback, useRef, useEffect,
  type DragEvent, type ChangeEvent,
} from 'react'
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Accepted formats ────────────────────────────────────────────────────────

const ACCEPTED_MIMES: Record<string, string[]> = {
  'application/pdf':                                                                            ['.pdf'],
  'application/msword':                                                                         ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':                  ['.docx'],
  'application/vnd.ms-excel':                                                                   ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':                        ['.xlsx'],
  'application/vnd.ms-powerpoint':                                                              ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation':                ['.pptx'],
  'image/png':                                                                                  ['.png'],
  'image/jpeg':                                                                         ['.jpg', '.jpeg'],
  'image/webp':                                                                                 ['.webp'],
  'image/svg+xml':                                                                              ['.svg'],
  'application/zip':                                                                            ['.zip'],
  'application/x-zip-compressed':                                                              ['.zip'],
}

const ALL_EXTS    = [...new Set(Object.values(ACCEPTED_MIMES).flat())]
const ALL_MIMES   = Object.keys(ACCEPTED_MIMES)
const IMG_MIMES   = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'])
const IMG_EXTS    = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg'])
const FORMAT_CHIPS = ['PDF', 'DOC', 'DOCX', 'XLS', 'XLSX', 'PPT', 'PPTX', 'PNG', 'JPG', 'WEBP', 'SVG', 'ZIP']

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FileEntry {
  id: string
  file: File
  progress: number
  status: 'validating' | 'ready' | 'error'
  error?: string
  preview?: string
}

export interface FileUploadProps {
  onFilesChange?: (entries: FileEntry[]) => void
  maxSizeMB?: number
  maxFiles?: number
  disabled?: boolean
  label?: string
  className?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fileExt(name: string) {
  return '.' + (name.split('.').pop() ?? '').toLowerCase()
}

function isImage(file: File) {
  return IMG_MIMES.has(file.type) || IMG_EXTS.has(fileExt(file.name))
}

function validateFile(file: File, maxMB: number): string | null {
  const e = fileExt(file.name)
  if (!ALL_EXTS.includes(e)) return `Extension non supportée (${e})`
  if (file.type && !ALL_MIMES.includes(file.type)) return `Type MIME non accepté`
  if (file.size > maxMB * 1_048_576) return `Fichier trop lourd (max ${maxMB} Mo)`
  return null
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1_048_576) return `${Math.round(bytes / 1024)} Ko`
  return `${(bytes / 1_048_576).toFixed(1)} Mo`
}

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

type FileCategory = 'pdf' | 'word' | 'excel' | 'ppt' | 'image' | 'zip'

function getCategory(file: File): FileCategory {
  const t = file.type
  const e = fileExt(file.name)
  if (t === 'application/pdf' || e === '.pdf') return 'pdf'
  if (t.includes('excel') || t.includes('spreadsheet') || e === '.xls' || e === '.xlsx') return 'excel'
  if (t.includes('powerpoint') || t.includes('presentation') || e === '.ppt' || e === '.pptx') return 'ppt'
  if (t.includes('word') || t.includes('wordprocessing') || e === '.doc' || e === '.docx') return 'word'
  if (IMG_MIMES.has(t) || IMG_EXTS.has(e)) return 'image'
  return 'zip'
}

const CATEGORY_STYLE: Record<FileCategory, { tag: string; bg: string; fg: string }> = {
  pdf:   { tag: 'PDF',   bg: 'bg-red-50',      fg: 'text-red-600' },
  word:  { tag: 'Word',  bg: 'bg-blue-50',     fg: 'text-blue-600' },
  excel: { tag: 'Excel', bg: 'bg-emerald-50',  fg: 'text-emerald-700' },
  ppt:   { tag: 'PPT',   bg: 'bg-orange-50',   fg: 'text-orange-600' },
  image: { tag: 'Img',   bg: 'bg-violet-50',   fg: 'text-violet-600' },
  zip:   { tag: 'ZIP',   bg: 'bg-amber-50',    fg: 'text-amber-600' },
}

// ─── FileRow ──────────────────────────────────────────────────────────────────

interface FileRowProps {
  entry: FileEntry
  onRemove: (id: string) => void
}

function FileRow({ entry, onRemove }: FileRowProps) {
  const { id, file, progress, status, error, preview } = entry
  const style = CATEGORY_STYLE[getCategory(file)]

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors',
        status === 'error'
          ? 'border-red-200 bg-red-50/50'
          : 'border-gray-100 bg-white hover:border-gray-200',
      )}
    >
      {/* Thumbnail or category badge */}
      <div className="shrink-0 h-10 w-10 rounded-lg overflow-hidden">
        {preview ? (
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className={cn('h-full w-full flex items-center justify-center', style.bg)}>
            <span className={cn('text-[10px] font-bold tracking-wide leading-none', style.fg)}>
              {style.tag}
            </span>
          </div>
        )}
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-baseline gap-2 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate leading-none">{file.name}</p>
          <span className="text-xs text-gray-400 shrink-0 leading-none">{formatSize(file.size)}</span>
        </div>

        {status === 'validating' && (
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-[width] duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {status === 'error' && error && (
          <p className="text-xs text-red-500 flex items-center gap-1 leading-none">
            <AlertCircle className="h-3 w-3 shrink-0" />
            {error}
          </p>
        )}
      </div>

      {/* Status + remove */}
      <div className="shrink-0 flex items-center gap-1.5">
        {status === 'validating' && (
          <span className="block h-4 w-4 rounded-full border-2 border-brand-400 border-t-transparent animate-spin" />
        )}
        {status === 'ready' && <CheckCircle className="h-4 w-4 text-emerald-500" />}
        {status === 'error'  && <AlertCircle className="h-4 w-4 text-red-500" />}

        <button
          type="button"
          onClick={() => onRemove(id)}
          aria-label="Supprimer le fichier"
          className="h-6 w-6 rounded-md flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

// ─── FileUpload ───────────────────────────────────────────────────────────────

export function FileUpload({
  onFilesChange,
  maxSizeMB = 10,
  maxFiles = 20,
  disabled = false,
  label,
  className,
}: FileUploadProps) {
  const [entries, setEntries] = useState<FileEntry[]>([])
  const [dragging, setDragging] = useState(false)

  const dragCounter  = useRef(0)
  const inputRef     = useRef<HTMLInputElement>(null)
  const timers       = useRef(new Set<ReturnType<typeof setInterval>>())
  const startedIds   = useRef(new Set<string>())
  const onChangeRef  = useRef(onFilesChange)
  onChangeRef.current = onFilesChange

  // Notify parent whenever entries change
  useEffect(() => {
    onChangeRef.current?.(entries)
  }, [entries])

  // Start progress animation for any new 'validating' entry
  useEffect(() => {
    entries.forEach(e => {
      if (e.status !== 'validating' || startedIds.current.has(e.id)) return
      startedIds.current.add(e.id)
      let p = 0
      const t = setInterval(() => {
        p = Math.min(p + 10, 100)
        setEntries(s => s.map(x => x.id === e.id ? { ...x, progress: p } : x))
        if (p >= 100) {
          clearInterval(t)
          timers.current.delete(t)
          setEntries(s => s.map(x =>
            x.id === e.id && x.status === 'validating' ? { ...x, status: 'ready' } : x
          ))
        }
      }, 30)
      timers.current.add(t)
    })
  }, [entries])

  // Clear timers and revoke preview URLs on unmount
  useEffect(() => {
    return () => {
      timers.current.forEach(clearInterval)
    }
  }, [])

  const addFiles = useCallback((raw: File[]) => {
    setEntries(prev => {
      const cap = maxFiles - prev.length
      if (cap <= 0) return prev
      const next: FileEntry[] = raw.slice(0, cap).map(file => {
        const err = validateFile(file, maxSizeMB)
        return {
          id: uid(),
          file,
          progress: 0,
          status: err ? 'error' : 'validating',
          error: err ?? undefined,
          preview: !err && isImage(file) ? URL.createObjectURL(file) : undefined,
        }
      })
      return [...prev, ...next]
    })
  }, [maxFiles, maxSizeMB])

  const removeEntry = useCallback((id: string) => {
    setEntries(prev => {
      const entry = prev.find(e => e.id === id)
      if (entry?.preview) URL.revokeObjectURL(entry.preview)
      return prev.filter(e => e.id !== id)
    })
  }, [])

  const removeErrors = useCallback(() => {
    setEntries(prev => prev.filter(e => e.status !== 'error'))
  }, [])

  const clearAll = useCallback(() => {
    setEntries(prev => {
      prev.forEach(e => { if (e.preview) URL.revokeObjectURL(e.preview) })
      return []
    })
  }, [])

  const onDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault()
    dragCounter.current++
    if (!disabled) setDragging(true)
  }, [disabled])

  const onDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    if (--dragCounter.current <= 0) {
      dragCounter.current = 0
      setDragging(false)
    }
  }, [])

  const onDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    dragCounter.current = 0
    setDragging(false)
    if (disabled) return
    addFiles(Array.from(e.dataTransfer.files))
  }, [disabled, addFiles])

  const onInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files ?? []))
    e.target.value = ''
  }, [addFiles])

  const readyCount = entries.filter(e => e.status === 'ready').length
  const hasErrors  = entries.some(e => e.status === 'error')
  const atLimit    = entries.length >= maxFiles

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {label && <p className="text-xs font-medium text-gray-700">{label}</p>}

      {/* Drop zone */}
      <div
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={e => e.preventDefault()}
        onDrop={onDrop}
        role="region"
        aria-label="Zone de dépôt de fichiers"
        className={cn(
          'relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 sm:p-8 transition-all duration-200 select-none',
          dragging
            ? 'border-brand-500 bg-brand-50/60 scale-[1.005] shadow-lg shadow-brand-500/10'
            : 'border-gray-200 bg-gray-50/80 hover:border-gray-300 hover:bg-gray-50',
          (disabled || atLimit) && 'opacity-50 pointer-events-none',
        )}
      >
        {/* Upload icon */}
        <div className={cn(
          'h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm transition-colors',
          dragging ? 'bg-brand-100' : 'bg-white border border-gray-200',
        )}>
          <Upload className={cn('h-5 w-5 transition-colors', dragging ? 'text-brand-600' : 'text-gray-400')} />
        </div>

        {/* CTA */}
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-gray-800">
            {dragging ? 'Déposez maintenant' : 'Glissez vos fichiers ici'}
          </p>
          <p className="text-xs text-gray-500">
            ou{' '}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-brand-500 hover:text-brand-600 font-semibold transition-colors hover:underline underline-offset-2"
            >
              parcourez vos fichiers
            </button>
          </p>
        </div>

        {/* Format chips */}
        <div className="flex flex-wrap justify-center gap-1 max-w-xs sm:max-w-sm">
          {FORMAT_CHIPS.map(fmt => (
            <span
              key={fmt}
              className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white border border-gray-200 text-gray-500 leading-none"
            >
              {fmt}
            </span>
          ))}
        </div>

        <p className="text-[11px] text-gray-400">
          Max {maxSizeMB} Mo par fichier · {maxFiles} fichiers maximum
        </p>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ALL_EXTS.join(',')}
          onChange={onInputChange}
          className="sr-only"
          aria-hidden
        />
      </div>

      {/* File list */}
      {entries.length > 0 && (
        <div className="flex flex-col gap-2">
          {/* List header */}
          <div className="flex items-center justify-between px-0.5">
            <p className="text-xs text-gray-500">
              <span className="font-semibold text-gray-700">{readyCount}</span>
              /{entries.length} fichier{entries.length > 1 ? 's' : ''} prêt{readyCount !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-3">
              {hasErrors && (
                <button
                  type="button"
                  onClick={removeErrors}
                  className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
                >
                  Retirer les erreurs
                </button>
              )}
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-gray-400 hover:text-gray-600 font-medium transition-colors"
              >
                Tout effacer
              </button>
            </div>
          </div>

          {/* Rows */}
          <div className="flex flex-col gap-1.5">
            {entries.map(entry => (
              <FileRow key={entry.id} entry={entry} onRemove={removeEntry} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
