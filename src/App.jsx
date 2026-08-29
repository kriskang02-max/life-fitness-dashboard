import { useState, useCallback } from 'react'
import Header from './components/Header'
import DailyActions from './components/DailyActions'
import WeeklyEngine from './components/WeeklyEngine'
import MonthlyArchive from './components/MonthlyArchive'
import RoutineSettingsModal from './components/modals/RoutineSettingsModal'
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
    updateDailyLogs,
    updateWeeklyMetrics,
    updateRoutinePresets,
    updateThoughtArchive,
    replaceAllData,
    refresh,
  } = useDashboardStorage()

  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })

  const [routineOpen, setRoutineOpen] = useState(false)
  const [weeklyOpen, setWeeklyOpen] = useState(false)
  const [weeklyManageOpen, setWeeklyManageOpen] = useState(false)
  const [weeklyEditEntry, setWeeklyEditEntry] = useState(null)
  const [archiveOpen, setArchiveOpen] = useState(false)
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
    <div className="min-h-screen text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-8">
        <Header
          dailyLogs={data.daily_logs}
          onOpenRoutine={() => setRoutineOpen(true)}
          onOpenBackup={() => setBackupOpen(true)}
        />

        <DailyActions
          dailyLogs={data.daily_logs}
          routinePresets={data.routine_presets}
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
          onOpenArchiveModal={() => setArchiveOpen(true)}
          onDeleteArchive={handleDeleteArchive}
        />
      </div>

      <RoutineSettingsModal
        open={routineOpen}
        onClose={() => setRoutineOpen(false)}
        presets={data.routine_presets}
        onSave={updateRoutinePresets}
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
        onClose={() => setArchiveOpen(false)}
        archive={data.thought_archive}
        onSave={updateThoughtArchive}
      />

      <JsonBackupModal
        open={backupOpen}
        onClose={() => setBackupOpen(false)}
        onImport={() => refresh()}
      />
    </div>
  )
}
