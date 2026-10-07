# Personal Offline Workout Tracker

An offline gym tracker for planning workouts, recording sets, and seeing your progress. No account required; your data stays on your device.

## What it includes

- Work out any category on any day
- Use a template or create as many custom routines as you want
- Log sets, reps, weights, and notes as you train
- Browse 77 exercises with form tips and movement visuals
- Track personal bests, workout history, weight, and measurements
- Back up or restore your data with a JSON file
- Install it on your phone and use it offline

> Health note: this is a tracking tool, not medical advice. Use only pain-free ranges approved by your clinician or physiotherapist. Stop if you feel sharp pain, instability, or symptoms that worsen.

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. To check types and verify the production build:

```bash
npm run typecheck
npm run audit:data
npm run build
npm run preview
```

## Deploy to GitHub Pages

1. Push this repository to GitHub.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Push to `main`, or run the **Deploy to GitHub Pages** workflow manually.
4. Open the Pages URL once while online, then choose **Add to Home Screen** on the phone.

Vite uses relative production asset paths, so the build works at both a user/organization Pages root and a repository subpath.

## Data and privacy

Workout and body data are stored locally in two browser copies: a synchronous localStorage copy and an IndexedDB mirror. Earlier IndexedDB-only data is migrated automatically. Set edits are saved as they happen, so closing the PWA does not require a separate save step. The app has no account or server sync; data belongs to the browser and device where it was entered. On iPhone, the installed Home Screen app may not share Safari's storage. Use **Progress → Export** regularly and verify the JSON file appears in Files or Downloads, especially before clearing browser/site data or removing the app. Old `steadylift-backup-*.json` files can still be imported; the internal `steadylift-data` storage key is intentionally unchanged so existing local data remains available after the rename.

To update the installed app, open it once while online, then close and reopen it. The service worker caches the new build for offline use.
On iPhone, app code updates this way, but an existing Home Screen icon may keep its old label until the app is reinstalled. Export a backup from the installed app before removing it; reinstalling can remove its local data.

## Exercise data attribution

Exercise metadata and images are a bundled subset of [yuhonas/free-exercise-db](https://github.com/yuhonas/free-exercise-db), which is released to the public domain. The upstream license is included at [`public/FREE_EXERCISE_DB_LICENSE.md`](public/FREE_EXERCISE_DB_LICENSE.md).
