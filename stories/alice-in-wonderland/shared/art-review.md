# Gate 2A art board — A Small Surprise

## Current v4 correction — 19 October 2026

Alejandro requested continuous viewport coverage and additional ground under the fixed sisters after reviewing implemented S1. This is the authorized correction to that delivery; final scene approval remains pending. The current panorama is **riverbank-panorama-v4.png**, **1881×836** pixels, SHA-256 `42d1fe6ba839940393e6adfbffd9e224a3db1c756cba1acc311b004b3bb98eb3`. It replaces v3 for S1. All character/prop atlas files, measured cuts, rabbit height **122**, watch **14×18**, actor anchors and S1 route remain unchanged.

Three integrated ImageGen generations supplied the deeper meadow followed by the wider continuation; the selected third original was copied byte-for-byte. The complete [generation prompts](../../../.artifacts/alice-in-wonderland/viewport-correction/generation-prompts.json) record requested edit targets and constraints. Returned dimensions differ from requested dimensions; no exact background pixel preservation is claimed. No code-painted, mirrored, tiled or stretched ground was added. The single image uses uniform scale **2.5** and translation **(-1535,-148)**, with real world ground continuing to **y=1942**.

Inspect the current [MEASURED ART BOARD](../../../.artifacts/alice-in-wonderland/viewport-correction/measured-art-board-v4.png), [support board](../../../.artifacts/alice-in-wonderland/viewport-correction/staging-support-board-v4.png) and [source detail](../../../.artifacts/alice-in-wonderland/viewport-correction/source-staging-inspection.png). The [terrain audit](../../../.artifacts/alice-in-wonderland/viewport-correction/geometry-v4-audit.json) records **305/305** unchanged S1 arrival samples on ochre path. Tree root and burrow were remeasured; current values, dynamic camera constraints and the revised S2-only terrain reservation are documented first in [geometry.md](geometry.md) and in [stage-geometry.json](stage-geometry.json). The sister remains fixed at **(810,650)**. S2 is not implemented, and its future crawling poses/rim still require their own work.

The current camera uses full viewport coverage and actual dialogue bounds; the old static 9:16/16:9 compositions and caption band below are historical evidence only. Source measurement does not certify runtime coverage, caption clearance, export or device behavior; those require independent 05 verification of the corrected scene. Original atlas audits remain applicable to unchanged character assets, while the v3 tree/camera boards are superseded by v4 measurements and runtime QA.

## Historical v3 art gate — superseded

The remainder preserves the original pre-implementation delivery. Its awaiting-approval and stop-at-Gate-2 statements describe that historical stage, not the current authorized correction.

18 October 2026 · Prepared by 03 Pixel Art Director under NOOK · **Awaiting Alejandro's approval**.

Read the approved Gate 1 proposal before production. Inspected the permanent `concept_art/Personajes` sheet, two `concept_art/Escenas` examples and the actual Odyssey core atlas. All new raster art was generated with the integrated ImageGen tool. No Python/SVG painting, placeholders, runtime chapter code, sound or publication was used. Python/canvas are restricted here to measurement, crop audits and clearly technical boards assembled from the selected assets.

| Selected asset | Actual dimensions | Contents |
| --- | --- | --- |
| `../assets/environments/riverbank-panorama-v3.png` | **1672 × 941** | One continuous riverbank, broad path, large far-right hedge opening and requested high-canopy tree. |
| `../assets/atlases/alice-s1-v1.png` | **1536 × 1024** | 8 authored poses: front/right/back, standing curiosity, seated book/curiosity, real support-hand rising, standing ready. |
| `../assets/atlases/sister-s1-v1.png` | **1536 × 1024** | 8 authored poses, including true seated reading, calm left-facing reply and gesture. Book is separate. |
| `../assets/atlases/white-rabbit-s1-v1.png` | **1536 × 1024** | 8 authored poses: front/right/back plus pocket, extraction, consultation, return and ready. Watch is separate. |
| `../assets/atlases/props-s1-v1.png` | **1536 × 1024** | Open book, tilted open book, front watch and side watch. Printed page strokes; no pictures. |

These are the returned dimensions, not 4K. Exact SHA-256 fingerprints, integrated generation provenance, final prompt specifications and reference paths are recorded in the JSON evidence. No final asset remains solely under the generator's default directory.

Characters use the requested Odyssey family: large heads, rectangular eyes, defined dark outline, stepped block clusters and restrained material palettes. Alice is a younger blonde girl in a muted blue day dress/pinafore; the older sister has chestnut braid and sage dress; the White Rabbit has ochre waistcoat and distinct white paws/ears. The normalized contact sheet is the appropriate view of the actual shared two-pixel rendering pipeline; source PNGs have genuine partial-alpha edges which are documented and normalized, not falsely described as already hard alpha.

Alejandro's scale revision reduces the rabbit from height 168 to **122, a 27.38% reduction**, with proportional even widths and watch 14 × 18. It is now below both seated girls in height and apparent volume; the atlas identity pixels remain unchanged. Hand supports were recomputed for the reduced watch. The only new permanent PLAYBOOK point in `agents/03-pixel-art-director.md` is the requested general scale/perspective rule.

The tree is an integrated ImageGen edit of the complete v2 panorama, selected as v3; it is **specific to this scene**. Its high crown reads above the sisters in 9:16 and 16:9. The trunk/root stand behind the path to the right of the S1 rabbit stop. Conservative whole walking-canvas regions at 255 route samples have zero intersections with crown/trunk; minimum clearance 6 world pixels. The caption zone, figures, book, same foot anchors and S2 ground corridor remain clear. The crown is clipped at the artwork's upper edge, while its lower branches and right trunk remain visible in the phone crop. See `tree-clearance-board.png` and `tree-clearance-audit.json`; no new foreground mask is invented.

The `atlas-cells.json` cells were derived from observed alpha>80 row/column gaps, then each silhouette's exact bounds plus four real clear border pixels. No equal cell grid was assumed. Alpha projection row spans differ between all three sheets. Every authored pose has one connected silhouette at rendering threshold; no component filtering or automatic deletion was needed. Mirrored directions, derived walking frames, actual book/watch contact and complete shoes/paws were separately inspected.

The static 9:16 boards keep both sisters, full legs/feet, book and rabbit's watch clear of the technical caption band. The sister's reply board contains **only the two sisters**, matching its place before the rabbit arrives. The watch board contains all three, and the closing board keeps sister fixed while Alice is standing and rabbit has empty hands. These are art review compositions, not implemented story beats or a playable preview.

See [geometry.md](geometry.md) for exact support points, arrival waypoints, both safe cameras, caption clearance and the deliberately empty S1 occluder list. Same world and panorama continue toward S2. Its corridor is reserved; crawling art, rim occlusion and S2 movement require their own authorized work and are not certified here.

The art check has zero issues in its real technical fixture. It establishes texture and portrait readiness and is supplemented by actual alpha/grid/crop audits. It does not replace the independent scene audit after implementation. Stop at Gate 2A so Alejandro can review the selected images and geometry before any Gate 3 code.
