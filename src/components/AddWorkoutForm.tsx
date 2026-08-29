import { useState } from 'react'
import { CALORIE_PER_MIN } from '../data'
import type { WorkoutType } from '../types'

const WORKOUT_TYPES: WorkoutType[] = [
  'Running',
  'Cycling',
  'Strength',
  'Yoga',
  'Swimming',
  'Walking',
]

interface AddWorkoutFormProps {
  onAdd: (type: WorkoutType, durationMin: number, calories: number) => void
}

export function AddWorkoutForm({ onAdd }: AddWorkoutFormProps) {
  const [type, setType] = useState<WorkoutType>('Running')
  const [duration, setDuration] = useState('30')

  const durationNum = Number(duration) || 0
  const estCalories = Math.round(durationNum * CALORIE_PER_MIN[type])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (durationNum <= 0) return
    onAdd(type, durationNum, estCalories)
    setDuration('30')
  }

  return (
    <div className="card">
      <h2>Log a Workout</h2>
      <p className="subtitle">Add a session to update today's totals</p>
      <form className="workout-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="wtype">Activity</label>
          <select
            id="wtype"
            value={type}
            onChange={(e) => setType(e.target.value as WorkoutType)}
          >
            {WORKOUT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="wduration">Duration (min)</label>
          <input
            id="wduration"
            type="number"
            min="1"
            max="600"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>
        <div className="full">
          <p className="calorie-preview">
            Estimated burn: <strong>{estCalories} kcal</strong>
          </p>
        </div>
        <div className="full">
          <button className="btn" type="submit">
            Add Workout
          </button>
        </div>
      </form>
    </div>
  )
}
