# Alice in Wonderland — Chapter 1 Scene 1 measured geometry

## Current v6 hedge seam repair — 20 October 2026

Selected panorama is `riverbank-panorama-v6.png`. The approved small opening and its complete earth rim are pixel-exact from v5; all world coordinates, routes, body scales and camera bounds remain unchanged. Only the surrounding hedge foliage/soil was repaired. See [current S2 geometry note](scene-2-geometry.md) and [preservation evidence](../../../.artifacts/alice-in-wonderland/hedge-seam/integration.json). Previous version references below are historical.

## Current local v5 burrow correction — 20 October 2026

S1 and S2 now share `riverbank-panorama-v5.png` (1881×836), retaining the same world mapping and every original RGB pixel outside the local hedge edit polygon. The smaller aperture and current threshold **B=(1632,464)** are measured in [scene-2-geometry.md](scene-2-geometry.md) and the active shared JSON files. S1's actors, atlas pixels, routes and held camera are unchanged; its Rabbit dialogue is now “Oh dear! I shall be late! I'm late!” as expressly requested. The v4 source/provenance below is historical; v5 supersedes only its local burrow. This is not a new panorama composition or a general PLAYBOOK rule.

## Current revision — continuous viewport correction, 19 October 2026

This section supersedes the historical v3 snapshot below. Alejandro authorized the panorama/camera correction and its implementation and QA; final scene review remains pending. The current authoritative measurements are [stage-geometry.json](stage-geometry.json). Character cuts and normalized sizes in [atlas-cells.json](atlas-cells.json) are unchanged.

The selected artwork is **riverbank-panorama-v4.png**, actual **1881 × 836** source pixels, SHA-256 `42d1fe6ba839940393e6adfbffd9e224a3db1c756cba1acc311b004b3bb98eb3`. It is a complete generated panorama with genuine additional lower meadow and side scenery. Its single uniform mapping is **world = source × 2.5 + (-1535, -148)**. World bounds `[x,y,width,height]` are **[-1535,-148,4702.5,2090]**, ending at **(3167.5,1942)**. Thus actual ground continues **1252 world units below Alice's y=690**, rather than stopping at the old y=941 image edge. The image is rendered uniformly; no tiled strip, mirror, stretched grass or coded floor continuation is supplied.

S1 world positions remain Alice **(680,690)**, sister **(810,650)** and rabbit **R0(590,412) → R1(650,416) → R2(710,424) → (810,440) → (900,448) → R3(990,452)**. Their registered source supports are Alice **(886,335.2)**, sister **(938,319.2)** and rabbit R0 **(850,224)** through R3 **(1010,240)**. The source terrain audit finds **305/305 arrival samples on ochre path**, zero non-ochre samples. This checks terrain support; it does not replace runtime body/panel or viewport coverage QA.

The tree and future burrow were remeasured because ImageGen reexported the scenery; identical v3 background pixels or landmark coordinates are not claimed. Tree root is now **(1202.5,397)**. Conservative crown bounds are **[400,-148,1050,395]**, bottom **247**, above the earliest rabbit head at **290**; trunk/root polygons remain behind and to the right of S1. S1 has **no foreground occluders**.

The S2-only reservation now follows **(990,452) → (1110,470) → (1260,500) → (1400,510) → (1500,500) → (1600,480) → (1658,472)**, ending at the remeasured opening threshold. Aperture bounds are **[1560,337,155,135]**; source bounds approximately **[1238,194,62,54]**. This replaces the old v3 approach/threshold and is only a terrain continuity reservation. S2 staging, crawling poses and a measured foreground rim remain unauthored and unapproved; no S2 scene is implemented. Sister remains fixed **(810,650)** at the S1 boundary.

The old fixed source rectangles and y=752…912 caption band below are **not current camera constraints**. The current renderer must fill the entire stage at every aspect ratio and fit the required world rectangle **[551,290,478,402]** within the above panorama bounds, using the actual DOM `#dialogue` reservation and **12 CSS px** fitting padding. Preferred center **(852.65625,470.5)** and view height **941** are camera preferences, not a rigid box. Portrait **720×1280** and landscape **1280×720** are output targets; dynamic crops cover intermediate, square, narrow and wide windows. Runtime QA certifies actual resulting coverage and body clearance separately.

Current evidence: [measured art board](../../../.artifacts/alice-in-wonderland/viewport-correction/measured-art-board-v4.png), [staging supports](../../../.artifacts/alice-in-wonderland/viewport-correction/staging-support-board-v4.png), [magnified terrain inspection](../../../.artifacts/alice-in-wonderland/viewport-correction/source-staging-inspection.png), [measurement audit](../../../.artifacts/alice-in-wonderland/viewport-correction/geometry-v4-audit.json), [measurement script](../../../.artifacts/alice-in-wonderland/viewport-correction/measure-v4.py) and [complete ImageGen prompts](../../../.artifacts/alice-in-wonderland/viewport-correction/generation-prompts.json). Previous v3 image and geometry are retained in that evidence folder for comparison. These technical boards are not runtime QA screenshots.

## Historical v3 Gate 2A snapshot — superseded

Everything below records the original art gate, before scene implementation and the authorized viewport correction. Its pending-gate/no-runtime statements and fixed camera rectangles describe that earlier delivery only.

18 October 2026 · 03 Pixel Art Director → NOOK · Gate 2A, awaiting Alejandro.

The authoritative measurements are in [stage-geometry.json](stage-geometry.json), with measured sprite cuts in [atlas-cells.json](atlas-cells.json). This is an art and geometry deliverable. It contains no narrative scene implementation, manifest or catalog registration. A future approved manifest must declare `stageGeometry`.

## Final artwork and coordinate mapping

The selected complete panorama is `../assets/environments/riverbank-panorama-v3.png`, actually **1672 × 941** pixels. One source pixel equals one world unit, origin at the image's upper-left. Both orientations use this same art and coordinate system. There are no mirrored wings, repeated strips, separate centers, generated floor fills or stretched ground.

The first generated opening was too small for future crawling. Integrated ImageGen enlarged it in v2. Alejandro's next revision adds the scene-specific bank tree in v3 while retaining the opening, approximately 126 × 112 source pixels, and the same measured river/grass/path relations. Only v3 is selected in story assets; earlier previews are retained in `.artifacts/`. ImageGen reexports surrounding pixels, so byte identity outside the tree is not claimed. All current hashes and geometry refer to inspected final v3.

## Reviewed scale and scene-specific tree

The White Rabbit's normalized standing height is **122**, previously 168: **27.38% smaller**. Source character and object PNGs and their crop bounds are unchanged. All eight rabbit poses use proportional even widths, height 122 and the actual shared normalization; the largest derived walking canvas is **78 × 122**. The watch scales to 14 × 18 (side 8 × 18), with hand anchors recomputed below. The rabbit is visibly smaller than seated Alice (130 × 144) and the seated sister (134 × 156 or 128 × 160), as well as the standing humans (heights 180/202). Contact sheets and both mounted orientations were inspected for height and apparent volume.

The high canopy spans a conservative source region **[470,0,850,280]**. It is perceptible above both sisters inside the unchanged phone crop; the upper crown naturally extends beyond the artwork's top edge. The trunk stands in the rear bank to the right of the S1 rabbit route, with root landmark **(1100,390)**. Its conservative trunk/branch and solid-root polygons are recorded under `s1-bank-tree` in JSON. The root region stays above, and outside, the path surface. The tree is this scene's requested background landmark, not a general story rule.

The full **78 × 122** walking canvas was swept along **255 route samples** against conservative crown and trunk regions: **zero intersections**, minimum conservative separation **6 source/world pixels**. The earliest rabbit head is y=290, below the conservative canopy limit y=280. The sisters' heads, book, grass supports and caption band remain clear. `tree-clearance-board.png` shows the complete silhouette corridor. No foreground occluder is required for this integrated rear tree.

| Support / landmark | World coordinate | Meaning |
| --- | --- | --- |
| A — Alice | **(680, 690)** | Same ground origin while seated, using support hand to rise, and standing at the hook's end. |
| S — sister | **(810, 650)** | Fixed throughout S1 and retained into S2. Reading/reply pose changes do not move her. |
| R0 — rabbit entry | **(590, 412)** | On the actual ochre path, near portrait frame's left edge. Initially invisible. No river/reed spawn. |
| R1 — fully in frame | **(650, 416)** | Entire rabbit fits in the held portrait crop; emergence opacity is still changing here. |
| R2 — emergence ends | **(710, 424)** | Becomes fully opaque after its emergence has been visible. |
| R3 — watch stop | **(990, 452)** | Stop before reaching into pocket; same feet during consultation, return and final turn. |
| H — hedge approach | **(1360, 454)** | Continuity reservation on the same real path, outside S1 portrait crop. |
| B — burrow threshold | **(1456, 438)** | Same art's actual opening; no S2 implementation is supplied. |

S1 arrival follows **(590,412) → (650,416) → (710,424) → (810,440) → (900,448) → (990,452)**. The world route stays behind and apart from the sisters. The camera is established before this walk and stays fixed. The largest walking canvas has half-width **39** world units. The very beginning deliberately emerges through the frame edge; no required fully visible actor is clipped after R1; the derived walking canvas at R1 retains **23** world units of left clearance.

The reserved continuation is **(990,452) → (1110,464) → (1260,466) → (1360,454) → (1410,446) → (1456,438)**. This records a verified ground corridor toward the already visible opening. It does not certify S2's complete staging, follow timing or entrance. Future S2 still needs authored crawling poses and a measured foreground rim mask. The S1 standing/rising atlas does not authorize walking upright into the hole. Alice's future following route must avoid the stationary sister and receive its own S2 review.

## Cameras and text reservation

| Camera | Source rectangle `[x,y,width,height]` | Preview |
| --- | --- | --- |
| Held portrait 9:16 | **[588, 0, 529.3125, 941]** | 720 × 1280 |
| Complete panorama 16:9 | **[0, 0.25, 1672, 940.5]** | 1280 × 720 |

The exact landscape ratio removes only half a source pixel in total vertically and stays inside the art. Portrait's full-image origin range is x=0…1142.6875; the narrower **S1 cast-safe origin range is x=522…592**. Chosen x=588 leaves at least 20 world units on Alice's widest rising pose, 23 after the rabbit clears the frame, and 88.3125 to the right of its largest walking canvas. This excludes the deliberate initial partial entry of the emerging rabbit.

The technical caption band is y=752…912 in world units, entirely below the lowest feet at y=690: **62 world units clear**. Caption guide images are technical reservations, not actual reader/export screenshots. Actual text panels must be checked during authorized scene implementation and independent QA. Mathematical projections at 360/390/430/720 widths are reported separately; they are not simulated reader interaction tests.

## Objects, alpha and depth

The book is a separate **66 × 42** normalized prop. In the reading pose its visible support maps from sister source point (979,870) to approximately **(820,606)**; book bottom-center is (820,616), with the actual support at normalized book point (0.5,0.75). The reply maps source (624,880) to approximately (828,610), with tilted-book bottom-center (830,620). Both poses retain sister feet (810,650). Pages contain text strokes only. The reply preview correctly precedes the rabbit's entrance.

The separate watch is **14 × 18**; its side pose is **8 × 18**. In consultation, rabbit source paw (670,820) maps to the inspected snapped support **(1014,408)**, the watch's bottom-center anchor. Extraction support is (1018,408), return (986,408), and pocket (990,422). These were recalculated from the unchanged source poses at height 122. Full movement between supports, owner opacity and hiding at the pocket still require implementation review. The character atlas contains no baked-in watch or book, preventing duplicate objects.

**S1 has no foreground occluders**: `occluders: []` is deliberate and complete. Rabbit emergence uses the observed frame edge. The integrated high tree does not cross required actor silhouettes and has no invented foreground mask. The burrow rim is a future S2 landmark, not a ready alpha mask. Feet determine depth; no special render-depth bypass is prescribed.

All actor/prop placements and normalized sizes follow the shared **two-world-pixel grid**. Source dimensions and fractional camera aspect coordinates are not forced onto that grid. Use `drawCharacter` for every pose and prop. Integrated source PNGs retain real transparency with some partial-alpha edge/halo pixels; the real shared normalization produces exclusively alpha 0/255, with no halo over the inspected green/white boards. Never bypass that normalization or squash a standing sprite to imitate sitting/rising.

## Evidence and limits

All evidence lives in `.artifacts/alice-in-wonderland/art-review/`: `geometry-map.png`, `tree-clearance-board.png`, clean `preview-*-9x16.png` / `preview-*-16x9.png`, `caption-guide-*-9x16.png`, `normalized-contact-sheet.png`, `walking-contact-sheet.png`, `alpha-crop-audit.json`, `character-art-check.json`, `geometry-projection-audit.json`, `tree-clearance-audit.json` and `generation-provenance.json`.

The reusable `character-art.check(page)` ran against an **actual local Phaser texture manager** prepared by an isolated technical fixture: 96 walking textures, 3 real portrait data URLs, **0 issues and 0 page errors**. All 28 authored crops have four clear source pixels at alpha>80, complete feet and one connected silhouette each. Separate audit: 31 normalized authored/mirrored textures with no partial alpha; 96 walking textures with zero broken two-pixel blocks and zero partial-alpha blocks. Contact sheets and mounted book/watch/closing previews were inspected visually.

No playable scene exists. No reader interaction, saved reconstruction, completed video, physical phone, Safari or independent QA Inspector scene certification is claimed. `npm run qa -- --story=alice-in-wonderland` is intentionally not presented as passed: this art-only gate has no story manifest/runtime yet. Stop for Alejandro's art and geometry approval before Gate 3.

