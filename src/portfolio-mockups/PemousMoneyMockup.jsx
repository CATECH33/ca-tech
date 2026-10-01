import {
  LayoutDashboard, CreditCard, ArrowLeftRight, TrendingUp,
  PieChart, Bell, Search, ArrowUpRight, ArrowDownRight,
} from 'lucide-react'
import { MockupFrame, AppLayout, SidebarNav, Topbar, T, Card, Badge, SectionLabel, UserChip, IconBtn } from './PortfolioMockupShell'
import { PF04_DATA } from './portfolioMockupData'

const NAV_ITEMS = [
  { label: 'Vue générale', icon: LayoutDashboard },
  { label: 'Comptes', icon: CreditCard },
  { label: 'Transactions', icon: ArrowLeftRight },
  { label: 'Investissements', icon: TrendingUp },
  { label: 'Budgets', icon: PieChart },
]

function PerformanceChart({ data, months }) {
  const W = 580
  const H = 160
  const PAD_TOP = 12
  const PAD_BOTTOM = 28
  const PAD_LR = 8
  const chartH = H - PAD_TOP - PAD_BOTTOM
  const chartW = W - PAD_LR * 2

  const xs = data.map((_, i) => PAD_LR + (i / (data.length - 1)) * chartW)
  const ys = data.map((v) => PAD_TOP + chartH - (v / 100) * chartH)

  // Smooth bezier curve
  const linePath = xs.reduce((acc, x, i) => {
    if (i === 0) return `M ${x} ${ys[i]}`
    const px = xs[i - 1]
    const py = ys[i - 1]
    const cpx = (px + x) / 2
    return `${acc} C ${cpx} ${py} ${cpx} ${ys[i]} ${x} ${ys[i]}`
  }, '')

  const chartBottom = PAD_TOP + chartH
  const areaPath = `${linePath} L ${xs[xs.length - 1]} ${chartBottom} L ${xs[0]} ${chartBottom} Z`

  // Grid lines (3 horizontal)
  const gridYs = [0.25, 0.5, 0.75].map((p) => PAD_TOP + chartH * (1 - p))

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ width: '100%', height: '100%', display: 'block' }}
      role="img"
      aria-label="Graphique de performance 12 mois"
    >
      <defs>
        <linearGradient id="pf04AreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#359BD9" stopOpacity="0.20" />
          <stop offset="100%" stopColor="#359BD9" stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {gridYs.map((y, i) => (
        <line
          key={i}
          x1={PAD_LR} y1={y} x2={W - PAD_LR} y2={y}
          stroke="rgba(165,172,181,0.07)" strokeWidth="1"
        />
      ))}

      {/* Area fill */}
      <path d={areaPath} fill="url(#pf04AreaGrad)" />

      {/* Line */}
      <path d={linePath} stroke="#359BD9" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* Last point dot */}
      <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="3.5" fill="#359BD9" />

      {/* Month labels */}
      {months.map((m, i) => (
        i % 2 === 0 && (
          <text
            key={i}
            x={xs[i]} y={H - 4}
            textAnchor="middle"
            fill="rgba(165,172,181,0.60)"
            fontSize="9"
            fontFamily="Inter, sans-serif"
          >
            {m}
          </text>
        )
      ))}
    </svg>
  )
}

function AllocationBar({ items }) {
  return (
    <div>
      {/* Stacked bar */}
      <div style={{
        display: 'flex', borderRadius: T.radius.sm, overflow: 'hidden',
        height: '8px', marginBottom: '14px',
      }}>
        {items.map((item) => (
          <div
            key={item.label}
            style={{ width: `${item.pct}%`, background: item.color }}
            aria-label={`${item.label} : ${item.pct} %`}
          />
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: item.color, flexShrink: 0 }} />
              <span style={{ fontFamily: T.fonts.body, fontSize: '12px', color: T.colors.lightSilver }}>
                {item.label}
              </span>
            </div>
            <span style={{ fontFamily: T.fonts.mono, fontSize: '12px', fontWeight: 600, color: T.colors.coolWhite }}>
              {item.pct} %
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TransactionRow({ tx, isLast }) {
  return (
    <tr style={{ borderBottom: isLast ? 'none' : `1px solid ${T.colors.border}` }}>
      <td style={{ padding: '10px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: T.radius.sm, flexShrink: 0,
          background: tx.positive ? T.colors.wonSurface : 'rgba(165,172,181,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {tx.positive
            ? <ArrowUpRight size={13} color={T.colors.wonColor} aria-hidden="true" />
            : <ArrowDownRight size={13} color={T.colors.silver} aria-hidden="true" />}
        </div>
        <div>
          <div style={{ fontFamily: T.fonts.body, fontSize: '13px', fontWeight: 500, color: T.colors.coolWhite }}>
            {tx.label}
          </div>
          <div style={{ fontFamily: T.fonts.body, fontSize: '10px', color: T.colors.silver }}>
            {tx.date}
          </div>
        </div>
      </td>
      <td style={{ textAlign: 'right', padding: '10px 0', verticalAlign: 'middle' }}>
        <span style={{
          fontFamily: T.fonts.mono, fontSize: '13px', fontWeight: 600,
          color: tx.positive ? T.colors.wonColor : T.colors.lightSilver,
        }}>
          {tx.amount}
        </span>
      </td>
    </tr>
  )
}

export function PemousMoneyMockup() {
  const sidebar = (
    <SidebarNav
      logo="Pemou's Money"
      logoSub="Gestion patrimoniale"
      items={NAV_ITEMS}
      active="Vue générale"
      footer={<UserChip initials="PM" name="P. Moustaskit" role="Titulaire" />}
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
              Vue financière
            </h1>
            <p style={{ fontFamily: T.fonts.body, fontSize: '11px', color: T.colors.silver, margin: '3px 0 0' }}>
              Mis à jour le 01 oct. 2026
            </p>
          </div>

          {PF04_DATA.metrics.map((m) => (
            <div key={m.label} style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: T.fonts.mono, fontSize: '14px', fontWeight: 700, color: T.colors.coolWhite, lineHeight: 1 }}>
                {m.value}
              </div>
              <div style={{ fontFamily: T.fonts.body, fontSize: '10px', color: T.colors.silver, marginTop: '2px' }}>
                {m.label}
              </div>
            </div>
          ))}

          <div style={{ width: '1px', height: '28px', background: T.colors.border, flexShrink: 0 }} />

          <IconBtn aria-label="Rechercher">
            <Search size={14} color={T.colors.silver} aria-hidden="true" />
          </IconBtn>
          <IconBtn aria-label="Notifications">
            <Bell size={14} color={T.colors.silver} aria-hidden="true" />
          </IconBtn>

          <div style={{
            width: '30px', height: '30px', borderRadius: '50%', background: T.colors.techBlue,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ fontFamily: T.fonts.mono, fontSize: '10px', color: T.colors.coolWhite, fontWeight: 700 }}>PM</span>
          </div>
        </Topbar>

        {/* Main content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Balance header card */}
          <Card style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div>
              <SectionLabel>Valeur totale du portefeuille</SectionLabel>
              <div style={{ fontFamily: T.fonts.mono, fontSize: '32px', fontWeight: 800, color: T.colors.coolWhite, lineHeight: 1 }}>
                {PF04_DATA.balance}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                <Badge color={T.colors.wonColor} bg={T.colors.wonSurface} style={{ fontSize: '12px', padding: '3px 10px' }}>
                  <ArrowUpRight size={10} style={{ marginRight: '3px' }} aria-hidden="true" />
                  {PF04_DATA.variation}
                </Badge>
                <span style={{ fontFamily: T.fonts.body, fontSize: '11px', color: T.colors.silver }}>
                  Depuis le début de l'année · {PF04_DATA.ytd}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={{
                padding: '8px 16px', borderRadius: T.radius.sm,
                background: T.colors.accent, border: 'none',
                fontFamily: T.fonts.body, fontSize: '12px', fontWeight: 600, color: '#fff', cursor: 'default',
              }}>
                Investir
              </button>
              <button style={{
                padding: '8px 16px', borderRadius: T.radius.sm,
                background: T.colors.surface, border: `1px solid ${T.colors.border}`,
                fontFamily: T.fonts.body, fontSize: '12px', fontWeight: 500, color: T.colors.lightSilver, cursor: 'default',
              }}>
                Virement
              </button>
            </div>
          </Card>

          {/* Charts row */}
          <div style={{ display: 'flex', gap: '16px', flex: 1, minHeight: 0 }}>
            {/* Performance chart */}
            <Card style={{ flex: '0 0 62%', padding: '18px 20px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexShrink: 0 }}>
                <SectionLabel style={{ marginBottom: 0 }}>Performance 12 mois</SectionLabel>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {['3M', '6M', '1A', '3A'].map((p, i) => (
                    <button key={p} style={{
                      padding: '2px 8px', borderRadius: T.radius.xs,
                      background: i === 2 ? T.colors.accent : T.colors.surface,
                      border: `1px solid ${i === 2 ? T.colors.accent : T.colors.border}`,
                      fontFamily: T.fonts.mono, fontSize: '10px',
                      color: i === 2 ? '#fff' : T.colors.silver, cursor: 'default',
                    }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, minHeight: 0 }}>
                <PerformanceChart data={PF04_DATA.performance} months={PF04_DATA.months} />
              </div>
            </Card>

            {/* Allocation */}
            <Card style={{ flex: 1, padding: '18px 20px', display: 'flex', flexDirection: 'column' }}>
              <SectionLabel>Allocation</SectionLabel>
              <AllocationBar items={PF04_DATA.allocation} />

              {/* Total by class */}
              <div style={{ marginTop: '16px', borderTop: `1px solid ${T.colors.border}`, paddingTop: '14px' }}>
                <SectionLabel>Valeur estimée</SectionLabel>
                {PF04_DATA.allocation.map((item) => {
                  const val = (84520 * item.pct / 100).toLocaleString('fr-FR')
                  return (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
                      <span style={{ fontFamily: T.fonts.body, fontSize: '12px', color: T.colors.silver }}>{item.label}</span>
                      <span style={{ fontFamily: T.fonts.mono, fontSize: '12px', fontWeight: 600, color: T.colors.coolWhite }}>
                        €{val}
                      </span>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>

          {/* Transactions */}
          <Card style={{ padding: '18px 20px', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <SectionLabel style={{ marginBottom: 0 }}>Transactions récentes</SectionLabel>
              <button style={{
                background: 'none', border: 'none', cursor: 'default',
                fontFamily: T.fonts.body, fontSize: '11px', color: T.colors.accent,
              }}>
                Voir tout
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {PF04_DATA.transactions.map((tx, i) => (
                  <TransactionRow key={i} tx={tx} isLast={i === PF04_DATA.transactions.length - 1} />
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </AppLayout>
    </MockupFrame>
  )
}
