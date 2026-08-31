import { useState, useEffect } from 'react'
import Modal from '../Modal'
import { createMeasurementId, sortByDate } from '../../utils/storage'

export default function BodyMeasurementModal({
  open,
  onClose,
  measurements,
  onSave,
  editEntry = null,
}) {
  const isEdit = Boolean(editEntry)
  const sorted = sortByDate(measurements)
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
      id: isEdit ? editEntry.id : createMeasurementId('body'),
      date: form.date,
      weight: Number(form.weight),
      bodyFat: Number(form.bodyFat),
    }

    let updated
    if (isEdit) {
      updated = measurements.map((m) => (m.id === editEntry.id ? entry : m))
    } else {
      updated = [...measurements, entry]
    }
    onSave(sortByDate(updated))
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? '✏️ 체성분 기록 수정' : '➕ 체성분 기록'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="측정 날짜"
            type="date"
            value={form.date}
            onChange={(v) => setForm((p) => ({ ...p, date: v }))}
            className="col-span-2"
          />
          <Field
            label="체중 (kg)"
            type="number"
            step="0.1"
            value={form.weight}
            onChange={(v) => setForm((p) => ({ ...p, weight: v }))}
          />
          <Field
            label="체지방률 (%)"
            type="number"
            step="0.1"
            value={form.bodyFat}
            onChange={(v) => setForm((p) => ({ ...p, bodyFat: v }))}
          />
        </div>
        <button
          type="submit"
          className="w-full py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-emerald-600 rounded-lg hover:from-indigo-500 hover:to-emerald-500 transition-all"
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
      weight: editEntry.weight,
      bodyFat: editEntry.bodyFat,
    }
  }
  return {
    date: new Date().toISOString().slice(0, 10),
    weight: latest?.weight ?? '',
    bodyFat: latest?.bodyFat ?? '',
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
        className="w-full px-3 py-2 text-base bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        {...rest}
      />
    </label>
  )
}
