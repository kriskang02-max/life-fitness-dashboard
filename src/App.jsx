import { useState, useCallback } from 'react'
import Header from './components/Header'
import FocusCompass from './components/FocusCompass'
import DailyActions from './components/DailyActions'
import WeeklyEngine from './components/WeeklyEngine'
import MonthlyArchive from './components/MonthlyArchive'
import MotivationTube from './components/MotivationTube'
import RoutineSettingsModal from './components/modals/RoutineSettingsModal'
import SyncSettingsModal from './components/modals/SyncSettingsModal'
import WeeklyDataModal from './components/modals/WeeklyDataModal'
import WeeklyManageModal from './components/modals/WeeklyManageModal'
import ArchiveAddModal from './components/modals/ArchiveAddModal'
import JsonBackupModal from './components/modals/JsonBackupModal'
import { useDashboardStorage } from './hooks/useDashboardStorage'
import { ensureDailyLog } from './utils/storage'
import { formatDateKey, parseDateKey, formatShortDotDate } from './utils/dates'

export default function App() {
  const {
    data,
    syncStatus,
    syncMessage,
    updateDailyLogs,
    updateWeeklyMetrics,
    updateRoutinePresets,
    updateDailyItemsConfig,
    updateFocusCompassData,
    updateMotivationVideos,
    updateThoughtArchive,
    updateSyncSettings,
    refresh,
    pullRemote,
    pushRemote,
  } = useDashboardStorage()

  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })

  const [routineOpen, setRoutineOpen] = useState(false)
  const [syncOpen, setSyncOpen] = useState(false)
  const [weeklyOpen, setWeeklyOpen] = useState(false)
  const [weeklyManageOpen, setWeeklyManageOpen] = useState(false)
  const [weeklyEditEntry, setWeeklyEditEntry] = useState(null)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [archiveEditEntry, setArchiveEditEntry] = useState(null)
  const [backupOpen, setBackupOpen] = useState(false)
  const [insightPinFlash, setInsightPinFlash] = useState(0)

  const selectedDateKey = formatDateKey(selectedDate)

  const handleSelectDateKey = useCallback((key) => {
    setSelectedDate(parseDateKey(key))
  }, [])

  const handleToggle = useCallback(
    (dateKey, field, value) => {
      updateDailyLogs((logs) => {
        const updated = ensureDailyLog(logs, dateKey)
        return {
          ...updated,
          [dateKey]: { ...updated[dateKey], [field]: value },
        }
      })
    },
    [updateDailyLogs],
  )

  const handleUpdateLabel = useCallback(
    (dateKey, field, label) => {
      updateDailyLogs((logs) => {
        const updated = ensureDailyLog(logs, dateKey)
        const entry = { ...updated[dateKey] }
        const labels = { ...(entry.labels ?? {}) }
        if (label == null || label === '') {
          delete labels[field]
        } else {
          labels[field] = label
        }
        if (Object.keys(labels).length === 0) {
          delete entry.labels
        } else {
          entry.labels = labels
        }
        return { ...updated, [dateKey]: entry }
      })
    },
    [updateDailyLogs],
  )

  const handleDeleteArchive = useCallback(
    (id) => {
      updateThoughtArchive((archive) => archive.filter((item) => item.id !== id))
    },
    [updateThoughtArchive],
  )

  const handleEditArchive = useCallback((item) => {
    setArchiveEditEntry(item)
    setArchiveOpen(true)
  }, [])

  const openArchiveCreate = useCallback(() => {
    setArchiveEditEntry(null)
    setArchiveOpen(true)
  }, [])

  const closeArchiveModal = useCallback(() => {
    setArchiveOpen(false)
    setArchiveEditEntry(null)
  }, [])

  const handlePinToInsight = useCallback(
    (item) => {
      const shortDate = formatShortDotDate(item.date)
      const body = item.note?.trim() || item.title
      updateFocusCompassData((prev) => ({
        ...prev,
        insight: {
          title: body,
          sub: `📌 ${shortDate} 메모에서 고정됨 · ${item.tag}`,
          pinnedArchiveId: String(item.id),
        },
      }))
      setInsightPinFlash(Date.now())
    },
    [updateFocusCompassData],
  )

  const handleDeleteWeekly = useCallback(
    (week) => {
      updateWeeklyMetrics((metrics) => metrics.filter((m) => m.week !== week))
    },
    [updateWeeklyMetrics],
  )

  const handleEditWeekly = useCallback((entry) => {
    setWeeklyEditEntry(entry)
    setWeeklyManageOpen(false)
    setWeeklyOpen(true)
  }, [])

  const openWeeklyCreate = useCallback(() => {
    setWeeklyEditEntry(null)
    setWeeklyOpen(true)
  }, [])

  const closeWeeklyModal = useCallback(() => {
    setWeeklyOpen(false)
    setWeeklyEditEntry(null)
  }, [])

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden text-zinc-100">
      {syncMessage && syncStatus === 'error' && (
        <div className="bg-red-500/10 border-b border-red-500/30 text-red-400 text-xs text-center py-1.5 px-4">
          {syncMessage}
        </div>
      )}
      <div className="max-w-7xl mx-auto w-full max-w-full px-4 py-6 md:py-8 space-y-6 md:space-y-8 overflow-x-hidden">
        <Header
          dailyLogs={data.daily_logs}
          syncStatus={syncStatus}
          onOpenRoutine={() => setRoutineOpen(true)}
          onOpenBackup={() => setBackupOpen(true)}
          onOpenSync={() => setSyncOpen(true)}
        />

        <FocusCompass
          data={data.focus_compass_data}
          onUpdate={updateFocusCompassData}
          insightPinFlash={insightPinFlash}
        />

        <DailyActions
          dailyLogs={data.daily_logs}
          routinePresets={data.routine_presets}
          dailyItemsConfig={data.daily_items_config}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onToggle={handleToggle}
          onUpdateLabel={handleUpdateLabel}
        />

        <WeeklyEngine
          weeklyMetrics={data.weekly_metrics}
          dailyLogs={data.daily_logs}
          onOpenWeeklyModal={openWeeklyCreate}
          onOpenWeeklyManage={() => setWeeklyManageOpen(true)}
        />

        <MonthlyArchive
          dailyLogs={data.daily_logs}
          weeklyMetrics={data.weekly_metrics}
          thoughtArchive={data.thought_archive}
          routinePresets={data.routine_presets}
          dailyItemsConfig={data.daily_items_config}
          selectedDateKey={selectedDateKey}
          onSelectDate={handleSelectDateKey}
          onOpenArchiveModal={openArchiveCreate}
          onEditArchive={handleEditArchive}
          onDeleteArchive={handleDeleteArchive}
          onPinToInsight={handlePinToInsight}
          pinnedArchiveId={data.focus_compass_data?.insight?.pinnedArchiveId}
        />

        <MotivationTube
          data={data.motivation_videos}
          onUpdate={updateMotivationVideos}
        />
      </div>

      <RoutineSettingsModal
        open={routineOpen}
        onClose={() => setRoutineOpen(false)}
        routinePresets={data.routine_presets}
        dailyItemsConfig={data.daily_items_config}
        onSaveWeekdays={updateRoutinePresets}
        onSaveDailyItems={updateDailyItemsConfig}
      />

      <SyncSettingsModal
        open={syncOpen}
        onClose={() => setSyncOpen(false)}
        syncSettings={data.sync_settings}
        onSave={updateSyncSettings}
        pullRemote={pullRemote}
        pushRemote={pushRemote}
      />

      <WeeklyDataModal
        open={weeklyOpen}
        onClose={closeWeeklyModal}
        metrics={data.weekly_metrics}
        onSave={updateWeeklyMetrics}
        editEntry={weeklyEditEntry}
      />

      <WeeklyManageModal
        open={weeklyManageOpen}
        onClose={() => setWeeklyManageOpen(false)}
        metrics={data.weekly_metrics}
        onEdit={handleEditWeekly}
        onDelete={handleDeleteWeekly}
      />

      <ArchiveAddModal
        open={archiveOpen}
        onClose={closeArchiveModal}
        archive={data.thought_archive}
        onSave={updateThoughtArchive}
        editEntry={archiveEditEntry}
      />

      <JsonBackupModal
        open={backupOpen}
        onClose={() => setBackupOpen(false)}
        onImport={() => refresh()}
      />
    </div>
  )
}
