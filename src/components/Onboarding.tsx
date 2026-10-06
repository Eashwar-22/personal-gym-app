import { useState } from 'react'
import { Dumbbell, ShieldCheck } from 'lucide-react'
import type { Profile, UnitSystem } from '../types'

export function Onboarding({ onSave }: { onSave: (profile: Profile) => void }) {
  const [units, setUnits] = useState<UnitSystem>('metric')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const validMeasurements = weight.trim() !== '' && height.trim() !== '' && Number.isFinite(Number(weight)) && Number.isFinite(Number(height)) && Number(weight) > 0 && Number(height) > 0

  return <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-between px-5 py-8 safe-bottom">
    <section>
      <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-ink"><Dumbbell size={28} strokeWidth={2.5} /></div>
      <p className="mb-2 text-sm font-semibold uppercase tracking-[.18em] text-accent">SteadyLift</p>
      <h1 className="max-w-sm text-4xl font-bold leading-[1.05]">Build strength at your pace.</h1>
      <p className="mt-4 text-base leading-7 text-muted">A straightforward 4-workout rotation for beginners, with shoulder-friendly choices and no fixed training days.</p>

      <div className="mt-8 rounded-card border border-line bg-panel p-5">
        <div className="mb-5 flex rounded-full border border-line bg-ink p-1">
          {(['metric', 'imperial'] as UnitSystem[]).map((item) => <button key={item} onClick={() => setUnits(item)} className={`min-h-11 flex-1 rounded-full text-sm font-semibold capitalize ${units === item ? 'bg-accent text-ink' : 'text-muted'}`}>{item}</button>)}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm text-muted">Weight
            <div className="mt-2 flex items-center rounded-2xl border border-line bg-ink px-4"><input className="min-h-12 w-full bg-transparent text-lg font-semibold tabular outline-none" inputMode="decimal" type="number" min="0.1" step="any" placeholder={units === 'metric' ? 'e.g. 72' : 'e.g. 160'} value={weight} onChange={(event) => setWeight(event.target.value)} /><span>{units === 'metric' ? 'kg' : 'lb'}</span></div>
          </label>
          <label className="text-sm text-muted">Height
            <div className="mt-2 flex items-center rounded-2xl border border-line bg-ink px-4"><input className="min-h-12 w-full bg-transparent text-lg font-semibold tabular outline-none" inputMode="decimal" type="number" min="0.1" step="any" placeholder={units === 'metric' ? 'e.g. 175' : 'e.g. 69'} value={height} onChange={(event) => setHeight(event.target.value)} /><span>{units === 'metric' ? 'cm' : 'in'}</span></div>
          </label>
        </div>
        <div className="mt-5 rounded-2xl border border-[#34405e] bg-navy p-4"><p className="font-semibold text-[#dbe2fa]">Train what you want, when you want</p><p className="mt-1 text-sm leading-6 text-[#aeb9dd]">No weekdays or workout categories are assigned. Pick Upper A, Lower A, Upper B, or Lower B each time you train.</p></div>
      </div>
    </section>

    <section className="mt-8">
      <div className="mb-5 flex gap-3 rounded-2xl border border-[#34405e] bg-navy p-4 text-sm leading-6 text-[#c9d2f3]"><ShieldCheck className="mt-0.5 shrink-0 text-accent" size={20} /><span>Keep every rep pain-free. If your recovering shoulder hurts, stop and check with your clinician or physio.</span></div>
      <button disabled={!validMeasurements} onClick={() => onSave({ weight: Number(weight), height: Number(height), units, restSeconds: 90 })} className="min-h-14 w-full rounded-full bg-accent px-6 text-base font-bold text-ink disabled:bg-[#303035] disabled:text-muted">Start my plan</button>
    </section>
  </main>
}
