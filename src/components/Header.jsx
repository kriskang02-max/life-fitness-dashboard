import { Settings, Database, Cloud } from 'lucide-react'
import { formatDisplayDate, formatDateKey } from '../utils/dates'
import { ensureTodayLog, getDayCompletionCount } from '../utils/storage'

export default function Header({
  onOpenRoutine,
  onOpenBackup,
  onOpenSync,
  dailyLogs,
  syncStatus,
}) {
  const today = new Date()
  const logs = ensureTodayLog(dailyLogs)
  const todayKey = formatDateKey(today)
  const todayCount = getDayCompletionCount(logs[todayKey])

  const statusBadge =
    todayCount === 4
      ? { text: '🔥 All Clear', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' }
      : todayCount >= 2
        ? { text: '⚡ In Progress', className: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' }
        : { text: '🌱 Start Today', className: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' }

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
          <span className={`inline-flex items-center px-2.5 sm:px-3 py-1 text-xs font-medium rounded-full border shrink-0 ${statusBadge.className}`}>
            {statusBadge.text} · {todayCount}/4
          </span>

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
