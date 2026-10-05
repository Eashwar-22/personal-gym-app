import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const sourcePath = '/tmp/steadylift-exercises.json'
const ids = [
  'Machine_Bench_Press','Dumbbell_Bench_Press_with_Neutral_Grip','Cable_Chest_Press','Butterfly','Incline_Push-Up','Leverage_Chest_Press',
  'Seated_Cable_Rows','One-Arm_Dumbbell_Row','Wide-Grip_Lat_Pulldown','Close-Grip_Front_Lat_Pulldown','Straight-Arm_Pulldown','Leverage_Iso_Row',
  'Cable_External_Rotation','External_Rotation','Cable_Rear_Delt_Fly','Reverse_Machine_Flyes','Dumbbell_Scaption','Seated_Side_Lateral_Raise',
  'Machine_Bicep_Curl','Dumbbell_Alternate_Bicep_Curl','Cable_Hammer_Curls_-_Rope_Attachment','Incline_Hammer_Curls','Concentration_Curls','Reverse_Cable_Curl',
  'Triceps_Pushdown_-_Rope_Attachment','Cable_One_Arm_Tricep_Extension','Machine_Triceps_Extension','Tricep_Dumbbell_Kickback','Reverse_Grip_Triceps_Pushdown','Close-Grip_Dumbbell_Press',
  'Leg_Press','Leg_Extensions','Chair_Squat','Dumbbell_Squat','Split_Squat_with_Dumbbells','Step-up_with_Knee_Raise',
  'Seated_Leg_Curl','Lying_Leg_Curls','Standing_Leg_Curl','Stiff-Legged_Dumbbell_Deadlift','Pull_Through','Butt_Lift_Bridge',
  'Seated_Calf_Raise','Standing_Calf_Raises','Calf_Press_On_The_Leg_Press_Machine','Dumbbell_Seated_One-Leg_Calf_Raise',
  'Dead_Bug','Pallof_Press','Plank','Cable_Crunch','Reverse_Crunch','Side_Bridge','Bird_Dog','Glute_Kickback',
  'Walking_Treadmill','Recumbent_Bike','Jogging_Treadmill','Air_Bike','Bodyweight_Squat','Incline_Push-Up_Medium',
  'Cable_Internal_Rotation','One_Arm_Lat_Pulldown','Seated_Dumbbell_Curl','Triceps_Pushdown'
]

const all = JSON.parse(await readFile(sourcePath, 'utf8'))
const fallback = all.find((item) => item.id === 'Dead_Bug')
const selected = ids.map((id) => all.find((item) => item.id === id)).filter(Boolean).slice(0, 68)
const missing = ids.filter((id) => !all.some((item) => item.id === id))
if (missing.length) console.warn('Missing:', missing.join(', '))

await mkdir('public/exercises', { recursive: true })
const result = []
for (const item of selected) {
  const sourceImage = item.images?.[0] ?? fallback.images[0]
  const filename = `${item.id}.jpg`
  const target = path.join('public/exercises', filename)
  if (!existsSync(target)) {
    const url = `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${sourceImage}`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`${response.status} ${url}`)
    await writeFile(target, Buffer.from(await response.arrayBuffer()))
  }
  result.push({
    id: item.id,
    name: item.name,
    group: item.primaryMuscles[0],
    equipment: item.equipment || 'body only',
    level: 'beginner',
    image: `exercises/${filename}`,
    notes: item.instructions.slice(0, 2),
    shoulderFriendly: ['Cable_External_Rotation','External_Rotation','Cable_Rear_Delt_Fly','Reverse_Machine_Flyes','Dumbbell_Scaption'].includes(item.id)
  })
}

await mkdir('src/data', { recursive: true })
await writeFile('src/data/exercises.json', JSON.stringify(result, null, 2) + '\n')
await copyFile('/tmp/steadylift-license.md', 'public/FREE_EXERCISE_DB_LICENSE.md')
console.log(`Imported ${result.length} exercises and images.`)
