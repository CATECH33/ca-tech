import {
  LayoutDashboard, Users, Target, TrendingUp, CheckSquare,
  Calendar, FileText, Search, Bell, Plus,
} from 'lucide-react'
import { MockupFrame, AppLayout, SidebarNav, Topbar, T, Badge, UserChip, IconBtn } from './PortfolioMockupShell'
import { PF01_DATA } from './portfolioMockupData'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Clients', icon: Users },
  { label: 'Leads', icon: Target },
  { label: 'Pipeline', icon: TrendingUp },
  { label: 'Tâches', icon: CheckSquare },
  { label: 'Agenda', icon: Calendar },
  { label: 'Facturation', icon: FileText },
]

function DealCard({ deal, isWon, isLost }) {
  const tagColor = isWon ? T.colors.wonColor : isLost ? T.colors.silver : T.colors.accent
  const tagBg = isWon ? T.colors.wonSurface : isLost ? 'rgba(165,172,181,0.10)' : T.colors.accentSurface

  return (
    <article
      style={{
        background: T.colors.surfaceDeep,
        border: `1px solid ${T.colors.borderMid}`,
        borderRadius: T.radius.md,
        padding: '12px 14px',
        marginBottom: '8px',
        cursor: 'default',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '9px' }}>
        <span style={{
          fontFamily: T.fonts.display, fontSize: '12px', fontWeight: 600,
          color: T.colors.coolWhite, lineHeight: 1.2,
        }}>
          {deal.company}
        </span>
        <Badge color={tagColor} bg={tagBg} style={{ flexShrink: 0, marginLeft: '6px' }}>
          {deal.tag}
        </Badge>
      </div>

      <div style={{
        fontFamily: T.fonts.mono, fontSize: '14px', fontWeight: 700,
        color: T.colors.coolWhite, marginBottom: '8px',
      }}>
        {deal.amount}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{
            width: '48px', height: '3px', borderRadius: '2px',
            background: T.colors.border, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: '2px',
              background: isWon ? T.colors.wonColor : isLost ? T.colors.silver : T.colors.accent,
              width: deal.proba,
            }} />
          </div>
          <span style={{ fontFamily: T.fonts.mono, fontSize: '10px', color: T.colors.silver }}>
            {deal.proba}
          </span>
        </div>
        <span style={{ fontFamily: T.fonts.body, fontSize: '10px', color: 'rgba(165,172,181,0.50)' }}>
          {deal.date}
        </span>
      </div>
    </article>
  )
}

function KanbanColumn({ column }) {
  const dotColor = column.won ? T.colors.wonColor : column.lost ? T.colors.silver : T.colors.accent

  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Column header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '10px', paddingBottom: '10px',
        borderBottom: `1px solid ${T.colors.border}`,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <div style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: dotColor, flexShrink: 0,
          }} />
          <span style={{
            fontFamily: T.fonts.body, fontSize: '11px', fontWeight: 600,
            color: T.colors.coolWhite, letterSpacing: '0.03em',
          }}>
            {column.label}
          </span>
        </div>
        <span style={{
          fontFamily: T.fonts.mono, fontSize: '10px', color: T.colors.silver,
          background: T.colors.surface, padding: '2px 6px',
          borderRadius: T.radius.xs, border: `1px solid ${T.colors.border}`,
        }}>
          {column.count}
        </span>
      </div>

      {/* Cards list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {column.deals.map((deal, i) => (
          <DealCard key={i} deal={deal} isWon={column.won} isLost={column.lost} />
        ))}
      </div>
    </div>
  )
}

export function CATechManagerMockup() {
  const sidebar = (
    <SidebarNav
      logo="CA-TECH Manager"
      logoSub="CRM · Pipeline commercial"
      items={NAV_ITEMS}
      active="Pipeline"
      footer={<UserChip initials="AM" name="Alex Martin" role="Admin" />}
    />
  )

  return (
    <MockupFrame>
      <AppLayout sidebar={sidebar}>
        {/* Topbar */}
        <Topbar>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{
              fontFamily: T.fonts.display, fontSize: '16px', fontWeight: 600,
              color: T.colors.coolWhite, margin: 0, lineHeight: 1,
            }}>
              Pipeline commercial
            </h1>
            <p style={{
              fontFamily: T.fonts.body, fontSize: '11px', color: T.colors.silver,
              margin: '3px 0 0',
            }}>
              Suivi des opportunités · 15 deals actifs
            </p>
          </div>

          {/* KPIs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginRight: '8px' }}>
            {PF01_DATA.kpis.map((kpi) => (
              <div key={kpi.label} style={{ textAlign: 'right' }}>
                <div style={{
                  fontFamily: T.fonts.mono, fontSize: '15px', fontWeight: 700,
                  color: T.colors.coolWhite, lineHeight: 1,
                }}>
                  {kpi.value}
                </div>
                <div style={{ fontFamily: T.fonts.body, fontSize: '10px', color: T.colors.silver, marginTop: '2px' }}>
                  {kpi.label}
                </div>
              </div>
            ))}
          </div>

          <div style={{ width: '1px', height: '28px', background: T.colors.border, flexShrink: 0 }} />

          <IconBtn aria-label="Rechercher">
            <Search size={14} color={T.colors.silver} aria-hidden="true" />
          </IconBtn>

          <IconBtn aria-label="Notifications">
            <Bell size={14} color={T.colors.silver} aria-hidden="true" />
          </IconBtn>

          <button
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px',
              background: T.colors.accent, border: 'none',
              borderRadius: T.radius.sm,
              fontFamily: T.fonts.body, fontSize: '12px', fontWeight: 500,
              color: '#fff', cursor: 'default', flexShrink: 0,
            }}
          >
            <Plus size={13} aria-hidden="true" />
            Nouveau deal
          </button>

          <div style={{
            width: '30px', height: '30px', borderRadius: '50%',
            background: T.colors.techBlue, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: T.fonts.mono, fontSize: '10px', color: T.colors.coolWhite, fontWeight: 700 }}>
              AM
            </span>
          </div>
        </Topbar>

        {/* Kanban board */}
        <div style={{
          flex: 1, overflow: 'hidden',
          padding: '20px 24px',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            display: 'flex', gap: '14px',
            flex: 1, overflow: 'hidden',
          }}>
            {PF01_DATA.columns.map((col) => (
              <KanbanColumn key={col.id} column={col} />
            ))}
          </div>
        </div>
      </AppLayout>
    </MockupFrame>
  )
}
