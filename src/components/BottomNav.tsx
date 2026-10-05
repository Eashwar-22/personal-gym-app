import { BarChart3, CalendarDays, Dumbbell, Library } from 'lucide-react'
import type { Tab } from '../types'

const tabs = [
  { id: 'today' as const, label: 'Today', icon: Dumbbell },
  { id: 'calendar' as const, label: 'Calendar', icon: CalendarDays },
  { id: 'library' as const, label: 'Library', icon: Library },
  { id: 'progress' as const, label: 'Progress', icon: BarChart3 },
]

export function BottomNav({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  return <nav aria-label="Main navigation" className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/95 px-3 pt-2">
    <div className="mx-auto grid max-w-lg grid-cols-4">{tabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => onChange(id)} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-xs font-medium ${active === id ? 'text-accent' : 'text-muted'}`}><Icon size={21} strokeWidth={active === id ? 2.5 : 2} /><span>{label}</span></button>)}</div>
  </nav>
}
