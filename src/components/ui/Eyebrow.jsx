export function Eyebrow({ children, className = '', as: Tag = 'span' }) {
  return (
    <Tag
      className={className}
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'rgba(53,155,217,0.75)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <span style={{
        display: 'inline-block',
        width: '18px',
        height: '1px',
        background: 'rgba(53,155,217,0.50)',
        flexShrink: 0,
      }} />
      {children}
    </Tag>
  )
}
