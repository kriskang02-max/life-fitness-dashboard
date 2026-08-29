import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import {
  formatDateKey,
  formatShortDate,
  parseDateKey,
  addDays,
  isSameDay,
  isFutureDate,
} from '../utils/dates'

export default function DateNavigator({ selectedDate, onDateChange }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const isToday = isSameDay(selectedDate, today)
  const canGoNext = !isFutureDate(addDays(selectedDate, 1))

  const goPrev = () => onDateChange(addDays(selectedDate, -1))
  const goNext = () => {
    const next = addDays(selectedDate, 1)
    if (!isFutureDate(next)) onDateChange(next)
  }
  const goToday = () => onDateChange(new Date())

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/40">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <button
          type="button"
          onClick={goPrev}
          className="flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-zinc-300 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors shrink-0"
          aria-label="이전 날짜"
        >
          <ChevronLeft size={14} />
          <span className="hidden sm:inline">이전</span>
        </button>

        <div className="flex items-center gap-2 flex-1 min-w-0 justify-center">
          <Calendar size={14} className="text-emerald-400 shrink-0" />
          <input
            type="date"
            value={formatDateKey(selectedDate)}
            max={formatDateKey(today)}
            onChange={(e) => {
              if (!e.target.value) return
              const picked = parseDateKey(e.target.value)
              if (!isFutureDate(picked)) onDateChange(picked)
            }}
            className="flex-1 min-w-0 max-w-[9.5rem] px-2 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
          <span className="text-xs text-zinc-400 truncate hidden md:inline">
            {formatShortDate(selectedDate)}
          </span>
        </div>

        <button
          type="button"
          onClick={goNext}
          disabled={!canGoNext}
          className="flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-zinc-300 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors shrink-0 disabled:opacity-40 disabled:pointer-events-none"
          aria-label="다음 날짜"
        >
          <span className="hidden sm:inline">다음</span>
          <ChevronRight size={14} />
        </button>
      </div>

      <button
        type="button"
        onClick={goToday}
        disabled={isToday}
        className="px-3 py-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors disabled:opacity-40 shrink-0"
      >
        📅 오늘로 이동
      </button>
    </div>
  )
}
