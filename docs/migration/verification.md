# Migration verification — 2026-10-15

Status: **passed — 0 QA errors, 0 failed HTTP resources / 404s.**

The complete reusable suite ran with `node qa/run.mjs` (the same command as `npm run qa`) against localhost:4175 in installed Microsoft Edge/Chromium. The last complete run finished at 2026-10-15 19:38:39 UTC. Browser profiles were isolated from the user's profile.

| Check | Result |
| --- | --- |
| Stories / chapter files | 3 / 12, including all 10 Odyssey chapters |
| Layout combinations | 60: 360, 390 and 430 px phone widths, 1366x640 desktop, explicit portrait |
| Narrative / model | 518 passages, 804 actions, manual and automatic completion; 1,036 saved-state reconstructions |
| Text / framing | 2,590 passage-layout checks |
| Intermediate movement | 18,984 samples, including 6,324 held-camera samples; pause and waiting positions checked |
| Resources / imports | 142 successful resource URLs, 50 resolved module imports, 83 preserved images |
| Reader / library | Search, saved stories, preferences, old slug, resume, back, history, restart, rotation and completion controls passed |
| Export | 57 real preview openings and clean cancellations; 636 opening-state interpolation samples |
| Completed recordings | 3 MP4 files, 720x1280, audio enabled; 3 decoded frames per file; no reading-state or storage changes |
| Visual preservation | All 518 passages compared with the original in 3 layouts: 1,554 identical canvas pixel hashes and camera frames |
| Original backup | All 5,465 file hashes and the complete file inventory unchanged |
| Migrated story data | All 12 chapter files equal after reversing only asset URLs and the deduplicated chapter list |
| Rules / references | All 34 authored source documents preserved; all 11 Arte files and the source DOCX identical |
| Syntax / reserved folder | 45 JavaScript modules passed syntax checks; agents/ is empty |

The recordings use an 8x test clock. Their decoded frame strips were visually inspected for all three stories; they verify encoding and presentation, not normal-speed pacing. Browser dimensions simulate devices; this does not claim physical-phone or Safari testing. No Site was published.

Generated evidence is kept out of source areas:

- [Full QA report](../../.artifacts/qa/report.json) — reached from the project root as `.artifacts/qa/report.json`.
- `.artifacts/migration-verification.json` — original file integrity and content preservation.
- `.artifacts/visual-parity.json` — source/target canvas comparison.
- `.artifacts/video-review.json` — decoded recording dimensions, duration and frame diversity.
- `.artifacts/qa/` — current screenshots, MP4 samples and decoded frame strips.

No old QA JSON or chapter patch scripts were copied. One-time migration, comparison and inspection helpers were removed after verification. Reusable checks remain exclusively in `qa/`. Both temporary localhost servers were stopped after verification; use `START.cmd` or `node server/server.mjs` to start the new project.
