import { ArrowDown, ArrowUp, Plus, Search, Trash2, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { exercises } from '../data/plan'
import type { PlanExercise, WorkoutDay } from '../types'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : min))

export function CustomRoutineSheet({ base, existing, onClose, onSave }: { base: WorkoutDay; existing?: WorkoutDay; onClose: () => void; onSave: (workout: WorkoutDay) => void }) {
  const [name, setName] = useState(existing?.name ?? 'My workout')
  const [cardio, setCardio] = useState(existing?.cardio ?? '')
  const [items, setItems] = useState<PlanExercise[]>(() => (existing?.exercises ?? []).map((item) => ({ ...item })))
  const [query, setQuery] = useState('')
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return exercises.filter((exercise) => !items.some((item) => item.exerciseId === exercise.id) && (!normalized || `${exercise.name} ${exercise.group} ${exercise.equipment}`.toLowerCase().includes(normalized))).slice(0, 10)
  }, [items, query])

  const update = (index: number, key: keyof Omit<PlanExercise, 'exerciseId'>, value: number) => setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: clamp(value, 1, key === 'sets' ? 12 : 100) } : item))
  const move = (index: number, offset: number) => setItems((current) => {
    const target = index + offset
    if (target < 0 || target >= current.length) return current
    const next = [...current]; [next[index], next[target]] = [next[target], next[index]]
    return next
  })

  return <div className="fixed inset-0 z-50 flex items-end bg-black/60" role="presentation" onMouseDown={(event) => event.currentTarget === event.target && onClose()}>
    <motion.section role="dialog" aria-modal="true" aria-label="Build a custom workout" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ duration: .2 }} className="safe-bottom max-h-[96dvh] w-full overflow-y-auto rounded-t-[28px] border border-line bg-ink p-5">
      <div className="mx-auto max-w-lg">
        <div className="flex items-start justify-between gap-4"><div><p className="text-sm text-muted">Your routine library</p><h2 className="mt-1 text-2xl font-bold">{existing ? 'Edit routine' : 'Create a routine'}</h2></div><button aria-label="Close" onClick={onClose} className="grid min-h-11 min-w-11 place-items-center rounded-full border border-line"><X size={20} /></button></div>

        <div className="mt-5 grid gap-3 rounded-card border border-line bg-panel p-4">
          <label className="text-sm text-muted">Routine name<input value={name} maxLength={40} onChange={(event) => setName(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-line bg-ink px-3 text-base text-white outline-none" /></label>
          <label className="text-sm text-muted">Optional cardio or finisher<input value={cardio} maxLength={100} placeholder="e.g. 10 min easy walk" onChange={(event) => setCardio(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-line bg-ink px-3 text-base text-white outline-none" /></label>
        </div>

        <div className="mt-5 flex items-center justify-between"><div><p className="text-sm text-muted">Your exercises</p><h3 className="text-lg font-semibold">{items.length} selected</h3></div><button type="button" onClick={() => setItems([])} className="min-h-11 rounded-full border border-line px-4 text-sm font-semibold text-muted">Clear all</button></div>
        {!existing && !items.length && <button type="button" onClick={() => setItems(base.exercises.map((item) => ({ ...item })))} className="mt-3 min-h-11 rounded-full border border-line px-4 text-sm font-semibold text-accent">Copy current workout as a starting point</button>}
        <div className="mt-3 space-y-3">{items.map((item, index) => {
          const exercise = exercises.find((candidate) => candidate.id === item.exerciseId)
          if (!exercise) return null
          return <div key={item.exerciseId} className="rounded-card border border-line bg-panel p-4">
            <div className="flex items-start gap-3">{exercise.image ? <img src={`${import.meta.env.BASE_URL}${exercise.image}`} alt="" className="h-12 w-12 rounded-xl bg-white object-cover" /> : <div className="grid h-12 w-12 place-items-center rounded-xl bg-ink text-xs text-muted">Demo</div>}<div className="min-w-0 flex-1"><p className="font-semibold text-accent">{exercise.name}</p><p className="mt-1 text-sm capitalize text-muted">{exercise.group} · {exercise.equipment}</p></div><div className="flex"><button aria-label={`Move ${exercise.name} up`} disabled={index === 0} onClick={() => move(index, -1)} className="grid min-h-10 min-w-10 place-items-center disabled:opacity-30"><ArrowUp size={17} /></button><button aria-label={`Move ${exercise.name} down`} disabled={index === items.length - 1} onClick={() => move(index, 1)} className="grid min-h-10 min-w-10 place-items-center disabled:opacity-30"><ArrowDown size={17} /></button><button aria-label={`Remove ${exercise.name}`} onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="grid min-h-10 min-w-10 place-items-center text-danger"><Trash2 size={17} /></button></div></div>
            <div className="mt-3 grid grid-cols-3 gap-2">{([
              ['sets', 'Sets'], ['minReps', 'Min reps'], ['maxReps', 'Max reps'],
            ] as const).map(([key, label]) => <label key={key} className="text-xs text-muted">{label}<input type="number" inputMode="numeric" min="1" max={key === 'sets' ? 12 : 100} value={item[key]} onChange={(event) => update(index, key, Number(event.target.value))} className="mt-1 min-h-11 w-full rounded-xl border border-line bg-ink px-3 text-center text-base font-semibold text-white outline-none" /></label>)}</div>
          </div>
        })}</div>
        {!items.length && <div className="mt-3 rounded-card border border-dashed border-line p-5 text-center text-sm text-muted">Start empty, then add the exercises you want below.</div>}

        <div className="mt-6"><label className="text-sm font-semibold">Add exercises</label><div className="mt-2 flex min-h-12 items-center gap-2 rounded-xl border border-line bg-panel px-3"><Search size={18} className="text-muted" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, muscle, or equipment" className="min-w-0 flex-1 bg-transparent text-base outline-none" /></div></div>
        <div className="mt-3 divide-y divide-line rounded-card border border-line bg-panel px-3">{results.map((exercise) => <button key={exercise.id} type="button" onClick={() => { setItems((current) => [...current, { exerciseId: exercise.id, sets: 3, minReps: 8, maxReps: 12 }]); setQuery('') }} className="flex min-h-16 w-full items-center gap-3 py-2 text-left">{exercise.image ? <img src={`${import.meta.env.BASE_URL}${exercise.image}`} alt="" className="h-10 w-10 rounded-full bg-white object-cover" /> : <div className="grid h-10 w-10 place-items-center rounded-full bg-ink text-xs text-muted">Demo</div>}<span className="min-w-0 flex-1"><span className="block truncate font-semibold">{exercise.name}</span><span className="block text-sm capitalize text-muted">{exercise.group} · {exercise.equipment}</span></span><Plus size={19} className="text-accent" /></button>)}</div>

        <button disabled={!items.length} onClick={() => onSave({ id: existing?.id ?? `routine-${crypto.randomUUID()}`, name: name.trim() || 'My workout', exercises: items.map((item) => ({ ...item, maxReps: Math.max(item.minReps, item.maxReps) })), cardio: cardio.trim() })} className="mt-5 min-h-14 w-full rounded-full bg-accent font-bold text-ink disabled:bg-[#303035] disabled:text-muted">Save routine</button>
        <p className="mt-3 text-center text-xs leading-5 text-muted">Saved to your routine library. You can choose it on any training day.</p>
      </div>
    </motion.section>
  </div>
}
