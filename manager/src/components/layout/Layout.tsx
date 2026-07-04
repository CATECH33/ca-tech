import { useState, useCallback, type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Breadcrumbs } from './Breadcrumbs'
import { ToastContainer, type ToastMessage } from '@/components/ui/Toast'
import { useDocumentInsertListener } from '@/hooks/useDocuments'

interface LayoutProps {
  children: ReactNode
  title?: string
  actions?: ReactNode
}

export function Layout({ children, title, actions }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const sidebarWidth = collapsed ? 60 : 220

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  useDocumentInsertListener(
    useCallback((doc) => {
      if (!doc.storage_path) return
      const name = doc.original_filename ?? doc.name ?? 'Document'
      const src = doc.entity_type === 'conversation' ? 'Loïc' : 'Formulaire devis'
      setToasts(prev => [
        ...prev,
        {
          id: doc.id + '-' + Date.now(),
          title: 'Nouveau document reçu',
          body: `${name} — via ${src}`,
          icon: 'document',
          duration: 6000,
        },
      ])
    }, []),
  )

  return (
    <div className="min-h-screen bg-gray-50/60 font-sans">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(v => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <Header
        sidebarWidth={sidebarWidth}
        onMobileMenuToggle={() => setMobileOpen(v => !v)}
      />

      <main
        className="transition-all duration-300 pt-14 md:ml-[var(--sidebar-w)]"
        style={{ '--sidebar-w': sidebarWidth + 'px' } as React.CSSProperties}
      >
        {/* Page header */}
        <div className="sticky top-14 z-10 bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5 min-w-0">
            <Breadcrumbs />
            {title && <h1 className="text-base font-semibold text-gray-900 truncate">{title}</h1>}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>

      <ToastContainer messages={toasts} onClose={removeToast} />
    </div>
  )
}
