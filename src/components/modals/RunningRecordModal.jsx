import { useState, useEffect } from 'react'
import Modal from '../Modal'
import { createMeasurementId, sortByDate } from '../../utils/storage'

export default function RunningRecordModal({
  open,
  onClose,
  records,
  onSave,
  editEntry = null,
}) {
  const isEdit = Boolean(editEntry)
  const sorted = sortByDate(records)
  const latest = sorted[sorted.length - 1]

  const [form, setForm] = useState(emptyForm(isEdit, editEntry, latest))

  useEffect(() => {
    if (open) {
      setForm(emptyForm(isEdit, editEntry, latest))
    }
  }, [open, isEdit, editEntry, latest])

  const handleSubmit = (e) => {
    e.preventDefault()
    const entry = {
      id: isEdit ? editEntry.id : createMeasurementId('run'),
      date: form.date,
      distance: Number(form.distance),
      avgHr: Number(form.avgHr),
      pace: form.pace,
    }

    let updated
    if (isEdit) {
      updated = records.map((m) => (m.id === editEntry.id ? entry : m))
    } else {
      updated = [...records, entry]
    }
    onSave(sortByDate(updated))
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? '✏️ 러닝 기록 수정' : '➕ 러닝 기록'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="기록 날짜"
            type="date"
            value={form.date}
            onChange={(v) => setForm((p) => ({ ...p, date: v }))}
            className="col-span-2"
          />
          <Field
            label="주행 거리 (km)"
            type="number"
            step="0.1"
            value={form.distance}
            onChange={(v) => setForm((p) => ({ ...p, distance: v }))}
          />
          <Field
            label="평균 심박 (bpm)"
            type="number"
            value={form.avgHr}
            onChange={(v) => setForm((p) => ({ ...p, avgHr: v }))}
          />
          <Field
            label="평균 페이스"
            type="text"
            placeholder="7:30"
            value={form.pace}
            onChange={(v) => setForm((p) => ({ ...p, pace: v }))}
            className="col-span-2"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2.5 text-sm font-medium text-white bg-gradient-to-r from-cyan-600 to-indigo-600 rounded-lg hover:from-cyan-500 hover:to-indigo-500 transition-all"
        >
          {isEdit ? '수정 저장' : '기록 저장'}
        </button>
      </form>
    </Modal>
  )
}

function emptyForm(isEdit, editEntry, latest) {
  if (isEdit && editEntry) {
    return {
      date: editEntry.date ?? '',
      distance: editEntry.distance,
      avgHr: editEntry.avgHr,
      pace: editEntry.pace,
    }
  }
  return {
    date: new Date().toISOString().slice(0, 10),
    distance: latest?.distance ?? '',
    avgHr: latest?.avgHr ?? '',
    pace: latest?.pace ?? '',
  }
}

function Field({ label, type, value, onChange, className = '', ...rest }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs text-zinc-400 mb-1 block">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="w-full px-3 py-2 text-base bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        {...rest}
      />
    </label>
  )
}
