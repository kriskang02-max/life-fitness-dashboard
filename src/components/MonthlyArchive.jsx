import { useState } from 'react'
import { Plus, Trash2, Pencil, ChevronLeft, ChevronRight } from 'lucide-react'
import { DAILY_CHECK_KEYS } from '../utils/constants'
import { getMonthDays, formatDateKey } from '../utils/dates'
import { getDayCompletionCount, computeYearlySummary } from '../utils/storage'

const HEATMAP_COLORS = [
  'bg-zinc-800/80',
  'bg-emerald-900/80',
  'bg-emerald-700/80',
  'bg-emerald-500/80',
  'bg-emerald-400',
]

const TAG_COLORS = {
  독서: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  인사이트: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  마인드셋: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
}

export default function MonthlyArchive({
  dailyLogs,
  weeklyMetrics,
  thoughtArchive,
  selectedDateKey,
  onSelectDate,
  onOpenArchiveModal,
  onEditArchive,
  onDeleteArchive,
}) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const { days, firstDay } = getMonthDays(viewYear, viewMonth)
  const monthSummary = computeMonthSummary(dailyLogs, weeklyMetrics, viewYear, viewMonth)
  const yearlySummary = computeYearlySummary(dailyLogs, weeklyMetrics, viewYear)

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1)
      setViewMonth(11)
    } else setViewMonth((m) => m - 1)
  }

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1)
      setViewMonth(0)
    } else setViewMonth((m) => m + 1)
  }

  const canNext =
    viewYear < today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth < today.getMonth())

  return (
    <section>
      <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
        Monthly Achievement & Archive
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 card-glow bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4 w-full max-w-full overflow-hidden min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <button
              type="button"
              onClick={goPrevMonth}
              className="flex items-center gap-1 px-2 py-1.5 text-xs text-zinc-400 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700"
            >
              <ChevronLeft size={14} /> 이전 달
            </button>
            <input
                type="month"
                value={`${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`}
                max={`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`}
                onChange={(e) => {
                  if (!e.target.value) return
                  const [y, m] = e.target.value.split('-').map(Number)
                  setViewYear(y)
                  setViewMonth(m - 1)
                }}
                className="px-3 py-2 text-base text-center bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 date-input min-w-[9.5rem]"
                aria-label="월 선택"
              />
            <button
              type="button"
              onClick={goNextMonth}
              disabled={!canNext}
              className="flex items-center gap-1 px-2 py-1.5 text-xs text-zinc-400 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 disabled:opacity-40"
            >
              다음 달 <ChevronRight size={14} />
            </button>
          </div>
          <Heatmap
            year={viewYear}
            month={viewMonth}
            days={days}
            firstDay={firstDay}
            dailyLogs={dailyLogs}
            selectedDateKey={selectedDateKey}
            onSelectDate={onSelectDate}
          />
          <div className="flex items-center gap-2 mt-3 text-xs text-zinc-500">
            <span>적음</span>
            {HEATMAP_COLORS.map((c, i) => (
              <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
            ))}
            <span>많음</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card-glow bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4 space-y-4">
            <p className="text-xs text-zinc-500">월간 서머리 · {viewYear}년 {viewMonth + 1}월</p>
            <SummaryRow label="총 운동 일수" value={`${monthSummary.workoutDays}일`} />
            <SummaryRow label="누적 거리" value={`${monthSummary.totalDistance.toFixed(1)} km`} />
            <SummaryRow
              label="체지방 순감소"
              value={
                monthSummary.bodyFatChange !== null
                  ? `${monthSummary.bodyFatChange > 0 ? '+' : ''}${monthSummary.bodyFatChange.toFixed(1)}%p`
                  : '—'
              }
              highlight={monthSummary.bodyFatChange !== null && monthSummary.bodyFatChange < 0}
            />
          </div>

          <div className="card-glow bg-zinc-900/60 border border-indigo-500/20 rounded-xl p-4 space-y-3">
            <p className="text-xs text-indigo-400 font-medium">연간 누적 서머리 · {viewYear}년</p>
            <SummaryRow
              label="총 운동 일수"
              value={`${yearlySummary.workoutDays}일`}
              sub={`누적 출석률 ${yearlySummary.attendance}%`}
            />
            <SummaryRow
              label="누적 러닝 마일리지"
              value={`${yearlySummary.totalDistance.toFixed(1)} km`}
            />
            <SummaryRow
              label="올클리어 (4/4) 달성"
              value={`${yearlySummary.allClearDays}회`}
              highlight
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-zinc-300">독서 & 마인드 아카이브</p>
        <button
          type="button"
          onClick={onOpenArchiveModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors"
        >
          <Plus size={14} />
          1줄 기록 추가
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {thoughtArchive.length === 0 ? (
          <p className="col-span-full text-sm text-zinc-500 text-center py-8">
            아직 기록이 없습니다. 첫 인사이트를 추가해보세요.
          </p>
        ) : (
          thoughtArchive.map((item) => (
            <ArchiveCard
              key={item.id}
              item={item}
              onEdit={() => onEditArchive(item)}
              onDelete={() => onDeleteArchive(item.id)}
            />
          ))
        )}
      </div>
    </section>
  )
}

function Heatmap({ year, month, days, firstDay, dailyLogs, selectedDateKey, onSelectDate }) {
  const [tooltip, setTooltip] = useState(null)
  const weekdays = ['일', '월', '화', '수', '목', '금', '토']

  const cells = []
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} className="w-full aspect-square" />)
  }
  for (let d = 1; d <= days; d++) {
    const date = new Date(year, month, d)
    const key = formatDateKey(date)
    const log = dailyLogs[key]
    const count = getDayCompletionCount(log)
    const color = HEATMAP_COLORS[count]
    const isSelected = key === selectedDateKey

    cells.push(
      <button
        key={key}
        type="button"
        onClick={() => {
          onSelectDate(key)
          document.getElementById('daily-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }}
        className={`heatmap-cell w-full aspect-square rounded-sm ${color} cursor-pointer ${
          isSelected ? 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-zinc-900' : ''
        }`}
        onMouseEnter={() => setTooltip({ key, log, count })}
        onMouseLeave={() => setTooltip(null)}
        aria-label={`${key} 데일리 기록`}
      />
    )
  }

  return (
    <div className="relative w-full max-w-full overflow-hidden min-w-0">
      <div className="grid grid-cols-7 gap-1 mb-1 min-w-0">
        {weekdays.map((w) => (
          <div key={w} className="text-center text-[10px] text-zinc-600">{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 min-w-0 w-full">{cells}</div>
      {tooltip && (
        <div className="absolute bottom-full left-0 mb-2 z-10 px-3 py-2 text-xs bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl max-w-xs">
          <p className="font-medium text-zinc-200 mb-1">{tooltip.key}</p>
          <p className="text-zinc-400">{buildTooltipText(tooltip.key, tooltip.log, tooltip.count)}</p>
        </div>
      )}
    </div>
  )
}

function buildTooltipText(key, log, count) {
  if (!log || count === 0) return `${key}: 미완료`
  const labels = { workout: '🏃', diet: '🥗', dopamine: '📵', read: '📖' }
  const items = DAILY_CHECK_KEYS.filter((k) => log[k]).map((k) => labels[k])
  return `${key}: ${count}/4 — ${items.join(' ') || '없음'}`
}

function SummaryRow({ label, value, sub, highlight }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">{label}</span>
        <span className={`text-sm font-semibold ${highlight ? 'text-emerald-400' : 'text-zinc-200'}`}>
          {value}
        </span>
      </div>
      {sub && <p className="text-[10px] text-zinc-500 mt-0.5">{sub}</p>}
    </div>
  )
}

function ArchiveCard({ item, onEdit, onDelete }) {
  const tagClass = TAG_COLORS[item.tag] ?? TAG_COLORS['독서']

  const handleDelete = () => {
    if (window.confirm(`「${item.title}」 기록을 삭제할까요?`)) onDelete()
  }

  return (
    <div className="card-glow bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4 group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded border ${tagClass}`}>
          {item.tag}
        </span>
        <div className="flex gap-0.5">
          <button
            type="button"
            onClick={onEdit}
            className="p-1 text-zinc-500 hover:text-cyan-400 transition-colors"
            aria-label="수정"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
            aria-label="삭제"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <h3 className="text-sm font-semibold text-zinc-100 mb-1">{item.title}</h3>
      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">{item.note}</p>
      <p className="text-[10px] text-zinc-600 mt-2">{item.date}</p>
    </div>
  )
}

function computeMonthSummary(dailyLogs, weeklyMetrics, year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  let workoutDays = 0

  for (let d = 1; d <= daysInMonth; d++) {
    const key = formatDateKey(new Date(year, month, d))
    if (dailyLogs[key]?.workout) workoutDays++
  }

  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`
  const monthMetrics = weeklyMetrics.filter((w) => w.date?.startsWith(monthPrefix))
  const totalDistance = monthMetrics.reduce((sum, m) => sum + (m.distance || 0), 0)

  let bodyFatChange = null
  if (monthMetrics.length >= 2) {
    const sorted = [...monthMetrics].sort((a, b) => a.week - b.week)
    bodyFatChange = sorted[sorted.length - 1].bodyFat - sorted[0].bodyFat
  }

  return { workoutDays, totalDistance, bodyFatChange }
}
