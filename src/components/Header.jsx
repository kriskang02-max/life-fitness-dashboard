import { Settings, Database, Cloud } from 'lucide-react'
import { addDays, formatDisplayDate, formatDateKey } from '../utils/dates'

const DEFAULT_CALORIE_GOAL = 1800
const CLEAN_DINNER_CUTOFF = 20 * 60 + 30

function parseTimeToMinutes(timeText) {
  if (!timeText || !/^\d{2}:\d{2}$/.test(timeText)) return null
  const [hh, mm] = timeText.split(':').map(Number)
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null
  return hh * 60 + mm
}

function getMealsFromEntry(entry) {
  if (!entry) return []
  if (entry.slots && typeof entry.slots === 'object') return Object.values(entry.slots).filter(Boolean)
  if (Array.isArray(entry.meals)) return entry.meals.filter(Boolean)
  return []
}

function sumDayCalories(entry) {
  const meals = getMealsFromEntry(entry)
  return meals.reduce((sum, meal) => sum + (Number(meal?.totals?.calories) || 0), 0)
}

function isCleanDietDay(entry, calorieGoal) {
  const meals = getMealsFromEntry(entry)
  if (!meals.length) return false
  const calories = sumDayCalories(entry)
  const dinner = entry?.slots?.dinner ?? meals.find((meal) => meal?.slot === 'dinner')
  const dinnerMinutes = parseTimeToMinutes(dinner?.time)
  return calories > 0 && calories <= calorieGoal && dinnerMinutes != null && dinnerMinutes <= CLEAN_DINNER_CUTOFF
}

function countWorkoutStreak(dailyLogs, today) {
  let streak = 0
  for (let i = 0; i < 3650; i++) {
    const key = formatDateKey(addDays(today, -i))
    // Today's workout is optional for streak continuity.
    if (i === 0 && !dailyLogs?.[key]?.workout) continue
    if (dailyLogs?.[key]?.workout) {
      streak += 1
      continue
    }
    break
  }
  return streak
}

function countCleanDietStreak(dietLogs, today, calorieGoal) {
  let streak = 0
  let foundTrackedDay = false
  // Exclude today because the current day is still in-progress.
  for (let i = 1; i < 3650; i++) {
    const key = formatDateKey(addDays(today, -i))
    const entry = dietLogs?.[key]
    const hasData = getMealsFromEntry(entry).length > 0

    if (!foundTrackedDay) {
      if (!hasData) continue
      foundTrackedDay = true
    }

    if (isCleanDietDay(entry, calorieGoal)) {
      streak += 1
      continue
    }
    break
  }
  return streak
}

export default function Header({
  onOpenRoutine,
  onOpenBackup,
  onOpenSync,
  dailyLogs,
  dietLogs,
  nutritionTargets,
  syncStatus,
}) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const calorieGoal = Math.max(100, Number(nutritionTargets?.calorieGoal) || DEFAULT_CALORIE_GOAL)
  const workoutStreak = countWorkoutStreak(dailyLogs, today)
  const cleanDietStreak = countCleanDietStreak(dietLogs, today, calorieGoal)

  const syncDot =
    syncStatus === 'ok'
      ? 'bg-emerald-400'
      : syncStatus === 'syncing'
        ? 'bg-cyan-400 animate-pulse'
        : syncStatus === 'error'
          ? 'bg-red-400'
          : 'bg-zinc-600'

  return (
    <header className="card-glow bg-zinc-900/80 backdrop-blur-md border border-zinc-800/60 rounded-2xl p-4 md:p-5">
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-0.5">Today</p>
          <h1 className="text-lg md:text-xl font-semibold text-zinc-100">{formatDisplayDate(today)}</h1>
        </div>

        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <span className="inline-flex items-center px-2.5 sm:px-3 py-1 text-xs font-medium rounded-full border shrink-0 border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
              🏋️ {workoutStreak}일 연속 운동
            </span>
            <span className="inline-flex items-center px-2.5 sm:px-3 py-1 text-xs font-medium rounded-full border shrink-0 border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
              🥗 {cleanDietStreak}일 연속 클린 식단
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenSync}
            className="flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-medium text-zinc-300 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors"
          >
            <Cloud size={15} />
            <span className={`w-2 h-2 rounded-full ${syncDot}`} />
            <span className="hidden sm:inline">동기화</span>
          </button>
          <button
            type="button"
            onClick={onOpenRoutine}
            className="flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-medium text-zinc-300 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors"
          >
            <Settings size={15} />
            <span className="hidden sm:inline">루틴 설정</span>
          </button>
          <button
            type="button"
            onClick={onOpenBackup}
            className="flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-medium text-zinc-300 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors"
          >
            <Database size={15} />
            <span className="hidden sm:inline">JSON 백업</span>
          </button>
          </div>
        </div>
      </div>
    </header>
  )
}
