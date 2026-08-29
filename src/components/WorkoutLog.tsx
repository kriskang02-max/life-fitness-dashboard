import type { Workout, WorkoutType } from '../types'

const EMOJI: Record<WorkoutType, string> = {
  Running: '🏃',
  Cycling: '🚴',
  Strength: '🏋️',
  Yoga: '🧘',
  Swimming: '🏊',
  Walking: '🚶',
}

function timeAgo(timestamp: number): string {
  const diffMin = Math.round((Date.now() - timestamp) / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.round(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.round(diffHr / 24)
  return `${diffDay}d ago`
}

interface WorkoutLogProps {
  workouts: Workout[]
}

export function WorkoutLog({ workouts }: WorkoutLogProps) {
  return (
    <div className="card">
      <h2>Recent Workouts</h2>
      <p className="subtitle">{workouts.length} logged session{workouts.length === 1 ? '' : 's'}</p>
      {workouts.length === 0 ? (
        <div className="empty">No workouts yet. Log your first session!</div>
      ) : (
        <ul className="workout-list">
          {workouts.map((w) => (
            <li className="workout-item" key={w.id}>
              <div className="workout-emoji">{EMOJI[w.type]}</div>
              <div className="workout-info">
                <div className="wtype">{w.type}</div>
                <div className="wmeta">
                  {w.durationMin} min · {timeAgo(w.timestamp)}
                </div>
              </div>
              <div className="workout-cal">{w.calories} kcal</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
