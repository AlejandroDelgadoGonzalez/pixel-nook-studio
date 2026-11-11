# Reusable QA

## Permanent visual canon gate

Gate 4 automatically audits `concept_art/` (eight character sheets, sixteen scene references and sixty native 3×4 sprites) and the PNG inventory of every story before per-story checks. New character art requires measured native eye/skin/neck/outline/hair contracts; unconverted historical art is preserved by exact hashes, not certified as pixel-pure. Never add new artwork to `legacy-visual-locks.json`. Character resampling to 68 rows is disabled. See [PIXEL-DENSITY.md](PIXEL-DENSITY.md), `qa/character_cores.py` and `qa/tests/test_visual_lock.py`; the latter deliberately injects facial noise, partial alpha, broken eyes, a dark neck, missing highlights and changed/unregistered images. Visual design approval and 400% review remain separate from technical PASS.

## Alice Scene 1: real MP3 files

Use QA_OUTPUT_DIR=.artifacts/qa/alice-scene-1-files. No QA script calls ElevenLabs or generates audio.

- node qa/alice-file-audio.mjs checks the four-file budget/provenance, original visual hashes, removed style selector, no external provider traffic and silence in S2–S6 across 320/360/390/430px and desktop. It explicitly reports prepared-but-blocked-by-provider while real MP3s are absent; wiring checks do not certify audible playback.
- node qa/alice-file-audio-export.mjs is guarded until the four real files exist and fileAudio.available is true. It records only S1, with and without MP3 audio, at normal speed; verifies full decode/playback, pristine export opening, cancellation, closed audio contexts and unchanged reader/storage. Set QA_FFMPEG to a local decoder. It never creates substitute media or spends generation credits.
- node --test qa/tests/*.test.mjs covers file-only transport logic (metadata stubs, not substitute audio), scope, watch timing and pause/resume. node qa/run.mjs is the shared regression for all stories.

Golden-master density is enforced for new measured stories by `checks/pixel-density.mjs`, called from `run.mjs`. Read [PIXEL-DENSITY.md](PIXEL-DENSITY.md) for calibration, the read-only audit, explicit background-only nearest-neighbor normalization with backups (character normalization is disabled), and `shared/pixel-density.json`. Run `python -m unittest discover -s qa/tests -p test_pixel_density.py` for the raster/outline guard tests. Preserved legacy sources are not rewritten.

Start the local server with `node server/server.mjs`, install development dependencies with `npm ci`, then run `npm run qa` (or `node qa/run.mjs`). The suite discovers chapters from the catalog and manifests. `--story=the-first-path` filters chapter checks; library integration still checks the whole catalog.

`QA_BASE_URL` defaults to `http://localhost:4175`. `QA_BROWSER_CHANNEL` defaults to `msedge`; set it to `chrome` when that browser is installed. Browsers are not downloaded by the test suite. Tests use new isolated browser contexts, never the user's profile.

Checks cover schema and geometry contracts, manual/automatic completion, reconstruction at every passage, aliases, HTTP resources and imports, image hashes, library/search/saved/preferences, all text glyph positions, required-element framing, camera coverage, intermediate held motion, pause, orientation, generated textures, completion themes/spacing, UI resume/history/back/restart, and independent video export.

New measured depth contracts are opt-in through `diagnostics().depthScaling` (`curve`, `actorReferenceY`). `checks/depth-and-simultaneity.mjs` compares actual sprite and shadow scales against world depth at intervals no longer than 20 ms, including reconstruction and pause. Actions declaring `motion.continuousActors` must move all listed actors at every interval, without alternating pauses. Camera zoom cannot satisfy the actor-scale assertion. This is integrated into the desktop/390 px motion checks; interaction contacts, orientation and normal-speed MP4 still require the independent visual audit.

For a drawn airborne pose whose hands extend below its raised shoes, `depthScaling.anchorByActor` can declare the measured source shoe pin, crop and normalized origin. The depth check derives the origin from that source measurement, rejects inconsistent/out-of-crop pins, then checks the actual sprite origin and snapped model position. It retains bottom-center for every undeclared legacy pose. `node --test qa/tests/measured-origin.test.mjs` covers valid and invalid pins. Run `node qa/alice-s4.mjs` for S4's exact S3 boundary, full-body viewport checks throughout movement, actual-alpha shelf clearance, hand-owned jar placement, pause and save/export parity across eight layouts; keep `QA_OUTPUT_DIR` under `.artifacts/`. This focused audit supplements the full suite, resize sweep and a newly completed normal-speed S4 MP4.

Environment changes can expose a different measured depth curve. `lockedScaleByActor` explicitly identifies a vertical fall that preserves the last terrain scale. The check uses the active environment's contract at each sample and still inspects the actual sprite/shadow. Timed route knots are tested by `node --test qa/tests/timed-paths.test.mjs qa/tests/alice-s3.test.mjs`. For Alice S3 run `node qa/alice-s3.mjs`: it checks the pixel-identical S2/S3 boundary, complete entry/roof coverage, the Rabbit's visible bend and final full occlusion without reappearance, whole-shot dissolve/pause and reconstruction parity in five layouts. Use `QA_OUTPUT_DIR` below `.artifacts/` to retain evidence. Complete the viewport sweep and a newly encoded S3 MP4 separately.

Five layouts cover every chapter: phone widths 360, 390 and 430, desktop 1366x640, and explicit portrait reading. Movement is sampled at at most 100 ms intervals on 390 and desktop. Every scene opens a real 720x1280 export preview, then cancellation is checked for state/storage preservation and renderer cleanup. One scene per story completes a real recording with ambient audio and an 8x test clock; three positions in each encoded file are decoded in the browser. This is integration verification, not a normal-speed pacing or physical-phone/Safari claim.

Results, screenshots and encoded samples go only to `.artifacts/qa/`. A failed assertion or HTTP/browser error makes the process fail. No old patch, result JSON, source checkout or absolute developer-specific runtime path is needed by this suite.

Official QA formats only: Desktop 1280x720 / 1366x640; Mobile 360x800, 390x844, 430x932; Vertical 1080x1920. Use qa/official-layouts.mjs. No additional viewport sweeps. Check complete visible bodies against #dialogue, actual intro coverage and independent video export. Simulated browsers do not certify physical devices.

Official QA formats only: Desktop 1280x720 / 1366x640; Mobile 360x800, 390x844, 430x932; Vertical 1080x1920. Use qa/official-layouts.mjs. No additional viewport sweeps. Check complete visible bodies against #dialogue, actual intro coverage and independent video export. Simulated browsers do not certify physical devices.

S4 prop-contact regression additionally rejects lateral body detours, checks the actual rendered eye centroid across interaction frames (not only the model pivot), tests opaque carried-jar pixels against shelf wood, and bounds fixed/held ownership-transfer displacement by the2world-pixel drawing lattice. Generated clean-wall coverage is fixed to measured texture contours; random dither is not acceptable evidence of a clean local repair.

S4 prop-contact regression additionally rejects lateral body detours, checks the actual rendered eye centroid across interaction frames (not only the model pivot), tests opaque carried-jar pixels against shelf wood, and bounds fixed/held ownership-transfer displacement by the2world-pixel drawing lattice. Generated clean-wall coverage is fixed to measured texture contours; random dither is not acceptable evidence of a clean local repair.

For S4 support and zoom regressions run `node qa/alice-s4-support-zoom.mjs`, optionally `QA_BROWSER_CHANNEL=chrome`. It samples all beats and the hook at16window sizes, including short320/360/390x480 and browser-client areas1366x600/641,1536x730,1440x760 and1920x947. Require exactly one actual camera zoom per fixed layout, feasible protected framing, real jar-bottom contact with painted shelf pixels, and a grip inside actual hand alpha. `qa/alice-s4.mjs` also requires one zoom across its full40ms motion/text sampling. Keep normal-speed active-scene MP4 and full resize audit mandatory.


### Alice Chapter1 Scene5

`node qa/alice-s5.mjs` audits16fixed layouts including short Chrome client windows,8mobile/portrait/wide configurations and full viewport coverage. Samples the complete rise/walk/arrival/exit/return/closing actions; checks exact S4/S5 rendered boundary, one exact zoom per layout, independent measured depth interpolation, fixed waiting Alice, uninterrupted single-actor walks, full-height hard2x2occluder pixels (including ear tips), camera boundary continuity, pause and save/export reconstruction. Use `QA_OUTPUT_DIR` under `.artifacts/`.

The depth checker accepts optional measured `curve.knots` in world-y coordinates for piecewise-linear perspective, retaining the existing linear contract unchanged. The common scene renderer supplies both reading and MP4. Standalone normal-speed export evidence is stored under `.artifacts/qa/alice-in-wonderland/scene-5/exports/`; this is separate from the suite's accelerated first-scene recording.

S5 targeted QA also checks speaking actors against the actual top toolbar rectangles, including the320x480client fallback. Corner mask pixels are cached once for exhaustive opaque-sprite probing; the sampling count and strict255alpha coverage requirement remain unchanged.
# Merged Alice Chapter 1 and duration policy

The current release contains three scenes: old riverbank segments S1+S2, old tunnel/well segments S3+S4, and Solid Ground with its retimed oldS5 opening plus the Hall of Doors. `qa/alice-s3.mjs` and `qa/alice-s4.mjs` retain their technical segment labels and audit the two portions of the merged second scene, including the internal pixel-identical join. The22October correction removes the old3s hold and derives every S3 movement duration from two fixed character speeds. Use alice-hall.mjs for its current combined scene; the old short standalone S5 export matrix is retired.

Stories declaring `sceneDurationPolicy` are accepted solely by automatic reading: ideal60–80s, inclusive tolerance55–85s. `checks/scene-duration.mjs` measures the actual engine at1ms resolution. MP4 runtime is informational, never an acceptance range. If automatic timing is valid, do not trim pauses, change reading timing or re-export MP4 for duration. `qa/run.mjs` retains static export-sequence and canvas-preview checks but skips recording for this policy. The authored final3s hook remains required; scene count is flexible. Legacy stories retain their previous behavior until authorized migration.



### Alice new Chapter1 Scene3: Solid Ground and Hall of Doors

Run `node qa/alice-hall.mjs` for the full16layout scene-motion matrix,9184source-clock samples, real DOM coverage, one zoom per layout, exact table ground contact, rear actor/furniture clearance, actual normalized-texture hand/key-ring grips including mirrored carried walks, and final door/key/curtain state. The same isolated reader context is resized across all16layouts; no user storage is cleared. `--layout=<name>` is a diagnostic subset, not release certification. Outputs go to `.artifacts/qa/alice-in-wonderland/new-scene-3/motion/`. The oldS5 opening keeps its artwork and measured routes but uses the authorized speed correction; technical `alice-s3.mjs`/`alice-s4.mjs` continue to refer to components of the merged second scene. Full story suite and viewport sweep remain mandatory. Automatic-only duration acceptance forbids re-exporting MP4 merely to meet a time limit; reuse valid technical export evidence, with static sequence and preview checks for subsequent corrections.

### Two constant locomotion speeds

`qa/checks/locomotion-speed.mjs`, invoked by `node qa/run.mjs`, independently integrates distance/depthScale over measured legs and checks the actual engine derivative against walkSpeed or runSpeed. A character profile has exactly these two positive reference speeds. Actual speed = reference * depthScale(y). Waypoint transitions cannot ease or pause. Opted-in scenes require all moving actors to declare `motion.actors`; legacy stories retain approved behavior until authorized migration. Unit coverage: `node --test qa/tests/motion-speed.test.mjs`. Current S3 targeted matrix uses `QA_OUTPUT_DIR` and checks16layouts, including real front/back held-key texture direction.

### 45 degree orientation

Diagonals are permitted; rigidL routes are not required. For each authored segment, abs(dy)>abs(dx) requires back/up when dy<0, front/down when dy>0. Otherwise (including exact45degrees) use left/right. `locomotion-speed.mjs` verifies the engine-facing independently at every leg sample, alongside speed/depth integration. Actual held-key front/back textures are checked in `alice-hall.mjs`.

### Whole-chapter Alice continuity

Run `node qa/alice-chapter-continuity.mjs` to traverse all released scenes chronologically in manual and automatic playback, across360/390/430px, desktop and9:16. Require all scenes and all text to be reached, no ending overlay at S2→S3, identical seated landing coordinates, and completion only at the last released scene. Scene-isolated rendering/export tests do not prove chapter reachability. Node regression in alice-hall-continuity.test.mjs also checks optional scene gating and forbids intermediate terminal steps.

###25October2026: existing-scene corrections and fixed rooms

The55–85s interval gates first creation only. An explicitly authorized `durationReview` revision keeps all old dialogue and pauses; report longer Automatic Reading without rejecting or compensating. Motion uses the environment profile from shared geometry; physical speed multiplies modeSpeed by depth and optional magical bodyScale exactly once. Hall standard235 is calibrated to the265.14worldpx/s leaf walk at normal depth; corridor350 stays unchanged.

`node qa/alice-drink-me.mjs` now checks a single x/y/z state and a single resting-key signature/texture hash across every beat in16layouts, plus zero shotDissolve/snapshot overlays. `node qa/alice-drink-boundary.mjs` independently checks pixel-identical S3/S4 joins. `node qa/alice-hall.mjs` allows only the explicitly authored final900ms S3 room reframe; before it the old corridor zoom remains locked, after it the closing room camera stays locked. Compact captions occupy actual unused top/side space in low layouts; framing must check real rectangles, not assume a caption always lies below actors.

## Alice S3/S4 support planes and central box

Run `node qa/alice-support-planes.mjs` after changes to Hall props, depth or routes. It samples both scenes at intervals of at most40ms, checks actual Phaser display-list ordering wherever opaque Alice/table-prop pixels overlap, checks tiny Alice against the floor bottle alpha, and checks her shoe band against the table foreground on the box approach. The box must stay visible at the same measured central coordinates throughout both scenes. False-positive-free passes also require positive sample/overlap coverage; a skipped route is not a pass. Outputs default to `.artifacts/qa/alice-in-wonderland/support-plane-box-fix/layers/` and respect `QA_OUTPUT_DIR`.

Combine with `alice-hall.mjs`, `alice-drink-me.mjs`, `alice-drink-boundary.mjs`, `alice-chapter-continuity.mjs`, the affected-story suite, viewport sweep, Node tests and both active-scene normal-speed MP4 exports. Revision duration is reported from Automatic Reading only, without compensating cuts.

For the active Alice exports, set `QA_FFMPEG` to a local FFmpeg executable before running `qa/alice-drink-export.mjs --scene=2` and `--scene=3`. The decoder replaces stale paused-video seek captures with actual saved-file frames and rejects recording gaps of two seconds or more. A video that merely reaches `ended` is insufficient evidence of continuous rendering. Record exports separately from exhaustive browser matrices so CPU saturation cannot invalidate the recording. This is a technical recording check, never a scene-duration target or reason to trim story timing.

Headless active-scene QA warms a disposable canvas encoder before pressing the real export button and disables accelerated video encoding in that isolated test browser. This avoids cold-start encoder stalls without changing the story clock, renderer timing, scene pauses or recorded product output. The actual product MP4 is then decoded for continuous timestamps and played in full at1x. A failed capture remains rejected; no timing assertion is relaxed to obtain a pass.

## Alice Chapter 2, Scene 1

`node qa/alice-c2-s1.mjs` audits the current renderer in seven layouts: actual alpha-mask clearance against the resting props and other actors, fixed prop transforms/depth, paused states, immediate advance after each of the twelve revealed texts, manual/automatic reachability, silence and pixel-identical C1/S6→C2/S1 boundaries. The complete affected-story suite remains `node qa/run.mjs --story=alice-in-wonderland`.

`node qa/alice-c2-s1-locks.mjs` additionally compares complete prop texture pixels and crop/transform signatures, the original C1/S1 dialogue DOM metrics, rejected action clicks and actual scene-only completion storage/UI.

`node qa/alice-c2-s1-viewport.mjs` checks the actual intro and all twelve texts at247 browser sizes. It explicitly retains Alejandro's prior usual-layout acceptance for the unchanged Hall panorama; excluded extreme observations remain in the report. Pair it with `node qa/viewport.mjs --story=alice-in-wonderland --usual-layouts --representative-only` for the standard shared checker across both chapters. Do not describe a scoped pass as zero issues at every swept size.

With `QA_FFMPEG` set, `node qa/alice-c2-s1-export.mjs` exports two actual720×1280 MP4s at1x, with the audio checkbox off and on. It independently decodes the saved files, rejects recording gaps, verifies that neither file has an audio stream, plays both completely at1x, and checks reader/storage preservation. Run it after exhaustive browser matrices finish. Evidence defaults to `.artifacts/qa/alice-in-wonderland/chapter-2-scene-1/`; only S1 is delivered, with scene completion rather than chapter completion. Gate2B remains paused.

## Reversible Alice close-camera trial

The current user-authorized exception covers C1-S4/S5/S6 and C2-S1. Configuration and measured camera targets live in `stories/alice-in-wonderland/shared/camera-trial.json`; the original panorama, chapters, routes and props remain untouched. The reader menu offers all four scenes, only S6/C2-S1, original camera, and individual scene choices. This experiment also derives higher-resolution character textures from archived originals; it does not replace the Golden Master or the approved baseline atlas files.

`node tools/alice-camera-mode.mjs --mode=all|late|original` sets the default and resets only the camera preference generation. `--restore-files` verifies the approved backup and restores the two original renderer files byte for byte. Reload localhost after a CLI switch. Backup and restore instructions are in `.artifacts/alice-in-wonderland/camera-trial/20261031-185032/README.md`.

Use `qa/alice-camera-trial.mjs --mode=all`, `--mode=late --quick`, and `--mode=original` for camera/detail, pause, text-click and original-pixel comparisons. The `--baseline` option captures the restored original renderer files; preserve the trial sources separately and restore them afterward. `qa/alice-camera-contract.mjs` checks scene inheritance and step-boundary continuity from those reports. `qa/alice-camera-viewport.mjs` retains the full resize observations and the previous usual-size acceptance scope. The existing C2 alpha/depth audit accepts `--camera-trial` only for the explicitly authorized pan; send its output to the trial directory with `QA_OUTPUT_DIR` to preserve the approved fixed-camera evidence.

Run the standard affected-story suite with the original preset, plus all other stories after changes to common checks. With `QA_FFMPEG` set, `node qa/alice-camera-export.mjs` records and fully plays the four current trial MP4s at normal speed. Run exports after browser matrices. Final movie evidence defaults to `.artifacts/qa/alice-in-wonderland/camera-trial/export-final/`; the initial S4 capture in `export/` is explicitly rejected for cropping the key ring and does not certify the corrected camera.


The official vertical viewport is actual 1080x1920 natural reading. Do not combine it with the optional portrait-reading control as if these were the same test. Product portrait controls and MP4 exports have their own checks. `--browser-only` runs only the browser phase; combine it with separately completed static evidence before claiming full QA. `--continue-on-error` records every chapter/layout failure instead of aborting the remaining matrix.

### C3-S1: actual text clock and revised Alice support

Run `node qa/alice-c3-s1-live-text.mjs` after changes to this renderer's update loop. It leaves the actual Phaser loop running, observes all nine paragraphs becoming visible without seeding `revealed` or calling the paint callback, checks the first-tap reveal and pause, and watches a complete real-time automatic traversal on phone390. Manual diagnostic reconstruction alone cannot detect a missing `onTick` callback. `QA_LAYOUT=phone-390` selects a diagnostic subset; the complete test uses the six official viewports.

Pair with `node qa/alice-c3-s1.mjs`, `node qa/alice-c3-s1-aspect.mjs`, the affected Alice suite, and a normal-speed C3-S1 MP4 export. Alice's user-authorized support is now [535,615], preserving the inherited [535,646] and the original scene timings and scale.
