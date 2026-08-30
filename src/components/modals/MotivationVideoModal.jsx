import { useState, useEffect } from 'react'
import Modal from '../Modal'
import { MOTIVATION_VIDEO_TAGS } from '../../utils/constants'
import { parseYoutubeUrl } from '../../utils/youtube'

export default function MotivationVideoModal({
  open,
  onClose,
  onSave,
  editEntry = null,
}) {
  const isEdit = Boolean(editEntry)
  const [form, setForm] = useState({ url: '', title: '', tag: '동기부여' })
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setError('')
      if (editEntry) {
        setForm({
          url: editEntry.url,
          title: editEntry.title ?? '',
          tag: editEntry.tag ?? '동기부여',
        })
      } else {
        setForm({ url: '', title: '', tag: '동기부여' })
      }
    }
  }, [open, editEntry])

  const handleSubmit = (e) => {
    e.preventDefault()
    const parsed = parseYoutubeUrl(form.url)
    if (!parsed) {
      setError('유효한 유튜브 URL을 입력해주세요.')
      return
    }
    onSave({
      url: parsed.url,
      videoId: parsed.videoId,
      startSeconds: parsed.startSeconds,
      title: form.title.trim() || '동기부여 영상',
      tag: form.tag,
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? '✏️ 영상 수정' : '➕ 영상 등록'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-xs text-zinc-400 mb-1 block">유튜브 URL (필수)</span>
          <input
            type="url"
            value={form.url}
            onChange={(e) => {
              setForm((p) => ({ ...p, url: e.target.value }))
              setError('')
            }}
            required
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-3 py-2 text-base bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </label>
        <label className="block">
          <span className="text-xs text-zinc-400 mb-1 block">영상 제목 / 한 줄 모티베이션 메모</span>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="한계에 부딪힐 때마다 보는 마인드셋"
            className="w-full px-3 py-2 text-base bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </label>
        <label className="block">
          <span className="text-xs text-zinc-400 mb-1 block">카테고리 태그</span>
          <select
            value={form.tag}
            onChange={(e) => setForm((p) => ({ ...p, tag: e.target.value }))}
            className="w-full px-3 py-2 text-base bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
          >
            {MOTIVATION_VIDEO_TAGS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          className="w-full py-2.5 text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg hover:from-amber-500 hover:to-orange-500 transition-all"
        >
          {isEdit ? '수정 저장' : '등록'}
        </button>
      </form>
    </Modal>
  )
}
