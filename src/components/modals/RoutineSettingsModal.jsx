import { useState, useEffect } from 'react'
import Modal from '../Modal'
import {
  DAY_KEYS,
  DAY_LABELS,
  DAILY_CHECK_KEYS,
  DAILY_CHECK_LABELS,
  DEFAULT_DAILY_ITEMS_CONFIG,
} from '../../utils/constants'

export default function RoutineSettingsModal({
  open,
  onClose,
  routinePresets,
  dailyItemsConfig,
  onSaveWeekdays,
  onSaveDailyItems,
}) {
  const [tab, setTab] = useState('weekdays')
  const [weekdays, setWeekdays] = useState(routinePresets)
  const [items, setItems] = useState(dailyItemsConfig)

  useEffect(() => {
    if (open) {
      setWeekdays({ ...routinePresets })
      setItems({ ...dailyItemsConfig })
      setTab('weekdays')
    }
  }, [open, routinePresets, dailyItemsConfig])

  const updateItem = (key, field, value) => {
    setItems((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }))
  }

  const handleSave = () => {
    onSaveWeekdays(weekdays)
    onSaveDailyItems(items)
    onClose()
  }

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
