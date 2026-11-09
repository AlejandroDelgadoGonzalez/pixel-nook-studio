# Pixel Nook Studio

Cloud setup, GitHub Pages and Vercel: [deployment guide](docs/cloud-deployment.md).

A local, phone-first pixel-art reader with The First Path, The Second Cup and all ten chapters of The Odyssey. This project is independent of the read-only entre-lineas-platform backup.

## Run

Use Node.js 20 or later: node server/server.mjs, npm start, or START.cmd on Windows. Open http://localhost:4175. No build or runtime dependency installation is required. Set PORT=4174 only after stopping the previous server if you want the same browser origin and existing local progress. Test contexts do not touch your real browser profile.

## Verify

Keep the local server running, install QA dependencies with npm ci, then run npm run qa in another terminal. The suite discovers all chapters from stories/catalog.json. Optional --story=<slug> filters a story. Results and screenshots go to .artifacts/qa, never the root. The migration verification also compares source hashes and preserved chapter content; see [the migration map](docs/migration/source-to-target.md).

## Work areas

- platform/: reusable reader, library, rendering, audio and video.
- stories/: independent story manifests, chapters, renderers and selected assets.
- docs/: current rules, authoring contract, provenance and migration mapping.
- qa/: reusable checks, not historical QA reports or patch scripts.
- concept_art/: original visual references.
- agents/: intentionally empty, reserved for the next setup.

Read docs/README.md and AGENTS.md before adding stories. New stories must define measured stage geometry in shared/. Existing IDs/storage keys are intentionally retained for compatibility. Everything stays local; no Site was published.

The migration passed all 60 chapter/layout combinations with zero errors and missing resources. See the [verified scope and evidence](docs/migration/verification.md).
