import { STORAGE_KEYS, DEFAULT_DAILY_ITEMS_CONFIG, DEFAULT_GOAL_SETTINGS, DEFAULT_SYNC_SETTINGS, BUILTIN_SUPABASE, DEFAULT_FOCUS_COMPASS_DATA } from './constants'
import { formatDateKey } from './dates'

function generateMockDailyLogs() {
  const logs = {}
  const today = new Date()
  for (let i = 59; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = formatDateKey(d)
    const rand = Math.random()
    logs[key] = {
      workout: rand > 0.25,
      diet: rand > 0.2,
      dopamine: rand > 0.35,
      read: rand > 0.3,
    }
  }
  return logs
}

export const DEFAULT_ROUTINE_PRESETS = {
  Mon: '크로스핏',
  Tue: '크로스핏',
  Wed: '러닝 35분',
  Thu: '크로스핏',
  Fri: '러닝 35분',
  Sat: '장거리 러닝',
  Sun: '휴식 & 스트레칭',
}

export const DEFAULT_WEEKLY_METRICS = [
  { week: 1, date: '2026-07-06', weight: 84.2, bodyFat: 37.2, distance: 3.5, avgHr: 175, pace: '8:10' },
  { week: 2, date: '2026-07-13', weight: 83.8, bodyFat: 36.9, distance: 4.0, avgHr: 173, pace: '7:55' },
  { week: 3, date: '2026-07-20', weight: 83.5, bodyFat: 36.7, distance: 4.5, avgHr: 171, pace: '7:50' },
  { week: 4, date: '2026-07-27', weight: 83.1, bodyFat: 36.5, distance: 5.0, avgHr: 170, pace: '7:45' },
  { week: 5, date: '2026-08-03', weight: 82.8, bodyFat: 36.3, distance: 5.5, avgHr: 168, pace: '7:40' },
  { week: 6, date: '2026-08-10', weight: 82.5, bodyFat: 36.1, distance: 6.0, avgHr: 167, pace: '7:35' },
  { week: 7, date: '2026-08-17', weight: 82.2, bodyFat: 35.8, distance: 6.5, avgHr: 166, pace: '7:32' },
  { week: 8, date: '2026-08-24', weight: 82.0, bodyFat: 35.6, distance: 7.0, avgHr: 165, pace: '7:30' },
]

export const DEFAULT_THOUGHT_ARCHIVE = [
  { id: 1, date: '2026-08-28', tag: '독서', title: '아토믹 해빗', note: '1% 개선의 복리 효과. 작은 습관이 정체기를 돌파한다.' },
  { id: 2, date: '2026-08-25', tag: '인사이트', title: '심박 존 트레이닝', note: 'Zone 2 유산소가 지방 연소와 회복력에 핵심. 155bpm 이하 유지.' },
  { id: 3, date: '2026-08-20', tag: '마인드셋', title: '프로세스 > 결과', note: '체중계 숫자보다 4개 데일리 루틴 완료율에 집중한다.' },
  { id: 4, date: '2026-08-15', tag: '독서', title: 'Why We Sleep', note: '수면 7시간 미만 시 회복과 심박 효율 모두 저하. 야식 차단과 연결.' },
]

export function normalizeWeekdays(raw) {
  if (!raw) return { ...DEFAULT_ROUTINE_PRESETS }
  if (raw.weekdays && typeof raw.weekdays === 'object') return { ...DEFAULT_ROUTINE_PRESETS, ...raw.weekdays }
  if (raw.Mon || raw.Tue) return { ...DEFAULT_ROUTINE_PRESETS, ...raw }
  return { ...DEFAULT_ROUTINE_PRESETS }
}

export function normalizeDailyItemsConfig(raw) {
  const base = { ...DEFAULT_DAILY_ITEMS_CONFIG }
  if (!raw) return base
  for (const key of Object.keys(base)) {
    if (raw[key]) base[key] = { ...base[key], ...raw[key] }
  }
  return base
}

export function normalizeSyncSettings(raw) {
  const merged = { ...DEFAULT_SYNC_SETTINGS, ...(raw ?? {}) }
  return {
    ...merged,
    provider: BUILTIN_SUPABASE.provider,
    supabaseUrl: BUILTIN_SUPABASE.supabaseUrl,
    supabaseAnonKey: BUILTIN_SUPABASE.supabaseAnonKey,
    syncId: merged.syncId || BUILTIN_SUPABASE.syncId,
  }
}

export function normalizeFocusCompassData(raw, goalSettings = null) {
  const base = {
    target: { ...DEFAULT_FOCUS_COMPASS_DATA.target },
    mindset: { ...DEFAULT_FOCUS_COMPASS_DATA.mindset },
    insight: { ...DEFAULT_FOCUS_COMPASS_DATA.insight },
  }
  if (!raw) {
    if (goalSettings?.targetDate) {
      base.target.targetDate = goalSettings.targetDate
      if (goalSettings.title) {
        const stripped = goalSettings.title.replace(/^[^\s]+\s*/, '').trim()
        if (stripped) base.target.eventTitle = stripped.replace(/\s*완주$/, '').trim() || base.target.eventTitle
      }
    }
    return base
  }
  return {
    target: { ...base.target, ...(raw.target ?? {}) },
    mindset: { ...base.mindset, ...(raw.mindset ?? {}) },
    insight: {
      ...base.insight,
      ...(raw.insight ?? {}),
      pinnedArchiveId: raw.insight?.pinnedArchiveId ?? null,
    },
  }
}

export function getDefaultData() {
  return {
    daily_logs: generateMockDailyLogs(),
    weekly_metrics: [...DEFAULT_WEEKLY_METRICS],
    routine_presets: { ...DEFAULT_ROUTINE_PRESETS },
    daily_items_config: normalizeDailyItemsConfig(null),
    goal_settings: { ...DEFAULT_GOAL_SETTINGS },
    focus_compass_data: normalizeFocusCompassData(null),
    thought_archive: [...DEFAULT_THOUGHT_ARCHIVE],
    sync_settings: normalizeSyncSettings(null),
  }
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function loadAllData() {
  const defaults = getDefaultData()
  const hasAny = Object.values(STORAGE_KEYS).some((k) => {
    if (k === STORAGE_KEYS.sync_meta) return false
    return localStorage.getItem(k) !== null
  })

  if (!hasAny) {
    saveAllData(defaults)
    return defaults
  }

  const goalSettings = { ...defaults.goal_settings, ...readJSON(STORAGE_KEYS.goal_settings, {}) }
  const focusRaw = readJSON(STORAGE_KEYS.focus_compass_data, null)

  return {
    daily_logs: readJSON(STORAGE_KEYS.daily_logs, defaults.daily_logs),
    weekly_metrics: readJSON(STORAGE_KEYS.weekly_metrics, defaults.weekly_metrics),
    routine_presets: normalizeWeekdays(readJSON(STORAGE_KEYS.routine_presets, null)),
    daily_items_config: normalizeDailyItemsConfig(readJSON(STORAGE_KEYS.daily_items_config, null)),
    goal_settings: goalSettings,
    focus_compass_data: normalizeFocusCompassData(focusRaw, goalSettings),
    thought_archive: readJSON(STORAGE_KEYS.thought_archive, defaults.thought_archive),
    sync_settings: normalizeSyncSettings(readJSON(STORAGE_KEYS.sync_settings, null)),
  }
}

export function saveAllData(data) {
  saveDailyLogs(data.daily_logs)
  saveWeeklyMetrics(data.weekly_metrics)
  saveRoutinePresets(data.routine_presets)
  saveDailyItemsConfig(data.daily_items_config)
  saveGoalSettings(data.goal_settings)
  saveFocusCompassData(data.focus_compass_data)
  saveThoughtArchive(data.thought_archive)
  if (data.sync_settings) saveSyncSettings(data.sync_settings)
}

export function saveDailyLogs(logs) {
  writeJSON(STORAGE_KEYS.daily_logs, logs)
}

export function saveWeeklyMetrics(metrics) {
  writeJSON(STORAGE_KEYS.weekly_metrics, metrics)
}

export function saveRoutinePresets(presets) {
  writeJSON(STORAGE_KEYS.routine_presets, presets)
}

export function saveDailyItemsConfig(config) {
  writeJSON(STORAGE_KEYS.daily_items_config, config)
}

export function saveGoalSettings(settings) {
  writeJSON(STORAGE_KEYS.goal_settings, settings)
}

export function saveFocusCompassData(data) {
  writeJSON(STORAGE_KEYS.focus_compass_data, normalizeFocusCompassData(data))
}

export function saveThoughtArchive(archive) {
  writeJSON(STORAGE_KEYS.thought_archive, archive)
}

export function saveSyncSettings(settings) {
  writeJSON(STORAGE_KEYS.sync_settings, normalizeSyncSettings(settings))
}

export function readSyncMeta() {
  return readJSON(STORAGE_KEYS.sync_meta, { updated_at: null })
}

export function saveSyncMeta(meta) {
  writeJSON(STORAGE_KEYS.sync_meta, meta)
}

/** 로컬 데이터 변경 시각 — 클라우드 pull과 충돌 방지용 */
export function touchLocalModified() {
  const meta = readSyncMeta()
  saveSyncMeta({
    ...meta,
    local_modified_at: new Date().toISOString(),
  })
}

export function exportAllData() {
  return loadAllData()
}

export function importAllData(data) {
  if (!data || typeof data !== 'object') throw new Error('Invalid data format')
  const defaults = getDefaultData()
  const merged = {
    daily_logs: data.daily_logs ?? defaults.daily_logs,
    weekly_metrics: data.weekly_metrics ?? defaults.weekly_metrics,
    routine_presets: normalizeWeekdays(data.routine_presets),
    daily_items_config: normalizeDailyItemsConfig(data.daily_items_config),
    goal_settings: { ...defaults.goal_settings, ...(data.goal_settings ?? {}) },
    focus_compass_data: normalizeFocusCompassData(data.focus_compass_data, data.goal_settings),
    thought_archive: data.thought_archive ?? defaults.thought_archive,
    sync_settings: normalizeSyncSettings(data.sync_settings),
  }
  saveAllData(merged)
  return merged
}

export function countDailyScore(logs, startDate, endDate) {
  let completed = 0
  let total = 0
  const current = new Date(startDate)
  const end = new Date(endDate)
  current.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  while (current <= end) {
    const key = formatDateKey(current)
    const log = logs[key]
    total += 4
    if (log) {
      completed += [log.workout, log.diet, log.dopamine, log.read].filter(Boolean).length
    }
    current.setDate(current.getDate() + 1)
  }
  return { completed, total, percent: total ? Math.round((completed / total) * 100) : 0 }
}

/** 이번 주 KPI: 항상 7일 × 4체크 = 28 만점 */
export function countWeeklyScore(logs, weekStart, weekEnd) {
  const { completed } = countDailyScore(logs, weekStart, weekEnd)
  const WEEKLY_TOTAL = 28
  return {
    completed,
    total: WEEKLY_TOTAL,
    percent: Math.round((completed / WEEKLY_TOTAL) * 100),
  }
}

export function getDayCompletionCount(log) {
  if (!log) return 0
  return [log.workout, log.diet, log.dopamine, log.read].filter(Boolean).length
}

export function ensureDailyLog(logs, dateKey) {
  if (!logs[dateKey]) {
    return {
      ...logs,
      [dateKey]: { workout: false, diet: false, dopamine: false, read: false },
    }
  }
  return logs
}

export function ensureTodayLog(logs) {
  return ensureDailyLog(logs, formatDateKey())
}

export function computeYearlySummary(dailyLogs, weeklyMetrics, year) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayKey = formatDateKey(today)
  const endKey = year < today.getFullYear() ? `${year}-12-31` : todayKey

  let workoutDays = 0
  let activeDays = 0
  let allClearDays = 0
  let daysInYearSoFar = 0
  let todayWorkoutCounted = false

  for (let m = 0; m < 12; m++) {
    const daysInMonth = new Date(year, m + 1, 0).getDate()
    for (let d = 1; d <= daysInMonth; d++) {
      const key = formatDateKey(new Date(year, m, d))
      if (key > endKey) break

      daysInYearSoFar++
      const log = dailyLogs[key]
      const completion = log ? getDayCompletionCount(log) : 0

      if (completion > 0) activeDays++
      if (log?.workout) {
        workoutDays++
        if (key === todayKey) todayWorkoutCounted = true
      }
      if (completion === 4) allClearDays++
    }
  }

  // 당일 workout 체크는 dailyLogs 최신값으로 한 번 더 보정 (루프/타임존 엣지 케이스)
  if (
    year === today.getFullYear() &&
    todayKey <= endKey &&
    dailyLogs[todayKey]?.workout &&
    !todayWorkoutCounted
  ) {
    workoutDays++
  }

  const yearMetrics = weeklyMetrics.filter((w) => w.date?.startsWith(String(year)))
  const totalDistance = yearMetrics.reduce((s, w) => s + (w.distance || 0), 0)
  const attendance = daysInYearSoFar
    ? Math.round((workoutDays / daysInYearSoFar) * 1000) / 10
    : 0

  return { workoutDays, totalDistance, allClearDays, attendance, daysInYearSoFar, activeDays }
}
