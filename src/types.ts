export type UnitSystem = 'metric' | 'imperial'
export type Tab = 'today' | 'calendar' | 'library' | 'progress'

export type Exercise = {
  id: string
  name: string
  group: string
  equipment: string
  level: 'beginner'
  image?: string
  images?: string[]
  sourceUrl?: string
  notes: string[]
  shoulderFriendly?: boolean
}

export type PlanExercise = {
  exerciseId: string
  sets: number
  minReps: number
  maxReps: number
}

export type WorkoutDay = {
  id: string
  name: string
  exercises: PlanExercise[]
  cardio: string
}

export type LoggedSet = { reps: number; weight: number; done: boolean }
export type ExerciseLog = { exerciseId: string; sets: LoggedSet[]; completed: boolean; pb?: boolean; note?: string }
export type WorkoutLog = { date: string; workoutId: string; exercises: ExerciseLog[]; completed: boolean; score: number }
export type BodyLog = { date: string; weight: number; waist?: number; chest?: number; arms?: number; thighs?: number }

export type Profile = {
  weight: number
  height: number
  units: UnitSystem
  restSeconds?: number
  weekdays?: number[]
}
