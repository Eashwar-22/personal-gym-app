# Personal Offline Workout Tracker

Build the workout you want, log it as you go, and keep your training history on your own device. Personal Offline Workout Tracker is a private, installable gym log that works without an account, backend, ads, or analytics.

Choose any workout category on any day, start from a template or make as many custom routines as you need, then record weights, reps, sets, notes, and body measurements at your own pace. Your data stays in your browser until you choose to export a backup.

## What it includes

- Train on your schedule — nothing assigns a workout category to a specific day
- Start with a simple beginner template, or save multiple custom routines with your own exercises, order, sets, and rep targets
- Log each set with typed weights and reps; drafts are saved while you train
- Browse and search 77 exercises, with form notes, locally bundled movement visuals for most exercises, and demonstration links
- Use shoulder-friendly exercise options when they suit your recovery plan
- Review personal bests, recent sessions, consistency, weight trends, and body measurements
- Get optional progressive-overload prompts based on your previous sessions
- Export and restore a JSON backup whenever you want
- Install it as an offline-capable PWA on a phone or computer

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
