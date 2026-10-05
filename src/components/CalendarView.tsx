import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import type { Profile, WorkoutLog } from '../types'
import { dateKey, longDate, workoutForDate } from '../utils/date'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'Sa']

export function CalendarView({ profile, logs, selected, onSelect, compact = false }: { profile: Profile; logs: WorkoutLog[]; selected: Date; onSelect: (date: Date) => void; compact?: boolean }) {
  const [month, setMonth] = useState(new Date(selected.getFullYear(), selected.getMonth(), 1))
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const gridStart = new Date(first)
  gridStart.setDate(first.getDate() - first.getDay())
  const days = Array.from({ length: 42 }, (_, index) => { const date = new Date(gridStart); date.setDate(gridStart.getDate() + index); return date })

  return <section className={`overflow-hidden border border-line bg-panel ${compact ? 'rounded-card' : 'min-h-[calc(100dvh-5rem)] rounded-b-[28px]'}`}>
    <header className="bg-accent px-6 pb-7 pt-6 text-ink">
      <p className="text-sm font-semibold opacity-70">{selected.getFullYear()}</p>
      <h1 className="mt-1 text-3xl font-bold leading-tight">{longDate(selected)}</h1>
    </header>
    <div className="p-5">
      <div className="flex items-center justify-between">
        <button aria-label="Previous month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="grid min-h-11 min-w-11 place-items-center rounded-full border border-line"><ChevronLeft size={20} /></button>
        <h2 className="text-lg font-semibold">{new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(month)}</h2>
        <button aria-label="Next month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="grid min-h-11 min-w-11 place-items-center rounded-full border border-line"><ChevronRight size={20} /></button>
      </div>
      <div className="mt-5 grid grid-cols-7 text-center text-xs font-semibold text-muted">{WEEKDAYS.map((day, index) => <span key={`${day}-${index}`} className="py-2">{day}</span>)}</div>
      <div className="grid grid-cols-7 gap-y-1">{days.map((date) => {
        const key = dateKey(date); const log = logs.find((item) => item.date === key); const planned = workoutForDate(date, profile)
        const isSelected = key === dateKey(selected); const inMonth = date.getMonth() === month.getMonth(); const missed = planned && date < new Date(new Date().setHours(0, 0, 0, 0)) && !log?.completed
        return <button key={key} onClick={() => onSelect(date)} className="relative flex min-h-12 flex-col items-center justify-center gap-1 rounded-full text-sm">
          <span className={`grid h-8 w-8 place-items-center rounded-full tabular ${isSelected ? 'bg-accent font-bold text-ink' : inMonth ? 'text-white' : 'text-[#55555c]'}`}>{date.getDate()}</span>
          {planned && <span aria-label={log?.completed ? 'Completed' : missed ? 'Missed' : 'Planned'} className={`h-1.5 w-1.5 rounded-full ${log?.completed ? 'bg-success' : missed ? 'bg-danger' : 'bg-accent'}`} />}
        </button>
      })}</div>
      <div className="mt-5 flex flex-wrap gap-4 border-t border-line pt-4 text-xs text-muted"><span><i className="mr-2 inline-block h-2 w-2 rounded-full bg-accent" />Planned</span><span><i className="mr-2 inline-block h-2 w-2 rounded-full bg-success" />Done</span><span><i className="mr-2 inline-block h-2 w-2 rounded-full bg-danger" />Missed</span></div>
    </div>
  </section>
}
