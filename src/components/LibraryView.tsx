import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { exercises } from '../data/plan'
import type { Exercise } from '../types'
import { ExerciseAnimation } from './ExerciseAnimation'

export function LibraryView() {
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState('all')
  const [equipment, setEquipment] = useState('all')
  const [active, setActive] = useState<Exercise>()
  const groups = [...new Set(exercises.map((item) => item.group))].sort()
  const equipmentList = [...new Set(exercises.map((item) => item.equipment))].sort()
  const filtered = useMemo(() => exercises.filter((item) => (group === 'all' || item.group === group) && (equipment === 'all' || item.equipment === equipment) && item.name.toLowerCase().includes(query.toLowerCase())), [query, group, equipment])

  return <main className="px-5 pb-28 pt-7">
    <p className="text-sm font-semibold uppercase tracking-[.16em] text-accent">62 beginner moves</p><h1 className="mt-1 text-3xl font-bold">Exercise library</h1>
    <div className="mt-5 flex min-h-12 items-center gap-3 rounded-full border border-line bg-panel px-4"><Search size={19} className="text-muted" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search exercises" className="w-full bg-transparent outline-none placeholder:text-muted" /></div>
    <div className="mt-3 flex gap-2"><label className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-full border border-line bg-panel px-3 text-sm"><SlidersHorizontal size={16} className="shrink-0 text-accent" /><select value={group} onChange={(event) => setGroup(event.target.value)} className="min-w-0 flex-1 bg-transparent capitalize outline-none"><option value="all">All muscles</option>{groups.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><select aria-label="Filter by equipment" value={equipment} onChange={(event) => setEquipment(event.target.value)} className="min-h-11 min-w-0 flex-1 rounded-full border border-line bg-panel px-3 text-sm capitalize"><option value="all">All equipment</option>{equipmentList.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
    <p className="mt-5 text-sm text-muted">{filtered.length} result{filtered.length === 1 ? '' : 's'}</p>
    <div className="mt-3 grid grid-cols-2 gap-3">{filtered.map((exercise) => <button key={exercise.id} onClick={() => setActive(exercise)} className="overflow-hidden rounded-card border border-line bg-panel text-left"><img src={`${import.meta.env.BASE_URL}${exercise.image}`} alt="" loading="lazy" className="aspect-[4/3] w-full bg-white object-contain" /><div className="p-3"><p className="font-semibold leading-5 text-accent">{exercise.name}</p><p className="mt-2 text-xs capitalize text-muted">{exercise.group} · {exercise.equipment}</p></div></button>)}</div>
    {!filtered.length && <div className="mt-8 rounded-card border border-line bg-panel p-8 text-center"><Search className="mx-auto text-muted" /><h2 className="mt-3 font-semibold">No exercises found</h2><p className="mt-1 text-sm text-muted">Try a different search or filter.</p></div>}

    {active && <div className="fixed inset-0 z-50 flex items-end bg-black/60" onMouseDown={(event) => event.target === event.currentTarget && setActive(undefined)}><section className="safe-bottom max-h-[92dvh] w-full overflow-y-auto rounded-t-[28px] border border-line bg-ink p-5"><div className="mx-auto max-w-lg"><div className="flex items-start justify-between"><div><p className="text-sm capitalize text-muted">{active.group} · {active.equipment}</p><h2 className="mt-1 text-2xl font-bold">{active.name}</h2></div><button onClick={() => setActive(undefined)} aria-label="Close" className="grid min-h-11 min-w-11 place-items-center rounded-full border border-line"><X size={20} /></button></div><div className="mt-4"><ExerciseAnimation exercise={active} /></div><div className="mt-4 flex gap-2"><span className="rounded-full bg-[#2a2f3f] px-3 py-2 text-sm text-accent">Beginner</span>{active.shoulderFriendly && <span className="rounded-full bg-[#1e2b24] px-3 py-2 text-sm text-success">Shoulder-friendly</span>}</div><h3 className="mt-5 font-semibold">Form notes</h3><ol className="mt-2 space-y-3 text-sm leading-6 text-muted">{active.notes.map((note, index) => <li key={index}><span className="mr-2 text-accent">{index + 1}.</span>{note}</li>)}</ol></div></section></div>}
  </main>
}
