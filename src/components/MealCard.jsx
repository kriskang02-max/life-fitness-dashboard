import { Pencil, Trash2 } from 'lucide-react'

function formatMacro(value, unit = 'g') {
  const n = Number(value) || 0
  const display = Number.isInteger(n) ? String(n) : n.toFixed(1)
  return `${display}${unit}`
}

export default function MealCard({ meal, onDelete, onReuseInput }) {
  return (
    <article className="card-glow rounded-xl border border-zinc-800/70 bg-zinc-900/60 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-zinc-500">
            {meal.source === 'heuristic' ? '휴리스틱 추정' : `AI 파서 · ${meal.provider ?? 'unknown'}`}
            {meal.model ? ` · ${meal.model}` : ''}
          </p>
          <p className="text-sm text-zinc-200 break-words">{meal.text || '입력 원문 없음'}</p>
        </div>
        <button
          type="button"
          onClick={() => onDelete(meal.id)}
          className="shrink-0 p-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-red-400 hover:border-red-500/40"
          aria-label="식사 삭제"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <ul className="space-y-1.5">
        {meal.items.map((item, index) => (
          <li key={`${item.name}-${index}`} className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-2 text-xs">
            <span className="text-zinc-300 truncate">{item.name}</span>
            <span className="text-zinc-500">{item.amount || '—'}</span>
            <span className="text-amber-300">{formatMacro(item.calories, 'kcal')}</span>
            <span className="text-cyan-300">{formatMacro(item.protein)}</span>
            <span className="text-emerald-300">{formatMacro(item.carbs)}</span>
            <span className="text-fuchsia-300">{formatMacro(item.fat)}</span>
          </li>
        ))}
      </ul>

      <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <span className="text-zinc-300">총 칼로리: <strong className="text-amber-300">{formatMacro(meal.totals.calories, 'kcal')}</strong></span>
          <span className="text-zinc-300">단백질: <strong className="text-cyan-300">{formatMacro(meal.totals.protein)}</strong></span>
          <span className="text-zinc-300">탄수화물: <strong className="text-emerald-300">{formatMacro(meal.totals.carbs)}</strong></span>
          <span className="text-zinc-300">지방: <strong className="text-fuchsia-300">{formatMacro(meal.totals.fat)}</strong></span>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onReuseInput(meal.text)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 border border-zinc-700 rounded-lg hover:bg-zinc-800"
        >
          <Pencil size={12} />
          원문 불러오기
        </button>
      </div>
    </article>
  )
}
