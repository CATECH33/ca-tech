import { useEffect, useCallback } from 'react'
import './DetailDrawer.css'

export default function DetailDrawer({ open, onClose, accentColor, children }) {
  const onEsc = useCallback(e => { if (e.key === 'Escape') onClose() }, [onClose])

  useEffect(() => {
    if (!open) return
    document.addEventListener('keydown', onEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onEsc)
      document.body.style.overflow = ''
    }
  }, [open, onEsc])

  return (
    <div className={`dd${open ? ' dd--open' : ''}`} aria-hidden={!open} role="presentation">
      <div className="dd-bd" onClick={onClose} aria-label="Fermer" />
      <aside
        className="dd-panel"
        role="dialog"
        aria-modal="true"
        style={{ '--acc': accentColor || '#0066FF' }}
      >
        {children}
      </aside>
    </div>
  )
}
