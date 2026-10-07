import assert from 'node:assert/strict'
import { readFile, access } from 'node:fs/promises'

const exercises = JSON.parse(await readFile('src/data/exercises.json', 'utf8'))
const plan = JSON.parse(await readFile('src/data/plan.json', 'utf8'))
const ids = new Set()

for (const exercise of exercises) {
  assert.ok(exercise.id && !ids.has(exercise.id), `Duplicate or missing exercise ID: ${exercise.id}`)
  ids.add(exercise.id)
  assert.ok(exercise.name && exercise.group && exercise.equipment, `Incomplete exercise: ${exercise.id}`)
  assert.ok(exercise.sourceUrl?.startsWith('https://'), `Missing source link: ${exercise.id}`)
  assert.ok(Array.isArray(exercise.notes) && exercise.notes.length > 0, `Missing form notes: ${exercise.id}`)
  assert.ok(exercise.images?.length || !exercise.image, `Image list missing: ${exercise.id}`)
  for (const image of exercise.images ?? []) {
    await access(`public/${image}`)
    const bytes = await readFile(`public/${image}`)
    assert.ok(bytes[0] === 0xff && bytes[1] === 0xd8, `Invalid JPEG: ${image}`)
  }
}

for (const workout of plan) {
  assert.ok(workout.id && workout.name && Array.isArray(workout.exercises), 'Invalid workout template')
  for (const item of workout.exercises) {
    assert.ok(ids.has(item.exerciseId), `Missing planned exercise: ${item.exerciseId}`)
    assert.ok(Number.isInteger(item.sets) && item.sets > 0 && Number.isInteger(item.minReps) && item.minReps > 0 && Number.isInteger(item.maxReps) && item.maxReps >= item.minReps, `Invalid prescription: ${item.exerciseId}`)
  }
}

console.log(`Verified ${exercises.length} exercises, ${plan.length} templates, and all bundled image files.`)
