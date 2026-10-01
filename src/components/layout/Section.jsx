import { cn } from '../../lib/utils'

// Section — wrapper avec padding vertical responsive et background configurable
export function Section({ children, className = '', id, bg = 'canvas', style }) {
  const bgMap = {
    canvas: '#05101E',
    panel:  '#102740',
    elevated: '#1A4066',
    transparent: 'transparent',
  }

  return (
    <section
      id={id}
      className={cn('py-16 md:py-20 xl:py-32', className)}
      style={{ background: bgMap[bg] ?? bg, ...style }}
    >
      {children}
    </section>
  )
}
