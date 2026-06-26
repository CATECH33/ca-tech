import { useState } from 'react'
import { Bell, Search, LogOut, User, ChevronDown } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import type { Notification } from '@/types'

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', created_at: new Date().toISOString(), titre: 'Nouveau devis accepté', corps: 'Le devis DEV-2024-041 a été accepté par Martin SARL.', type: 'success', lu: false, lien: '/devis' },
  { id: '2', created_at: new Date(Date.now() - 3600000).toISOString(), titre: 'Facture en retard', corps: 'La facture FAC-2024-018 est en retard de 5 jours.', type: 'warning', lu: false, lien: '/factures' },
  { id: '3', created_at: new Date(Date.now() - 86400000).toISOString(), titre: 'Nouveau lead', corps: 'Un nouveau lead a rempli le formulaire de contact.', type: 'info', lu: true, lien: '/leads' },
]

const notifColors: Record<string, string> = {
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  error: 'bg-red-50 text-red-600',
  info: 'bg-blue-50 text-blue-600',
}

interface HeaderProps {
  sidebarWidth: number
}

export function Header({ sidebarWidth }: HeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const unread = MOCK_NOTIFICATIONS.filter(n => !n.lu).length

  return (
    <header
      className="fixed top-0 right-0 h-14 bg-white border-b border-gray-100 z-20 flex items-center px-4 gap-3 transition-all duration-300"
      style={{ left: sidebarWidth }}
    >
      {/* Search */}
      <div className="relative flex-1 max-w-xs hidden md:flex items-center">
        <Search className="absolute left-2.5 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
        <input
          placeholder="Rechercher…"
          className="w-full h-8 pl-8 pr-3 text-sm rounded-lg border border-gray-200 bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
        />
        <span className="absolute right-2.5 text-[10px] text-gray-400 bg-gray-100 rounded px-1 py-0.5 hidden lg:block">⌘K</span>
      </div>

      <div className="flex-1 md:hidden" />

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => { setNotifOpen(v => !v); setUserOpen(false) }}
          className="relative h-8 w-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-brand-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
              {unread}
            </span>
          )}
        </button>

        {notifOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
            <div className="absolute right-0 top-10 w-80 bg-white border border-gray-100 rounded-xl shadow-modal z-50 overflow-hidden animate-slide-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-900">Notifications</span>
                {unread > 0 && <span className="text-xs text-brand-500 font-medium">{unread} non lues</span>}
              </div>
              <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                {MOCK_NOTIFICATIONS.map(n => (
                  <div key={n.id} className={cn('flex gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition', !n.lu && 'bg-blue-50/30')}>
                    <span className={cn('h-7 w-7 rounded-lg flex items-center justify-center text-xs shrink-0 mt-0.5', notifColors[n.type])}>
                      {n.type === 'success' ? '✓' : n.type === 'warning' ? '!' : 'i'}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{n.titre}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.corps}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{formatDate(n.created_at, 'dd/MM à HH:mm')}</p>
                    </div>
                    {!n.lu && <span className="h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0 mt-2" />}
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-gray-100 text-center">
                <button className="text-xs text-brand-500 font-medium hover:underline">Voir tout</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => { setUserOpen(v => !v); setNotifOpen(false) }}
          className="flex items-center gap-2 h-8 pl-1 pr-2 rounded-lg hover:bg-gray-100 transition"
        >
          <Avatar nom="Dupont" prenom="Jean" size="sm" />
          <span className="text-sm font-medium text-gray-700 hidden sm:block">Jean Dupont</span>
          <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
        </button>

        {userOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setUserOpen(false)} />
            <div className="absolute right-0 top-10 w-52 bg-white border border-gray-100 rounded-xl shadow-modal z-50 overflow-hidden animate-slide-in">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">Jean Dupont</p>
                <p className="text-xs text-gray-500">admin@ca-tech.fr</p>
              </div>
              <div className="p-1">
                <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition">
                  <User className="h-4 w-4 text-gray-400" />Mon profil
                </button>
                <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition">
                  <LogOut className="h-4 w-4" />Se déconnecter
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
