import { CalendarDays, ChevronRight, Flame, ShieldCheck, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Exercise, Profile, WorkoutDay, WorkoutLog } from '../types'
import { exerciseMap } from '../data/plan'
import { dateKey, longDate, workoutForDate } from '../utils/date'

export function WorkoutView({ date, profile, logs, onOpenCalendar, onExercise }: { date: Date; profile: Profile; logs: WorkoutLog[]; onOpenCalendar: () => void; onExercise: (exercise: Exercise, workout: WorkoutDay) => void }) {
  const workout = workoutForDate(date, profile)
  const log = logs.find((item) => item.date === dateKey(date))
  const adjacent = [-1, 0, 1].map((offset) => { const item = new Date(date); item.setDate(date.getDate() + offset); return item })

  return <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .18 }} className="pb-28">
    <header className="rounded-b-[28px] bg-accent px-5 pb-6 pt-7 text-ink">
      <div className="mx-auto max-w-lg"><p className="text-sm font-semibold opacity-70">{date.getFullYear()}</p><h1 className="mt-1 text-4xl font-bold">{workout?.name ?? 'Recovery day'}</h1><p className="mt-2 text-sm font-medium opacity-75">{longDate(date)}</p></div>
    </header>
    <div className="scrollbar-none mx-auto flex max-w-lg gap-6 overflow-x-auto px-5 pt-5">{adjacent.map((item, index) => <div key={dateKey(item)} className={`shrink-0 border-b-2 pb-3 ${index === 1 ? 'border-accent text-accent' : 'border-transparent text-muted'}`}><p className="text-sm font-semibold">{item.toLocaleDateString('en', { weekday: 'long' })}</p><p className="text-xs">{item.toLocaleDateString('en', { month: 'short', day: 'numeric' })}</p></div>)}</div>

    <div className="mx-auto max-w-lg px-5">
      <button onClick={onOpenCalendar} className="mt-5 flex min-h-12 items-center gap-2 rounded-full border border-[#3c4c75] bg-navy px-4 text-sm font-semibold text-[#dbe2fa]"><CalendarDays size={18} className="text-accent" />Date</button>
      {workout ? <>
        <section className="mt-5 grid grid-cols-2 gap-3 rounded-card border border-line bg-panel p-4">
          <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#2a2f3f] text-accent"><Flame size={19} /></span><div><p className="text-xs text-muted">Current streak</p><p className="text-lg font-bold tabular">— workouts</p></div></div>
          <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#2a2f3f] text-accent"><Trophy size={19} /></span><div><p className="text-xs text-muted">Today’s score</p><p className="text-lg font-bold tabular">{log?.score ?? 0} pts</p></div></div>
        </section>
        <div className="mt-6 flex items-end justify-between"><div><p className="text-sm text-muted">Your session</p><h2 className="text-2xl font-bold">{workout.exercises.length} exercises</h2></div><span className="text-sm text-muted">~55 min</span></div>
        <div className="mt-3 flex gap-2 rounded-2xl border border-[#34405e] bg-navy p-3 text-sm leading-5 text-[#c9d2f3]"><ShieldCheck className="mt-0.5 shrink-0 text-accent" size={18} /><span>Shoulder work stays light and controlled. Stop if you feel sharp pain.</span></div>
        <div className="mt-4 divide-y divide-line">{workout.exercises.map((item) => {
          const exercise = exerciseMap.get(item.exerciseId); if (!exercise) return null
          const done = log?.exercises.find((entry) => entry.exerciseId === item.exerciseId)?.completed
          return <button key={item.exerciseId} onClick={() => onExercise(exercise, workout)} className="flex min-h-[94px] w-full items-center gap-3 py-4 text-left">
            <div className="w-14 shrink-0 text-center"><p className="text-base font-bold tabular">{item.sets} × {item.minReps}–{item.maxReps}</p><p className="mt-1 text-xs text-muted">sets × reps</p></div>
            <img src={`${import.meta.env.BASE_URL}${exercise.image}`} alt="" className="h-14 w-14 rounded-full border border-line bg-white object-cover" />
            <div className="min-w-0 flex-1"><p className="truncate font-semibold text-accent">{exercise.name}</p><p className="mt-1 text-sm capitalize text-muted">{exercise.group} · {exercise.equipment}</p></div>
            <span className={`flex min-h-11 items-center gap-1 rounded-full border px-3 text-sm font-semibold ${done ? 'border-success text-success' : 'border-[#52525a] text-white'}`}>{done ? 'Done' : 'Log'} {!done && <ChevronRight size={15} />}</span>
          </button>
        })}</div>
        <div className="mt-5 rounded-card border border-line bg-panel p-5"><p className="text-sm text-muted">Optional finisher</p><p className="mt-1 font-semibold">{workout.cardio}</p></div>
      </> : <section className="mt-8 rounded-card border border-line bg-panel p-7 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#2a2a31] text-accent"><ShieldCheck /></div><h2 className="mt-4 text-xl font-bold">Rest and recover</h2><p className="mt-2 leading-6 text-muted">Rest days are part of the plan. A walk or a few gentle mobility minutes is plenty.</p></section>}
    </div>
  </motion.main>
}
