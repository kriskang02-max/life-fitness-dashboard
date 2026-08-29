export type WorkoutType =
  | 'Running'
  | 'Cycling'
  | 'Strength'
  | 'Yoga'
  | 'Swimming'
  | 'Walking'

export interface Workout {
  id: string
  type: WorkoutType
  durationMin: number
  calories: number
  timestamp: number
}

export interface DayActivity {
  day: string
  steps: number
  calories: number
  activeMin: number
}

export interface Goals {
  steps: number
  calories: number
  activeMin: number
}
