import { useEffect, useState } from 'react'
import { X, Paperclip } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ToastMessage {
  id: string
  title: string
  body?: string
  icon?: 'document'
  duration?: number
}

interface ToastProps {
  message: ToastMessage
  onClose: (id: string) => void
}

function Toast({ message, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false)
  const duration = message.duration ?? 5000

  useEffect(() => {
    // Slide in
    const t1 = setTimeout(() => setVisible(true), 10)
    // Auto-close
    const t2 = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onClose(message.id), 300)
    }, duration)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [message.id, duration, onClose])

  return (
    <div
      className={cn(
        'flex items-start gap-3 w-80 bg-white border border-gray-100 rounded-2xl shadow-lg shadow-black/5 px-4 py-3 transition-all duration-300',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
      )}
    >
      <div className="h-8 w-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0 mt-0.5">
        <Paperclip className="h-4 w-4 text-brand-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 leading-tight">{message.title}</p>
        {message.body && (
          <p className="text-xs text-gray-500 mt-0.5 leading-snug truncate">{message.body}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => { setVisible(false); setTimeout(() => onClose(message.id), 300) }}
        className="h-5 w-5 flex items-center justify-center text-gray-300 hover:text-gray-500 transition-colors shrink-0 mt-0.5"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

interface ToastContainerProps {
  messages: ToastMessage[]
  onClose: (id: string) => void
}

export function ToastContainer({ messages, onClose }: ToastContainerProps) {
  if (messages.length === 0) return null
  return (
    <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 items-end">
      {messages.map(msg => (
        <Toast key={msg.id} message={msg} onClose={onClose} />
      ))}
    </div>
  )
}
