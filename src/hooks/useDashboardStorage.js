import { useCallback, useEffect, useRef, useState } from 'react'
import {
  loadAllData,
  saveAllData,
  saveDailyLogs,
  saveWeeklyMetrics,
  saveRoutinePresets,
  saveDailyItemsConfig,
  saveGoalSettings,
  saveThoughtArchive,
  saveSyncSettings,
  readSyncMeta,
  saveSyncMeta,
  importAllData,
} from '../utils/storage'
import { isSyncConfigured, pullFromCloud, pushToCloud } from '../utils/cloudSync'

export function useDashboardStorage() {
  const [data, setData] = useState(() => loadAllData())
  const [syncStatus, setSyncStatus] = useState('idle') // idle | syncing | ok | error
  const [syncMessage, setSyncMessage] = useState('')
  const dataRef = useRef(data)
  const syncTimerRef = useRef(null)

  dataRef.current = data

  const applyData = useCallback((next) => {
    saveAllData(next)
    setData(next)
  }, [])

  const refresh = useCallback(() => {
    setData(loadAllData())
  }, [])

  const pullRemote = useCallback(async (silent = false) => {
    const settings = dataRef.current.sync_settings
    if (!isSyncConfigured(settings)) return false
    try {
      if (!silent) setSyncStatus('syncing')
      const remote = await pullFromCloud(settings)
      if (!remote?.payload) {
        if (!silent) setSyncStatus('ok')
        return false
      }
      const localMeta = readSyncMeta()
      const remoteTime = new Date(remote.updated_at).getTime()
      const localTime = localMeta.updated_at ? new Date(localMeta.updated_at).getTime() : 0
      if (remoteTime > localTime) {
        const merged = importAllData(remote.payload)
        setData(merged)
        saveSyncMeta({ updated_at: remote.updated_at })
        if (!silent) setSyncMessage('클라우드 데이터를 불러왔습니다.')
      }
      if (!silent) setSyncStatus('ok')
      return true
    } catch (err) {
      if (!silent) {
        setSyncStatus('error')
        setSyncMessage(err.message || '동기화 실패')
      }
      return false
    }
  }, [])

  const pushRemote = useCallback(async (payload = dataRef.current) => {
    const settings = payload.sync_settings
    if (!isSyncConfigured(settings)) return false
    try {
      setSyncStatus('syncing')
      const updated_at = await pushToCloud(settings, {
        daily_logs: payload.daily_logs,
        weekly_metrics: payload.weekly_metrics,
        routine_presets: payload.routine_presets,
        daily_items_config: payload.daily_items_config,
        goal_settings: payload.goal_settings,
        thought_archive: payload.thought_archive,
      })
      saveSyncMeta({ updated_at })
      setSyncStatus('ok')
      setSyncMessage('클라우드에 저장되었습니다.')
      return true
    } catch (err) {
      setSyncStatus('error')
      setSyncMessage(err.message || '저장 실패')
      return false
    }
  }, [])

  const schedulePush = useCallback(() => {
    if (!isSyncConfigured(dataRef.current.sync_settings)) return
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
    syncTimerRef.current = setTimeout(() => {
      pushRemote(dataRef.current)
    }, 1500)
  }, [pushRemote])

  const mutate = useCallback(
    (updater) => {
      setData((prev) => {
        const next = updater(prev)
        saveAllData(next)
        schedulePush()
        return next
      })
    },
    [schedulePush],
  )

  useEffect(() => {
    pullRemote(true)
    const onVis = () => {
      if (document.visibilityState === 'visible') pullRemote(true)
    }
    document.addEventListener('visibilitychange', onVis)
    const interval = setInterval(() => pullRemote(true), 45000)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      clearInterval(interval)
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
    }
  }, [pullRemote])

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key) refresh()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [refresh])

  const updateDailyLogs = useCallback(
    (updater) => mutate((prev) => ({ ...prev, daily_logs: typeof updater === 'function' ? updater(prev.daily_logs) : updater })),
    [mutate],
  )

  const updateWeeklyMetrics = useCallback(
    (updater) => mutate((prev) => ({ ...prev, weekly_metrics: typeof updater === 'function' ? updater(prev.weekly_metrics) : updater })),
    [mutate],
  )

  const updateRoutinePresets = useCallback(
    (updater) => mutate((prev) => ({ ...prev, routine_presets: typeof updater === 'function' ? updater(prev.routine_presets) : updater })),
    [mutate],
  )

  const updateDailyItemsConfig = useCallback(
    (updater) => mutate((prev) => ({ ...prev, daily_items_config: typeof updater === 'function' ? updater(prev.daily_items_config) : updater })),
    [mutate],
  )

  const updateGoalSettings = useCallback(
    (updater) => mutate((prev) => ({ ...prev, goal_settings: typeof updater === 'function' ? updater(prev.goal_settings) : updater })),
    [mutate],
  )

  const updateThoughtArchive = useCallback(
    (updater) => mutate((prev) => ({ ...prev, thought_archive: typeof updater === 'function' ? updater(prev.thought_archive) : updater })),
    [mutate],
  )

  const updateSyncSettings = useCallback(
    (settings) => {
      saveSyncSettings(settings)
      setData((prev) => ({ ...prev, sync_settings: settings }))
    },
    [],
  )

  const replaceAllData = useCallback(
    (newData) => {
      applyData(newData)
      schedulePush()
    },
    [applyData, schedulePush],
  )

  return {
    data,
    syncStatus,
    syncMessage,
    updateDailyLogs,
    updateWeeklyMetrics,
    updateRoutinePresets,
    updateDailyItemsConfig,
    updateGoalSettings,
    updateThoughtArchive,
    updateSyncSettings,
    replaceAllData,
    refresh,
    pullRemote,
    pushRemote,
  }
}
