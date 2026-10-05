import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import { del, get, set } from 'idb-keyval'
import type { BodyLog, ExerciseLog, Profile, WorkoutLog } from './types'

const idbStorage: StateStorage = {
  getItem: async (name) => { try { return (await get(name)) ?? null } catch { return localStorage.getItem(name) } },
  setItem: async (name, value) => { try { await set(name, value) } catch { localStorage.setItem(name, value) } },
  removeItem: async (name) => { try { await del(name) } catch { localStorage.removeItem(name) } },
}

type AppState = {
  hydrated: boolean
  profile?: Profile
  logs: WorkoutLog[]
  bodyLogs: BodyLog[]
  lastExport?: string
  exerciseSwaps: Record<string, string>
  setHydrated: (value: boolean) => void
  saveProfile: (profile: Profile) => void
  saveExerciseLog: (date: string, workoutId: string, exercise: ExerciseLog) => void
  completeWorkout: (date: string, workoutId: string, score: number) => void
  addBodyLog: (log: BodyLog) => void
  setLastExport: (date: string) => void
  swapExercise: (key: string, exerciseId: string) => void
  importData: (data: Partial<Pick<AppState, 'profile' | 'logs' | 'bodyLogs' | 'lastExport'>>) => void
  resetAll: () => void
}

export const useAppStore = create<AppState>()(persist((setState) => ({
  hydrated: false,
  logs: [],
  bodyLogs: [],
  exerciseSwaps: {},
  setHydrated: (hydrated) => setState({ hydrated }),
  saveProfile: (profile) => setState({ profile }),
  saveExerciseLog: (date, workoutId, exercise) => setState((state) => {
    const found = state.logs.find((log) => log.date === date && log.workoutId === workoutId)
    if (!found) return { logs: [...state.logs, { date, workoutId, exercises: [exercise], completed: false, score: 0 }] }
    return { logs: state.logs.map((log) => log === found ? { ...log, exercises: [...log.exercises.filter((item) => item.exerciseId !== exercise.exerciseId), exercise] } : log) }
  }),
  completeWorkout: (date, workoutId, score) => setState((state) => ({ logs: state.logs.map((log) => log.date === date && log.workoutId === workoutId ? { ...log, completed: true, score } : log) })),
  addBodyLog: (entry) => setState((state) => ({ bodyLogs: [...state.bodyLogs.filter((item) => item.date !== entry.date), entry].sort((a, b) => a.date.localeCompare(b.date)) })),
  setLastExport: (lastExport) => setState({ lastExport }),
  swapExercise: (key, exerciseId) => setState((state) => ({ exerciseSwaps: { ...state.exerciseSwaps, [key]: exerciseId } })),
  importData: (data) => setState((state) => ({ ...state, ...data })),
  resetAll: () => setState({ profile: undefined, logs: [], bodyLogs: [], exerciseSwaps: {}, lastExport: undefined }),
}), {
  name: 'steadylift-data',
  storage: createJSONStorage(() => idbStorage),
  partialize: ({ profile, logs, bodyLogs, exerciseSwaps, lastExport }) => ({ profile, logs, bodyLogs, exerciseSwaps, lastExport }),
  onRehydrateStorage: () => (state) => state?.setHydrated(true),
}))
