import { LoaderCircle } from 'lucide-react'
import { Onboarding } from './components/Onboarding'
import { useAppStore } from './store'

export default function App() {
  const { hydrated, profile, saveProfile } = useAppStore()
  if (!hydrated) return <main className="grid min-h-dvh place-items-center text-muted"><LoaderCircle className="animate-spin" /><span className="sr-only">Loading your plan</span></main>
  if (!profile) return <Onboarding onSave={saveProfile} />
  return <main className="grid min-h-dvh place-items-center p-6 text-center"><div><p className="text-accent">SteadyLift is ready.</p><h1 className="mt-2 text-3xl font-bold">Your gentle 4-day plan is next.</h1></div></main>
}
