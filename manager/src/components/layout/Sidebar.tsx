import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, UserPlus, FileText, Receipt, FolderKanban,
  CheckSquare, Briefcase, CreditCard, Image, MessageSquare, Headphones,
  Settings, ChevronLeft, ChevronRight, Zap, Calendar, Bot, Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  icon: React.ElementType
  to: string
  badge?: number
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/' },
  { label: 'Clients', icon: Users, to: '/clients' },
  { label: 'Leads', icon: UserPlus, to: '/leads' },
  { label: 'Devis', icon: FileText, to: '/devis' },
  { label: 'Factures', icon: Receipt, to: '/factures' },
  { label: 'Projets', icon: FolderKanban, to: '/projets' },
  { label: 'Tâches', icon: CheckSquare, to: '/taches' },
  { label: 'Services', icon: Briefcase, to: '/services' },
  { label: 'Paiements', icon: CreditCard, to: '/paiements' },
  { label: 'Portfolio', icon: Image, to: '/portfolio' },
  { label: 'Agenda', icon: Calendar, to: '/agenda' },
  { label: 'Loïc IA', icon: Bot, to: '/loic' },
  { label: 'Notifications', icon: Bell, to: '/notifications' },
  { label: 'Messages', icon: MessageSquare, to: '/messages' },
  { label: 'Support', icon: Headphones, to: '/support' },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation()

  return (
    <>
      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={onMobileClose}
        />
      )}

    <aside className={cn(
      'fixed left-0 top-0 h-screen bg-white border-r border-gray-100 flex flex-col z-30 transition-all duration-300 ease-in-out',
      collapsed ? 'w-[60px]' : 'w-[220px]',
      'max-md:-translate-x-full max-md:w-[220px]',
      mobileOpen && 'max-md:translate-x-0'
    )}>
      {/* Logo */}
      <div className={cn('h-14 flex items-center border-b border-gray-100 shrink-0 px-3 gap-2.5')}>
        <div className="h-7 w-7 rounded-lg bg-brand-500 flex items-center justify-center shrink-0">
          <Zap className="h-3.5 w-3.5 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-sm font-bold text-gray-900 tracking-tight">CA-TECH</div>
            <div className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">Manager</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = item.to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.to)
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors group',
                isActive
                  ? 'bg-brand-50 text-brand-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0 transition-colors', isActive ? 'text-brand-500' : 'text-gray-400 group-hover:text-gray-600')} />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.badge !== undefined && (
                <span className="ml-auto text-[10px] font-semibold bg-brand-100 text-brand-600 rounded-full px-1.5 py-0.5 leading-none">
                  {item.badge}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-gray-100 p-2 space-y-0.5">
        <NavLink
          to="/parametres"
          title={collapsed ? 'Paramètres' : undefined}
          className={cn(
            'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors group',
            location.pathname.startsWith('/parametres')
              ? 'bg-brand-50 text-brand-600'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          )}
        >
          <Settings className="h-4 w-4 shrink-0 text-gray-400 group-hover:text-gray-600" />
          {!collapsed && <span className="truncate">Paramètres</span>}
        </NavLink>

        <button
          onClick={onToggle}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
        >
          {collapsed
            ? <ChevronRight className="h-4 w-4 shrink-0" />
            : <><ChevronLeft className="h-4 w-4 shrink-0" /><span className="truncate text-xs">Réduire</span></>
          }
        </button>
      </div>
    </aside>
    </>
  )
}
