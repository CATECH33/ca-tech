// Shared design tokens + layout primitives for all 4 portfolio mockups

export const T = {
  colors: {
    deepNavy: '#05101E',
    navy: '#102740',
    techBlue: '#1A4066',
    accent: '#359BD9',
    silver: '#A5ACB5',
    lightSilver: '#E0E0E3',
    coolWhite: '#F2F4F6',
    border: 'rgba(165,172,181,0.08)',
    borderMid: 'rgba(165,172,181,0.14)',
    surface: 'rgba(16,39,64,0.55)',
    surfaceDeep: 'rgba(5,16,30,0.70)',
    accentSurface: 'rgba(53,155,217,0.08)',
    accentBorder: 'rgba(53,155,217,0.18)',
    wonColor: '#4ADE80',
    wonSurface: 'rgba(74,222,128,0.10)',
  },
  fonts: {
    display: '"Space Grotesk", sans-serif',
    body: '"Inter", sans-serif',
    mono: '"JetBrains Mono", monospace',
  },
  radius: {
    xs: '3px',
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
}

/** Full-viewport frame — wraps a single mockup */
export function MockupFrame({ id, children, style = {} }) {
  return (
    <div
      id={id}
      style={{
        width: '100%',
        height: '100%',
        background: T.colors.deepNavy,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: T.fonts.body,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/** Sidebar + main area split */
export function AppLayout({ sidebar, children }) {
  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {sidebar}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {children}
      </div>
    </div>
  )
}

/** Left navigation sidebar */
export function SidebarNav({ logo, logoSub, items, active, footer }) {
  return (
    <div
      style={{
        width: '196px',
        flexShrink: 0,
        background: T.colors.navy,
        borderRight: `1px solid ${T.colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        userSelect: 'none',
      }}
      aria-label="Navigation principale"
    >
      {/* Logo */}
      <div style={{ padding: '16px 16px 13px', borderBottom: `1px solid ${T.colors.border}` }}>
        <div style={{
          fontFamily: T.fonts.display, fontSize: '13px', fontWeight: 700,
          color: T.colors.coolWhite, letterSpacing: '-0.01em', lineHeight: 1.2,
        }}>
          {logo}
        </div>
        {logoSub && (
          <div style={{ fontFamily: T.fonts.body, fontSize: '10px', color: T.colors.silver, marginTop: '3px' }}>
            {logoSub}
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ padding: '10px 8px', flex: 1, overflowY: 'auto' }}>
        {items.map((item) => {
          const isActive = item.label === active
          const Icon = item.icon
          return (
            <div
              key={item.label}
              role="menuitem"
              aria-current={isActive ? 'page' : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: '9px',
                padding: '7px 10px 7px 9px',
                borderRadius: T.radius.sm,
                marginBottom: '1px',
                background: isActive ? T.colors.accentSurface : 'transparent',
                borderLeft: `2px solid ${isActive ? T.colors.accent : 'transparent'}`,
                cursor: 'default',
                transition: 'background 0.15s ease',
              }}
            >
              <Icon size={14} color={isActive ? T.colors.accent : T.colors.silver} aria-hidden="true" />
              <span style={{
                fontFamily: T.fonts.body, fontSize: '13px',
                fontWeight: isActive ? 500 : 400,
                color: isActive ? T.colors.coolWhite : T.colors.silver,
              }}>
                {item.label}
              </span>
            </div>
          )
        })}
      </nav>

      {/* Footer slot */}
      {footer && (
        <div style={{ padding: '12px 14px', borderTop: `1px solid ${T.colors.border}` }}>
          {footer}
        </div>
      )}
    </div>
  )
}

/** Top application header bar */
export function Topbar({ children }) {
  return (
    <div
      style={{
        height: '56px',
        flexShrink: 0,
        background: T.colors.deepNavy,
        borderBottom: `1px solid ${T.colors.border}`,
        display: 'flex', alignItems: 'center',
        padding: '0 24px', gap: '12px',
      }}
    >
      {children}
    </div>
  )
}

/** Generic surface card */
export function Card({ children, style = {} }) {
  return (
    <div style={{
      background: T.colors.surface,
      border: `1px solid ${T.colors.border}`,
      borderRadius: T.radius.lg,
      ...style,
    }}>
      {children}
    </div>
  )
}

/** Small pill badge */
export function Badge({ children, color, bg, style = {} }) {
  const c = color || T.colors.accent
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 7px',
      borderRadius: '4px',
      fontFamily: T.fonts.body,
      fontSize: '10px', fontWeight: 500,
      color: c,
      background: bg || `${c}18`,
      letterSpacing: '0.01em',
      lineHeight: 1.4,
      ...style,
    }}>
      {children}
    </span>
  )
}

/** Section label (eyebrow style) */
export function SectionLabel({ children, style = {} }) {
  return (
    <div style={{
      fontFamily: T.fonts.body,
      fontSize: '10px', fontWeight: 600,
      color: T.colors.silver,
      textTransform: 'uppercase', letterSpacing: '0.07em',
      marginBottom: '12px',
      ...style,
    }}>
      {children}
    </div>
  )
}

/** User avatar chip for sidebar footer */
export function UserChip({ initials = 'AM', name = 'Alex Martin', role = 'Admin' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%',
        background: T.colors.techBlue,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <span style={{ fontFamily: T.fonts.mono, fontSize: '10px', color: T.colors.coolWhite, fontWeight: 700 }}>
          {initials}
        </span>
      </div>
      <div>
        <div style={{ fontFamily: T.fonts.body, fontSize: '12px', fontWeight: 500, color: T.colors.coolWhite }}>
          {name}
        </div>
        <div style={{ fontFamily: T.fonts.body, fontSize: '10px', color: T.colors.silver }}>
          {role}
        </div>
      </div>
    </div>
  )
}

/** Icon button (topbar actions) */
export function IconBtn({ children, 'aria-label': ariaLabel }) {
  return (
    <button
      aria-label={ariaLabel}
      style={{
        width: '32px', height: '32px', flexShrink: 0,
        borderRadius: T.radius.sm,
        background: T.colors.surface,
        border: `1px solid ${T.colors.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'default',
      }}
    >
      {children}
    </button>
  )
}
