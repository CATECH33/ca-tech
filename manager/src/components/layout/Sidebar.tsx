import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, UserPlus, FileText, Receipt, FolderKanban,
  CheckSquare, Briefcase, CreditCard, Image, MessageSquare, Headphones,
  Settings, ChevronLeft, ChevronRight, Zap, Calendar, Bot, Bell, Paperclip,
  Target, UsersRound, Search, Sparkles, FilePen, BellRing, BarChart3,
  SlidersHorizontal, ChevronDown, Layers, Plug, Workflow,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUnreadMessageCount } from '@/hooks/useMessages'

interface NavItem {
  label: string
  icon: React.ElementType
  to: string
  badge?: number
}

const prospectionItems: NavItem[] = [
  { label: 'Tableau de bord',   icon: LayoutDashboard,   to: '/prospection' },
  { label: 'Prospects',         icon: UsersRound,        to: '/prospection/prospects' },
  { label: 'Pipeline',          icon: Workflow,          to: '/prospection/pipeline' },
  { label: 'Recherche',         icon: Search,            to: '/prospection/recherche' },
  { label: 'Qualification IA',  icon: Sparkles,          to: '/prospection/qualification' },
  { label: 'Brouillons',        icon: FilePen,           to: '/prospection/brouillons' },
  { label: 'Campagnes',         icon: Layers,            to: '/prospection/campagnes' },
  { label: 'Relances',          icon: BellRing,          to: '/prospection/relances' },
  { label: 'Statistiques',      icon: BarChart3,         to: '/prospection/statistiques' },
  { label: 'Connecteurs',       icon: Plug,              to: '/prospection/connecteurs' },
  { label: 'Paramètres',        icon: SlidersHorizontal, to: '/prospection/config' },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation()
  const isProspectionActive = location.pathname.startsWith('/prospection')
  const [prospOpen, setProspOpen] = useState(isProspectionActive)

  const { data: unreadMessages = 0 } = useUnreadMessageCount()

  const navItems: NavItem[] = [
    { label: 'Dashboard',     icon: LayoutDashboard, to: '/' },
    { label: 'Clients',       icon: Users,           to: '/clients' },
    { label: 'Leads',         icon: UserPlus,        to: '/leads' },
    { label: 'Devis',         icon: FileText,        to: '/devis' },
    { label: 'Factures',      icon: Receipt,         to: '/factures' },
    { label: 'Projets',       icon: FolderKanban,    to: '/projets' },
    { label: 'Tâches',        icon: CheckSquare,     to: '/taches' },
    { label: 'Services',      icon: Briefcase,       to: '/services' },
    { label: 'Paiements',     icon: CreditCard,      to: '/paiements' },
    { label: 'Portfolio',     icon: Image,           to: '/portfolio' },
    { label: 'Agenda',        icon: Calendar,        to: '/agenda' },
    { label: 'Documents',     icon: Paperclip,       to: '/documents' },
    { label: 'Loïc IA',       icon: Bot,             to: '/loic' },
    { label: 'Notifications', icon: Bell,            to: '/notifications' },
    { label: 'Messages',      icon: MessageSquare,   to: '/messages', badge: unreadMessages > 0 ? unreadMessages : undefined },
    { label: 'Support',       icon: Headphones,      to: '/support' },
    { label: 'Intégrations',  icon: Plug,            to: '/integrations' },
  ]

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

          {/* ── Section Prospection IA ────────────────────────────── */}
          <div className="pt-2">
            {collapsed ? (
              /* Sidebar réduite : icône seule liée à /prospection */
              <NavLink
                to="/prospection"
                title="Prospection IA"
                className={cn(
                  'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors group',
                  isProspectionActive
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Target className={cn('h-4 w-4 shrink-0', isProspectionActive ? 'text-brand-500' : 'text-gray-400 group-hover:text-gray-600')} />
              </NavLink>
            ) : (
              <>
                {/* Séparateur + en-tête de section */}
                <div className="mb-1 px-1">
                  <div className="h-px bg-gray-100 mb-2" />
                  <button
                    onClick={() => setProspOpen(v => !v)}
                    className={cn(
                      'w-full flex items-center gap-2 px-1.5 py-1 rounded-lg transition-colors group',
                      isProspectionActive ? 'text-brand-600' : 'text-gray-500 hover:text-gray-700'
                    )}
                  >
                    <Target className={cn('h-3.5 w-3.5 shrink-0', isProspectionActive ? 'text-brand-500' : 'text-gray-400 group-hover:text-gray-500')} />
                    <span className="text-[11px] font-bold uppercase tracking-wider flex-1 text-left">
                      Prospection IA
                    </span>
                    <ChevronDown className={cn(
                      'h-3 w-3 text-gray-400 transition-transform duration-200',
                      prospOpen && 'rotate-180'
                    )} />
                  </button>
                </div>

                {/* Sous-items */}
                {prospOpen && (
                  <div className="space-y-0.5 pl-2">
                    {prospectionItems.map(item => {
                      const Icon = item.icon
                      const isActive = item.to === '/prospection'
                        ? location.pathname === '/prospection'
                        : location.pathname.startsWith(item.to)
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          className={cn(
                            'flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm font-medium transition-colors group',
                            isActive
                              ? 'bg-brand-50 text-brand-600'
                              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                          )}
                        >
                          <Icon className={cn('h-3.5 w-3.5 shrink-0', isActive ? 'text-brand-500' : 'text-gray-400 group-hover:text-gray-500')} />
                          <span className="truncate text-[13px]">{item.label}</span>
                        </NavLink>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>
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
