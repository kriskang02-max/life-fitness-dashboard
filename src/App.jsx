import { useState, useCallback } from 'react'
import Header from './components/Header'
import DailyActions from './components/DailyActions'
import WeeklyEngine from './components/WeeklyEngine'
import MonthlyArchive from './components/MonthlyArchive'
import RoutineSettingsModal from './components/modals/RoutineSettingsModal'
import GoalSettingsModal from './components/modals/GoalSettingsModal'
import SyncSettingsModal from './components/modals/SyncSettingsModal'
import WeeklyDataModal from './components/modals/WeeklyDataModal'
import WeeklyManageModal from './components/modals/WeeklyManageModal'
import ArchiveAddModal from './components/modals/ArchiveAddModal'
import JsonBackupModal from './components/modals/JsonBackupModal'
import { useDashboardStorage } from './hooks/useDashboardStorage'
import { ensureDailyLog } from './utils/storage'
import { formatDateKey, parseDateKey } from './utils/dates'

export default function App() {
  const {
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
  } = useDashboardStorage()

  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })

  const [routineOpen, setRoutineOpen] = useState(false)
  const [goalOpen, setGoalOpen] = useState(false)
  const [syncOpen, setSyncOpen] = useState(false)
  const [weeklyOpen, setWeeklyOpen] = useState(false)
  const [weeklyManageOpen, setWeeklyManageOpen] = useState(false)
  const [weeklyEditEntry, setWeeklyEditEntry] = useState(null)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [archiveEditEntry, setArchiveEditEntry] = useState(null)
  const [backupOpen, setBackupOpen] = useState(false)

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
          goalSettings={data.goal_settings}
          syncStatus={syncStatus}
          onOpenRoutine={() => setRoutineOpen(true)}
          onOpenBackup={() => setBackupOpen(true)}
          onOpenSync={() => setSyncOpen(true)}
          onOpenGoal={() => setGoalOpen(true)}
        />

        <DailyActions
          dailyLogs={data.daily_logs}
          routinePresets={data.routine_presets}
          dailyItemsConfig={data.daily_items_config}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onToggle={handleToggle}
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
          selectedDateKey={selectedDateKey}
          onSelectDate={handleSelectDateKey}
          onOpenArchiveModal={openArchiveCreate}
          onEditArchive={handleEditArchive}
          onDeleteArchive={handleDeleteArchive}
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

      <GoalSettingsModal
        open={goalOpen}
        onClose={() => setGoalOpen(false)}
        goalSettings={data.goal_settings}
        dailyItemsConfig={data.daily_items_config}
        onSave={updateGoalSettings}
      />

      <SyncSettingsModal
        open={syncOpen}
        onClose={() => setSyncOpen(false)}
        syncSettings={data.sync_settings}
        onSave={updateSyncSettings}
        onImport={refresh}
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
