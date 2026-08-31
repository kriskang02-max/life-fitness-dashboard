import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import Modal from '../Modal'
import { sortByDate } from '../../utils/storage'

export default function MeasurementManageModal({
  open,
  onClose,
  bodyMeasurements,
  runningRecords,
  onEditBody,
  onEditRunning,
  onDeleteBody,
  onDeleteRunning,
}) {
  const [tab, setTab] = useState('body')
  const bodySorted = sortByDate(bodyMeasurements)
  const runningSorted = sortByDate(runningRecords)

  const handleDeleteBody = (entry) => {
    const ok = window.confirm(
      `${entry.date} 체성분 기록을 삭제할까요?\n(체중 ${entry.weight}kg · 체지방 ${entry.bodyFat}%)`,
    )
    if (ok) onDeleteBody(entry.id)
  }

  const handleDeleteRunning = (entry) => {
    const ok = window.confirm(
      `${entry.date} 러닝 기록을 삭제할까요?\n(거리 ${entry.distance}km · 페이스 ${entry.pace})`,
    )
    if (ok) onDeleteRunning(entry.id)
  }

  return (
    <Modal open={open} onClose={onClose} title="📋 측정 기록 관리" wide>
      <div className="flex gap-2 mb-4">
        <TabButton active={tab === 'body'} onClick={() => setTab('body')}>
          체성분 ({bodySorted.length})
        </TabButton>
        <TabButton active={tab === 'running'} onClick={() => setTab('running')}>
          러닝 ({runningSorted.length})
        </TabButton>
      </div>

      {tab === 'body' ? (
        bodySorted.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-8">등록된 체성분 기록이 없습니다.</p>
        ) : (
          <RecordTable
            headers={['날짜', '체중', '체지방', '액션']}
            rows={bodySorted.map((row) => ({
              key: row.id,
              cells: [row.date, `${row.weight} kg`, `${row.bodyFat}%`],
              onEdit: () => onEditBody(row),
              onDelete: () => handleDeleteBody(row),
            }))}
          />
        )
      ) : runningSorted.length === 0 ? (
        <p className="text-sm text-zinc-500 text-center py-8">등록된 러닝 기록이 없습니다.</p>
      ) : (
        <RecordTable
          headers={['날짜', '거리', '심박', '페이스', '액션']}
          rows={runningSorted.map((row) => ({
            key: row.id,
            cells: [row.date, `${row.distance} km`, `${row.avgHr} bpm`, row.pace],
            onEdit: () => onEditRunning(row),
            onDelete: () => handleDeleteRunning(row),
          }))}
        />
      )}
    </Modal>
  )
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
        active
          ? 'text-indigo-300 bg-indigo-500/15 border-indigo-500/30'
          : 'text-zinc-400 bg-zinc-800/50 border-zinc-700 hover:text-zinc-200'
      }`}
    >
      {children}
    </button>
  )
}

function RecordTable({ headers, rows }) {
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-xs text-zinc-500 border-b border-zinc-800">
            {headers.map((h) => (
              <th
                key={h}
                className={`py-2 px-2 font-medium ${h === '액션' ? 'text-right' : ''}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.key}
              className="border-b border-zinc-800/60 hover:bg-zinc-800/30 transition-colors"
            >
              {row.cells.map((cell, i) => (
                <td key={i} className="py-2.5 px-2 text-zinc-300">{cell}</td>
              ))}
              <td className="py-2.5 px-2">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={row.onEdit}
                    className="p-1.5 text-zinc-400 hover:text-cyan-400 hover:bg-zinc-800 rounded-lg transition-colors"
                    aria-label="수정"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={row.onDelete}
                    className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                    aria-label="삭제"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
