import { useCallback, useEffect, useRef, useState } from 'react'
import {
  loadAllData,
  saveAllData,
  saveDailyLogs,
  saveWeeklyMetrics,
  saveRoutinePresets,
  saveDailyItemsConfig,
  saveGoalSettings,
  saveFocusCompassData,
  saveThoughtArchive,
  saveSyncSettings,
  readSyncMeta,
  saveSyncMeta,
  importAllData,
  touchLocalModified,
} from '../utils/storage'
import {
  isSyncConfigured,
  pullFromCloud,
  pushToCloud,
  subscribeSupabaseSync,
} from '../utils/cloudSync'

function buildSyncPayload(data) {
  return {
    daily_logs: data.daily_logs,
    weekly_metrics: data.weekly_metrics,
    routine_presets: data.routine_presets,
    daily_items_config: data.daily_items_config,
    goal_settings: data.goal_settings,
    focus_compass_data: data.focus_compass_data,
    thought_archive: data.thought_archive,
  }
}

function shouldPushToCloud(meta) {
  if (meta.local_modified_at) return true
  if (!meta.remote_updated_at) return true
  return false
}

export function useDashboardStorage() {
  const [data, setData] = useState(() => loadAllData())
  const [syncStatus, setSyncStatus] = useState('idle') // idle | syncing | ok | error
  const [syncMessage, setSyncMessage] = useState('')
  const dataRef = useRef(data)
  const syncTimerRef = useRef(null)
  const lastPushedAtRef = useRef(null)
  const pushingRef = useRef(false)

  dataRef.current = data

  const applyData = useCallback((next) => {
    saveAllData(next)
    setData(next)
  }, [])

  const refresh = useCallback(() => {
    setData(loadAllData())
  }, [])

  const applyRemoteIfNewer = useCallback((remote, silent = true) => {
    if (!remote?.payload) return false

    const meta = readSyncMeta()
    const remoteTime = new Date(remote.updated_at).getTime()
    const remoteKnown = meta.remote_updated_at ? new Date(meta.remote_updated_at).getTime() : 0
    const localMod = meta.local_modified_at ? new Date(meta.local_modified_at).getTime() : 0

    if (remote.updated_at === lastPushedAtRef.current) return false
    if (remoteTime <= remoteKnown) return false

    if (remoteTime > localMod) {
      const merged = importAllData(remote.payload)
      setData(merged)
      saveSyncMeta({
        remote_updated_at: remote.updated_at,
        local_modified_at: null,
      })
      if (!silent) {
        setSyncMessage('클라우드에서 최신 데이터를 불러왔습니다.')
        setSyncStatus('ok')
      }
      return true
    }

    return false
  }, [])

  const pushRemote = useCallback(async (payload = dataRef.current, silent = false, force = false) => {
    const settings = payload.sync_settings
    if (!isSyncConfigured(settings)) return false

    const meta = readSyncMeta()
    if (!force && !shouldPushToCloud(meta)) return false

    if (pushingRef.current) return false

    try {
      pushingRef.current = true
      if (!silent) {
        setSyncStatus('syncing')
        setSyncMessage('')
      }

      const updated_at = await pushToCloud(settings, buildSyncPayload(payload))
      lastPushedAtRef.current = updated_at
      saveSyncMeta({
        remote_updated_at: updated_at,
        local_modified_at: null,
      })

      if (!silent) {
        setSyncStatus('ok')
        setSyncMessage('클라우드에 저장되었습니다.')
      } else {
        setSyncStatus((s) => (s === 'error' ? s : 'ok'))
      }
      return true
    } catch (err) {
      if (!silent) {
        setSyncStatus('error')
        setSyncMessage(err.message || '저장 실패')
      }
      return false
    } finally {
      pushingRef.current = false
    }
  }, [])

  const pullRemote = useCallback(
    async (silent = true) => {
      const settings = dataRef.current.sync_settings
      if (!isSyncConfigured(settings)) return false

      try {
        if (!silent) {
          setSyncStatus('syncing')
          setSyncMessage('')
        }

        const remote = await pullFromCloud(settings)

        if (!remote?.payload) {
          if (!silent) setSyncStatus('ok')
          return false
        }

        const applied = applyRemoteIfNewer(remote, silent)

        if (!applied) {
          const meta = readSyncMeta()
          const remoteTime = new Date(remote.updated_at).getTime()
          const localMod = meta.local_modified_at ? new Date(meta.local_modified_at).getTime() : 0
          if (localMod > remoteTime) {
            await pushRemote(dataRef.current, silent, true)
          }
        }

        if (!silent && !applied) setSyncStatus('ok')
        return applied
      } catch (err) {
        if (!silent) {
          setSyncStatus('error')
          setSyncMessage(err.message || '동기화 실패')
        }
        return false
      }
    },
    [applyRemoteIfNewer, pushRemote],
  )

  const runInitialSync = useCallback(async () => {
    const settings = dataRef.current.sync_settings
    if (!isSyncConfigured(settings)) return

    setSyncStatus('syncing')
    try {
      const remote = await pullFromCloud(settings)
      if (remote?.payload) {
        applyRemoteIfNewer(remote, true)
      }
      await pushRemote(dataRef.current, true, false)
      setSyncStatus('ok')
      setSyncMessage('자동 동기화가 활성화되었습니다.')
    } catch (err) {
      setSyncStatus('error')
      setSyncMessage(err.message || '동기화 실패')
      throw err
    }
  }, [applyRemoteIfNewer, pushRemote])

  const schedulePush = useCallback(() => {
    if (!isSyncConfigured(dataRef.current.sync_settings)) return
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
    syncTimerRef.current = setTimeout(() => {
      pushRemote(dataRef.current, true, false)
    }, 1200)
  }, [pushRemote])

  const mutate = useCallback(
    (updater) => {
      setData((prev) => {
        const next = updater(prev)
        touchLocalModified()
        saveAllData(next)
        schedulePush()
        return next
      })
    },
    [schedulePush],
  )

  const syncSettings = data.sync_settings
  const syncProvider = syncSettings?.provider
  const syncId = syncSettings?.syncId
  const supabaseUrl = syncSettings?.supabaseUrl
  const supabaseAnonKey = syncSettings?.supabaseAnonKey
  const gistId = syncSettings?.gistId

  useEffect(() => {
    const settings = {
      provider: syncProvider,
      syncId,
      supabaseUrl,
      supabaseAnonKey,
      gistId,
      gistToken: dataRef.current.sync_settings?.gistToken,
    }
    if (!isSyncConfigured(settings)) return

    pullRemote(true)

    let unsubscribeRealtime = null
    if (syncProvider === 'supabase') {
      unsubscribeRealtime = subscribeSupabaseSync(settings, (row) => {
        if (!row?.payload) return
        if (row.updated_at === lastPushedAtRef.current) return
        applyRemoteIfNewer(
          { payload: row.payload, updated_at: row.updated_at },
          true,
        )
      })
    }

    const onVis = () => {
      if (document.visibilityState === 'visible') pullRemote(true)
    }
    document.addEventListener('visibilitychange', onVis)

    const interval = setInterval(() => pullRemote(true), 30000)

    return () => {
      unsubscribeRealtime?.()
      document.removeEventListener('visibilitychange', onVis)
      clearInterval(interval)
    }
  }, [
    syncProvider,
    syncId,
    supabaseUrl,
    supabaseAnonKey,
    gistId,
    pullRemote,
    applyRemoteIfNewer,
  ])

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

  const updateFocusCompassData = useCallback(
    (updater) => mutate((prev) => ({
      ...prev,
      focus_compass_data: typeof updater === 'function' ? updater(prev.focus_compass_data) : updater,
    })),
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
      if (!isSyncConfigured(settings)) return Promise.resolve()
      return runInitialSync()
    },
    [runInitialSync],
  )

  const replaceAllData = useCallback(
    (newData) => {
      touchLocalModified()
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
    updateFocusCompassData,
    updateThoughtArchive,
    updateSyncSettings,
    replaceAllData,
    refresh,
    pullRemote,
    pushRemote: (payload) => pushRemote(payload ?? dataRef.current, false, true),
    runInitialSync,
  }
}
