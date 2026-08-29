import { useMemo, useState } from 'react'
import { AddWorkoutForm } from './components/AddWorkoutForm'
import { ActivityChart } from './components/ActivityChart'
import { GoalRings } from './components/GoalRings'
import { StatCard } from './components/StatCard'
import { TrendChart } from './components/TrendChart'
import { WorkoutLog } from './components/WorkoutLog'
import {
  GOALS,
  HEART_RATE_TREND,
  INITIAL_WORKOUTS,
  WEEKLY_ACTIVITY,
} from './data'
import type { Workout, WorkoutType } from './types'

const BASE_TODAY = {
  steps: 7480,
  calories: 512,
  activeMin: 34,
  restingHr: 62,
  sleepHours: 7.4,
}

function App() {
  const [workouts, setWorkouts] = useState<Workout[]>(INITIAL_WORKOUTS)

  const loggedToday = useMemo(() => {
    const dayStart = new Date()
    dayStart.setHours(0, 0, 0, 0)
    return workouts.filter((w) => w.timestamp >= dayStart.getTime())
  }, [workouts])

  const bonus = useMemo(() => {
    return loggedToday.reduce(
      (acc, w) => {
        acc.calories += w.calories
        acc.activeMin += w.durationMin
        acc.steps += Math.round(w.durationMin * 110)
        return acc
      },
      { steps: 0, calories: 0, activeMin: 0 },
    )
  }, [loggedToday])

  const today = {
    steps: BASE_TODAY.steps + bonus.steps,
    calories: BASE_TODAY.calories + bonus.calories,
    activeMin: BASE_TODAY.activeMin + bonus.activeMin,
  }

  const handleAdd = (type: WorkoutType, durationMin: number, calories: number) => {
    setWorkouts((prev) => [
      {
        id: `w${Date.now()}`,
        type,
        durationMin,
        calories,
        timestamp: Date.now(),
      },
      ...prev,
    ])
  }

  const now = new Date()
  const dateLabel = now.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <div className="brand-logo">⚡</div>
          <div>
            <h1>Life Fitness Dashboard</h1>
            <p>Your daily health &amp; activity overview</p>
          </div>
        </div>
        <div className="header-date">
          <strong>{dateLabel}</strong>
          Keep moving — you're doing great!
        </div>
      </header>

      <section className="stat-grid">
        <StatCard
          icon="👟"
          label="Steps Today"
          value={today.steps.toLocaleString()}
          delta="12% vs yesterday"
          deltaDir="up"
        />
        <StatCard
          icon="🔥"
          label="Calories Burned"
          value={today.calories.toLocaleString()}
          unit="kcal"
          delta="8% vs yesterday"
          deltaDir="up"
        />
        <StatCard
          icon="⏱️"
          label="Active Minutes"
          value={String(today.activeMin)}
          unit="min"
          delta="5% vs yesterday"
          deltaDir="up"
        />
        <StatCard
          icon="❤️"
          label="Resting HR"
          value={String(BASE_TODAY.restingHr)}
          unit="bpm"
          delta="3 bpm lower"
          deltaDir="down"
        />
        <StatCard
          icon="😴"
          label="Sleep"
          value={BASE_TODAY.sleepHours.toFixed(1)}
          unit="hrs"
          delta="0.6 hrs more"
          deltaDir="up"
        />
      </section>

      <section className="grid-2">
        <ActivityChart data={WEEKLY_ACTIVITY} />
        <GoalRings today={today} goals={GOALS} />
      </section>

      <section style={{ marginBottom: 24 }}>
        <TrendChart data={HEART_RATE_TREND} />
      </section>

      <section className="grid-2b">
        <AddWorkoutForm onAdd={handleAdd} />
        <WorkoutLog workouts={workouts} />
      </section>
    </div>
  )
}

export default App
