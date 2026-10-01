import {
  LayoutDashboard, FileText, BarChart2, Layout, Download,
  Search, Bell, ChevronRight, CheckCircle, AlertCircle,
} from 'lucide-react'
import { MockupFrame, AppLayout, SidebarNav, Topbar, T, Badge, SectionLabel, UserChip, IconBtn } from './PortfolioMockupShell'
import { PF02_DATA } from './portfolioMockupData'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Mon CV', icon: FileText },
  { label: 'Analyse', icon: BarChart2 },
  { label: 'Modèles', icon: Layout },
  { label: 'Export', icon: Download },
]

function ScoreRing({ score }) {
  const r = 36
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <svg width="88" height="88" viewBox="0 0 88 88" aria-label={`Score ${score} sur 100`}>
      <circle cx="44" cy="44" r={r} fill="none" stroke={T.colors.border} strokeWidth="6" />
      <circle
        cx="44" cy="44" r={r}
        fill="none" stroke={T.colors.accent} strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 44 44)"
      />
      <text x="44" y="40" textAnchor="middle" fill={T.colors.coolWhite} fontSize="18" fontWeight="700" fontFamily="JetBrains Mono, monospace">
        {score}
      </text>
      <text x="44" y="54" textAnchor="middle" fill={T.colors.silver} fontSize="10" fontFamily="Inter, sans-serif">
        / 100
      </text>
    </svg>
  )
}

function AnalysisBar({ label, value }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span style={{ fontFamily: T.fonts.body, fontSize: '12px', color: T.colors.lightSilver }}>{label}</span>
        <span style={{ fontFamily: T.fonts.mono, fontSize: '11px', color: T.colors.accent }}>{value}</span>
      </div>
      <div style={{ height: '4px', borderRadius: '2px', background: T.colors.border, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: '2px',
          background: value >= 90 ? T.colors.accent : value >= 75 ? T.colors.accent : '#4AAEE0',
          width: `${value}%`,
        }} />
      </div>
    </div>
  )
}

function CVPreview({ cv }) {
  return (
    <div style={{
      background: '#F8F9FA',
      borderRadius: T.radius.lg,
      padding: '24px 20px',
      height: '100%',
      overflowY: 'auto',
      color: '#1A2332',
    }}>
      {/* Header */}
      <div style={{ borderBottom: '2px solid #1A4066', paddingBottom: '14px', marginBottom: '16px' }}>
        <h2 style={{ fontFamily: T.fonts.display, fontSize: '18px', fontWeight: 700, color: '#05101E', margin: '0 0 4px' }}>
          {cv.name}
        </h2>
        <p style={{ fontFamily: T.fonts.body, fontSize: '12px', color: '#1A4066', fontWeight: 600, margin: '0 0 6px' }}>
          {cv.title}
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[cv.location, cv.email, cv.phone].map((item) => (
            <span key={item} style={{ fontFamily: T.fonts.body, fontSize: '10px', color: '#4A5568' }}>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{
          fontFamily: T.fonts.body, fontSize: '10px', fontWeight: 700,
          color: '#1A4066', letterSpacing: '0.08em', textTransform: 'uppercase',
          margin: '0 0 10px',
        }}>
          Expérience professionnelle
        </h3>
        {cv.experience.map((exp) => (
          <div key={exp.company} style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span style={{ fontFamily: T.fonts.body, fontSize: '12px', fontWeight: 600, color: '#1A2332' }}>
                {exp.role}
              </span>
              <span style={{ fontFamily: T.fonts.body, fontSize: '10px', color: '#718096' }}>
                {exp.period}
              </span>
            </div>
            <div style={{ fontFamily: T.fonts.body, fontSize: '11px', color: '#4A5568', marginBottom: '5px' }}>
              {exp.company}
            </div>
            {exp.bullets.map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '2px' }}>
                <span style={{ color: '#1A4066', fontSize: '10px', marginTop: '1px', flexShrink: 0 }}>›</span>
                <span style={{ fontFamily: T.fonts.body, fontSize: '10px', color: '#4A5568', lineHeight: 1.4 }}>{b}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Skills */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{
          fontFamily: T.fonts.body, fontSize: '10px', fontWeight: 700,
          color: '#1A4066', letterSpacing: '0.08em', textTransform: 'uppercase',
          margin: '0 0 8px',
        }}>
          Compétences techniques
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {cv.skills.map((s) => (
            <span key={s} style={{
              fontFamily: T.fonts.body, fontSize: '10px',
              padding: '2px 8px',
              borderRadius: '3px',
              background: '#EBF4FF',
              color: '#1A4066',
              border: '1px solid #BEE3F8',
            }}>
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Education */}
      <div>
        <h3 style={{
          fontFamily: T.fonts.body, fontSize: '10px', fontWeight: 700,
          color: '#1A4066', letterSpacing: '0.08em', textTransform: 'uppercase',
          margin: '0 0 6px',
        }}>
          Formation
        </h3>
        <p style={{ fontFamily: T.fonts.body, fontSize: '11px', color: '#4A5568', margin: 0 }}>
          {cv.education}
        </p>
      </div>
    </div>
  )
}

function AnalysisPanel({ analysis }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px', overflowY: 'auto' }}>
      {/* Score card */}
      <div style={{
        background: T.colors.surface,
        border: `1px solid ${T.colors.accentBorder}`,
        borderRadius: T.radius.lg,
        padding: '20px',
        display: 'flex', alignItems: 'center', gap: '20px',
        flexShrink: 0,
      }}>
        <ScoreRing score={analysis.score} />
        <div>
          <h3 style={{
            fontFamily: T.fonts.display, fontSize: '16px', fontWeight: 700,
            color: T.colors.coolWhite, margin: '0 0 6px',
          }}>
            Score global
          </h3>
          <Badge color={T.colors.wonColor} bg={T.colors.wonSurface} style={{ marginBottom: '8px', display: 'inline-flex' }}>
            <CheckCircle size={9} style={{ marginRight: '4px' }} aria-hidden="true" />
            {analysis.ats}
          </Badge>
          <p style={{
            fontFamily: T.fonts.body, fontSize: '11px', color: T.colors.silver, margin: 0,
          }}>
            Supérieur à 78 % des CV analysés
          </p>
        </div>
      </div>

      {/* Section scores */}
      <div style={{
        background: T.colors.surface,
        border: `1px solid ${T.colors.border}`,
        borderRadius: T.radius.lg,
        padding: '18px 20px',
        flexShrink: 0,
      }}>
        <SectionLabel>Analyse détaillée</SectionLabel>
        {analysis.sections.map((s) => (
          <AnalysisBar key={s.label} label={s.label} value={s.value} />
        ))}
      </div>

      {/* Recommendations */}
      <div style={{
        background: T.colors.surface,
        border: `1px solid ${T.colors.border}`,
        borderRadius: T.radius.lg,
        padding: '18px 20px',
        flex: 1,
      }}>
        <SectionLabel>Recommandations</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {analysis.recommendations.map((rec, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <AlertCircle size={13} color={T.colors.accent} style={{ marginTop: '1px', flexShrink: 0 }} aria-hidden="true" />
              <p style={{ fontFamily: T.fonts.body, fontSize: '12px', color: T.colors.lightSilver, margin: 0, lineHeight: 1.4 }}>
                {rec}
              </p>
            </div>
          ))}
        </div>

        <button style={{
          marginTop: '16px', width: '100%', padding: '9px',
          background: T.colors.accent, border: 'none', borderRadius: T.radius.sm,
          fontFamily: T.fonts.body, fontSize: '12px', fontWeight: 600,
          color: '#fff', cursor: 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        }}>
          Améliorer mon CV
          <ChevronRight size={13} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

export function CVMagicMockup() {
  const { cv, analysis } = PF02_DATA

  const sidebar = (
    <SidebarNav
      logo="CV Magic"
      logoSub="IA · Optimisation · Export"
      items={NAV_ITEMS}
      active="Mon CV"
      footer={<UserChip initials="AM" name="Alexandre M." role="Pro" />}
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
              Mon CV
            </h1>
            <p style={{ fontFamily: T.fonts.body, fontSize: '11px', color: T.colors.silver, margin: '3px 0 0' }}>
              Dernière mise à jour — 30 sept. 2026
            </p>
          </div>

          <Badge color={T.colors.wonColor} bg={T.colors.wonSurface} style={{ fontSize: '11px', padding: '4px 10px' }}>
            Score 92/100
          </Badge>

          <IconBtn aria-label="Rechercher">
            <Search size={14} color={T.colors.silver} aria-hidden="true" />
          </IconBtn>
          <IconBtn aria-label="Notifications">
            <Bell size={14} color={T.colors.silver} aria-hidden="true" />
          </IconBtn>

          <button style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 14px', background: T.colors.accent, border: 'none',
            borderRadius: T.radius.sm, fontFamily: T.fonts.body, fontSize: '12px',
            fontWeight: 500, color: '#fff', cursor: 'default', flexShrink: 0,
          }}>
            <Download size={13} aria-hidden="true" />
            Exporter
          </button>

          <div style={{
            width: '30px', height: '30px', borderRadius: '50%', background: T.colors.techBlue,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ fontFamily: T.fonts.mono, fontSize: '10px', color: T.colors.coolWhite, fontWeight: 700 }}>AM</span>
          </div>
        </Topbar>

        {/* Main split-screen content */}
        <div style={{
          flex: 1, overflow: 'hidden',
          padding: '20px 24px',
          display: 'flex', gap: '20px',
        }}>
          {/* Left: CV preview */}
          <div style={{ flex: '0 0 52%', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{
              fontFamily: T.fonts.body, fontSize: '10px', fontWeight: 600,
              color: T.colors.silver, textTransform: 'uppercase', letterSpacing: '0.07em',
              marginBottom: '10px',
            }}>
              Aperçu du document
            </div>
            <CVPreview cv={cv} />
          </div>

          {/* Divider */}
          <div style={{ width: '1px', background: T.colors.border, flexShrink: 0 }} />

          {/* Right: Analysis */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{
              fontFamily: T.fonts.body, fontSize: '10px', fontWeight: 600,
              color: T.colors.silver, textTransform: 'uppercase', letterSpacing: '0.07em',
              marginBottom: '10px',
            }}>
              Analyse IA
            </div>
            <AnalysisPanel analysis={analysis} />
          </div>
        </div>
      </AppLayout>
    </MockupFrame>
  )
}
