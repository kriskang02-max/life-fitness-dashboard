import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function PageSwipe({ pages }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [touchStartX, setTouchStartX] = useState(null)

  const safeIndex = Math.max(0, Math.min(activeIndex, pages.length - 1))

  const movePage = (delta) => {
    setActiveIndex((prev) => Math.max(0, Math.min(prev + delta, pages.length - 1)))
  }

  const onTouchStart = (e) => {
    setTouchStartX(e.changedTouches?.[0]?.clientX ?? null)
  }

  const onTouchEnd = (e) => {
    const endX = e.changedTouches?.[0]?.clientX
    if (touchStartX == null || endX == null) return
    const distance = endX - touchStartX
    if (Math.abs(distance) < 45) return
    if (distance < 0) movePage(1)
    if (distance > 0) movePage(-1)
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {pages.map((page, index) => (
            <button
              key={page.key}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                safeIndex === index
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                  : 'border-zinc-700 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {page.title}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => movePage(-1)}
            disabled={safeIndex === 0}
            className="p-1.5 rounded-lg border border-zinc-700 text-zinc-400 disabled:opacity-30"
            aria-label="이전 페이지"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            type="button"
            onClick={() => movePage(1)}
            disabled={safeIndex === pages.length - 1}
            className="p-1.5 rounded-lg border border-zinc-700 text-zinc-400 disabled:opacity-30"
            aria-label="다음 페이지"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {pages[safeIndex]?.content}
      </div>
    </section>
  )
}
