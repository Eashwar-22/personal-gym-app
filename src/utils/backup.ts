import type { BodyLog, ExerciseLog, Profile, WorkoutDay, WorkoutLog } from '../types'

const record = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value)
const finiteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
const validDate = (value: unknown) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)

const validExerciseLog = (value: unknown): value is ExerciseLog => record(value) && typeof value.exerciseId === 'string' && typeof value.completed === 'boolean' && Array.isArray(value.sets) && value.sets.every((set: unknown) => record(set) && finiteNumber(set.reps) && set.reps >= 0 && finiteNumber(set.weight) && set.weight >= 0 && typeof set.done === 'boolean')
const validWorkoutLog = (value: unknown): value is WorkoutLog => record(value) && validDate(value.date) && typeof value.workoutId === 'string' && typeof value.completed === 'boolean' && finiteNumber(value.score) && Array.isArray(value.exercises) && value.exercises.every(validExerciseLog)
// Older app versions could export a measurement row with no weight. Accept it
// so an otherwise healthy backup can still be restored; charts skip that row.
const validBodyLog = (value: unknown): value is BodyLog => record(value) && validDate(value.date) && (value.weight === undefined || (finiteNumber(value.weight) && value.weight >= 0)) && ['waist', 'chest', 'arms', 'thighs'].every((key) => value[key] === undefined || (finiteNumber(value[key]) && value[key] >= 0))
const validProfile = (value: unknown): value is Profile => record(value) && finiteNumber(value.weight) && value.weight > 0 && finiteNumber(value.height) && value.height > 0 && (value.units === 'metric' || value.units === 'imperial')
const validWorkout = (value: unknown): value is WorkoutDay => record(value) && typeof value.id === 'string' && typeof value.name === 'string' && typeof value.cardio === 'string' && Array.isArray(value.exercises) && value.exercises.every((item: unknown) => record(item) && typeof item.exerciseId === 'string' && finiteNumber(item.sets) && item.sets > 0 && finiteNumber(item.minReps) && item.minReps > 0 && finiteNumber(item.maxReps) && item.maxReps >= item.minReps)
const validMap = (value: unknown, validator: (entry: unknown) => boolean) => value === undefined || (record(value) && Object.values(value).every(validator))

export const validBackup = (value: unknown) => record(value)
  && Array.isArray(value.logs) && value.logs.every(validWorkoutLog)
  && Array.isArray(value.bodyLogs) && value.bodyLogs.every(validBodyLog)
  && (value.profile === undefined || validProfile(value.profile))
  && validMap(value.customWorkouts, validWorkout)
  && validMap(value.savedRoutines, validWorkout)
  && validMap(value.workoutChoices, (entry) => typeof entry === 'string')
  && validMap(value.exerciseSwaps, (entry) => typeof entry === 'string')
