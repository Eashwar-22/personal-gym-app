import { Download, Flame, Save, Upload } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useAppStore } from '../store'
import type { BodyLog, Profile, WorkoutLog } from '../types'
import { dateKey } from '../utils/date'
import { streaks } from '../utils/stats'

type Measurement = 'weight' | 'waist' | 'chest' | 'arms' | 'thighs'
const measurements: Measurement[] = ['weight', 'waist', 'chest', 'arms', 'thighs']

export function ProgressView({ profile, logs }: { profile: Profile; logs: WorkoutLog[] }) {
  const { bodyLogs, addBodyLog, setLastExport, importData, lastExport } = useAppStore()
  const [metric, setMetric] = useState<Measurement>('weight')
  const [form, setForm] = useState<BodyLog>({ date: dateKey(new Date()), weight: profile.weight })
  const [message, setMessage] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const streak = streaks(logs)
  const reminder = !lastExport || (Date.now() - new Date(lastExport).getTime()) / 86400000 >= 30

  const weeklyWeight = useMemo(() => {
    const weeks = new Map<string, number[]>()
    bodyLogs.forEach((entry) => { const date = new Date(`${entry.date}T12:00:00`); const start = new Date(date); start.setDate(date.getDate() - date.getDay()); const key = dateKey(start); weeks.set(key, [...(weeks.get(key) ?? []), entry.weight]) })
    return [...weeks].map(([date, values]) => ({ date, weight: Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)) }))
  }, [bodyLogs])
  const chartData = metric === 'weight' ? weeklyWeight : bodyLogs.filter((entry) => entry[metric] !== undefined).map((entry) => ({ date: entry.date, [metric]: entry[metric] }))

  const exportData = () => {
    try {
      const state = useAppStore.getState()
      const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), profile: state.profile, logs: state.logs, bodyLogs: state.bodyLogs, exerciseSwaps: state.exerciseSwaps, workoutChoices: state.workoutChoices, lastExport: new Date().toISOString() }, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `steadylift-backup-${dateKey(new Date())}.json`; link.click(); URL.revokeObjectURL(url); setLastExport(new Date().toISOString()); setMessage('Backup downloaded.')
    } catch { setMessage('Could not create the backup. Please try again.') }
  }
  const importFile = async (file?: File) => {
    if (!file) return
    try { const data = JSON.parse(await file.text()); if (!Array.isArray(data.logs) || !Array.isArray(data.bodyLogs)) throw new Error('Invalid'); importData(data); setMessage('Backup restored.') } catch { setMessage('That file is not a valid SteadyLift backup.') }
  }

  const monthDays = Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() }, (_, i) => new Date(new Date().getFullYear(), new Date().getMonth(), i + 1))
  return <main className="px-5 pb-28 pt-7">
    <p className="text-sm font-semibold uppercase tracking-[.16em] text-accent">Body & consistency</p><h1 className="mt-1 text-3xl font-bold">Your progress</h1>
    <section className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-card border border-line bg-panel p-4"><Flame className="text-accent" size={20} /><p className="mt-3 text-3xl font-bold tabular">{streak.current}</p><p className="text-sm text-muted">Workouts in 7 days</p></div><div className="rounded-card border border-line bg-panel p-4"><p className="text-sm text-muted">Best week</p><p className="mt-3 text-3xl font-bold tabular">{streak.longest}</p><p className="text-sm text-muted">completed workouts</p></div></section>

    <section className="mt-4 rounded-card border border-line bg-panel p-4"><div className="flex items-center justify-between"><h2 className="font-semibold">This month</h2><span className="text-xs text-muted">Training heatmap</span></div><div className="mt-4 grid grid-cols-7 gap-2">{monthDays.map((date) => { const log = logs.find((item) => item.date === dateKey(date)); return <span key={dateKey(date)} title={`${date.getDate()}`} className={`aspect-square rounded-md border ${log?.completed ? 'border-accent bg-accent' : log ? 'border-[#3c4c75] bg-navy' : 'border-line bg-ink'}`} /> })}</div></section>

    <section className="mt-4 rounded-card border border-line bg-panel p-4"><h2 className="font-semibold">Log measurements</h2><div className="mt-4 grid grid-cols-2 gap-3"><label className="text-xs text-muted">Date<input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="mt-1 min-h-12 w-full rounded-xl border border-line bg-ink px-3 text-base" /></label>{measurements.map((item) => <label key={item} className="text-xs capitalize text-muted">{item}<div className="mt-1 flex min-h-12 items-center rounded-xl border border-line bg-ink px-3"><input inputMode="decimal" type="number" value={form[item] ?? ''} onChange={(event) => setForm({ ...form, [item]: event.target.value === '' ? undefined : Number(event.target.value) })} className="min-w-0 flex-1 bg-transparent text-base outline-none" /><span className="text-sm">{item === 'weight' ? (profile.units === 'metric' ? 'kg' : 'lb') : (profile.units === 'metric' ? 'cm' : 'in')}</span></div></label>)}</div><button onClick={() => { addBodyLog(form); setMessage('Measurements saved.') }} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-accent font-bold text-ink"><Save size={18} />Save entry</button></section>

    <section className="mt-4 rounded-card border border-line bg-panel p-4"><div className="scrollbar-none flex gap-2 overflow-x-auto">{measurements.map((item) => <button key={item} onClick={() => setMetric(item)} className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold capitalize ${metric === item ? 'bg-accent text-ink' : 'border border-line text-muted'}`}>{item}{item === 'weight' ? ' average' : ''}</button>)}</div><div className="mt-5 h-56">{chartData.length ? <ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}><CartesianGrid stroke="#2E2E33" vertical={false} /><XAxis dataKey="date" tick={{ fill: '#92929B', fontSize: 11 }} tickLine={false} axisLine={false} /><YAxis tick={{ fill: '#92929B', fontSize: 11 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} /><Tooltip contentStyle={{ background: '#18181B', border: '1px solid #2E2E33', borderRadius: 12 }} /><Line type="monotone" dataKey={metric} stroke="#7490EA" strokeWidth={3} dot={{ r: 3, fill: '#7490EA' }} isAnimationActive={false} /></LineChart></ResponsiveContainer> : <div className="grid h-full place-items-center text-center"><div><p className="font-semibold">No {metric} trend yet</p><p className="mt-1 text-sm text-muted">Save an entry to start the chart.</p></div></div>}</div></section>

    <section className={`mt-4 rounded-card border p-4 ${reminder ? 'border-[#5369a3] bg-navy' : 'border-line bg-panel'}`}><h2 className="font-semibold">Backup your data</h2><p className="mt-1 text-sm leading-6 text-muted">Everything stays on this device. Export a copy at least every 30 days.</p>{reminder && <p className="mt-2 text-sm font-semibold text-accent">Backup reminder: it’s time to export a fresh copy.</p>}<div className="mt-4 grid grid-cols-2 gap-3"><button onClick={exportData} className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent font-semibold text-ink"><Download size={18} />Export</button><button onClick={() => fileRef.current?.click()} className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-line font-semibold"><Upload size={18} />Import</button><input ref={fileRef} type="file" accept="application/json" onChange={(event) => importFile(event.target.files?.[0])} className="hidden" /></div></section>
    {message && <p role="status" className="mt-4 rounded-2xl border border-line bg-panel p-3 text-sm text-accent">{message}</p>}
  </main>
}
