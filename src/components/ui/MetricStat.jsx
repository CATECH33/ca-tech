// MetricStat — valeur proéminente + label caption
export function MetricStat({ value, label, className = '' }) {
  return (
    <div className={className}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '28px',
        fontWeight: 600,
        color: '#359BD9',
        lineHeight: 1.1,
        letterSpacing: '-0.01em',
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: 'var(--font-body)',
        fontSize: '12px',
        color: '#A5ACB5',
        marginTop: '6px',
        lineHeight: 1.4,
      }}>
        {label}
      </div>
    </div>
  )
}
