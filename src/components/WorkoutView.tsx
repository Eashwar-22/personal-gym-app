import { CalendarDays, CheckCircle2, ChevronRight, Flame, Pencil, ShieldCheck, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Exercise, WorkoutDay, WorkoutLog } from '../types'
import { exerciseMap, plan } from '../data/plan'
import { dateKey, longDate, suggestedWorkoutForDate, workoutForDate } from '../utils/date'
import { streaks, workoutScore } from '../utils/stats'

export function WorkoutView({ date, logs, swaps, choices, customWorkouts, lastSavedAt, onChoose, onCustomize, onOpenCalendar, onExercise, onFinish }: { date: Date; logs: WorkoutLog[]; swaps: Record<string, string>; choices: Record<string, string>; customWorkouts: Record<string, WorkoutDay>; lastSavedAt?: string; onChoose: (workoutId: string) => void; onCustomize: () => void; onOpenCalendar: () => void; onExercise: (exercise: Exercise, workout: WorkoutDay, originalId: string) => void; onFinish: (workout: WorkoutDay, score: number) => void }) {
  const key = dateKey(date)
  const workout = workoutForDate(date, logs, choices, customWorkouts)
  const custom = customWorkouts[key]
  const suggested = suggestedWorkoutForDate(date, logs)
  const log = logs.find((item) => item.date === key && item.workoutId === workout.id)
  const expectedExerciseIds = workout.exercises.map((item) => swaps[`${key}:${item.exerciseId}`] ?? item.exerciseId)
  const activeExerciseLogs = log?.exercises.filter((entry) => expectedExerciseIds.includes(entry.exerciseId)) ?? []
  const streak = streaks(logs)
  const score = workoutScore(activeExerciseLogs, workout.exercises.length, Boolean(log?.completed))
  const adjacent = [-1, 0, 1].map((offset) => { const item = new Date(date); item.setDate(date.getDate() + offset); return item })

  return <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .18 }} className="pb-28">
    <header className="rounded-b-[28px] bg-accent px-5 pb-6 pt-7 text-ink">
      <div className="mx-auto max-w-lg"><p className="text-sm font-semibold opacity-70">{date.getFullYear()}</p><h1 className="mt-1 text-4xl font-bold">{workout?.name ?? 'Recovery day'}</h1><p className="mt-2 text-sm font-medium opacity-75">{longDate(date)}</p></div>
    </header>
    <div className="scrollbar-none mx-auto flex max-w-lg gap-6 overflow-x-auto px-5 pt-5">{adjacent.map((item, index) => <div key={dateKey(item)} className={`shrink-0 border-b-2 pb-3 ${index === 1 ? 'border-accent text-accent' : 'border-transparent text-muted'}`}><p className="text-sm font-semibold">{item.toLocaleDateString('en', { weekday: 'long' })}</p><p className="text-xs">{item.toLocaleDateString('en', { month: 'short', day: 'numeric' })}</p></div>)}</div>

    <div className="mx-auto max-w-lg px-5">
      <button onClick={onOpenCalendar} className="mt-5 flex min-h-12 items-center gap-2 rounded-full border border-[#3c4c75] bg-navy px-4 text-sm font-semibold text-[#dbe2fa]"><CalendarDays size={18} className="text-accent" />Date</button>
      <section className="mt-4 rounded-card border border-line bg-panel p-4">
        <div className="flex items-end justify-between gap-3"><div><p className="text-sm text-muted">Choose this day’s workout</p><h2 className="mt-1 text-lg font-semibold">What do you want to train?</h2></div>{!choices[key] && <span className="shrink-0 text-xs text-accent">Suggested: {suggested.name}</span>}</div>
        <div className="mt-4 grid grid-cols-2 gap-2">{plan.map((option) => <button key={option.id} type="button" aria-pressed={option.id === workout.id} onClick={() => onChoose(option.id)} className={`min-h-14 rounded-2xl border px-3 text-left transition-colors ${option.id === workout.id ? 'border-accent bg-accent text-ink' : 'border-line bg-ink text-white'}`}><span className="block font-semibold">{option.name}</span><span className={`mt-0.5 block text-xs ${option.id === workout.id ? 'text-[#273353]' : 'text-muted'}`}>{option.name.startsWith('Upper') ? 'Upper body' : 'Lower body'}</span></button>)}</div>
        {custom && <button type="button" aria-pressed={custom.id === workout.id} onClick={() => onChoose(custom.id)} className={`mt-2 min-h-14 w-full rounded-2xl border px-3 text-left ${custom.id === workout.id ? 'border-accent bg-accent text-ink' : 'border-line bg-ink text-white'}`}><span className="block font-semibold">{custom.name}</span><span className={`mt-0.5 block text-xs ${custom.id === workout.id ? 'text-[#273353]' : 'text-muted'}`}>Custom for this date · {custom.exercises.length} exercises</span></button>}
        <button type="button" onClick={onCustomize} className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-accent text-sm font-semibold text-accent"><Pencil size={17} />{custom ? 'Edit custom routine' : 'Build a custom routine'}</button>
        <p className="mt-3 text-xs leading-5 text-muted">Choose a template or build your own routine for this date. Nothing is assigned to a weekday.</p>
      </section>
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#315343] bg-[#1e2b24] px-3 py-2 text-xs text-success"><CheckCircle2 size={15} /><span>{lastSavedAt ? `Saved on this device at ${new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Changes save automatically on this device'}</span></div>
      <>
        <section className="mt-5 grid grid-cols-2 gap-3 rounded-card border border-line bg-panel p-4">
          <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#2a2f3f] text-accent"><Flame size={19} /></span><div><p className="text-xs text-muted">Last 7 days</p><p className="text-lg font-bold tabular">{streak.current} workout{streak.current === 1 ? '' : 's'}</p></div></div>
          <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#2a2f3f] text-accent"><Trophy size={19} /></span><div><p className="text-xs text-muted">Today’s score</p><p className="text-lg font-bold tabular">{score} pts</p></div></div>
        </section>
        <div className="mt-6 flex items-end justify-between"><div><p className="text-sm text-muted">Your session</p><h2 className="text-2xl font-bold">{workout.exercises.length} exercises</h2></div><span className="text-sm text-muted">~55 min</span></div>
        <div className="mt-3 flex gap-2 rounded-2xl border border-[#34405e] bg-navy p-3 text-sm leading-5 text-[#c9d2f3]"><ShieldCheck className="mt-0.5 shrink-0 text-accent" size={18} /><span>Shoulder work stays light and controlled. Stop if you feel sharp pain.</span></div>
        <div className="mt-4 divide-y divide-line">{workout.exercises.map((item) => {
          const exerciseId = swaps[`${dateKey(date)}:${item.exerciseId}`] ?? item.exerciseId
          const exercise = exerciseMap.get(exerciseId); if (!exercise) return null
          const done = log?.exercises.find((entry) => entry.exerciseId === exerciseId)?.completed
          return <button key={item.exerciseId} onClick={() => onExercise(exercise, workout, item.exerciseId)} className="flex min-h-[94px] w-full items-center gap-3 py-4 text-left">
            <div className="w-14 shrink-0 text-center"><p className="text-base font-bold tabular">{item.sets} × {item.minReps}–{item.maxReps}</p><p className="mt-1 text-xs text-muted">sets × reps</p></div>
            <img src={`${import.meta.env.BASE_URL}${exercise.image}`} alt="" className="h-14 w-14 rounded-full border border-line bg-white object-cover" />
            <div className="min-w-0 flex-1"><p className="truncate font-semibold text-accent">{exercise.name}</p><p className="mt-1 text-sm capitalize text-muted">{exercise.group} · {exercise.equipment}</p></div>
            <span className={`flex min-h-11 items-center gap-1 rounded-full border px-3 text-sm font-semibold ${done ? 'border-success text-success' : 'border-[#52525a] text-white'}`}>{done ? 'Done' : 'Log'} {!done && <ChevronRight size={15} />}</span>
          </button>
        })}</div>
        {workout.cardio && <div className="mt-5 rounded-card border border-line bg-panel p-5"><p className="text-sm text-muted">Optional finisher</p><p className="mt-1 font-semibold">{workout.cardio}</p></div>}
        <div className="mt-3 rounded-card border border-line bg-panel p-5"><p className="font-semibold">Score breakdown</p><div className="mt-3 grid grid-cols-2 gap-y-2 text-sm text-muted"><span>Completed exercise</span><span className="text-right text-white">+10</span><span>All sets logged</span><span className="text-right text-white">+5</span><span>Personal best</span><span className="text-right text-white">+5</span><span>Full session</span><span className="text-right text-white">+20</span></div></div>
        <button disabled={!log || activeExerciseLogs.filter((item) => item.completed).length < workout.exercises.length || log.completed} onClick={() => onFinish(workout, workoutScore(activeExerciseLogs, workout.exercises.length, true))} className="mt-5 min-h-14 w-full rounded-full bg-accent font-bold text-ink disabled:bg-[#303035] disabled:text-muted">{log?.completed ? 'Workout finished' : 'Finish full workout'}</button>
      </>
    </div>
  </motion.main>
}
