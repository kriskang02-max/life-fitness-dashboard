import { useEffect, useMemo, useState } from 'react'
import { Doughnut } from 'react-chartjs-2'
import '../chartSetup.js'
import DateNavigator from './DateNavigator'
import MealCard from './MealCard'
import { formatDateKey } from '../utils/dates'
import { createMeasurementId, createEmptyDietSlots, ensureDietLog } from '../utils/storage'
import { GEMINI_KEY_REQUIRED_MESSAGE, parseNutritionText } from '../services/geminiNutrition'

const SLOT_META = [
  { key: 'morning', label: '아침', emoji: '🌅', defaultTime: '07:30' },
  { key: 'lunch', label: '점심', emoji: '☀️', defaultTime: '12:30' },
  { key: 'dinner', label: '저녁', emoji: '🌙', defaultTime: '18:30' },
  { key: 'snack', label: '간식·야식', emoji: '☕', defaultTime: '21:30' },
]

const DEFAULT_CALORIE_GOAL = 1800
const DEFAULT_TARGET_MACRO_RATIO = { carbs: 40, protein: 35, fat: 25 }
const SUGAR_LIMIT = 30
const SODIUM_LIMIT = 2000

function sumDayTotals(mealList) {
  return mealList.reduce(
    (acc, meal) => {
      if (!meal) return acc
      return {
        calories: acc.calories + (Number(meal?.totals?.calories) || 0),
        protein: acc.protein + (Number(meal?.totals?.protein) || 0),
        carbs: acc.carbs + (Number(meal?.totals?.carbs) || 0),
        fat: acc.fat + (Number(meal?.totals?.fat) || 0),
        sugar: acc.sugar + (Number(meal?.totals?.sugar) || 0),
        sodium: acc.sodium + (Number(meal?.totals?.sodium) || 0),
      }
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0, sodium: 0 },
  )
}

function fmt(value, unit = 'g') {
  const num = Number(value) || 0
  const display = Number.isInteger(num) ? String(num) : num.toFixed(1)
  return `${display}${unit}`
}

function initialDraftsFromSlots(slots) {
  const draft = {}
  for (const slot of SLOT_META) {
    draft[slot.key] = {
      time: slots?.[slot.key]?.time || slot.defaultTime,
      text: slots?.[slot.key]?.text || '',
    }
  }
  return draft
}

function parseTimeToMinutes(timeText) {
  if (!timeText || !/^\d{2}:\d{2}$/.test(timeText)) return null
  const [hh, mm] = timeText.split(':').map(Number)
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null
  return hh * 60 + mm
}

function findLastMealIndicator(slots) {
  const candidates = ['dinner', 'snack']
    .map((key) => {
      const meal = slots?.[key]
      if (!meal?.text || !meal?.time) return null
      const minutes = parseTimeToMinutes(meal.time)
      if (minutes == null) return null
      return { slot: key, time: meal.time, minutes }
    })
    .filter(Boolean)

  if (candidates.length === 0) {
    return {
      badge: '⚪ 기록 대기',
      detail: '저녁/야식 시간이 아직 기록되지 않았습니다.',
      tone: 'border-zinc-700 bg-zinc-800/40 text-zinc-300',
    }
  }

  const latest = candidates.reduce((prev, current) => (current.minutes > prev.minutes ? current : prev))
  if (latest.slot === 'snack' && latest.minutes >= 21 * 60) {
    return {
      badge: '⚠️ 소화 주의 (야식 감지)',
      detail: `최종 섭취 ${latest.time} · 취침 3시간 전 이내 섭취 가능성이 있습니다.`,
      tone: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    }
  }
  if (latest.minutes <= 20 * 60) {
    return {
      badge: '🟢 소화 안전 & 지방 연소 모드',
      detail: `최종 섭취 ${latest.time} · 저녁 8시 이전 마감`,
      tone: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    }
  }
  return {
    badge: '🟡 소화 체크',
    detail: `최종 섭취 ${latest.time} · 취침 전 간격을 확인하세요.`,
    tone: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300',
  }
}

export default function DietNutrition({
  selectedDate,
  onDateChange,
  dietLogs,
  aiSettings,
  nutritionTargets,
  onUpdateDietLogs,
}) {
  const [drafts, setDrafts] = useState(() => initialDraftsFromSlots(createEmptyDietSlots()))
  const [slotLoading, setSlotLoading] = useState(null)
  const [slotHints, setSlotHints] = useState({})

  const dateKey = formatDateKey(selectedDate)
  const normalizedLogs = useMemo(() => ensureDietLog(dietLogs ?? {}, dateKey), [dietLogs, dateKey])
  const currentSlots = normalizedLogs[dateKey]?.slots ?? createEmptyDietSlots()

  useEffect(() => {
    setDrafts(initialDraftsFromSlots(currentSlots))
    setSlotHints({})
    setSlotLoading(null)
  }, [dateKey, currentSlots.morning?.id, currentSlots.lunch?.id, currentSlots.dinner?.id, currentSlots.snack?.id])

  const dailyMeals = useMemo(
    () => SLOT_META.map((slot) => currentSlots[slot.key]).filter(Boolean),
    [currentSlots],
  )
  const totals = useMemo(() => sumDayTotals(dailyMeals), [dailyMeals])
  const calorieGoal = Math.max(100, Number(nutritionTargets?.calorieGoal) || DEFAULT_CALORIE_GOAL)
  const targetMacroRatio = nutritionTargets?.macroRatio ?? DEFAULT_TARGET_MACRO_RATIO

  const macroCalories = useMemo(
    () => ({
      carbs: totals.carbs * 4,
      protein: totals.protein * 4,
      fat: totals.fat * 9,
    }),
    [totals],
  )
  const macroTotalCalories = macroCalories.carbs + macroCalories.protein + macroCalories.fat
  const macroActualRatio = {
    carbs: macroTotalCalories ? (macroCalories.carbs / macroTotalCalories) * 100 : 0,
    protein: macroTotalCalories ? (macroCalories.protein / macroTotalCalories) * 100 : 0,
    fat: macroTotalCalories ? (macroCalories.fat / macroTotalCalories) * 100 : 0,
  }

  const donutData = {
    labels: ['탄수화물', '단백질', '지방'],
    datasets: [
      {
        label: '실제 비율',
        data: [macroActualRatio.carbs, macroActualRatio.protein, macroActualRatio.fat],
        backgroundColor: ['rgba(52, 211, 153, 0.85)', 'rgba(34, 211, 238, 0.85)', 'rgba(217, 70, 239, 0.85)'],
        borderColor: ['rgba(16, 185, 129, 1)', 'rgba(6, 182, 212, 1)', 'rgba(192, 38, 211, 1)'],
        borderWidth: 1.2,
      },
      {
        label: '목표 비율',
        data: [targetMacroRatio.carbs, targetMacroRatio.protein, targetMacroRatio.fat],
        backgroundColor: ['rgba(52, 211, 153, 0.2)', 'rgba(34, 211, 238, 0.2)', 'rgba(217, 70, 239, 0.2)'],
        borderWidth: 0,
      },
    ],
  }

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '56%',
    plugins: {
      legend: {
        labels: { color: '#a1a1aa', font: { size: 11 } },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${Number(ctx.parsed).toFixed(1)}%`,
        },
      },
    },
  }

  const indicator = useMemo(() => findLastMealIndicator(currentSlots), [currentSlots])
  const calorieProgress = Math.min(100, (totals.calories / calorieGoal) * 100)
  const sugarProgress = Math.min(100, (totals.sugar / SUGAR_LIMIT) * 100)
  const sodiumProgress = Math.min(100, (totals.sodium / SODIUM_LIMIT) * 100)

  const updateDraft = (slotKey, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [slotKey]: { ...prev[slotKey], [field]: value },
    }))
  }

  const saveSlot = (slotKey, mealData) => {
    onUpdateDietLogs((logs) => {
      const ensured = ensureDietLog(logs, dateKey)
      return {
        ...ensured,
        [dateKey]: {
          ...ensured[dateKey],
          slots: {
            ...ensured[dateKey].slots,
            [slotKey]: mealData,
          },
        },
      }
    })
  }

  const handleAnalyzeSlot = async (slotKey) => {
    const draft = drafts[slotKey]
    if (!draft?.text?.trim()) {
      setSlotHints((prev) => ({ ...prev, [slotKey]: '입력값이 비어 있어 저장하지 않았습니다.' }))
      return
    }
    if (!aiSettings?.geminiApiKey?.trim()) {
      setSlotHints((prev) => ({ ...prev, [slotKey]: GEMINI_KEY_REQUIRED_MESSAGE }))
      if (typeof window !== 'undefined') window.alert(GEMINI_KEY_REQUIRED_MESSAGE)
      return
    }

    setSlotLoading(slotKey)
    setSlotHints((prev) => ({ ...prev, [slotKey]: '' }))
    try {
      const parsed = await parseNutritionText(draft.text, aiSettings)
      saveSlot(slotKey, {
        id: currentSlots?.[slotKey]?.id ?? createMeasurementId(`meal-${slotKey}`),
        slot: slotKey,
        time: draft.time || '',
        text: draft.text.trim(),
        provider: parsed.provider,
        model: parsed.model,
        items: parsed.items,
        totals: parsed.totals,
        summary: parsed.summary,
        createdAt: currentSlots?.[slotKey]?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      setSlotHints((prev) => ({
        ...prev,
        [slotKey]: 'Gemini 분석 완료',
      }))
    } catch (error) {
      setSlotHints((prev) => ({
        ...prev,
        [slotKey]: error?.message || 'API 호출에 실패했습니다. 키를 확인해주세요.',
      }))
    } finally {
      setSlotLoading(null)
    }
  }

  const handleClearSlot = (slotKey) => {
    saveSlot(slotKey, null)
    const slotMeta = SLOT_META.find((slot) => slot.key === slotKey)
    setDrafts((prev) => ({
      ...prev,
      [slotKey]: { text: '', time: slotMeta?.defaultTime ?? '12:00' },
    }))
    setSlotHints((prev) => ({ ...prev, [slotKey]: '' }))
  }

  const handleRestoreSlot = (slotKey) => {
    const saved = currentSlots?.[slotKey]
    const slotMeta = SLOT_META.find((slot) => slot.key === slotKey)
    setDrafts((prev) => ({
      ...prev,
      [slotKey]: {
        text: saved?.text ?? '',
        time: saved?.time ?? slotMeta?.defaultTime ?? '12:00',
      },
    }))
    setSlotHints((prev) => ({ ...prev, [slotKey]: saved ? '저장된 값으로 복원했습니다.' : '' }))
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Diet & Nutrition</h2>
        <span className="text-xs text-zinc-500">파서: Gemini 2.5 Flash / 목표 {calorieGoal}kcal</span>
      </div>

      <DateNavigator selectedDate={selectedDate} onDateChange={onDateChange} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SLOT_META.map((slot) => (
          <MealCard
            key={slot.key}
            slotKey={slot.key}
            title={slot.label}
            emoji={slot.emoji}
            meal={currentSlots[slot.key]}
            timeValue={drafts[slot.key]?.time ?? slot.defaultTime}
            textValue={drafts[slot.key]?.text ?? ''}
            loading={slotLoading === slot.key}
            hint={slotHints[slot.key]}
            onTimeChange={(value) => updateDraft(slot.key, 'time', value)}
            onTextChange={(value) => updateDraft(slot.key, 'text', value)}
            onAnalyze={() => handleAnalyzeSlot(slot.key)}
            onClear={() => handleClearSlot(slot.key)}
            onRestore={() => handleRestoreSlot(slot.key)}
          />
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">식습관 트래킹 인사이트</h3>

        <div className="card-glow rounded-2xl border border-zinc-800/70 bg-zinc-900/60 p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-300">일일 칼로리 진행도</span>
            <span className="text-amber-300 font-medium">{fmt(totals.calories, 'kcal')} / {calorieGoal}kcal</span>
          </div>
          <div className="h-2.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300"
              style={{ width: `${calorieProgress}%` }}
            />
          </div>
          <p className="text-xs text-zinc-500">
            총합: 탄 {fmt(totals.carbs)} · 단 {fmt(totals.protein)} · 지 {fmt(totals.fat)} · 당 {fmt(totals.sugar)} · 나트륨 {fmt(totals.sodium, 'mg')}
          </p>
        </div>

        <div className="card-glow rounded-2xl border border-zinc-800/70 bg-zinc-900/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-300">클린 섭취 케어 바</p>
            <div className="flex items-center gap-2">
              {totals.sugar > SUGAR_LIMIT && (
                <span className="text-[11px] px-2 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-300">
                  ⚠️ 당류 과다 주의
                </span>
              )}
              {totals.sodium > SODIUM_LIMIT && (
                <span className="text-[11px] px-2 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-300">
                  ⚠️ 나트륨 과다 (붓기·수분정체 주의)
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">당류</span>
              <span className="text-orange-300">{fmt(totals.sugar)} / {SUGAR_LIMIT}g</span>
            </div>
            <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-400 to-amber-500" style={{ width: `${sugarProgress}%` }} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">나트륨</span>
              <span className="text-sky-300">{fmt(totals.sodium, 'mg')} / {SODIUM_LIMIT}mg</span>
            </div>
            <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-sky-400 to-cyan-500" style={{ width: `${sodiumProgress}%` }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-3">
          <div className="card-glow rounded-2xl border border-zinc-800/70 bg-zinc-900/60 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-zinc-300">라스트 밀 & 소화 세이프티</p>
              <span className={`text-xs px-2 py-1 rounded-full border ${indicator.tone}`}>{indicator.badge}</span>
            </div>
            <p className="text-xs text-zinc-500 mb-3">{indicator.detail}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {SLOT_META.map((slot) => {
                const meal = currentSlots?.[slot.key]
                return (
                  <div key={slot.key} className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2">
                    <p className="text-[11px] text-zinc-500">{slot.emoji} {slot.label}</p>
                    <p className="text-sm text-zinc-200">{meal?.time || '--:--'}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="card-glow rounded-2xl border border-zinc-800/70 bg-zinc-900/60 p-4">
            <p className="text-sm text-zinc-300 mb-2">탄·단·지 도넛 차트</p>
            <div className="chart-canvas-wrap h-56">
              <Doughnut data={donutData} options={donutOptions} />
            </div>
            <div className="mt-3 text-xs text-zinc-500 space-y-1">
              <p>목표 비율: 탄 {targetMacroRatio.carbs}% · 단 {targetMacroRatio.protein}% · 지 {targetMacroRatio.fat}%</p>
              <p>실제 비율: 탄 {macroActualRatio.carbs.toFixed(1)}% · 단 {macroActualRatio.protein.toFixed(1)}% · 지 {macroActualRatio.fat.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
