# SteadyLift

SteadyLift is a private, offline-first personal gym tracker for a beginner returning carefully to shoulder training. It has no backend, account, analytics, ads, or remote runtime dependencies.

## What it includes

- One-time onboarding for units and body stats, with no assigned training weekdays
- Four beginner-friendly workout templates plus a per-date custom routine builder for choosing exercises, order, sets, and rep ranges
- Shoulder-friendly external rotation, rear-delt, neutral-grip, machine, and cable choices
- Auto-saved workout drafts, typed weights and reps, adjustable set counts, exercise notes, a configurable rest timer, same-muscle swaps, scoring, PBs, and streaks
- A searchable 62-exercise offline library with locally bundled looping start/finish demonstrations, pause controls, and source links
- Weight weekly averages plus waist, chest, arms, and thigh charts
- Progressive-overload suggestions based on the previous session and estimated 1RM history
- JSON backup/restore with a 30-day export reminder
- Installable PWA and offline service worker

> Health note: this is a tracking tool, not medical advice. Use only pain-free ranges approved by your clinician or physiotherapist. Stop if you feel sharp pain, instability, or symptoms that worsen.

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. To verify the production build:

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

1. Push this repository to GitHub.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Push to `main` or `master`, or run the **Deploy to GitHub Pages** workflow manually.
4. Open the Pages URL once while online, then choose **Add to Home Screen** on the phone.

Vite uses relative production asset paths, so the build works at both a user/organization Pages root and a repository subpath.

## Data and privacy

Workout and body data are stored locally in two browser copies: a synchronous localStorage copy and an IndexedDB mirror. Earlier IndexedDB-only data is migrated automatically. Set edits are saved as they happen, so closing the PWA does not require a separate save step. The app has no account or server sync; data belongs to the browser and device where it was entered. Use **Progress → Export** regularly because clearing browser/site data removes local records.

## Exercise data attribution

Exercise metadata and images are a bundled subset of [yuhonas/free-exercise-db](https://github.com/yuhonas/free-exercise-db), which is released to the public domain. The upstream license is included at [`public/FREE_EXERCISE_DB_LICENSE.md`](public/FREE_EXERCISE_DB_LICENSE.md).
