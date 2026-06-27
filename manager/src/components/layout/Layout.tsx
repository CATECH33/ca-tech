import { useState, type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Breadcrumbs } from './Breadcrumbs'

interface LayoutProps {
  children: ReactNode
  title?: string
  actions?: ReactNode
}

export function Layout({ children, title, actions }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const sidebarWidth = collapsed ? 60 : 220

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
    </div>
  )
}
