import { DAY_KEYS, DAY_LABELS } from './constants'

/** 대시보드 기준 타임존 — 아카이브·데일리·헤더 날짜 등 */
export const APP_TIMEZONE = 'Asia/Seoul'

const WEEKDAY_TO_KEY = {
  Sun: 'Sun',
  Mon: 'Mon',
  Tue: 'Tue',
  Wed: 'Wed',
  Thu: 'Thu',
  Fri: 'Fri',
  Sat: 'Sat',
}

export function formatDateKey(date = new Date(), timeZone = APP_TIMEZONE) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function formatDisplayDate(date = new Date()) {
  const key = formatDateKey(date)
  const [y, m, d] = key.split('-')
  const dayLabel = DAY_LABELS[getDayKey(date)]
  return `${y}.${m}.${d} ${dayLabel}요일`
}

export function getDayKey(date = new Date()) {
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: APP_TIMEZONE,
    weekday: 'short',
  }).format(date)
  return WEEKDAY_TO_KEY[weekday] ?? DAY_KEYS[date.getDay()]
}

export function getMarathonDDay(marathonDate) {
  const target = parseDateKey(marathonDate)
  const today = parseDateKey(formatDateKey())
  const diff = Math.round((target - today) / (1000 * 60 * 60 * 24))
  if (diff > 0) return { label: `D-${diff}`, days: diff }
  if (diff === 0) return { label: 'D-Day', days: 0 }
  return { label: `D+${Math.abs(diff)}`, days: diff }
}

export function getWeekStart(date = new Date()) {
  const d = parseDateKey(formatDateKey(date))
  const dayKey = getDayKey(d)
  const dayIndex = DAY_KEYS.indexOf(dayKey)
  const diff = dayIndex === 0 ? -6 : 1 - dayIndex
  d.setDate(d.getDate() + diff)
  return d
}

export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

export function getMonthDays(year, month) {
  const days = getDaysInMonth(year, month)
  const firstDay = new Date(year, month, 1).getDay()
  return { days, firstDay, year, month }
}

export function parseDateKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(date, days) {
  const d = parseDateKey(formatDateKey(date))
  d.setDate(d.getDate() + days)
  return d
}

export function isSameDay(a, b) {
  return formatDateKey(a) === formatDateKey(b)
}

export function isFutureDate(date) {
  return formatDateKey(date) > formatDateKey()
}

export function formatShortDotDate(dateKey) {
  const [, m, d] = dateKey.split('-')
  return `${m}.${d}`
}

export function formatShortDate(date = new Date()) {
  const key = formatDateKey(date)
  const [y, m, d] = key.split('-')
  const dayLabel = DAY_LABELS[getDayKey(date)]
  return `${y}.${m}.${d} (${dayLabel})`
}
