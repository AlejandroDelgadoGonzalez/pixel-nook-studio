# Pixel density and visual canon gate

`concept_art/characters/` and `concept_art/scenes/` are the only global visual authority. See `concept_art/catalog.json` for approval states, `manifest.json` for exact sources and `density-profile.json` for measured background density and historical diagnostics.

Character generation and cleanup operate at native resolution. `normalize_atlas()` and the entire normalization batch preflight reject character atlases, including nearest-neighbor projection to 68 rows. The old 68-sample calibration remains read-only historical evidence. Runtime two-world-pixel display policy is separate from source authoring. Panorama normalization remains measured, explicit and backed up; it must never touch character masters.

## Native character contract

Each source crop declares an exact palette, dark outline RGB, flat skin RGB, rectangular eyes and widths, skin margin, warm central neck attachment, and three hair tones. Human views with visible eyes require a measured warm neck link or a documented occlusion exception. Closed-eye expressions and non-human anatomy use explicit measured exceptions. Do not fake a human face on an animal or certify exceptions as ordinary open-eye poses.

`native_pixel_errors()` rejects partial alpha, detached silhouettes, foreign palette colors, every colored eight-neighbor exterior pixel, nonrectangular/partially opaque eyes, gray/brown eye halos, wrong eye widths, a black/incorrect central neck link and missing hair tones/highlights. `strictHuman` and `logicalEyeWidth` enforce the new masters' face requirements. Optional `minimumHairClusterPixels` checks connected tone blocks. A three-tone count alone cannot prove attractive waves: native crop hashes pin the reviewed pattern and all poses require 400% human inspection.

`qa/character_cores.py` audits all five 3×4 sheets (60 sprites): inventories, cuts/gutters, exact hashes, palette, eye count and one-cell width, warm neck, flat facial interiors, head palettes, hair tones and authored head/jaw landmarks at 45–50%. The head envelope includes hair/headwear; rear jaw landmarks inherit anatomical measurements, not long hair tips. The original Odyssey/Second Cup masters remain immutable source references; their historical statistics do not constitute native-purity certification.

## Automatic Gate 4 integration

`qa/checks/pixel-density.mjs`, called by `qa/run.mjs`, automatically runs the complete concept directory audit and all-story inventory before each story's density checks. `check-directory` validates all 24 catalog images and JSON metadata, checks immutable source pairs and background density, then invokes the native 60-pose core audit. Missing, unlisted or altered assets fail.

`check-stories` inventories every story PNG under assets. Measured native sprite contracts are inspected directly. Existing unconverted artwork is pinned by exact SHA256 in `qa/legacy-visual-locks.json`; changed or new unregistered files fail. That immutable legacy list is preservation, NOT certification of facial/hair purity. Never enroll new artwork into it. Existing approved identities, unusual expressions, props, animals and geometry stay unchanged. A new/revised sprite must carry its own measured native contract; a new background must have a measured panorama specification.

```powershell
python qa/pixel_density.py check-directory --directory concept_art --output .artifacts/qa/visual-canon.json
python qa/pixel_density.py check-stories --output .artifacts/qa/story-visual-inventory.json
python qa/character_cores.py --output .artifacts/qa/character-cores.json
python qa/pixel_density.py check --spec stories/alice-in-wonderland/shared/pixel-density.json --output .artifacts/qa/alice-density.json
python -m unittest discover -s qa/tests -p 'test_*.py'
node qa/run.mjs
```

All generated evidence belongs in `.artifacts/`. Native source QA is not runtime, physical-device, pacing or MP4 certification. Existing scene approval states and all production gates remain required. Prompts, exact generation sources, authored native cleanup and nine front-face 400% crops for this expansion are in `.artifacts/qa/character-expansion-part3/`.


## Zero Bounding-Box Clipping — permanent export rule

For every newly exported sprite, detect the FULL opaque/visible bounding box, including the highest bun, cap, hair tuft, hat, ears, beak, wings, feet and tail. Add at least FOUR logical cells of alpha==0 on all four sides. Declare the measured native `logicalCellPx`, the complete `cellBoundsExclusive` and exact alpha/palette/eye contracts. A tight runtime `sourceBoundsExclusive` is an explicit CONTENT TRIM inside that padded storage cell, not a replacement for its margin. Preserve normalized frame size, origin, hand/foot anchors and world geometry when packing. QA audits both the complete storage cell and the content frame; a trim without its storage contract fails.

Never discard native upper/lower rows, redraw a bun into a flat block or seal an already-truncated head to force a density/proportion result. Preserve the complete original head silhouette and enlarge the canvas. `qa/character_cores.py.padded_sprite_sheet()` copies the full measured sprite without resampling. The retired `character-expansion-part3/clean_expansion.py` in evidence contains destructive head-band edits and must NOT be reused. The corrected source-head alpha proof and pixel pins detect that regression independently of PNG margins.

`qa/pixel_density.py` fails on visible pixels touching a complete cell edge, margins below four declared cells, an open/non-dark top or bottom outline, a changed pinned full head silhouette, missing storage bounds, invalid content trims, dirty eyes/skin and nonsealed eight-neighbor exterior pixels. Run the source pixel checks, complete directory inventory, character-master gate and Playwright for both Alice chapters after any rebind. Inspect at 400%; a mathematically closed dark bar cannot by itself prove that an original head was not cut. Compare the alpha silhouette against the independently preserved source.

Alice has 75 active master poses: all 74 prior poses plus the previously external S5 reach. The approved first eight retain exact foreground RGBA; closed crying eyes and authored wet-pose drops remain explicit exceptions. All seven appeared characters use one master each (Alice, White Rabbit, Dodo, Lory, Eaglet, Mouse and Sister). Retire per-scene character PNGs only after exact crop rebinding, recoverable originals and zero broken URLs. Historical source links belong in `.artifacts/`; runtime and export load only canonical masters plus necessary props.

## Scene-reference lock
New/revised story panoramas must declare `panoramas[].reference_scene_master` in their story manifest and meet `concept_art/README.md`: actual direct primary image_gen image reference, pinned master hash, 1664×936, exact 2×2 grid, 1.30× overscan, opaque raster and full-room interior metadata when applicable. The registry checks every story, before legacy handling. Pre-policy background preservation is an independently hash-pinned finite baseline; never extend it for new art. Auxiliary scene metadata is archived under `.artifacts/qa/scene-reference-lock/`. Canonical scene art and all existing story files remain unchanged. Numerical checks do not prove style, actual generator inputs or room composition; inspect saved generation requests and full-room visuals.
