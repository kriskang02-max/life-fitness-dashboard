import { useState, useEffect } from 'react'
import Modal from '../Modal'
import {
  DAY_KEYS,
  DAY_LABELS,
  DAILY_CHECK_KEYS,
  DAILY_CHECK_LABELS,
  DEFAULT_DAILY_ITEMS_CONFIG,
  DEFAULT_AI_SETTINGS,
  DEFAULT_NUTRITION_TARGETS,
} from '../../utils/constants'

export default function RoutineSettingsModal({
  open,
  onClose,
  routinePresets,
  dailyItemsConfig,
  aiSettings,
  nutritionTargets,
  onSaveWeekdays,
  onSaveDailyItems,
  onSaveAiSettings,
  onSaveNutritionTargets,
}) {
  const [tab, setTab] = useState('weekdays')
  const [weekdays, setWeekdays] = useState(routinePresets)
  const [items, setItems] = useState(dailyItemsConfig)
  const [ai, setAi] = useState(aiSettings)
  const [nutrition, setNutrition] = useState(nutritionTargets)

  useEffect(() => {
    if (open) {
      setWeekdays({ ...routinePresets })
      setItems({ ...dailyItemsConfig })
      setAi({ ...DEFAULT_AI_SETTINGS, ...(aiSettings ?? {}) })
      setNutrition({
        calorieGoal: nutritionTargets?.calorieGoal ?? DEFAULT_NUTRITION_TARGETS.calorieGoal,
        sugarLimit: nutritionTargets?.sugarLimit ?? DEFAULT_NUTRITION_TARGETS.sugarLimit,
        sodiumLimit: nutritionTargets?.sodiumLimit ?? DEFAULT_NUTRITION_TARGETS.sodiumLimit,
        macroRatio: {
          carbs: nutritionTargets?.macroRatio?.carbs ?? DEFAULT_NUTRITION_TARGETS.macroRatio.carbs,
          protein: nutritionTargets?.macroRatio?.protein ?? DEFAULT_NUTRITION_TARGETS.macroRatio.protein,
          fat: nutritionTargets?.macroRatio?.fat ?? DEFAULT_NUTRITION_TARGETS.macroRatio.fat,
        },
      })
      setTab('weekdays')
    }
  }, [open, routinePresets, dailyItemsConfig, aiSettings, nutritionTargets])

  const updateItem = (key, field, value) => {
    setItems((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }))
  }

  const handleSave = () => {
    onSaveWeekdays(weekdays)
    onSaveDailyItems(items)
    onSaveAiSettings(ai)
    onSaveNutritionTargets(nutrition)
    onClose()
  }

  const macroSum =
    Number(nutrition?.macroRatio?.carbs || 0) +
    Number(nutrition?.macroRatio?.protein || 0) +
    Number(nutrition?.macroRatio?.fat || 0)

  return (
    <Modal open={open} onClose={onClose} title="⚙️ 데일리 & 루틴 설정" wide>
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setTab('weekdays')}
          className={`px-3 py-1.5 text-xs rounded-lg border ${tab === 'weekdays' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'border-zinc-700 text-zinc-400'}`}
        >
          요일별 운동
        </button>
        <button
          type="button"
          onClick={() => setTab('items')}
          className={`px-3 py-1.5 text-xs rounded-lg border ${tab === 'items' ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400' : 'border-zinc-700 text-zinc-400'}`}
        >
          체크박스 4종 커스텀
        </button>
        <button
          type="button"
          onClick={() => setTab('ai')}
          className={`px-3 py-1.5 text-xs rounded-lg border ${tab === 'ai' ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'border-zinc-700 text-zinc-400'}`}
        >
          AI 파서
        </button>
        <button
          type="button"
          onClick={() => setTab('nutrition')}
          className={`px-3 py-1.5 text-xs rounded-lg border ${tab === 'nutrition' ? 'bg-lime-500/20 border-lime-500/40 text-lime-300' : 'border-zinc-700 text-zinc-400'}`}
        >
          🥗 영양 목표 세팅
        </button>
      </div>

      {tab === 'weekdays' && (
        <div className="space-y-3">
          <p className="text-xs text-zinc-500">체크박스 #1 (운동)에 요일별 루틴명이 연동됩니다.</p>
          {DAY_KEYS.map((day) => (
            <label key={day} className="flex items-center gap-3">
              <span className="w-12 text-sm font-medium text-zinc-400">{DAY_LABELS[day]}요일</span>
              <input
                type="text"
                value={weekdays[day] ?? ''}
                onChange={(e) => setWeekdays((p) => ({ ...p, [day]: e.target.value }))}
                className="flex-1 px-3 py-2 text-base bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="운동 종류"
              />
            </label>
          ))}
        </div>
      )}

      {tab === 'items' && (
        <div className="space-y-4">
          {DAILY_CHECK_KEYS.map((key) => (
            <div key={key} className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/40 space-y-2">
              <p className="text-xs font-medium text-zinc-400">{DAILY_CHECK_LABELS[key]}</p>
              <div className="grid grid-cols-[3rem_1fr] gap-2">
                <input
                  type="text"
                  value={items[key]?.emoji ?? ''}
                  onChange={(e) => updateItem(key, 'emoji', e.target.value)}
                  className="px-2 py-2 text-center text-base bg-zinc-800 border border-zinc-700 rounded-lg"
                  placeholder="🔥"
                />
                <input
                  type="text"
                  value={items[key]?.label ?? ''}
                  onChange={(e) => updateItem(key, 'label', e.target.value)}
                  className="px-3 py-2 text-base bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                  placeholder="제목"
                />
              </div>
              <textarea
                value={items[key]?.tooltip ?? ''}
                onChange={(e) => updateItem(key, 'tooltip', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-base bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 resize-none"
                placeholder="툴팁 설명"
              />
              {key === 'workout' && (
                <label className="flex items-center gap-2 text-xs text-zinc-400">
                  <input
                    type="checkbox"
                    checked={items[key]?.linkWeekday ?? true}
                    onChange={(e) => updateItem(key, 'linkWeekday', e.target.checked)}
                    className="rounded"
                  />
                  요일별 운동명 연동
                </label>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'ai' && (
        <div className="space-y-4">
          <p className="text-xs text-zinc-500">
            Diet & Nutrition은 Gemini API 전용으로 동작합니다. 키가 없으면 분석이 실행되지 않습니다.
          </p>

          <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 space-y-2">
            <p className="text-xs text-emerald-400 font-medium">Gemini 2.5 Flash</p>
            <input
              type="password"
              value={ai.geminiApiKey ?? ''}
              onChange={(e) => setAi((prev) => ({ ...prev, geminiApiKey: e.target.value }))}
              placeholder="Gemini API Key"
              className="w-full px-3 py-2 text-base bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
            />
            <input
              type="text"
              value={ai.geminiModel ?? 'gemini-2.5-flash'}
              readOnly
              className="w-full px-3 py-2 text-base bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-400"
            />
          </div>
        </div>
      )}

      {tab === 'nutrition' && (
        <div className="space-y-4">
          <div className="p-3 rounded-lg border border-lime-500/20 bg-lime-500/5 space-y-3">
            <p className="text-xs text-lime-300 font-medium">일일 목표 칼로리 (kcal)</p>
            <input
              type="number"
              min="100"
              step="10"
              value={nutrition?.calorieGoal ?? DEFAULT_NUTRITION_TARGETS.calorieGoal}
              onChange={(e) =>
                setNutrition((prev) => ({
                  ...(prev ?? {}),
                  calorieGoal: Number(e.target.value || DEFAULT_NUTRITION_TARGETS.calorieGoal),
                }))
              }
              className="w-full px-3 py-2 text-base bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-orange-500/20 bg-orange-500/5 space-y-2">
              <p className="text-xs text-orange-300 font-medium">당류 상한 (g)</p>
              <input
                type="number"
                min="1"
                step="1"
                value={nutrition?.sugarLimit ?? DEFAULT_NUTRITION_TARGETS.sugarLimit}
                onChange={(e) =>
                  setNutrition((prev) => ({
                    ...(prev ?? {}),
                    sugarLimit: Number(e.target.value || DEFAULT_NUTRITION_TARGETS.sugarLimit),
                  }))
                }
                className="w-full px-3 py-2 text-base bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
              />
            </div>

            <div className="p-3 rounded-lg border border-sky-500/20 bg-sky-500/5 space-y-2">
              <p className="text-xs text-sky-300 font-medium">나트륨 상한 (mg)</p>
              <input
                type="number"
                min="1"
                step="10"
                value={nutrition?.sodiumLimit ?? DEFAULT_NUTRITION_TARGETS.sodiumLimit}
                onChange={(e) =>
                  setNutrition((prev) => ({
                    ...(prev ?? {}),
                    sodiumLimit: Number(e.target.value || DEFAULT_NUTRITION_TARGETS.sodiumLimit),
                  }))
                }
                className="w-full px-3 py-2 text-base bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
              />
            </div>
          </div>

          <div className="p-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 space-y-3">
            <p className="text-xs text-cyan-300 font-medium">목표 매크로 비율 (%)</p>
            <div className="grid grid-cols-3 gap-2">
              <label className="text-xs text-zinc-400">
                탄수화물
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={nutrition?.macroRatio?.carbs ?? DEFAULT_NUTRITION_TARGETS.macroRatio.carbs}
                  onChange={(e) =>
                    setNutrition((prev) => ({
                      ...(prev ?? {}),
                      macroRatio: {
                        ...((prev ?? {}).macroRatio ?? {}),
                        carbs: Number(e.target.value || 0),
                      },
                    }))
                  }
                  className="w-full mt-1 px-2 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                />
              </label>
              <label className="text-xs text-zinc-400">
                단백질
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={nutrition?.macroRatio?.protein ?? DEFAULT_NUTRITION_TARGETS.macroRatio.protein}
                  onChange={(e) =>
                    setNutrition((prev) => ({
                      ...(prev ?? {}),
                      macroRatio: {
                        ...((prev ?? {}).macroRatio ?? {}),
                        protein: Number(e.target.value || 0),
                      },
                    }))
                  }
                  className="w-full mt-1 px-2 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                />
              </label>
              <label className="text-xs text-zinc-400">
                지방
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={nutrition?.macroRatio?.fat ?? DEFAULT_NUTRITION_TARGETS.macroRatio.fat}
                  onChange={(e) =>
                    setNutrition((prev) => ({
                      ...(prev ?? {}),
                      macroRatio: {
                        ...((prev ?? {}).macroRatio ?? {}),
                        fat: Number(e.target.value || 0),
                      },
                    }))
                  }
                  className="w-full mt-1 px-2 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                />
              </label>
            </div>
            <p className={`text-xs ${macroSum === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
              현재 합계: {macroSum}% (저장 시 자동으로 100%에 맞춰 정규화됩니다)
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        className="w-full mt-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-lg hover:from-emerald-500 hover:to-cyan-500 transition-all"
      >
        저장
      </button>
    </Modal>
  )
}
