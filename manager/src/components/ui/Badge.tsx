import { cn, statusColor, statusLabel } from '@/lib/utils'

interface BadgeProps {
  status?: string
  label?: string
  className?: string
  dot?: boolean
}

export function Badge({ status, label, className, dot }: BadgeProps) {
  const text = label ?? (status ? statusLabel(status) : '')
  const color = status ? statusColor(status) : 'bg-gray-100 text-gray-700 border-gray-200'
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border', color, className)}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
      {text}
    </span>
  )
}
