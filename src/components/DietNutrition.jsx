import { useMemo, useState } from 'react'
import { Sparkles, Plus } from 'lucide-react'
import DateNavigator from './DateNavigator'
import MealCard from './MealCard'
import { formatDateKey } from '../utils/dates'
import { createMeasurementId, ensureDietLog } from '../utils/storage'
import { parseNutritionText } from '../utils/nutritionParser'

function sumDayTotals(meals) {
  return meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + (Number(meal?.totals?.calories) || 0),
      protein: acc.protein + (Number(meal?.totals?.protein) || 0),
      carbs: acc.carbs + (Number(meal?.totals?.carbs) || 0),
      fat: acc.fat + (Number(meal?.totals?.fat) || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  )
}

function fmt(value, unit = 'g') {
  const num = Number(value) || 0
  const display = Number.isInteger(num) ? String(num) : num.toFixed(1)
  return `${display}${unit}`
}

export default function DietNutrition({
  selectedDate,
  onDateChange,
  dietLogs,
  aiSettings,
  onUpdateDietLogs,
}) {
  const [mealInput, setMealInput] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [parsing, setParsing] = useState(false)

  const dateKey = formatDateKey(selectedDate)
  const meals = useMemo(() => {
    const items = dietLogs?.[dateKey]?.meals ?? []
    return [...items].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  }, [dietLogs, dateKey])
  const totals = useMemo(() => sumDayTotals(meals), [meals])

  const appendMeal = (parsed, rawText) => {
    const meal = {
      id: createMeasurementId('meal'),
      text: rawText.trim(),
      source: parsed.source,
      provider: parsed.provider,
      model: parsed.model,
      confidence: parsed.confidence,
      items: parsed.items,
      totals: parsed.totals,
      createdAt: new Date().toISOString(),
    }

    onUpdateDietLogs((logs) => {
      const next = ensureDietLog(logs, dateKey)
      return {
        ...next,
        [dateKey]: {
          meals: [meal, ...(next[dateKey]?.meals ?? [])],
        },
      }
    })
  }

  const handleParseAndSave = async () => {
    const text = mealInput.trim()
    if (!text) {
      setError('식사 내용을 입력해주세요.')
      setStatus('')
      return
    }

    setParsing(true)
    setError('')
    setStatus('AI 파싱 중...')
    try {
      const parsed = await parseNutritionText(text, aiSettings)
      appendMeal(parsed, text)
      setMealInput('')
      if (parsed.source === 'heuristic') {
        setStatus(`AI 호출 실패로 휴리스틱 추정 저장: ${parsed.notes}`)
      } else {
        setStatus(`저장 완료 · ${parsed.provider} (${parsed.model})`)
      }
    } catch (err) {
      setError(err.message || '파싱에 실패했습니다.')
      setStatus('')
    } finally {
      setParsing(false)
    }
  }

  const handleDeleteMeal = (mealId) => {
    onUpdateDietLogs((logs) => {
      const next = ensureDietLog(logs, dateKey)
      return {
        ...next,
        [dateKey]: {
          meals: (next[dateKey]?.meals ?? []).filter((meal) => meal.id !== mealId),
        },
      }
    })
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
          Diet & Nutrition
        </h2>
        <span className="text-xs text-zinc-500">
          파서: {aiSettings?.provider ?? 'gemini'}
        </span>
      </div>

      <DateNavigator selectedDate={selectedDate} onDateChange={onDateChange} />

      <div className="card-glow rounded-xl border border-zinc-800/70 bg-zinc-900/60 p-4 space-y-3">
        <p className="text-xs text-zinc-400">
          예시: 닭가슴살 150g, 밥 1공기, 계란 2개
        </p>
        <textarea
          rows={3}
          value={mealInput}
          onChange={(e) => setMealInput(e.target.value)}
          placeholder="오늘 먹은 식사를 자유롭게 입력하세요."
          className="w-full px-3 py-2 text-base bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 resize-y"
        />
        <button
          type="button"
          onClick={handleParseAndSave}
          disabled={parsing}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-lg hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-50"
        >
          {parsing ? <Sparkles size={14} className="animate-pulse" /> : <Plus size={14} />}
          파싱 후 저장
        </button>
        {status && <p className="text-xs text-emerald-400">{status}</p>}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      <div className="card-glow rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
        <p className="text-xs text-zinc-400 mb-2">{dateKey} 총합</p>
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="text-amber-300">칼로리 {fmt(totals.calories, 'kcal')}</span>
          <span className="text-cyan-300">단백질 {fmt(totals.protein)}</span>
          <span className="text-emerald-300">탄수화물 {fmt(totals.carbs)}</span>
          <span className="text-fuchsia-300">지방 {fmt(totals.fat)}</span>
        </div>
      </div>

      <div className="space-y-3">
        {meals.length === 0 && (
          <p className="text-sm text-zinc-500 text-center py-6 border border-dashed border-zinc-700 rounded-xl">
            아직 저장된 식사 기록이 없습니다.
          </p>
        )}

        {meals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            onDelete={handleDeleteMeal}
            onReuseInput={setMealInput}
          />
        ))}
      </div>
    </section>
  )
}
