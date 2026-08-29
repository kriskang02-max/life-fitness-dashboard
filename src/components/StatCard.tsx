interface StatCardProps {
  icon: string
  label: string
  value: string
  unit?: string
  delta?: string
  deltaDir?: 'up' | 'down'
}

export function StatCard({ icon, label, value, unit, delta, deltaDir }: StatCardProps) {
  return (
    <div className="card stat-card">
      <div className="stat-top">
        <div className="stat-icon">{icon}</div>
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">
        {value}
        {unit ? <span>{unit}</span> : null}
      </div>
      {delta ? (
        <div className={`stat-delta ${deltaDir ?? 'up'}`}>
          {deltaDir === 'down' ? '▼' : '▲'} {delta}
        </div>
      ) : null}
    </div>
  )
}
