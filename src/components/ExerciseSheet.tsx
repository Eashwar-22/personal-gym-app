import { Check, Minus, Plus, Timer, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { Exercise, LoggedSet, PlanExercise } from '../types'
import { exercises } from '../data/plan'

export function ExerciseSheet({ exercise, prescription, onClose, onSave, onSwap }: { exercise: Exercise; prescription: PlanExercise; onClose: () => void; onSave: (sets: LoggedSet[]) => void; onSwap: (exerciseId: string) => void }) {
  const [sets, setSets] = useState<LoggedSet[]>(() => Array.from({ length: prescription.sets }, () => ({ reps: prescription.minReps, weight: 0, done: false })))
  const [rest, setRest] = useState(0)
  const [swapId, setSwapId] = useState(exercise.id)
  useEffect(() => { if (!rest) return; const timer = window.setInterval(() => setRest((value) => Math.max(0, value - 1)), 1000); return () => clearInterval(timer) }, [rest])
  const update = (index: number, key: 'reps' | 'weight', delta: number) => setSets((current) => current.map((set, i) => i === index ? { ...set, [key]: Math.max(0, set[key] + delta) } : set))
  const toggleDone = (index: number) => setSets((current) => current.map((set, i) => i === index ? { ...set, done: !set.done } : set))

  return <div className="fixed inset-0 z-50 flex items-end bg-black/60" role="presentation" onMouseDown={(event) => event.currentTarget === event.target && onClose()}>
    <motion.section role="dialog" aria-modal="true" aria-label={`Log ${exercise.name}`} initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ duration: .2 }} className="safe-bottom max-h-[94dvh] w-full overflow-y-auto rounded-t-[28px] border border-line bg-ink p-5">
      <div className="mx-auto max-w-lg">
        <div className="flex items-start justify-between"><div><p className="text-sm capitalize text-muted">{exercise.group} · {exercise.equipment}</p><h2 className="mt-1 text-2xl font-bold">{exercise.name}</h2></div><button aria-label="Close" onClick={onClose} className="grid min-h-11 min-w-11 place-items-center rounded-full border border-line"><X size={20} /></button></div>
        <div className="mt-4 overflow-hidden rounded-card border border-line bg-white"><img className="aspect-[16/9] w-full object-contain" src={`${import.meta.env.BASE_URL}${exercise.image}`} alt={`${exercise.name} demonstration`} /></div>
        <div className="mt-4 flex flex-wrap gap-2"><span className="rounded-full bg-[#2a2f3f] px-3 py-2 text-sm text-accent">Beginner</span><span className="rounded-full bg-[#2a2f3f] px-3 py-2 text-sm capitalize text-accent">{exercise.equipment}</span></div>
        <p className="mt-4 text-sm leading-6 text-muted">{exercise.notes[0]}</p>
        <div className="mt-4 rounded-2xl border border-line bg-panel p-3"><label className="text-sm text-muted">Swap for another {exercise.group} exercise</label><div className="mt-2 flex gap-2"><select value={swapId} onChange={(event) => setSwapId(event.target.value)} className="min-h-12 min-w-0 flex-1 rounded-full border border-line bg-ink px-4 text-sm">{exercises.filter((item) => item.group === exercise.group).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><button disabled={swapId === exercise.id} onClick={() => onSwap(swapId)} className="min-h-12 rounded-full border border-accent px-4 text-sm font-semibold text-accent disabled:opacity-40">Swap</button></div></div>
        <div className="mt-5 flex items-center justify-between"><h3 className="font-semibold">Working sets</h3><span className="flex items-center gap-2 text-sm text-muted"><Timer size={17} />{rest ? `${Math.floor(rest / 60)}:${String(rest % 60).padStart(2, '0')}` : 'Rest timer'}</span></div>
        <div className="mt-3 space-y-3">{sets.map((set, index) => <div key={index} className={`rounded-card border p-3 ${set.done ? 'border-success bg-[#1e2b24]' : 'border-line bg-panel'}`}>
          <div className="mb-3 flex items-center justify-between"><span className="text-sm font-semibold text-muted">Set {index + 1}</span><button onClick={() => { toggleDone(index); if (!set.done) setRest(90) }} className={`flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold ${set.done ? 'bg-success text-ink' : 'border border-[#52525a]'}`}><Check size={17} />{set.done ? 'Done' : 'Mark done'}</button></div>
          <div className="grid grid-cols-2 gap-3">{(['weight', 'reps'] as const).map((key) => <div key={key}><p className="mb-2 text-center text-xs uppercase tracking-wider text-muted">{key}</p><div className="flex min-h-12 items-center justify-between rounded-full border border-line bg-ink"><button aria-label={`Decrease ${key}`} onClick={() => update(index, key, key === 'weight' ? -2.5 : -1)} className="grid min-h-11 min-w-11 place-items-center"><Minus size={16} /></button><span className="font-bold tabular">{set[key]}</span><button aria-label={`Increase ${key}`} onClick={() => update(index, key, key === 'weight' ? 2.5 : 1)} className="grid min-h-11 min-w-11 place-items-center"><Plus size={16} /></button></div></div>)}</div>
        </div>)}</div>
        <button onClick={() => onSave(sets)} className="mt-5 min-h-14 w-full rounded-full bg-accent font-bold text-ink">Save exercise</button>
      </div>
    </motion.section>
  </div>
}
