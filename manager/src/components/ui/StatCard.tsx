import { type ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from './Card'

interface StatCardProps {
  label: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: ReactNode
  iconColor?: string
  className?: string
}

export function StatCard({ label, value, change, changeLabel, icon, iconColor = 'bg-brand-50 text-brand-500', className }: StatCardProps) {
  const up = change !== undefined && change > 0
  const down = change !== undefined && change < 0

  return (
    <Card className={cn('hover:shadow-elevated transition-shadow', className)}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 truncate">{label}</p>
          <p className="text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
          {change !== undefined && (
            <div className={cn('flex items-center gap-1 text-xs font-medium mt-1', up && 'text-emerald-600', down && 'text-red-500', !up && !down && 'text-gray-400')}>
              {up ? <TrendingUp className="h-3 w-3" /> : down ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
              <span>{up && '+'}{change}%{changeLabel && ` ${changeLabel}`}</span>
            </div>
          )}
        </div>
        <div className={cn('p-2.5 rounded-xl shrink-0', iconColor)}>{icon}</div>
      </div>
    </Card>
  )
}
