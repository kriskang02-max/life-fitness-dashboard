import { Plus, TrendingDown, TrendingUp, Activity, Target, ClipboardList, Scale } from 'lucide-react'
import BodyCompositionChart from './charts/BodyCompositionChart'
import CardioEfficiencyChart from './charts/CardioEfficiencyChart'
import { countWeeklyScore, sortByDate } from '../utils/storage'
import { getWeekStart } from '../utils/dates'

export default function WeeklyEngine({
  bodyMeasurements,
  runningRecords,
  dailyLogs,
  onOpenBodyModal,
  onOpenRunningModal,
  onOpenManageModal,
}) {
  const today = new Date()
  const weekStart = getWeekStart(today)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  const weekScore = countWeeklyScore(dailyLogs, weekStart, weekEnd)

  const bodySorted = sortByDate(bodyMeasurements)
  const runningSorted = sortByDate(runningRecords)
  const latestBody = bodySorted[bodySorted.length - 1]
  const prevBody = bodySorted.length > 1 ? bodySorted[bodySorted.length - 2] : null
  const latestRun = runningSorted[runningSorted.length - 1]

  const bodyFatDelta = latestBody && prevBody ? (latestBody.bodyFat - prevBody.bodyFat).toFixed(1) : null
  const bodyFatTrend = bodyFatDelta !== null ? (parseFloat(bodyFatDelta) <= 0 ? 'down' : 'up') : null

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
          체성분 · 러닝 기록
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenManageModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/20 transition-colors"
          >
            <ClipboardList size={14} />
            기록 관리
          </button>
          <button
            type="button"
            onClick={onOpenBodyModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors"
          >
            <Scale size={14} />
            체성분 입력
          </button>
          <button
            type="button"
            onClick={onOpenRunningModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-lg hover:bg-cyan-500/20 transition-colors"
          >
            <Plus size={14} />
            러닝 입력
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <KpiCard
          icon={<Target size={18} className="text-emerald-400" />}
          label="이번 주 실천 스코어"
          value={`${weekScore.completed}/${weekScore.total}`}
          sub={`${weekScore.percent}% 달성 (만점 ${weekScore.total})`}
          accent="emerald"
        />
        <KpiCard
          icon={
            bodyFatTrend === 'down'
              ? <TrendingDown size={18} className="text-emerald-400" />
              : <TrendingUp size={18} className="text-amber-400" />
          }
          label="최신 체지방률"
          value={latestBody ? `${latestBody.bodyFat}%` : '—'}
          sub={
            bodyFatDelta !== null
              ? `이전 측정 대비 ${parseFloat(bodyFatDelta) > 0 ? '+' : ''}${bodyFatDelta}%p`
              : '데이터 없음'
          }
          accent={bodyFatTrend === 'down' ? 'emerald' : 'amber'}
        />
        <KpiCard
          icon={<Activity size={18} className="text-cyan-400" />}
          label="최근 러닝 요약"
          value={latestRun ? `${latestRun.pace} 페이스` : '—'}
          sub={latestRun ? `@ 심박 ${latestRun.avgHr}bpm · ${latestRun.distance}km` : '데이터 없음'}
          accent="cyan"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-w-0">
        <div className="card-glow bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4 w-full max-w-full overflow-hidden min-w-0">
          <BodyCompositionChart measurements={bodyMeasurements} />
        </div>
        <div className="card-glow bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4 w-full max-w-full overflow-hidden min-w-0">
          <CardioEfficiencyChart records={runningRecords} />
        </div>
      </div>
    </section>
  )
}

function KpiCard({ icon, label, value, sub, accent }) {
  const borderColors = {
    emerald: 'border-emerald-500/20',
    cyan: 'border-cyan-500/20',
    amber: 'border-amber-500/20',
  }

  return (
    <div className={`card-glow bg-zinc-900/60 border ${borderColors[accent]} rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-zinc-500">{label}</span>
      </div>
      <p className="text-xl font-bold text-zinc-100">{value}</p>
      <p className="text-xs text-zinc-500 mt-1">{sub}</p>
    </div>
  )
}
