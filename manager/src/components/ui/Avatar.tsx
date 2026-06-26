import { cn, initials } from '@/lib/utils'

interface AvatarProps {
  nom?: string
  prenom?: string
  src?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = { sm: 'h-6 w-6 text-xs', md: 'h-8 w-8 text-sm', lg: 'h-10 w-10 text-sm', xl: 'h-12 w-12 text-base' }

const colors = [
  'bg-blue-100 text-blue-700', 'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700', 'bg-indigo-100 text-indigo-700',
]

export function Avatar({ nom, prenom, src, size = 'md', className }: AvatarProps) {
  const text = initials(nom, prenom)
  const colorIdx = (nom?.charCodeAt(0) ?? 0) % colors.length
  return (
    <span className={cn('inline-flex items-center justify-center rounded-full font-semibold shrink-0', sizes[size], !src && colors[colorIdx], className)}>
      {src ? <img src={src} alt={text} className="rounded-full h-full w-full object-cover" /> : text}
    </span>
  )
}
