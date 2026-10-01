import { cn } from '../../lib/utils'

// Container — max-width + padding horizontal responsive
export function Container({ children, className = '', wide = false, narrow = false }) {
  const maxW = wide ? 'max-w-[1440px]' : narrow ? 'max-w-[720px]' : 'max-w-[1200px]'
  return (
    <div className={cn('w-full mx-auto px-6 md:px-12 xl:px-20', maxW, className)}>
      {children}
    </div>
  )
}
