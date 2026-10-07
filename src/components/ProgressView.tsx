import { Database, Download, Flame, Save, ShieldCheck, Upload } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useAppStore } from '../store'
import type { BodyLog, Profile, WorkoutLog } from '../types'
import { dateKey } from '../utils/date'
import { validBackup } from '../utils/backup'
import { streaks } from '../utils/stats'
import { requestPersistentStorage } from '../utils/storage'

type Measurement = 'weight' | 'waist' | 'chest' | 'arms' | 'thighs'
const measurements: Measurement[] = ['weight', 'waist', 'chest', 'arms', 'thighs']
const validPositive = (value: string) => /^\d+(?:[.,]\d+)?$/.test(value) && Number(value.replace(',', '.')) > 0
const parseAmount = (value: string) => Number(value.replace(',', '.'))

export function ProgressView({ profile, logs }: { profile: Profile; logs: WorkoutLog[] }) {
  const { bodyLogs, addBodyLog, setLastExport, importData, lastExport, savedRoutines, lastSavedAt, storageWarning, saveProfile } = useAppStore()
  const [metric, setMetric] = useState<Measurement>('weight')
  const [form, setForm] = useState<Record<Measurement | 'date', string>>({ date: dateKey(new Date()), weight: String(profile.weight), waist: '', chest: '', arms: '', thighs: '' })
  const [message, setMessage] = useState('')
  const [restSeconds, setRestSeconds] = useState(String(profile.restSeconds ?? 90))
  const fileRef = useRef<HTMLInputElement>(null)
  const streak = streaks(logs)
  const reminder = !lastExport || (Date.now() - new Date(lastExport).getTime()) / 86400000 >= 30
  const validMeasurement = Boolean(form.date) && validPositive(form.weight) && measurements.slice(1).every((item) => form[item] === '' || validPositive(form[item]))
  const validRest = /^\d+$/.test(restSeconds) && Number(restSeconds) >= 15 && Number(restSeconds) <= 600
  const saveMeasurements = () => {
    if (!validMeasurement) return
    const entry: BodyLog = { date: form.date, weight: parseAmount(form.weight) }
    measurements.slice(1).forEach((item) => { if (form[item] !== '') entry[item] = parseAmount(form[item]) })
    addBodyLog(entry)
    setMessage('Measurements saved.')
  }

  const weeklyWeight = useMemo(() => {
    const weeks = new Map<string, number[]>()
    bodyLogs.filter((entry) => Number.isFinite(entry.weight) && entry.weight > 0).forEach((entry) => { const date = new Date(`${entry.date}T12:00:00`); const start = new Date(date); start.setDate(date.getDate() - ((date.getDay() + 6) % 7)); const key = dateKey(start); weeks.set(key, [...(weeks.get(key) ?? []), entry.weight]) })
    return [...weeks].map(([date, values]) => ({ date, weight: Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)) }))
  }, [bodyLogs])
  const chartData = metric === 'weight' ? weeklyWeight : bodyLogs.filter((entry) => Number.isFinite(entry[metric]) && Number(entry[metric]) > 0).map((entry) => ({ date: entry.date, [metric]: entry[metric] }))

  const exportData = () => {
    try {
      const state = useAppStore.getState()
      const blob = new Blob([JSON.stringify({ version: 3, exportedAt: new Date().toISOString(), profile: state.profile, logs: state.logs, bodyLogs: state.bodyLogs, exerciseSwaps: state.exerciseSwaps, workoutChoices: state.workoutChoices, customWorkouts: state.customWorkouts, savedRoutines: state.savedRoutines, lastSavedAt: state.lastSavedAt, lastExport: new Date().toISOString() }, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `workout-tracker-backup-${dateKey(new Date())}.json`; document.body.appendChild(link); link.click(); link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 60000); setLastExport(new Date().toISOString()); setMessage('Backup download started. Confirm the file appears in Files or Downloads.')
    } catch { setMessage('Could not create the backup. Please try again.') }
  }
  const importFile = async (file?: File) => {
    if (!file) return
    try {
      const data = JSON.parse(await file.text())
      if (!validBackup(data)) throw new Error('Invalid')
      if (!window.confirm('Restore this backup? It will replace the current workout and measurement logs on this device. Export your current data first if you need it.')) { setMessage('Import cancelled.'); return }
      importData(data)
      setMessage('Backup restored.')
    } catch { setMessage('That file is not a valid workout tracker backup.') }
    finally { if (fileRef.current) fileRef.current.value = '' }
  }

  const monthDays = Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() }, (_, i) => new Date(new Date().getFullYear(), new Date().getMonth(), i + 1))
  return <main className="px-5 pb-28 pt-7">
    <p className="text-sm font-semibold uppercase tracking-[.16em] text-accent">Body & consistency</p><h1 className="mt-1 text-3xl font-bold">Your progress</h1>
    <section className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-card border border-line bg-panel p-4"><Flame className="text-accent" size={20} /><p className="mt-3 text-3xl font-bold tabular">{streak.current}</p><p className="text-sm text-muted">Workouts in 7 days</p></div><div className="rounded-card border border-line bg-panel p-4"><p className="text-sm text-muted">Best week</p><p className="mt-3 text-3xl font-bold tabular">{streak.longest}</p><p className="text-sm text-muted">completed workouts</p></div></section>

    <section className="mt-4 rounded-card border border-line bg-panel p-4"><div className="flex items-center justify-between"><h2 className="font-semibold">This month</h2><span className="text-xs text-muted">Training heatmap</span></div><div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs text-muted">{['S', 'M', 'T', 'W', 'T', 'F', 'Sa'].map((day, index) => <span key={index}>{day}</span>)}{Array.from({ length: monthDays[0].getDay() }, (_, index) => <span key={`blank-${index}`} />)}{monthDays.map((date) => { const dayLogs = logs.filter((item) => item.date === dateKey(date)); return <span key={dateKey(date)} title={`${date.getDate()}`} className={`aspect-square rounded-md border ${dayLogs.some((log) => log.completed) ? 'border-accent bg-accent' : dayLogs.length ? 'border-[#3c4c75] bg-navy' : 'border-line bg-ink'}`} /> })}</div></section>

    <section className="mt-4 rounded-card border border-line bg-panel p-4"><h2 className="font-semibold">Log measurements</h2><div className="mt-4 grid grid-cols-2 gap-3"><label className="text-xs text-muted">Date<input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="mt-1 min-h-12 w-full rounded-xl border border-line bg-ink px-3 text-base" /></label>{measurements.map((item) => <label key={item} className="text-xs capitalize text-muted">{item}<div className="mt-1 flex min-h-12 items-center rounded-xl border border-line bg-ink px-3"><input inputMode="decimal" type="text" value={form[item]} onChange={(event) => setForm({ ...form, [item]: event.target.value })} className="min-w-0 flex-1 bg-transparent text-base outline-none" /><span className="text-sm normal-case">{item === 'weight' ? (profile.units === 'metric' ? 'kg' : 'lb') : (profile.units === 'metric' ? 'cm' : 'in')}</span></div></label>)}</div>{!validMeasurement && <p className="mt-3 text-sm text-danger">Enter a date and a positive weight. Other measurements must be positive if filled in.</p>}<button disabled={!validMeasurement} onClick={saveMeasurements} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-accent font-bold text-ink disabled:bg-[#303035] disabled:text-muted"><Save size={18} />Save entry</button></section>

    <section className="mt-4 rounded-card border border-line bg-panel p-4"><div className="scrollbar-none flex gap-2 overflow-x-auto">{measurements.map((item) => <button key={item} onClick={() => setMetric(item)} className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold capitalize ${metric === item ? 'bg-accent text-ink' : 'border border-line text-muted'}`}>{item}{item === 'weight' ? ' average' : ''}</button>)}</div><div className="mt-5 h-56">{chartData.length ? <ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}><CartesianGrid stroke="#2E2E33" vertical={false} /><XAxis dataKey="date" tick={{ fill: '#92929B', fontSize: 11 }} tickLine={false} axisLine={false} /><YAxis tick={{ fill: '#92929B', fontSize: 11 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} /><Tooltip contentStyle={{ background: '#18181B', border: '1px solid #2E2E33', borderRadius: 12 }} /><Line type="monotone" dataKey={metric} stroke="#7490EA" strokeWidth={3} dot={{ r: 3, fill: '#7490EA' }} isAnimationActive={false} /></LineChart></ResponsiveContainer> : <div className="grid h-full place-items-center text-center"><div><p className="font-semibold">No {metric} trend yet</p><p className="mt-1 text-sm text-muted">Save an entry to start the chart.</p></div></div>}</div></section>

    <section className="mt-4 rounded-card border border-line bg-panel p-4"><div className="flex items-center gap-2"><Database size={20} className="text-accent" /><h2 className="font-semibold">Where your progress is saved</h2></div><p className="mt-3 text-sm leading-6 text-muted">Workout drafts, routines, measurements, and settings are saved automatically inside this browser on this device. The app keeps a fast local copy plus an IndexedDB mirror. Nothing is sent to a server.</p><p className="mt-3 rounded-xl border border-line bg-ink p-3 text-sm text-white">{storageWarning ?? (lastSavedAt ? `Last saved: ${new Date(lastSavedAt).toLocaleString()}` : 'No changes saved yet.')}</p><p className="mt-3 text-xs leading-5 text-muted">Clearing this site’s browser data, using private browsing, or removing the app without exporting can erase local records. The Home Screen app may have storage separate from Safari.</p><button onClick={async () => { const protectedStorage = await requestPersistentStorage(); setMessage(protectedStorage ? 'This browser granted protected local storage.' : 'The browser kept standard local storage. Regular exports are still recommended.') }} className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-accent font-semibold text-accent"><ShieldCheck size={18} />Protect local storage</button></section>

    <section className="mt-4 rounded-card border border-line bg-panel p-4"><h2 className="font-semibold">Workout preferences</h2><label className="mt-3 block text-sm text-muted">Default rest timer (seconds)<input type="number" inputMode="numeric" min="15" max="600" step="1" value={restSeconds} onChange={(event) => setRestSeconds(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-line bg-ink px-3 text-base text-white outline-none" /></label>{!validRest && <p className="mt-2 text-sm text-danger">Choose a whole number between 15 and 600 seconds.</p>}<button disabled={!validRest} onClick={() => { saveProfile({ ...profile, restSeconds: Number(restSeconds) }); setMessage('Workout preferences saved.') }} className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-accent font-bold text-ink disabled:bg-[#303035] disabled:text-muted"><Save size={18} />Save preferences</button></section>

    <section className={`mt-4 rounded-card border p-4 ${reminder ? 'border-[#5369a3] bg-navy' : 'border-line bg-panel'}`}><h2 className="font-semibold">Backup your data</h2><p className="mt-1 text-sm leading-6 text-muted">Everything stays on this device. Your backup includes {logs.length} workout log{logs.length === 1 ? '' : 's'} and {Object.keys(savedRoutines ?? {}).length} custom routine{Object.keys(savedRoutines ?? {}).length === 1 ? '' : 's'}.</p>{reminder && <p className="mt-2 text-sm font-semibold text-accent">Backup reminder: it’s time to export a fresh copy.</p>}<div className="mt-4 grid grid-cols-2 gap-3"><button onClick={exportData} className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent font-semibold text-ink"><Download size={18} />Export</button><button onClick={() => fileRef.current?.click()} className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-line font-semibold"><Upload size={18} />Import</button><input ref={fileRef} type="file" accept="application/json" onChange={(event) => importFile(event.target.files?.[0])} className="hidden" /></div></section>
    {message && <p role="status" className="mt-4 rounded-2xl border border-line bg-panel p-3 text-sm text-accent">{message}</p>}
  </main>
}
