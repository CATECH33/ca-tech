import { Badge } from './badge'
import { cn } from '@/lib/utils'

export function Tag({ children, className }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'font-mono text-[10px] tracking-wide border-[rgba(53,155,217,0.28)] text-[rgba(53,155,217,0.85)] bg-[rgba(53,155,217,0.07)] hover:bg-[rgba(53,155,217,0.12)] transition-colors',
        className
      )}
    >
      {children}
    </Badge>
  )
}
