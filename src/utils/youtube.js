/** @typedef {{ videoId: string, startSeconds: number, url: string }} ParsedYoutube */

function parseTimestampParam(t) {
  if (!t) return 0
  const raw = String(t).trim()
  if (/^\d+$/.test(raw)) return parseInt(raw, 10)

  let seconds = 0
  const hours = raw.match(/(\d+)h/i)
  const minutes = raw.match(/(\d+)m/i)
  const secs = raw.match(/(\d+)s/i)
  if (hours) seconds += parseInt(hours[1], 10) * 3600
  if (minutes) seconds += parseInt(minutes[1], 10) * 60
  if (secs) seconds += parseInt(secs[1], 10)
  return seconds
}

function extractVideoId(input) {
  const trimmed = input.trim()
  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=|youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match) return match[1]
  }
  return null
}

function extractStartSeconds(input) {
  const trimmed = input.trim()
  let startSeconds = 0

  try {
    const normalized = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`
    const url = new URL(normalized)
    const t = url.searchParams.get('t') || url.searchParams.get('start')
    if (t) startSeconds = parseTimestampParam(t)
  } catch {
    const tMatch = trimmed.match(/[?&]t=([^&]+)/)
    if (tMatch) startSeconds = parseTimestampParam(tMatch[1])
  }

  return startSeconds
}

/** 유튜브 URL → videoId + 시작 시각 */
export function parseYoutubeUrl(input) {
  if (!input?.trim()) return null
  const trimmed = input.trim()
  const videoId = extractVideoId(trimmed)
  if (!videoId) return null

  const startSeconds = extractStartSeconds(trimmed)
  const url = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`

  return { videoId, startSeconds, url }
}

export function buildYoutubeEmbedUrl(videoId, startSeconds = 0) {
  const base = `https://www.youtube.com/embed/${videoId}`
  const params = new URLSearchParams({ rel: '0', modestbranding: '1' })
  if (startSeconds > 0) params.set('start', String(startSeconds))
  return `${base}?${params.toString()}`
}

export function buildYoutubeWatchUrl(videoId, startSeconds = 0) {
  const base = `https://www.youtube.com/watch?v=${videoId}`
  if (startSeconds > 0) return `${base}&t=${startSeconds}s`
  return base
}
