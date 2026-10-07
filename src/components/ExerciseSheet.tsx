import { Check, Minus, Plus, Timer, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { Exercise, LoggedSet, PlanExercise, WorkoutLog } from '../types'
import { exercises } from '../data/plan'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ExerciseAnimation } from './ExerciseAnimation'

export function ExerciseSheet({ exercise, prescription, logs, date, workoutId, unitLabel, restSeconds, onClose, onDraft, onSave, onSwap }: { exercise: Exercise; prescription: PlanExercise; logs: WorkoutLog[]; date: string; workoutId: string; unitLabel: string; restSeconds: number; onClose: () => void; onDraft: (sets: LoggedSet[], note: string) => void; onSave: (sets: LoggedSet[], note: string) => void; onSwap: (exerciseId: string) => void }) {
  const current = logs.find((log) => log.date === date && log.workoutId === workoutId)?.exercises.find((entry) => entry.exerciseId === exercise.id)
  const history = logs.filter((log) => log.date < date).flatMap((log) => log.exercises.map((entry) => ({ ...entry, date: log.date }))).filter((entry) => entry.exerciseId === exercise.id).sort((a, b) => a.date.localeCompare(b.date))
  const previous = history[history.length - 1]
  const [sets, setSets] = useState<LoggedSet[]>(() => current?.sets.map((set) => ({ ...set })) ?? Array.from({ length: prescription.sets }, (_, index) => ({ reps: previous?.sets[index]?.reps ?? prescription.minReps, weight: previous?.sets[index]?.weight ?? 0, done: false })))
  const [draftValues, setDraftValues] = useState<Record<string, string>>(() => Object.fromEntries(sets.flatMap((set, index) => [[`weight-${index}`, set.weight ? String(set.weight) : ''], [`reps-${index}`, set.reps ? String(set.reps) : '']])))
  const [note, setNote] = useState(current?.note ?? '')
  const [rest, setRest] = useState(0)
  const [swapId, setSwapId] = useState(exercise.id)
  const readyToIncrease = Boolean(previous?.sets.length && previous.sets.every((set) => set.done && set.reps >= prescription.maxReps))
  const chartData = history.map((entry) => { const best = entry.sets.reduce((max, set) => Math.max(max, set.weight * (1 + set.reps / 30)), 0); return { date: entry.date, e1rm: Number(best.toFixed(1)) } })
  useEffect(() => { if (!rest) return; const timer = window.setInterval(() => setRest((value) => Math.max(0, value - 1)), 1000); return () => clearInterval(timer) }, [rest])
  const saveSets = (next: LoggedSet[]) => { setSets(next); onDraft(next, note) }
  const update = (index: number, key: 'reps' | 'weight', raw: string) => {
    if (!(key === 'weight' ? /^\d*(?:[.,]\d*)?$/.test(raw) : /^\d*$/.test(raw))) return
    setDraftValues((current) => ({ ...current, [`${key}-${index}`]: raw }))
    const value = raw === '' ? 0 : Number(raw.replace(',', '.'))
    if (!Number.isFinite(value)) return
    saveSets(sets.map((set, i) => i === index ? { ...set, [key]: value, done: key === 'reps' && value === 0 ? false : set.done } : set))
  }
  const toggleDone = (index: number) => {
    const next = sets.map((set, i) => i === index ? { ...set, done: !set.done } : set)
    saveSets(next)
    if (!sets[index].done) setRest(restSeconds)
  }
  const addSet = () => { const previousSet = sets[sets.length - 1] ?? { reps: prescription.minReps, weight: 0, done: false }; saveSets([...sets, { ...previousSet, done: false }]) }
  const removeSet = () => { if (sets.length > 1) { setDraftValues((current) => { const next = { ...current }; delete next[`weight-${sets.length - 1}`]; delete next[`reps-${sets.length - 1}`]; return next }); saveSets(sets.slice(0, -1)) } }

  return <div className="fixed inset-0 z-50 flex items-end bg-black/60" role="presentation" onMouseDown={(event) => event.currentTarget === event.target && onClose()}>
    <motion.section role="dialog" aria-modal="true" aria-label={`Log ${exercise.name}`} initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ duration: .2 }} className="safe-bottom max-h-[94dvh] w-full overflow-y-auto rounded-t-[28px] border border-line bg-ink p-5">
      <div className="mx-auto max-w-lg">
        <div className="flex items-start justify-between"><div><p className="text-sm capitalize text-muted">{exercise.group} · {exercise.equipment}</p><h2 className="mt-1 text-2xl font-bold">{exercise.name}</h2></div><button aria-label="Close" onClick={onClose} className="grid min-h-11 min-w-11 place-items-center rounded-full border border-line"><X size={20} /></button></div>
        <div className="mt-4"><ExerciseAnimation exercise={exercise} /></div>
        <div className="mt-4 flex flex-wrap gap-2"><span className="rounded-full bg-[#2a2f3f] px-3 py-2 text-sm capitalize text-accent">{exercise.level}</span><span className="rounded-full bg-[#2a2f3f] px-3 py-2 text-sm capitalize text-accent">{exercise.equipment}</span></div>
        <ul className="mt-4 space-y-2 text-sm leading-6 text-muted">{exercise.notes.map((note, index) => <li key={index} className="flex gap-2"><span className="text-accent">{index + 1}.</span><span>{note}</span></li>)}</ul>
        <div className="mt-4 rounded-2xl border border-line bg-panel p-4"><p className="text-sm font-semibold">Last session</p>{previous ? <><p className="mt-2 text-sm text-muted">{previous.sets.map((set) => `${set.weight} × ${set.reps}`).join(' · ')}</p>{readyToIncrease && <p className="mt-3 rounded-xl border border-[#5369a3] bg-navy p-3 text-sm leading-5 text-[#dbe2fa]">You reached the top of the rep range. If every rep felt controlled and pain-free, try just <strong>+2.5</strong> next time. Repeating the same weight is also progress.</p>}</> : <p className="mt-2 text-sm text-muted">No previous session yet. Start lighter than you think and learn the movement.</p>}</div>
        <div className="mt-4 rounded-2xl border border-line bg-panel p-3"><label className="text-sm text-muted">Swap for another {exercise.group} exercise</label><div className="mt-2 flex gap-2"><select value={swapId} onChange={(event) => setSwapId(event.target.value)} className="min-h-12 min-w-0 flex-1 rounded-full border border-line bg-ink px-4 text-sm">{exercises.filter((item) => item.group === exercise.group && (item.modality ?? 'strength') === (exercise.modality ?? 'strength')).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><button disabled={swapId === exercise.id} onClick={() => onSwap(swapId)} className="min-h-12 rounded-full border border-accent px-4 text-sm font-semibold text-accent disabled:opacity-40">Swap</button></div></div>
        <div className="mt-5 flex items-center justify-between gap-3"><div><h3 className="font-semibold">Working sets</h3><p className="mt-1 flex items-center gap-1 text-xs text-success"><Check size={14} />Every change is saved</p></div><span className="flex items-center gap-2 text-sm text-muted"><Timer size={17} />{rest ? `${Math.floor(rest / 60)}:${String(rest % 60).padStart(2, '0')}` : 'Rest timer'}</span></div>
        <div className="mt-3 flex gap-2"><button type="button" disabled={sets.length <= 1} onClick={removeSet} className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-line text-sm font-semibold disabled:opacity-35"><Minus size={16} />Remove set</button><button type="button" onClick={addSet} className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-accent text-sm font-semibold text-accent"><Plus size={16} />Add set</button></div>
        <div className="mt-3 space-y-3">{sets.map((set, index) => <div key={index} className={`rounded-card border p-3 ${set.done ? 'border-success bg-[#1e2b24]' : 'border-line bg-panel'}`}>
          <div className="mb-3 flex items-center justify-between"><span className="text-sm font-semibold text-muted">Set {index + 1}</span><button disabled={!set.done && set.reps < 1} onClick={() => toggleDone(index)} className={`flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold disabled:opacity-35 ${set.done ? 'bg-success text-ink' : 'border border-[#52525a]'}`}><Check size={17} />{set.done ? 'Done' : 'Mark done'}</button></div>
          <div className="grid grid-cols-2 gap-3"><label className="text-center text-xs uppercase tracking-wider text-muted">Weight<div className="mt-2 flex min-h-12 items-center rounded-xl border border-line bg-ink px-3"><input aria-label={`Weight for set ${index + 1}`} inputMode="decimal" type="text" value={draftValues[`weight-${index}`] ?? (set.weight ? String(set.weight) : '')} placeholder="0" onChange={(event) => update(index, 'weight', event.target.value)} className="min-w-0 flex-1 bg-transparent text-center text-lg font-bold text-white outline-none" /><span className="text-xs normal-case tracking-normal text-muted">{unitLabel}</span></div></label><label className="text-center text-xs uppercase tracking-wider text-muted">Reps<input aria-label={`Reps for set ${index + 1}`} inputMode="numeric" type="text" value={draftValues[`reps-${index}`] ?? (set.reps ? String(set.reps) : '')} placeholder="0" onChange={(event) => update(index, 'reps', event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-line bg-ink px-3 text-center text-lg font-bold text-white outline-none" /></label></div>
        </div>)}</div>
        <label className="mt-4 block text-sm text-muted">Exercise note<textarea value={note} maxLength={300} placeholder="Machine setup, pain level, form cue…" onChange={(event) => { const next = event.target.value; setNote(next); onDraft(sets, next) }} className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-line bg-panel p-3 text-base text-white outline-none" /></label>
        <button onClick={() => onSave(sets, note)} className="mt-5 min-h-14 w-full rounded-full bg-accent font-bold text-ink">Done — changes saved</button>
        <div className="mt-5 rounded-card border border-line bg-panel p-4"><div className="flex items-center justify-between"><h3 className="font-semibold">Strength history</h3><span className="text-xs text-muted">Est. 1RM</span></div><div className="mt-4 h-40">{chartData.length ? <ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{ top: 4, right: 6, left: -24, bottom: 0 }}><CartesianGrid stroke="#2E2E33" vertical={false} /><XAxis dataKey="date" tick={{ fill: '#92929B', fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: '#92929B', fontSize: 10 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} /><Tooltip contentStyle={{ background: '#18181B', border: '1px solid #2E2E33', borderRadius: 12 }} /><Line dataKey="e1rm" stroke="#7490EA" strokeWidth={3} dot={{ fill: '#7490EA', r: 3 }} isAnimationActive={false} /></LineChart></ResponsiveContainer> : <div className="grid h-full place-items-center text-center text-sm text-muted">Log this exercise twice to see a trend.</div>}</div></div>
      </div>
    </motion.section>
  </div>
}
