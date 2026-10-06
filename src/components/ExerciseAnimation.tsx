import { ExternalLink, Pause, Play } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Exercise } from '../types'

export function ExerciseAnimation({ exercise, compact = false }: { exercise: Exercise; compact?: boolean }) {
  const frames = exercise.images?.length ? exercise.images : exercise.image ? [exercise.image] : []
  const [frame, setFrame] = useState(0)
  const [paused, setPaused] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    setFrame(0)
    if (paused || frames.length < 2) return
    const timer = window.setInterval(() => setFrame((current) => (current + 1) % frames.length), 900)
    return () => window.clearInterval(timer)
  }, [exercise.id, frames.length, paused])

  if (!frames.length) return <div className="grid aspect-video place-items-center rounded-card border border-line bg-panel p-5 text-center text-sm text-muted"><div><p>Offline demonstration unavailable for this move.</p>{exercise.sourceUrl && <a href={exercise.sourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-accent px-4 font-semibold text-accent">View demonstration <ExternalLink size={15} /></a>}</div></div>

  return <figure className="overflow-hidden rounded-card border border-line bg-white">
    <div className={`relative w-full ${compact ? 'aspect-[4/3]' : 'aspect-video'}`}>
      {frames.map((image, index) => <img key={image} src={`${import.meta.env.BASE_URL}${image}`} alt={index === 0 ? `${exercise.name} start position` : `${exercise.name} finish position`} className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-200 ${index === frame ? 'opacity-100' : 'opacity-0'}`} />)}
      {frames.length > 1 && <span className="absolute left-3 top-3 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-white">{frame === 0 ? 'Start' : 'Finish'}</span>}
    </div>
    {!compact && <figcaption className="flex min-h-12 items-center justify-between gap-3 border-t border-line bg-panel px-3 text-ink">
      <div className="flex gap-1.5" aria-hidden="true">{frames.map((_, index) => <span key={index} className={`h-1.5 w-5 rounded-full ${index === frame ? 'bg-accent' : 'bg-[#505058]'}`} />)}</div>
      <div className="flex items-center gap-1">
        {frames.length > 1 && <button type="button" onClick={() => setPaused((value) => !value)} className="flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-white">{paused ? <Play size={17} /> : <Pause size={17} />}{paused ? 'Play' : 'Pause'}</button>}
        {exercise.sourceUrl && <a href={exercise.sourceUrl} target="_blank" rel="noreferrer" className="flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-accent">Source <ExternalLink size={15} /></a>}
      </div>
    </figcaption>}
  </figure>
}
