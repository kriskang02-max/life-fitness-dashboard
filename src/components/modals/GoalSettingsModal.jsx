import { useState, useEffect } from 'react'
import Modal from '../Modal'
import { DAILY_CHECK_KEYS } from '../../utils/constants'

export default function GoalSettingsModal({
  open,
  onClose,
  goalSettings,
  dailyItemsConfig,
  onSave,
}) {
  const [local, setLocal] = useState(goalSettings)

  useEffect(() => {
    if (open) setLocal({ ...goalSettings })
  }, [open, goalSettings])

  return (
    <Modal open={open} onClose={onClose} title="✏️ 목표 & D-Day 설정">
      <div className="space-y-4">
        <label className="block">
          <span className="text-xs text-zinc-400 mb-1 block">목표명</span>
          <input
            type="text"
            value={local.title}
            onChange={(e) => setLocal((p) => ({ ...p, title: e.target.value }))}
            className="w-full px-3 py-2 text-base bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            placeholder="🏃 10km 마라톤 완주"
          />
        </label>
        <label className="block">
          <span className="text-xs text-zinc-400 mb-1 block">목표 일자</span>
          <input
            type="date"
            value={local.targetDate}
            onChange={(e) => setLocal((p) => ({ ...p, targetDate: e.target.value }))}
            className="w-full px-3 py-2 text-base bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50 date-input"
          />
        </label>
        <label className="block">
          <span className="text-xs text-zinc-400 mb-1 block">연동 체크박스 (헤더 배지 연동)</span>
          <select
            value={local.linkedCheckKey ?? ''}
            onChange={(e) => setLocal((p) => ({ ...p, linkedCheckKey: e.target.value || null }))}
            className="w-full px-3 py-2 text-base bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="">연동 안 함</option>
            {DAILY_CHECK_KEYS.map((k, i) => {
              const cfg = dailyItemsConfig?.[k]
              const label = cfg
                ? `[체크박스 ${i + 1}] ${cfg.emoji} ${cfg.label}`
                : `[체크박스 ${i + 1}]`
              return (
                <option key={k} value={k}>{label}</option>
              )
            })}
          </select>
        </label>
        <button
          type="button"
          onClick={() => {
            onSave(local)
            onClose()
          }}
          className="w-full py-2.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-lg hover:from-emerald-500 hover:to-cyan-500 transition-all"
        >
          저장
        </button>
      </div>
    </Modal>
  )
}
