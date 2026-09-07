import { Eraser, RotateCcw } from 'lucide-react'

function fmt(value, unit) {
  const num = Number(value) || 0
  return `${Number.isInteger(num) ? num : num.toFixed(1)}${unit}`
}

function MacroBadge({ label, value, tone }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </span>
  )
}

export default function MealCard({
  slotKey,
  title,
  emoji,
  timeValue,
  textValue,
  meal,
  loading,
  hint,
  onTimeChange,
  onTextChange,
  onAnalyze,
  onClear,
  onRestore,
}) {
  const totals = meal?.totals ?? { calories: 0, carbs: 0, protein: 0, fat: 0, sugar: 0, sodium: 0 }
  const hasMeal = Boolean(meal?.text)

  return (
    <article className="card-glow rounded-2xl border border-zinc-800/80 bg-zinc-900/65 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider">{slotKey}</p>
          <h3 className="text-sm font-semibold text-zinc-100">{emoji} {title}</h3>
        </div>

        <div className="flex flex-wrap justify-end gap-1.5">
          {hasMeal && (
            <>
              <MacroBadge label="kcal" value={fmt(totals.calories, '')} tone="border-amber-500/30 bg-amber-500/10 text-amber-300" />
              <MacroBadge label="탄" value={fmt(totals.carbs, 'g')} tone="border-emerald-500/30 bg-emerald-500/10 text-emerald-300" />
              <MacroBadge label="단" value={fmt(totals.protein, 'g')} tone="border-cyan-500/30 bg-cyan-500/10 text-cyan-300" />
              <MacroBadge label="지" value={fmt(totals.fat, 'g')} tone="border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300" />
              <MacroBadge label="당" value={fmt(totals.sugar, 'g')} tone="border-orange-500/30 bg-orange-500/10 text-orange-300" />
              <MacroBadge label="나트륨" value={fmt(totals.sodium, 'mg')} tone="border-sky-500/30 bg-sky-500/10 text-sky-300" />
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-[auto_1fr] gap-2">
        <input
          type="time"
          value={timeValue}
          onChange={(e) => onTimeChange(e.target.value)}
          className="px-2 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
          aria-label={`${title} 식사 시간`}
        />
        <input
          type="text"
          value={textValue}
          onChange={(e) => onTextChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onAnalyze()
            }
          }}
          placeholder="예: 장어 1.5마리, 밥 0.3공기, 밑반찬, 제로콜라 1캔"
          className="px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
          aria-label={`${title} 식사 입력`}
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-lg hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-50"
        >
          {loading && <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
          {loading ? '분석 중...' : '기록/분석'}
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onRestore}
            className="p-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-zinc-100"
            aria-label="저장된 값 복원"
          >
            <RotateCcw size={14} />
          </button>
          <button
            type="button"
            onClick={onClear}
            className="p-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-red-400 hover:border-red-500/40"
            aria-label="해당 끼니 초기화"
          >
            <Eraser size={14} />
          </button>
        </div>
      </div>

      {hint && <p className="text-xs text-zinc-400">{hint}</p>}
    </article>
  )
}
