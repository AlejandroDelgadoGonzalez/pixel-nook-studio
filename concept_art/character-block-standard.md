# Native character block standard — Part 1

Status: Alejandro explicitly approved Part 1 at 100% (2026-11-06), including the 74-pose master and folded copy. His current Part 2 request authorizes the two three-character/four-pose candidates in `character-cores.json`; their visual approval is pending. Part 3 has not started.

The three approved character style references are: `characters/odyssey-core.png`, `characters/second-cup-people.png`, and `characters/master-pose-sheet-alice.png`. Treat the two historical sheets as direct visual references for chibi proportions, simple clothing blocks, rectangular dark eyes and a continuous stepped outline. Preserve their bytes. Alice supplies the eight approved pose geometries; its cleanup is now explicitly approved.

## Measured native geometry

Source coordinates, exclusive bounds; head = scalp/hair top through annotated jaw bottom. Beard, hairstyle and glasses affect this measurement. Do not force one fixed head ratio by stretching or shrinking an existing pose.

| Character | Front opaque silhouette (alpha > 80) | Jaw bottom y | Head/body height | Eye core width × height |
|---|---|---:|---:|---|
| Odysseus | [65, 41, 250, 321] | 194 | 54.64% | 11 × 25; 11 × 25 |
| Calypso | [50, 351, 267, 629] | 489 | 49.64% | 12 × 25; 12 × 25 |
| Second Cup man | [92, 32, 345, 435] | 245 | 52.85% | 17 × 35; 16 × 35 |
| Second Cup woman | [80, 460, 358, 866] | 647 | 46.06% | 16 × 34; 17 × 34 |

These native PNGs are visually simple but not numerically pure: Calypso’s two eye cores contain 149/168 RGB values and alpha 253/254. The four front cells contain partial alpha and subtle skin/outline variation. The measured head/body range is approximately 46–55% with this explicit scalp-to-jaw definition. Do not falsely report zero antialiasing, exactly #181210 throughout, or a universal 45–50% from the original source bytes. Exact measurements and masks are in `.artifacts/qa/character-cleanup-part1/reference-measurements.json`.

## Exact cleaned Alice contract

- Edit native pixels and existing blocks. Never reduce the source to 68 rows, interpolate, average, or smooth it. `qa/pixel_density.py normalize` rejects character atlases before any batch write. Existing 68-row calibration is a read-only historical diagnostic for untouched art; runtime retains its established two-world-pixel rendering policy.
- Keep every approved pose, alpha silhouette, dimension, crop, standing size and foot/hand anchor. Source and concept copy must match byte-for-byte.
- Eyes: solid opaque vertical rectangles in #181210, surrounded by flat #FEC696 skin. RIGHT and RISING must match the approved narrow profile bar, 12 native source pixels, with the former extra column replaced by skin. Packed cells record the corresponding mapped width. Do not add eye thickness while removing a brown/gray halo. Back views have no eyes; preserve the authored closed crying eye.
- Jaw: dark stepped side contours only. At the actual central neck attachment, connect the face through warm #E68F52 skin shadow, as in Calypso. Never draw a continuous black bar across that attachment. Source FRONT, RIGHT, CURIOUS STANDING and STANDING READY have explicit warm-opening measurements.
- Exterior: every opaque pixel adjacent to transparent background, including diagonal adjacency, uses #181210. One connected silhouette per pose; no detached flecks.
- Hair uses three exact clean tones: #C07421 shadow, #FCAB37 golden base and #FDBB4E light. Keep large clean highlight blocks on the upper hair and waves. Dress, bow and apron use two material tones each. Do not spread the neck/limb skin shade into hair or the bow blue into clothing. Preserve large authored material blocks and avoid intermediate color noise.
- This user-authorized revision covers all 74 existing Alice master poses. Every crop is pinned to its revised pixels and must use the exact canonical source palette; Alice has no legacy-palette exemption. `c2-s5-folded-v1.png` must match the complete RGBA crop of `folded-trapped-right`, including dimensions. All pre-revision geometry and alpha are preserved. The wet seated pose retains its two legitimate separate water drops.

Exact palette: #181210, #FCAB37, #C07421, #FDBB4E, #7B9AB1, #4C6C82, #568B9C, #235A68, #FBECCB, #D4BE9D, #FEC696, #E68F52.

## Read-only evidence

Native eye-width, warm-neck, highlight, palette and exterior contracts are attached to the eight source and all 74 packed-master cells in `stories/alice-in-wonderland/shared/*pixel-density.json`. `qa/character_master.py` enforces the revised source palette and crop locks on every Alice pose and exact equality of the folded copy. Both source and atlas pins identify this authorized revision; previous versions remain in `.artifacts/qa/character-cleanup-part1/before/`.

Run the directory audit, affected-story density audit, character-master audit, Python tests and reusable browser regression. Keep evidence under `.artifacts/`. Asset checks do not replace visual approval or certify a newly encoded MP4.

Review: `.artifacts/qa/character-cleanup-part1/comparison-400.png` and `all-eight-poses-400.png`. Both use exact native 4× nearest-neighbor crops; view the saved image at 100% for true 400% rather than the chat’s fit-to-window display. The original diagnosis remains historical. Part 1 is approved. Revision evidence and pre-revision backups are in `.artifacts/qa/character-cleanup-part1-revision/`.
