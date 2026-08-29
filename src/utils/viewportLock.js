const VIEWPORT_CONTENT =
  'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'

/** iOS/iPad Safari: re-apply viewport after app switch or multitasking restore */
export function lockViewportScale() {
  const meta = document.querySelector('meta[name="viewport"]')
  if (meta) meta.setAttribute('content', VIEWPORT_CONTENT)
}

export function initViewportLock() {
  lockViewportScale()
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') lockViewportScale()
  })
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) lockViewportScale()
  })
}
