import type { ExerciseLog, WorkoutLog } from '../types'

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

export const streaks = (logs: WorkoutLog[]) => {
  const completed = logs.filter((log) => log.completed)
  const sevenDaysAgo = new Date(); sevenDaysAgo.setHours(0, 0, 0, 0); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  const current = completed.filter((log) => new Date(`${log.date}T12:00:00`) >= sevenDaysAgo).length
  const weeks = new Map<string, number>()
  completed.forEach((log) => { const date = new Date(`${log.date}T12:00:00`); const monday = new Date(date); const day = (date.getDay() + 6) % 7; monday.setDate(date.getDate() - day); const key = monday.toISOString().slice(0, 10); weeks.set(key, (weeks.get(key) ?? 0) + 1) })
  return { current, longest: Math.max(0, ...weeks.values()) }
}
