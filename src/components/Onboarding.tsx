import { useState } from 'react'
import { Dumbbell, ShieldCheck } from 'lucide-react'
import type { Profile, UnitSystem } from '../types'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function Onboarding({ onSave }: { onSave: (profile: Profile) => void }) {
  const [units, setUnits] = useState<UnitSystem>('metric')
  const [weight, setWeight] = useState(75)
  const [height, setHeight] = useState(175)
  const [weekdays, setWeekdays] = useState([1, 2, 4, 5])

  const toggleDay = (day: number) => setWeekdays((current) => current.includes(day) ? current.filter((item) => item !== day) : current.length < 4 ? [...current, day].sort() : current)

  return <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-between px-5 py-8 safe-bottom">
    <section>
      <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-ink"><Dumbbell size={28} strokeWidth={2.5} /></div>
      <p className="mb-2 text-sm font-semibold uppercase tracking-[.18em] text-accent">SteadyLift</p>
      <h1 className="max-w-sm text-4xl font-bold leading-[1.05]">Build strength at your pace.</h1>
      <p className="mt-4 text-base leading-7 text-muted">A straightforward 4-day plan for beginners, with shoulder-friendly choices and no pressure to rush.</p>

      <div className="mt-8 rounded-card border border-line bg-panel p-5">
        <div className="mb-5 flex rounded-full border border-line bg-ink p-1">
          {(['metric', 'imperial'] as UnitSystem[]).map((item) => <button key={item} onClick={() => setUnits(item)} className={`min-h-11 flex-1 rounded-full text-sm font-semibold capitalize ${units === item ? 'bg-accent text-ink' : 'text-muted'}`}>{item}</button>)}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm text-muted">Weight
            <div className="mt-2 flex items-center rounded-2xl border border-line bg-ink px-4"><input className="min-h-12 w-full bg-transparent text-lg font-semibold tabular outline-none" inputMode="decimal" type="number" value={weight} onChange={(event) => setWeight(Number(event.target.value))} /><span>{units === 'metric' ? 'kg' : 'lb'}</span></div>
          </label>
          <label className="text-sm text-muted">Height
            <div className="mt-2 flex items-center rounded-2xl border border-line bg-ink px-4"><input className="min-h-12 w-full bg-transparent text-lg font-semibold tabular outline-none" inputMode="decimal" type="number" value={height} onChange={(event) => setHeight(Number(event.target.value))} /><span>{units === 'metric' ? 'cm' : 'in'}</span></div>
          </label>
        </div>
        <p className="mb-3 mt-6 text-sm text-muted">Choose exactly 4 training days</p>
        <div className="grid grid-cols-7 gap-1">{DAYS.map((day, index) => <button key={day} aria-pressed={weekdays.includes(index)} onClick={() => toggleDay(index)} className={`aspect-square min-h-11 rounded-full text-sm font-semibold ${weekdays.includes(index) ? 'bg-accent text-ink' : 'border border-line text-muted'}`}>{day.slice(0, 1)}</button>)}</div>
      </div>
    </section>

    <section className="mt-8">
      <div className="mb-5 flex gap-3 rounded-2xl border border-[#34405e] bg-navy p-4 text-sm leading-6 text-[#c9d2f3]"><ShieldCheck className="mt-0.5 shrink-0 text-accent" size={20} /><span>Keep every rep pain-free. If your recovering shoulder hurts, stop and check with your clinician or physio.</span></div>
      <button disabled={weekdays.length !== 4} onClick={() => onSave({ weight, height, units, weekdays })} className="min-h-14 w-full rounded-full bg-accent px-6 text-base font-bold text-ink disabled:opacity-40">Start my plan</button>
    </section>
  </main>
}
