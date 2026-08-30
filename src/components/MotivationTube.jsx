import { useState } from 'react'
import { Plus, Play, Pencil, Trash2, Link2 } from 'lucide-react'
import MotivationVideoModal from './modals/MotivationVideoModal'
import { parseYoutubeUrl, buildYoutubeEmbedUrl } from '../utils/youtube'
import { formatDateKey } from '../utils/dates'

const TAG_COLORS = {
  동기부여: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  마인드셋: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  러닝: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  인사이트: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
}

function createEntryId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `vid-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export default function MotivationTube({ data, onUpdate }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editEntry, setEditEntry] = useState(null)
  const [quickUrl, setQuickUrl] = useState('')
  const [quickError, setQuickError] = useState('')

  const playlist = data.playlist ?? []
  const activeVideoId = data.activeVideoId
  const activeItem =
    playlist.find((v) => v.videoId === activeVideoId) ?? playlist[0] ?? null

  const setActive = (videoId) => {
    onUpdate((prev) => ({ ...prev, activeVideoId: videoId }))
  }

  const openAdd = () => {
    setEditEntry(null)
    setModalOpen(true)
  }

  const openEdit = (item) => {
    setEditEntry(item)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditEntry(null)
  }

  const handleSave = ({ url, videoId, startSeconds, title, tag }) => {
    if (editEntry) {
      onUpdate((prev) => {
        const playlist = prev.playlist.map((item) =>
          item.id === editEntry.id
            ? {
                ...item,
                url,
                videoId,
                startSeconds,
                title,
                tag,
              }
            : item,
        )
        return {
          ...prev,
          playlist,
          activeVideoId: prev.activeVideoId === editEntry.videoId ? videoId : prev.activeVideoId,
        }
      })
    } else {
      const entry = {
        id: createEntryId(),
        videoId,
        url,
        startSeconds,
        title,
        tag,
        addedAt: formatDateKey(),
      }
      onUpdate((prev) => ({
        activeVideoId: videoId,
        playlist: [entry, ...prev.playlist],
      }))
    }
  }

  const handleDelete = (item) => {
    if (!window.confirm(`「${item.title}」 영상을 삭제할까요?`)) return
    onUpdate((prev) => {
      const playlist = prev.playlist.filter((v) => v.id !== item.id)
      let activeVideoId = prev.activeVideoId
      if (activeVideoId === item.videoId) {
        activeVideoId = playlist[0]?.videoId ?? null
      }
      return { activeVideoId, playlist }
    })
  }

  const handleQuickAdd = () => {
    const parsed = parseYoutubeUrl(quickUrl)
    if (!parsed) {
      setQuickError('유효한 유튜브 URL을 입력해주세요.')
      return
    }
    setQuickError('')
    const entry = {
      id: createEntryId(),
      videoId: parsed.videoId,
      url: parsed.url,
      startSeconds: parsed.startSeconds,
      title: '동기부여 영상',
      tag: '동기부여',
      addedAt: formatDateKey(),
    }
    onUpdate((prev) => ({
      activeVideoId: parsed.videoId,
      playlist: [entry, ...prev.playlist.filter((v) => v.videoId !== parsed.videoId)],
    }))
    setQuickUrl('')
  }

  const embedSrc = activeItem
    ? buildYoutubeEmbedUrl(
        activeItem.videoId,
        activeItem.startSeconds ?? parseYoutubeUrl(activeItem.url)?.startSeconds ?? 0,
      )
    : null

  const singleVideo = playlist.length === 1

  return (
    <section className="pb-2">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-amber-400/90 uppercase tracking-wider">
            🔥 MOTIVATION TUBE
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            도파민 낭비가 아닌, 목표 리마인드를 위한 고정 영상
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/25 rounded-lg hover:bg-amber-500/20 transition-colors shrink-0 self-start"
        >
          <Plus size={14} />
          영상 추가/변경
        </button>
      </div>

      {playlist.length === 0 ? (
        <div className="card-glow bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 space-y-3">
          <p className="text-sm text-zinc-400 text-center">
            등록된 영상이 없습니다. 유튜브 링크를 붙여넣어 첫 영상을 추가하세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              value={quickUrl}
              onChange={(e) => {
                setQuickUrl(e.target.value)
                setQuickError('')
              }}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 px-3 py-2 text-base bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
            />
            <button
              type="button"
              onClick={handleQuickAdd}
              className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-500 shrink-0"
            >
              등록
            </button>
          </div>
          {quickError && <p className="text-xs text-red-400">{quickError}</p>}
        </div>
      ) : (
        <div
          className={
            singleVideo
              ? 'space-y-4'
              : 'grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,20rem)] gap-4'
          }
        >
          <div className="card-glow bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-3 sm:p-4 w-full max-w-full overflow-hidden">
            {embedSrc && (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black/40 border border-zinc-800">
                <iframe
                  key={`${activeItem.videoId}-${activeItem.startSeconds ?? 0}`}
                  src={embedSrc}
                  title={activeItem.title}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            )}
            {activeItem && (
              <div className="mt-3 px-1">
                <p className="text-sm font-medium text-zinc-100">{activeItem.title}</p>
                <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                  <Link2 size={12} />
                  {activeItem.tag} · {activeItem.addedAt}
                </p>
              </div>
            )}

            {singleVideo && (
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  value={quickUrl}
                  onChange={(e) => {
                    setQuickUrl(e.target.value)
                    setQuickError('')
                  }}
                  placeholder="새 유튜브 URL로 교체..."
                  className="flex-1 px-3 py-2 text-base bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                />
                <button
                  type="button"
                  onClick={() => {
                    const parsed = parseYoutubeUrl(quickUrl)
                    if (!parsed) {
                      setQuickError('유효한 유튜브 URL을 입력해주세요.')
                      return
                    }
                    setQuickError('')
                    onUpdate((prev) => ({
                      activeVideoId: parsed.videoId,
                      playlist: [
                        {
                          ...prev.playlist[0],
                          videoId: parsed.videoId,
                          url: parsed.url,
                          startSeconds: parsed.startSeconds,
                        },
                      ],
                    }))
                    setQuickUrl('')
                  }}
                  className="px-4 py-2 text-sm font-medium text-amber-400 bg-amber-500/10 border border-amber-500/25 rounded-lg hover:bg-amber-500/20 shrink-0"
                >
                  URL 변경
                </button>
              </div>
            )}
            {quickError && singleVideo && <p className="text-xs text-red-400 mt-2">{quickError}</p>}
          </div>

          {!singleVideo && (
            <div className="card-glow bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-3 sm:p-4 space-y-2 max-h-[28rem] overflow-y-auto">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                반복 시청 플레이리스트
              </p>
              {playlist.map((item) => {
                const isActive = item.videoId === activeVideoId
                const tagClass = TAG_COLORS[item.tag] ?? TAG_COLORS['동기부여']
                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border transition-all ${
                      isActive
                        ? 'border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_16px_rgba(16,185,129,0.15)]'
                        : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded border ${tagClass}`}>
                        {item.tag}
                      </span>
                      {isActive && (
                        <span className="text-[10px] font-semibold text-emerald-400 shrink-0">
                          📌 현재 재생 중
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-zinc-100 leading-snug mb-1">{item.title}</p>
                    <p className="text-[10px] text-zinc-600 mb-2">{item.addedAt}</p>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setActive(item.videoId)}
                        className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded hover:bg-cyan-500/20"
                      >
                        <Play size={12} />
                        재생
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="p-1 text-zinc-500 hover:text-amber-400"
                        aria-label="수정"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="p-1 text-zinc-500 hover:text-red-400"
                        aria-label="삭제"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <footer className="mt-8 pt-4 border-t border-zinc-800/60 text-center text-[10px] text-zinc-600">
        Life & Fitness Dashboard · Motivation Tube
      </footer>

      <MotivationVideoModal
        open={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        editEntry={editEntry}
      />
    </section>
  )
}
