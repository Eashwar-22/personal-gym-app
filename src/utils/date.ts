import { plan } from '../data/plan'
import type { Profile, WorkoutDay } from '../types'

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

export const workoutForDate = (date: Date, profile: Profile): WorkoutDay | undefined => {
  const index = profile.weekdays.indexOf(date.getDay())
  return index >= 0 ? plan[index] : undefined
}

export const longDate = (date: Date) => new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(date)
