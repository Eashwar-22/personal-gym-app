import { LoaderCircle, X } from 'lucide-react'
import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Onboarding } from './components/Onboarding'
import { BottomNav } from './components/BottomNav'
import { CalendarView } from './components/CalendarView'
import { WorkoutView } from './components/WorkoutView'
import { ExerciseSheet } from './components/ExerciseSheet'
import { useAppStore } from './store'
import type { Exercise, Tab, WorkoutDay } from './types'
import { dateKey } from './utils/date'
import { isPersonalBest } from './utils/stats'

export default function App() {
  const { hydrated, profile, logs, saveProfile, saveExerciseLog, completeWorkout } = useAppStore()
  const [tab, setTab] = useState<Tab>('today')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [activeExercise, setActiveExercise] = useState<{ exercise: Exercise; workout: WorkoutDay }>()
  if (!hydrated) return <main className="grid min-h-dvh place-items-center text-muted"><LoaderCircle className="animate-spin" /><span className="sr-only">Loading your plan</span></main>
  if (!profile) return <Onboarding onSave={saveProfile} />
  return <div className="mx-auto min-h-dvh max-w-lg bg-ink">
    {tab === 'today' && <WorkoutView date={selectedDate} profile={profile} logs={logs} onOpenCalendar={() => setCalendarOpen(true)} onExercise={(exercise, workout) => setActiveExercise({ exercise, workout })} onFinish={(workout, score) => completeWorkout(dateKey(selectedDate), workout.id, score)} />}
    {tab === 'calendar' && <CalendarView profile={profile} logs={logs} selected={selectedDate} onSelect={(date) => { setSelectedDate(date); setTab('today') }} />}
    {tab === 'library' && <main className="p-6 pb-28"><h1 className="text-3xl font-bold">Exercise library</h1><p className="mt-2 text-muted">Search and filters are coming into focus.</p></main>}
    {tab === 'progress' && <main className="p-6 pb-28"><h1 className="text-3xl font-bold">Progress</h1><p className="mt-2 text-muted">Your body and strength trends live here.</p></main>}
    <BottomNav active={tab} onChange={setTab} />

    <AnimatePresence>{calendarOpen && <div className="fixed inset-0 z-50 flex items-end bg-black/60" onMouseDown={(event) => event.target === event.currentTarget && setCalendarOpen(false)}><div className="safe-bottom max-h-[92dvh] w-full overflow-y-auto rounded-t-[28px] bg-ink p-4"><div className="mx-auto mb-3 flex max-w-lg justify-end"><button aria-label="Close calendar" onClick={() => setCalendarOpen(false)} className="grid min-h-11 min-w-11 place-items-center rounded-full border border-line"><X size={20} /></button></div><div className="mx-auto max-w-lg"><CalendarView compact profile={profile} logs={logs} selected={selectedDate} onSelect={(date) => { setSelectedDate(date); setCalendarOpen(false) }} /></div></div></div>}</AnimatePresence>
    <AnimatePresence>{activeExercise && (() => {
      const prescription = activeExercise.workout.exercises.find((item) => item.exerciseId === activeExercise.exercise.id)!
      return <ExerciseSheet exercise={activeExercise.exercise} prescription={prescription} onClose={() => setActiveExercise(undefined)} onSave={(sets) => { const key = dateKey(selectedDate); saveExerciseLog(key, activeExercise.workout.id, { exerciseId: activeExercise.exercise.id, sets, completed: sets.every((set) => set.done), pb: isPersonalBest(sets, activeExercise.exercise.id, key, logs) }); setActiveExercise(undefined) }} />
    })()}</AnimatePresence>
  </div>
}
