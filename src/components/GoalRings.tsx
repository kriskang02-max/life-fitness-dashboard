import type { Goals } from '../types'

interface GoalProgress {
  steps: number
  calories: number
  activeMin: number
}

interface GoalRingsProps {
  today: GoalProgress
  goals: Goals
}

interface Row {
  name: string
  current: number
  goal: number
  unit: string
  color: string
}

function pct(current: number, goal: number): number {
  return Math.min(100, Math.round((current / goal) * 100))
}

export function GoalRings({ today, goals }: GoalRingsProps) {
  const rows: Row[] = [
    { name: 'Steps', current: today.steps, goal: goals.steps, unit: 'steps', color: '#22c55e' },
    { name: 'Calories', current: today.calories, goal: goals.calories, unit: 'kcal', color: '#f97316' },
    { name: 'Active Minutes', current: today.activeMin, goal: goals.activeMin, unit: 'min', color: '#38bdf8' },
  ]

  return (
    <div className="card">
      <h2>Today's Goals</h2>
      <p className="subtitle">Progress toward your daily targets</p>
      <div className="rings">
        {rows.map((row) => {
          const percent = pct(row.current, row.goal)
          return (
            <div className="ring-row" key={row.name}>
              <div className="ring-meta">
                <div className="ring-name">{row.name}</div>
                <div className="ring-sub">
                  {row.current.toLocaleString()} / {row.goal.toLocaleString()} {row.unit} · {percent}%
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${percent}%`, background: row.color }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
