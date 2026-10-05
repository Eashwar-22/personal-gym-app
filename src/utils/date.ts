import { plan } from '../data/plan'
import type { WorkoutDay, WorkoutLog } from '../types'

export const dateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const fromDateKey = (key: string) => {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export const workoutForDate = (date: Date, logs: WorkoutLog[]): WorkoutDay => {
  const key = dateKey(date)
  const existing = logs.find((log) => log.date === key)
  if (existing) return plan.find((workout) => workout.id === existing.workoutId) ?? plan[0]
  const completedBefore = logs.filter((log) => log.completed && log.date < key).length
  return plan[completedBefore % plan.length]
}

export const longDate = (date: Date) => new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(date)
