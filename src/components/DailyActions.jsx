import { useState, useEffect } from 'react'
import { Check, Pencil, RotateCcw } from 'lucide-react'
import Tooltip from './Tooltip'
import DateNavigator from './DateNavigator'
import { resolveDailyItemsForLog, buildDailyItems } from '../utils/constants'
import { formatDateKey, getDayKey, isSameDay } from '../utils/dates'
import { ensureDailyLog } from '../utils/storage'

export default function DailyActions({
  dailyLogs,
  routinePresets,
  dailyItemsConfig,
  selectedDate,
  onDateChange,
  onToggle,
  onUpdateLabel,
}) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dateKey = formatDateKey(selectedDate)
  const dayKey = getDayKey(selectedDate)
  const logs = ensureDailyLog(dailyLogs, dateKey)
  const dayLog = logs[dateKey]
  const viewingToday = isSameDay(selectedDate, today)
  const defaultItems = buildDailyItems(dailyItemsConfig, routinePresets, dayKey)
  const dailyItems = resolveDailyItemsForLog(dayLog, dailyItemsConfig, routinePresets, dayKey)

  const [editingKey, setEditingKey] = useState(null)
  const [draftLabel, setDraftLabel] = useState('')

  useEffect(() => {
    setEditingKey(null)
    setDraftLabel('')
  }, [dateKey])

  const startEdit = (key, currentLabel) => {
    setEditingKey(key)
    setDraftLabel(currentLabel)
  }

  const saveEdit = (key) => {
    const trimmed = draftLabel.trim()
    const defaultLabel = defaultItems.find((i) => i.key === key)?.label ?? ''
    onUpdateLabel(dateKey, key, trimmed === defaultLabel ? null : trimmed)
    setEditingKey(null)
    setDraftLabel('')
  }

  const resetLabel = (key) => {
    onUpdateLabel(dateKey, key, null)
    setEditingKey(null)
    setDraftLabel('')
  }

  const handleToggle = (key) => {
    if (editingKey === key) return
    onToggle(dateKey, key, !dayLog[key])
  }

  return (
    <section id="daily-section">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
          Daily Actions
        </h2>
        {!viewingToday && (
          <span className="text-xs text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-full">
            과거 기록 편집 중
          </span>
        )}
      </div>

      <DateNavigator selectedDate={selectedDate} onDateChange={onDateChange} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {dailyItems.map((item) => {
          const checked = dayLog[item.key]
          const isEditing = editingKey === item.key
          const defaultLabel = defaultItems.find((i) => i.key === item.key)?.label ?? ''
          const hasCustomLabel = Boolean(dayLog.labels?.[item.key])

          return (
            <div
              key={item.key}
              className={`check-card card-glow text-left p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/60 ${checked ? 'checked' : ''}`}
            >
              <div className="flex items-center gap-2 min-w-0 w-full">
                {isEditing ? (
                  <>
                    <div className="flex-1 min-w-0 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={draftLabel}
                        onChange={(e) => setDraftLabel(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(item.key)
                          if (e.key === 'Escape') {
                            setEditingKey(null)
                            setDraftLabel('')
                          }
                        }}
                        autoFocus
                        placeholder={defaultLabel}
                        className="flex-1 min-w-0 px-2 py-1.5 text-base bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-100"
                      />
                      {hasCustomLabel && (
                        <button
                          type="button"
                          onClick={() => resetLabel(item.key)}
                          className="p-1 shrink-0 text-zinc-400 hover:text-zinc-200"
                          title="설정 기본값으로"
                        >
                          <RotateCcw size={12} />
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => saveEdit(item.key)}
                      className="shrink-0 px-2 py-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded"
                    >
                      저장
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1 min-w-0 flex-1">
                      <Tooltip content={item.tooltip}>
                        <button
                          type="button"
                          onClick={() => handleToggle(item.key)}
                          className="min-w-0 flex-1 text-left group/label"
                        >
                          <p className="text-sm font-medium text-zinc-200 leading-snug truncate group-hover/label:text-zinc-100">
                            {item.emoji} {item.label}
                          </p>
                        </button>
                      </Tooltip>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          startEdit(item.key, item.label)
                        }}
                        className="p-1 shrink-0 text-zinc-500 hover:text-cyan-400 transition-colors"
                        aria-label="내용 수정"
                      >
                        <Pencil size={13} />
                      </button>
                    </div>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => handleToggle(item.key)}
                  disabled={isEditing}
                  className={`ml-auto shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                    checked
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-zinc-600 bg-zinc-800/50'
                  } ${isEditing ? 'opacity-40 pointer-events-none' : ''}`}
                  aria-label={checked ? '완료 해제' : '완료 표시'}
                >
                  {checked && <Check size={14} strokeWidth={3} />}
                </button>
              </div>
              {!isEditing && (
                <p className="text-xs text-zinc-500 mt-2">
                  {checked ? '완료 ✓' : '클릭하여 완료 표시'}
                  {hasCustomLabel && (
                    <span className="text-cyan-500/70 ml-1">· 수정됨</span>
                  )}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
