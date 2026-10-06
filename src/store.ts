import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import { del, get, set as idbSet } from 'idb-keyval'
import type { BodyLog, ExerciseLog, Profile, WorkoutDay, WorkoutLog } from './types'

// localStorage is written synchronously so closing the PWA immediately after a
// set cannot lose the latest edit. IndexedDB remains a second, independent copy
// and is also used to migrate data saved by earlier versions of the app.
const durableBrowserStorage: StateStorage = {
  getItem: async (name) => {
    try {
      const localValue = localStorage.getItem(name)
      if (localValue !== null) return localValue
    } catch { /* IndexedDB can still recover the data. */ }
    try {
      const indexedValue = await get<string>(name)
      if (indexedValue !== undefined) {
        try { localStorage.setItem(name, indexedValue) } catch { /* Keep the IndexedDB copy. */ }
        return indexedValue
      }
    } catch { /* Start with defaults if both browser stores are unavailable. */ }
    return null
  },
  setItem: (name, value) => {
    let localSaved = false
    try { localStorage.setItem(name, value); localSaved = true } catch { /* Mirror below may still work. */ }
    const mirror = idbSet(name, value).catch(() => undefined)
    return localSaved ? undefined : mirror
  },
  removeItem: (name) => {
    try { localStorage.removeItem(name) } catch { /* Also clear the mirror. */ }
    return del(name).catch(() => undefined)
  },
}

const savedNow = () => new Date().toISOString()
const routinesFromDates = (workouts: Record<string, WorkoutDay> = {}) =>
  Object.values(workouts).reduce<Record<string, WorkoutDay>>((all, workout) => {
    if (workout?.id && !all[workout.id]) all[workout.id] = workout
    return all
  }, {})

type AppState = {
  hydrated: boolean
  profile?: Profile
  logs: WorkoutLog[]
  bodyLogs: BodyLog[]
  lastExport?: string
  exerciseSwaps: Record<string, string>
  workoutChoices: Record<string, string>
  customWorkouts: Record<string, WorkoutDay>
  savedRoutines: Record<string, WorkoutDay>
  lastSavedAt?: string
  storageWarning?: string
  setHydrated: (value: boolean) => void
  saveProfile: (profile: Profile) => void
  saveExerciseLog: (date: string, workoutId: string, exercise: ExerciseLog) => void
  completeWorkout: (date: string, workoutId: string, score: number) => void
  addBodyLog: (log: BodyLog) => void
  setLastExport: (date: string) => void
  swapExercise: (key: string, exerciseId: string) => void
  chooseWorkout: (date: string, workoutId: string) => void
  saveCustomWorkout: (date: string, workout: WorkoutDay) => void
  importData: (data: Partial<Pick<AppState, 'profile' | 'logs' | 'bodyLogs' | 'exerciseSwaps' | 'workoutChoices' | 'customWorkouts' | 'savedRoutines' | 'lastExport' | 'lastSavedAt'>>) => void
  resetAll: () => void
}

export const useAppStore = create<AppState>()(persist((setState) => ({
  hydrated: false,
  logs: [],
  bodyLogs: [],
  exerciseSwaps: {},
  workoutChoices: {},
  customWorkouts: {},
  savedRoutines: {},
  setHydrated: (hydrated) => setState({ hydrated }),
  saveProfile: (profile) => setState({ profile, lastSavedAt: savedNow() }),
  saveExerciseLog: (date, workoutId, exercise) => setState((state) => {
    const found = state.logs.find((log) => log.date === date && log.workoutId === workoutId)
    const workoutChoices = { ...state.workoutChoices, [date]: workoutId }
    if (!found) return { logs: [...state.logs, { date, workoutId, exercises: [exercise], completed: false, score: 0 }], workoutChoices, lastSavedAt: savedNow() }
    return { logs: state.logs.map((log) => log === found ? { ...log, exercises: [...log.exercises.filter((item) => item.exerciseId !== exercise.exerciseId), exercise], completed: false, score: 0 } : log), workoutChoices, lastSavedAt: savedNow() }
  }),
  completeWorkout: (date, workoutId, score) => setState((state) => ({ logs: state.logs.map((log) => log.date === date && log.workoutId === workoutId ? { ...log, completed: true, score } : log), lastSavedAt: savedNow() })),
  addBodyLog: (entry) => setState((state) => ({ bodyLogs: [...state.bodyLogs.filter((item) => item.date !== entry.date), entry].sort((a, b) => a.date.localeCompare(b.date)), lastSavedAt: savedNow() })),
  setLastExport: (lastExport) => setState({ lastExport, lastSavedAt: savedNow() }),
  swapExercise: (key, exerciseId) => setState((state) => ({ exerciseSwaps: { ...state.exerciseSwaps, [key]: exerciseId }, lastSavedAt: savedNow() })),
  chooseWorkout: (date, workoutId) => setState((state) => ({
    workoutChoices: { ...state.workoutChoices, [date]: workoutId },
    customWorkouts: state.savedRoutines[workoutId] ? { ...state.customWorkouts, [date]: state.customWorkouts[date]?.id === workoutId ? state.customWorkouts[date] : { ...state.savedRoutines[workoutId], exercises: state.savedRoutines[workoutId].exercises.map((item) => ({ ...item })) } } : state.customWorkouts,
    lastSavedAt: savedNow(),
  })),
  saveCustomWorkout: (date, workout) => setState((state) => ({
    savedRoutines: { ...state.savedRoutines, [workout.id]: workout },
    customWorkouts: { ...state.customWorkouts, [date]: { ...workout, exercises: workout.exercises.map((item) => ({ ...item })) } },
    workoutChoices: { ...state.workoutChoices, [date]: workout.id },
    lastSavedAt: savedNow(),
  })),
  importData: (data) => setState((state) => ({
    profile: data.profile ?? state.profile,
    logs: Array.isArray(data.logs) ? data.logs : state.logs,
    bodyLogs: Array.isArray(data.bodyLogs) ? data.bodyLogs : state.bodyLogs,
    exerciseSwaps: data.exerciseSwaps && typeof data.exerciseSwaps === 'object' ? data.exerciseSwaps : state.exerciseSwaps,
    workoutChoices: data.workoutChoices && typeof data.workoutChoices === 'object' ? data.workoutChoices : state.workoutChoices,
    customWorkouts: data.customWorkouts && typeof data.customWorkouts === 'object' ? data.customWorkouts : state.customWorkouts,
    savedRoutines: { ...routinesFromDates(data.customWorkouts ?? state.customWorkouts), ...(data.savedRoutines && typeof data.savedRoutines === 'object' ? data.savedRoutines : {}) },
    lastExport: data.lastExport ?? state.lastExport,
    lastSavedAt: savedNow(),
  })),
  resetAll: () => setState({ profile: undefined, logs: [], bodyLogs: [], exerciseSwaps: {}, workoutChoices: {}, customWorkouts: {}, savedRoutines: {}, lastExport: undefined, lastSavedAt: savedNow() }),
}), {
  name: 'steadylift-data',
  storage: createJSONStorage(() => durableBrowserStorage),
  partialize: ({ profile, logs, bodyLogs, exerciseSwaps, workoutChoices, customWorkouts, savedRoutines, lastExport, lastSavedAt }) => ({ profile, logs, bodyLogs, exerciseSwaps, workoutChoices, customWorkouts, savedRoutines, lastExport, lastSavedAt }),
  onRehydrateStorage: () => (state, error) => {
    if (state) {
      state.setHydrated(true)
      const legacy = routinesFromDates(state.customWorkouts)
      if (Object.keys(legacy).some((id) => !state.savedRoutines?.[id])) queueMicrotask(() => useAppStore.setState((current) => ({ savedRoutines: { ...legacy, ...current.savedRoutines } })))
      if (error) queueMicrotask(() => useAppStore.setState({ storageWarning: 'Browser storage could not be opened. Export your data before closing the app.' }))
    }
    else queueMicrotask(() => useAppStore.setState({ hydrated: true, storageWarning: error ? 'Browser storage could not be opened. Export your data before closing the app.' : undefined }))
  },
}))
