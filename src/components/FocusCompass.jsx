import { useState, useEffect, useRef, useCallback } from 'react'
import { Pencil } from 'lucide-react'
import { getMarathonDDay } from '../utils/dates'

const CARD_META = {
  target: {
    label: '🎯 TARGET',
    accent: 'border-emerald-500/25 from-emerald-500/10',
    subClass: 'text-emerald-400/90',
  },
  mindset: {
    label: '🧭 MOTTO',
    accent: 'border-cyan-500/25 from-cyan-500/10',
    subClass: 'text-cyan-400/80',
  },
  insight: {
    label: '💡 INSIGHT',
    accent: 'border-indigo-500/25 from-indigo-500/10',
    subClass: 'text-indigo-400/80',
  },
}

export default function FocusCompass({ data, onUpdate, insightPinFlash }) {
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(null)
  const [insightGlow, setInsightGlow] = useState(false)
  const cardRef = useRef(null)

  useEffect(() => {
    if (!insightPinFlash) return
    setInsightGlow(true)
    const t = setTimeout(() => setInsightGlow(false), 2200)
    return () => clearTimeout(t)
  }, [insightPinFlash])

  const startEdit = useCallback(
    (key) => {
      setEditing(key)
      if (key === 'target') {
        setForm({ ...data.target })
      } else if (key === 'mindset') {
        setForm({ ...data.mindset })
      } else {
        setForm({ title: data.insight.title, sub: data.insight.sub })
      }
    },
    [data],
  )

  const cancelEdit = useCallback(() => {
    setEditing(null)
    setForm(null)
  }, [])

  const saveEdit = useCallback(() => {
    if (!editing || !form) return
    if (editing === 'target') {
      onUpdate((prev) => ({
        ...prev,
        target: {
          title: form.title?.trim() || prev.target.title,
          eventTitle: form.eventTitle?.trim() || prev.target.eventTitle,
          targetDate: form.targetDate || prev.target.targetDate,
        },
      }))
    } else if (editing === 'mindset') {
      onUpdate((prev) => ({
        ...prev,
        mindset: {
          title: form.title?.trim() || prev.mindset.title,
          sub: form.sub?.trim() || prev.mindset.sub,
        },
      }))
    } else {
      onUpdate((prev) => ({
        ...prev,
        insight: {
          ...prev.insight,
          title: form.title?.trim() || prev.insight.title,
          sub: form.sub?.trim() || prev.insight.sub,
        },
      }))
    }
    cancelEdit()
  }, [editing, form, onUpdate, cancelEdit])

  const handleBlur = (e) => {
    if (cardRef.current?.contains(e.relatedTarget)) return
    saveEdit()
  }

  const dday = getMarathonDDay(data.target.targetDate)
  const ddayBadge = `🏃 ${data.target.eventTitle} ${dday.label}`

  return (
    <section>
      <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
        Focus & Compass
      </h2>

      <div className="flex md:grid md:grid-cols-3 gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory pb-1 -mx-1 px-1 md:overflow-visible md:mx-0 md:px-0">
        <FocusCard
          meta={CARD_META.target}
          editing={editing === 'target'}
          onStartEdit={() => startEdit('target')}
          onSave={saveEdit}
          onCancel={cancelEdit}
          onBlur={handleBlur}
          cardRef={editing === 'target' ? cardRef : null}
        >
          {editing === 'target' ? (
            <div className="space-y-2" onKeyDown={(e) => e.key === 'Enter' && saveEdit()}>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="단기 목표"
                className="w-full px-2 py-2 text-base bg-zinc-800/80 border border-zinc-600 rounded-lg text-zinc-100"
              />
              <input
                type="text"
                value={form.eventTitle}
                onChange={(e) => setForm((f) => ({ ...f, eventTitle: e.target.value }))}
                placeholder="이벤트명 (예: 10km 마라톤)"
                className="w-full px-2 py-2 text-base bg-zinc-800/80 border border-zinc-600 rounded-lg text-zinc-100"
              />
              <input
                type="date"
                value={form.targetDate}
                onChange={(e) => setForm((f) => ({ ...f, targetDate: e.target.value }))}
                className="w-full px-2 py-2 text-base text-center bg-zinc-800/80 border border-zinc-600 rounded-lg text-zinc-100 date-input"
              />
              <button
                type="button"
                onClick={saveEdit}
                className="w-full py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg"
              >
                저장
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="text-left w-full group/content"
              onClick={() => startEdit('target')}
            >
              <p className="text-sm md:text-base font-medium text-zinc-100 leading-snug mb-2 group-hover/content:text-emerald-50 transition-colors">
                {data.target.title}
              </p>
              <p className={`text-xs font-medium ${CARD_META.target.subClass}`}>{ddayBadge}</p>
            </button>
          )}
        </FocusCard>

        <FocusCard
          meta={CARD_META.mindset}
          editing={editing === 'mindset'}
          onStartEdit={() => startEdit('mindset')}
          onSave={saveEdit}
          onCancel={cancelEdit}
          onBlur={handleBlur}
          cardRef={editing === 'mindset' ? cardRef : null}
        >
          {editing === 'mindset' ? (
            <div className="space-y-2" onKeyDown={(e) => e.key === 'Enter' && e.ctrlKey && saveEdit()}>
              <textarea
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                rows={3}
                placeholder="마인드셋 / 좌우명"
                className="w-full px-2 py-2 text-base bg-zinc-800/80 border border-zinc-600 rounded-lg text-zinc-100 resize-none"
              />
              <input
                type="text"
                value={form.sub}
                onChange={(e) => setForm((f) => ({ ...f, sub: e.target.value }))}
                placeholder="출처 / 태그"
                className="w-full px-2 py-2 text-base bg-zinc-800/80 border border-zinc-600 rounded-lg text-zinc-100"
              />
              <button
                type="button"
                onClick={saveEdit}
                className="w-full py-1.5 text-xs font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 rounded-lg"
              >
                저장
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="text-left w-full group/content"
              onClick={() => startEdit('mindset')}
            >
              <p className="text-sm md:text-base font-medium text-zinc-100 leading-relaxed mb-2 whitespace-pre-line break-words group-hover/content:text-cyan-50 transition-colors">
                {data.mindset.title}
              </p>
              <p className={`text-xs ${CARD_META.mindset.subClass}`}>{data.mindset.sub}</p>
            </button>
          )}
        </FocusCard>

        <FocusCard
          meta={CARD_META.insight}
          editing={editing === 'insight'}
          onStartEdit={() => startEdit('insight')}
          onSave={saveEdit}
          onCancel={cancelEdit}
          onBlur={handleBlur}
          cardRef={editing === 'insight' ? cardRef : null}
          glow={insightGlow}
        >
          {editing === 'insight' ? (
            <div className="space-y-2" onKeyDown={(e) => e.key === 'Enter' && e.ctrlKey && saveEdit()}>
              <textarea
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                rows={3}
                placeholder="인사이트 본문"
                className="w-full px-2 py-2 text-base bg-zinc-800/80 border border-zinc-600 rounded-lg text-zinc-100 resize-none"
              />
              <input
                type="text"
                value={form.sub}
                onChange={(e) => setForm((f) => ({ ...f, sub: e.target.value }))}
                placeholder="출처 / 일자"
                className="w-full px-2 py-2 text-base bg-zinc-800/80 border border-zinc-600 rounded-lg text-zinc-100"
              />
              <button
                type="button"
                onClick={saveEdit}
                className="w-full py-1.5 text-xs font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 rounded-lg"
              >
                저장
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="text-left w-full group/content"
              onClick={() => startEdit('insight')}
            >
              <p className="text-sm md:text-base font-medium text-zinc-100 leading-relaxed mb-2 whitespace-pre-line break-words group-hover/content:text-indigo-50 transition-colors">
                {data.insight.title}
              </p>
              <p className={`text-xs ${CARD_META.insight.subClass}`}>{data.insight.sub}</p>
            </button>
          )}
        </FocusCard>
      </div>
    </section>
  )
}

function FocusCard({
  meta,
  editing,
  onStartEdit,
  onSave,
  onBlur,
  cardRef,
  glow,
  children,
}) {
  return (
    <div
      ref={cardRef}
      onBlur={editing ? onBlur : undefined}
      className={`focus-compass-card snap-center shrink-0 w-[88%] sm:w-[72%] md:w-auto min-w-0 flex-1 card-glow bg-gradient-to-br ${meta.accent} to-zinc-900/40 backdrop-blur-md border rounded-xl p-4 relative transition-all duration-500 ${
        glow ? 'focus-insight-pin-glow' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          {meta.label}
        </span>
        {!editing && (
          <button
            type="button"
            onClick={onStartEdit}
            className="p-1.5 text-zinc-500 hover:text-zinc-200 bg-zinc-800/60 border border-zinc-700/60 rounded-lg transition-colors"
            aria-label="수정"
          >
            <Pencil size={13} />
          </button>
        )}
      </div>
      {children}
    </div>
  )
}
