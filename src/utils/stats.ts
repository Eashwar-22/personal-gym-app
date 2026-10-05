import type { ExerciseLog, Profile, WorkoutLog } from '../types'
import { dateKey, workoutForDate } from './date'

export const exerciseScore = (log: ExerciseLog) => {
  if (!log.completed) return 0
  return 10 + (log.sets.every((set) => set.done) ? 5 : 0) + (log.pb ? 5 : 0)
}

export const workoutScore = (exercises: ExerciseLog[], plannedCount: number, completed = false) =>
  exercises.reduce((total, exercise) => total + exerciseScore(exercise), 0) + (completed && exercises.filter((item) => item.completed).length === plannedCount ? 20 : 0)

export const isPersonalBest = (sets: ExerciseLog['sets'], exerciseId: string, date: string, logs: WorkoutLog[]) => {
  const currentBest = Math.max(...sets.filter((set) => set.done).map((set) => set.weight * Math.max(1, set.reps)), 0)
  const previousBest = Math.max(...logs.filter((log) => log.date < date).flatMap((log) => log.exercises).filter((item) => item.exerciseId === exerciseId).flatMap((item) => item.sets).filter((set) => set.done).map((set) => set.weight * Math.max(1, set.reps)), 0)
  return previousBest > 0 && currentBest > previousBest
}

export const streaks = (profile: Profile, logs: WorkoutLog[]) => {
  const completed = new Set(logs.filter((log) => log.completed).map((log) => log.date))
  const cursor = new Date(); cursor.setHours(0, 0, 0, 0)
  const dates: string[] = []
  for (let count = 0; count < 730; count++) {
    if (workoutForDate(cursor, profile)) dates.unshift(dateKey(cursor))
    cursor.setDate(cursor.getDate() - 1)
  }
  let longest = 0; let run = 0
  for (const key of dates) { if (completed.has(key)) { run += 1; longest = Math.max(longest, run) } else run = 0 }
  let current = 0
  for (let index = dates.length - 1; index >= 0; index--) { if (completed.has(dates[index])) current += 1; else break }
  return { current, longest }
}
