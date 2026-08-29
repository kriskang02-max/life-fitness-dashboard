import type { DayActivity, Goals, Workout, WorkoutType } from './types'

export const GOALS: Goals = {
  steps: 10000,
  calories: 700,
  activeMin: 45,
}

export const WEEKLY_ACTIVITY: DayActivity[] = [
  { day: 'Mon', steps: 8420, calories: 540, activeMin: 38 },
  { day: 'Tue', steps: 11230, calories: 720, activeMin: 52 },
  { day: 'Wed', steps: 6890, calories: 410, activeMin: 28 },
  { day: 'Thu', steps: 12040, calories: 810, activeMin: 61 },
  { day: 'Fri', steps: 9560, calories: 620, activeMin: 44 },
  { day: 'Sat', steps: 14320, calories: 980, activeMin: 78 },
  { day: 'Sun', steps: 7210, calories: 470, activeMin: 33 },
]

export const HEART_RATE_TREND = [
  { time: '6am', bpm: 58 },
  { time: '9am', bpm: 76 },
  { time: '12pm', bpm: 82 },
  { time: '3pm', bpm: 91 },
  { time: '6pm', bpm: 128 },
  { time: '9pm', bpm: 72 },
]

export const CALORIE_PER_MIN: Record<WorkoutType, number> = {
  Running: 12,
  Cycling: 10,
  Strength: 8,
  Yoga: 4,
  Swimming: 11,
  Walking: 5,
}

export const INITIAL_WORKOUTS: Workout[] = [
  {
    id: 'w1',
    type: 'Running',
    durationMin: 32,
    calories: 384,
    timestamp: Date.now() - 1000 * 60 * 60 * 5,
  },
  {
    id: 'w2',
    type: 'Strength',
    durationMin: 45,
    calories: 360,
    timestamp: Date.now() - 1000 * 60 * 60 * 26,
  },
  {
    id: 'w3',
    type: 'Yoga',
    durationMin: 20,
    calories: 80,
    timestamp: Date.now() - 1000 * 60 * 60 * 50,
  },
]
