import type { Exercise, WorkoutDay } from '../types'
import rawExercises from './exercises.json'
import rawPlan from './plan.json'

export const exercises = rawExercises as Exercise[]
export const exerciseMap = new Map(exercises.map((exercise) => [exercise.id, exercise]))

export const plan = rawPlan as WorkoutDay[]
