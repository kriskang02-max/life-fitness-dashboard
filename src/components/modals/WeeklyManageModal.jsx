import { Pencil, Trash2 } from 'lucide-react'
import Modal from '../Modal'

export default function WeeklyManageModal({
  open,
  onClose,
  metrics,
  onEdit,
  onDelete,
}) {
  const sorted = [...metrics].sort((a, b) => a.week - b.week)

  const handleDelete = (entry) => {
    const ok = window.confirm(
      `${entry.week}주차 기록을 삭제할까요?\n(체중 ${entry.weight}kg · 거리 ${entry.distance}km)`,
    )
    if (ok) onDelete(entry.week)
  }

  return (
    <Modal open={open} onClose={onClose} title="📋 주간 기록 관리" wide>
      {sorted.length === 0 ? (
        <p className="text-sm text-zinc-500 text-center py-8">등록된 주간 기록이 없습니다.</p>
      ) : (
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-zinc-500 border-b border-zinc-800">
                <th className="py-2 px-2 font-medium">주차</th>
                <th className="py-2 px-2 font-medium">날짜</th>
                <th className="py-2 px-2 font-medium">체중</th>
                <th className="py-2 px-2 font-medium">체지방</th>
                <th className="py-2 px-2 font-medium">거리</th>
                <th className="py-2 px-2 font-medium">심박</th>
                <th className="py-2 px-2 font-medium">페이스</th>
                <th className="py-2 px-2 font-medium text-right">액션</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr
                  key={row.week}
                  className="border-b border-zinc-800/60 hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="py-2.5 px-2 text-zinc-200 font-medium">{row.week}주</td>
                  <td className="py-2.5 px-2 text-zinc-400">{row.date ?? '—'}</td>
                  <td className="py-2.5 px-2 text-zinc-300">{row.weight} kg</td>
                  <td className="py-2.5 px-2 text-zinc-300">{row.bodyFat}%</td>
                  <td className="py-2.5 px-2 text-zinc-300">{row.distance} km</td>
                  <td className="py-2.5 px-2 text-zinc-300">{row.avgHr} bpm</td>
                  <td className="py-2.5 px-2 text-zinc-300">{row.pace}</td>
                  <td className="py-2.5 px-2">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(row)}
                        className="p-1.5 text-zinc-400 hover:text-cyan-400 hover:bg-zinc-800 rounded-lg transition-colors"
                        aria-label="수정"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(row)}
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
      )}
    </Modal>
  )
}
