import type { Exercise, WorkoutDay } from '../types'
import rawExercises from './exercises.json'

export const exercises = rawExercises as Exercise[]
export const exerciseMap = new Map(exercises.map((exercise) => [exercise.id, exercise]))

export const plan: WorkoutDay[] = [
  {
    id: 'upper-a', name: 'Upper A', weekday: 1, cardio: '10 min easy incline walk',
    exercises: [
      { exerciseId: 'Machine_Bench_Press', sets: 3, minReps: 8, maxReps: 10 },
      { exerciseId: 'Seated_Cable_Rows', sets: 3, minReps: 8, maxReps: 10 },
      { exerciseId: 'Wide-Grip_Lat_Pulldown', sets: 3, minReps: 8, maxReps: 10 },
      { exerciseId: 'External_Rotation', sets: 2, minReps: 12, maxReps: 15 },
      { exerciseId: 'Machine_Bicep_Curl', sets: 2, minReps: 10, maxReps: 12 },
      { exerciseId: 'Triceps_Pushdown_-_Rope_Attachment', sets: 2, minReps: 10, maxReps: 12 },
    ]
  },
  {
    id: 'lower-a', name: 'Lower A', weekday: 2, cardio: '10 min relaxed bike',
    exercises: [
      { exerciseId: 'Leg_Press', sets: 3, minReps: 8, maxReps: 10 },
      { exerciseId: 'Seated_Leg_Curl', sets: 3, minReps: 8, maxReps: 10 },
      { exerciseId: 'Leg_Extensions', sets: 3, minReps: 10, maxReps: 12 },
      { exerciseId: 'Butt_Lift_Bridge', sets: 3, minReps: 10, maxReps: 12 },
      { exerciseId: 'Standing_Calf_Raises', sets: 3, minReps: 10, maxReps: 12 },
      { exerciseId: 'Dead_Bug', sets: 2, minReps: 8, maxReps: 10 },
    ]
  },
  {
    id: 'upper-b', name: 'Upper B', weekday: 4, cardio: '10 min easy elliptical',
    exercises: [
      { exerciseId: 'Dumbbell_Bench_Press_with_Neutral_Grip', sets: 3, minReps: 8, maxReps: 10 },
      { exerciseId: 'Leverage_Iso_Row', sets: 3, minReps: 8, maxReps: 10 },
      { exerciseId: 'One_Arm_Lat_Pulldown', sets: 3, minReps: 8, maxReps: 10 },
      { exerciseId: 'Cable_Rear_Delt_Fly', sets: 2, minReps: 12, maxReps: 15 },
      { exerciseId: 'Incline_Hammer_Curls', sets: 2, minReps: 10, maxReps: 12 },
      { exerciseId: 'Cable_One_Arm_Tricep_Extension', sets: 2, minReps: 10, maxReps: 12 },
    ]
  },
  {
    id: 'lower-b', name: 'Lower B', weekday: 5, cardio: '10 min comfortable treadmill walk',
    exercises: [
      { exerciseId: 'Dumbbell_Squat', sets: 3, minReps: 8, maxReps: 10 },
      { exerciseId: 'Stiff-Legged_Dumbbell_Deadlift', sets: 3, minReps: 8, maxReps: 10 },
      { exerciseId: 'Split_Squat_with_Dumbbells', sets: 3, minReps: 8, maxReps: 10 },
      { exerciseId: 'Lying_Leg_Curls', sets: 3, minReps: 10, maxReps: 12 },
      { exerciseId: 'Seated_Calf_Raise', sets: 3, minReps: 10, maxReps: 12 },
      { exerciseId: 'Pallof_Press', sets: 2, minReps: 10, maxReps: 12 },
    ]
  }
]
