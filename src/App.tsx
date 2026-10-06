import { LoaderCircle, X } from 'lucide-react'
import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Onboarding } from './components/Onboarding'
import { BottomNav } from './components/BottomNav'
import { CalendarView } from './components/CalendarView'
import { WorkoutView } from './components/WorkoutView'
import { ExerciseSheet } from './components/ExerciseSheet'
import { LibraryView } from './components/LibraryView'
import { ProgressView } from './components/ProgressView'
import { CustomRoutineSheet } from './components/CustomRoutineSheet'
import { useAppStore } from './store'
import type { Exercise, Tab, WorkoutDay } from './types'
import { dateKey, workoutForDate } from './utils/date'
import { isPersonalBest } from './utils/stats'
import { requestPersistentStorage } from './utils/storage'

export default function App() {
  const { hydrated, profile, logs, exerciseSwaps, workoutChoices, customWorkouts, lastSavedAt, saveProfile, saveExerciseLog, completeWorkout, swapExercise, chooseWorkout, saveCustomWorkout } = useAppStore()
  const [tab, setTab] = useState<Tab>('today')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [customizerOpen, setCustomizerOpen] = useState(false)
  const [activeExercise, setActiveExercise] = useState<{ exercise: Exercise; workout: WorkoutDay; originalId: string }>()
  if (!hydrated) return <main className="grid min-h-dvh place-items-center text-muted"><LoaderCircle className="animate-spin" /><span className="sr-only">Loading your plan</span></main>
  if (!profile) return <Onboarding onSave={(nextProfile) => { saveProfile(nextProfile); void requestPersistentStorage() }} />
  return <div className="mx-auto min-h-dvh max-w-lg bg-ink">
    {tab === 'today' && <WorkoutView date={selectedDate} logs={logs} swaps={exerciseSwaps} choices={workoutChoices} customWorkouts={customWorkouts} lastSavedAt={lastSavedAt} onChoose={(workoutId) => chooseWorkout(dateKey(selectedDate), workoutId)} onCustomize={() => setCustomizerOpen(true)} onOpenCalendar={() => setCalendarOpen(true)} onExercise={(exercise, workout, originalId) => setActiveExercise({ exercise, workout, originalId })} onFinish={(workout, score) => completeWorkout(dateKey(selectedDate), workout.id, score)} />}
    {tab === 'calendar' && <CalendarView logs={logs} choices={workoutChoices} selected={selectedDate} onSelect={(date) => { setSelectedDate(date); setTab('today') }} />}
    {tab === 'library' && <LibraryView />}
    {tab === 'progress' && <ProgressView profile={profile} logs={logs} />}
    <BottomNav active={tab} onChange={setTab} />

    <AnimatePresence>{calendarOpen && <div className="fixed inset-0 z-50 flex items-end bg-black/60" onMouseDown={(event) => event.target === event.currentTarget && setCalendarOpen(false)}><div className="safe-bottom max-h-[92dvh] w-full overflow-y-auto rounded-t-[28px] bg-ink p-4"><div className="mx-auto mb-3 flex max-w-lg justify-end"><button aria-label="Close calendar" onClick={() => setCalendarOpen(false)} className="grid min-h-11 min-w-11 place-items-center rounded-full border border-line"><X size={20} /></button></div><div className="mx-auto max-w-lg"><CalendarView compact logs={logs} choices={workoutChoices} selected={selectedDate} onSelect={(date) => { setSelectedDate(date); setCalendarOpen(false) }} /></div></div></div>}</AnimatePresence>
    <AnimatePresence>{customizerOpen && <CustomRoutineSheet date={dateKey(selectedDate)} base={workoutForDate(selectedDate, logs, workoutChoices, customWorkouts)} existing={customWorkouts[dateKey(selectedDate)]} onClose={() => setCustomizerOpen(false)} onSave={(workout) => { saveCustomWorkout(dateKey(selectedDate), workout); setCustomizerOpen(false) }} />}</AnimatePresence>
    <AnimatePresence>{activeExercise && (() => {
      const prescription = activeExercise.workout.exercises.find((item) => item.exerciseId === activeExercise.originalId)!
      const saveDraft = (sets: Parameters<typeof isPersonalBest>[0], note: string) => { const key = dateKey(selectedDate); saveExerciseLog(key, activeExercise.workout.id, { exerciseId: activeExercise.exercise.id, sets, note: note.trim() || undefined, completed: sets.length > 0 && sets.every((set) => set.done), pb: isPersonalBest(sets, activeExercise.exercise.id, key, logs) }) }
      return <ExerciseSheet exercise={activeExercise.exercise} prescription={prescription} logs={logs} date={dateKey(selectedDate)} workoutId={activeExercise.workout.id} unitLabel={profile.units === 'metric' ? 'kg' : 'lb'} restSeconds={profile.restSeconds ?? 90} onClose={() => setActiveExercise(undefined)} onSwap={(exerciseId) => { swapExercise(`${dateKey(selectedDate)}:${activeExercise.originalId}`, exerciseId); setActiveExercise(undefined) }} onDraft={saveDraft} onSave={(sets, note) => { saveDraft(sets, note); setActiveExercise(undefined) }} />
    })()}</AnimatePresence>
  </div>
}
