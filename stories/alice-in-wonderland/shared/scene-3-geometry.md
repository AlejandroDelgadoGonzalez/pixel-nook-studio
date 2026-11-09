# S3 measured geometry: Where the Ground Gives Way

**Density revision,20 October2026:** selected panorama and Alice atlas received the user-authorized Golden Master NN normalization. Density/crop evidence is in `.artifacts/pixel-density/` and `.artifacts/qa/alice-in-wonderland/pixel-density/`; see `shared/pixel-density.json`. The earlier19unchanged-runtime/art-hash statement describes only the pre-normalization proposal. At the density revision, cut rectangles, physical sizes, mappings, anchors, routes and occluders remained unchanged. The later S3 implementation approval and its derived integration measurements are recorded below.

20 October 2026. **Gates 1 and 2A approved by Alejandro, including the normalized assets. S3 implementation and QA authorized.** NOOK applies04 and05 sequentially in the main thread. S1/S2 narrative, assets and staging remain approved.

Canonical data: [scene-3-geometry.json](scene-3-geometry.json). New pose crops: [scene-3-atlas-cells.json](scene-3-atlas-cells.json). All coordinates below are measured against the selected images, not invented routes.

## Canvas and coordinate system

- Panorama: `assets/environments/tunnel-well-panorama-s3-v1.png`, 1672 × 941 actual source pixels.
- Central art reference: source rectangle `(196,110.5,1280,720)`, exact 16:9. Full/base factors **1.30625 horizontally / 1.306944 vertically**, within 1.25–1.35. Extra canvas totals 30.625% width and 30.694% height: 196 pixels on each side, 110.5 above and below. This means about 15.3% of the base dimension on each side, not 30% per side.
- Source → world: uniform **2.0×**, no stretch; world bounds `(0,0,3344,1882)`. Anchors snap to the two-world-pixel grid. New interior mapping does not modify the approved riverbank mapping.
- Principal art frame is a composition reference. Planned active upper-corridor 16:9 shot uses source `(266.666667,0,1066.666667,600)`: a deliberate 1.2× base zoom. Other shapes reveal painted margins or follow the measured subjects; body scale is not changed to solve resize.

## Spawns and anchors

Feet / support anchors, except the explicitly reserved shelf contact:

| ID | Source x,y | World x,y | State |
| --- | --- | --- | --- |
| A0 crawl-clear | 378,244 | 756,488 | Alice has completed exterior entry; crouched inside, then rises |
| R0 ahead | 500,260 | 1000,520 | Rabbit already ahead, watch pocketed |
| A1 lip-support | 984,314 | 1968,628 | Last loose surface support |
| R1 inner-turn | 1104,228 | 2208,456 | Rabbit visibly turns into inner corridor |
| R2 hidden | 1076,210 | 2152,420 | Rabbit covered by rooted buttress |
| A2 clear-of-earth | 1038,316 | 2076,632 | Momentum clears solid lip before downward drop |
| A3 first-drop | 1052,360 | 2104,720 | First real downward movement, “Oh!” |
| A4 slow-fall | 1088,380 | 2176,760 | Last narration / hook start |
| A5 hook-end | 1074,600 | 2148,1200 | Still falling, empty hands, looking right |
| shelf-tip | 1108,675 | 2216,1350 | Fixed first shelf |
| jar-contact-reserved | 1102.8,655.5 | 2205.6,1311 | Unused body-side reference. Current S4 neck contact is in scene-4-geometry.json. |

Sister remains seated reading at the exact **riverbank** anchor `(810,650)`, not an interior spawn. The small daylight opening is behind Alice; her crawl is completed before the whole-shot exterior/interior transition. Independent S3 export must replay the approved S2 hook once; continuous reading must not replay it.

## Walk paths and loss of support

Source waypoints, transformed uniformly to world in JSON:

- Alice corridor: `(378,244) → (520,270) → (700,278) → (820,292) → (920,300) → (964,310) → (978,313) → (984,314)`.
- Rabbit inner bend: `(500,260) → (642,272) → (822,280) → (942,278) → (1042,256) → (1104,228) → (1100,212) → (1076,210)`.
- Both use common progress knots `0,.20,.45,.62,.78,.90,.96,1`; one continuous simultaneous traversal, no alternating walks or waits. Maximum horizontal lead is 140 source pixels.
- Separate **fall path**, never a walkPath: `(984,314) → (1038,316) → (1052,360) → (1088,380) → (1084,455) → (1074,535) → (1074,600)`.
- The two authored loose earth clods are superficial rooted crust beneath the shoe. They do not remove the permanent rock face. Alice clears x=1038 before descending below it. Rabbit takes the inner route; he is never shown falling.

## Scale and poses

Terrain scale: `clamp(0.56,0.80,0.62+(sourceY−244)*0.0016)`. Actor gain: Alice 1.0, Rabbit 0.88. Reference standing heights: Alice 180 world pixels, Rabbit 122. Alice begins at 0.62; Rabbit begins at 0.568128. Scale applies once to body, props, shadows and local hand offsets.

Alice's fall scale locks to **0.732**, from her last real support at source y=314. Falling y is vertical height, not ground depth: she must not grow during descent. New authored cells are crawl-inside (168×142), support-loss (154×170), slow-descent (170×182), standing calibration (120×180, reference only), and two clods. Pose sizes share anatomical calibration; crouch and fall are not forced to standing height. Use mirrored descent to look back toward the lip and the authored right-facing pose for the shelf glance.

## Occluders and camera safety

Exact polygons are in JSON:

- Entry aperture polygon with full upper coverage source `(294,0,74,235)`, active only for crossed body portions near the lintel. Approved S2 exterior mask remains unchanged.
- Rabbit rooted buttress: measured foreground polygon plus upper coverage `(1010,0,88,240)`. Entire final sprite bounding box including ears lies inside the coverage column; dynamic traversal must be rechecked at Gate 4.
- Loose lip: foreground polygon active only for trailing overlap while clearing the edge. No disappearance through solid rock or whole-body fade on open ground.

Bounded full-viewport camera: `viewH=min(max(600,requiredWidth/(aspect−24/viewportHeight)),941,1672/aspect)`; `viewW=viewH*aspect`. Camera origin clamps inside the image while keeping required bodies visible. Normal formats preserve the baseline or zoom out into real overscan. Extreme ultrawide reaches the finite painted-width bound and reduces vertical field; this is recorded explicitly in projection metadata.

Technical reservations: 12px body clearance, 77px upper controls, caption reserve `min(300,max(180,0.30*viewportHeight))`. Paired travel and final hook have no caption. Actual DOM geometry must be retested after implementation.

The shelf remains outside all measured active shots before the final hook. Hold the prehook framing for 0–1200ms, then smoothly interpolate to the measured end framing during 1200–3000ms. Fixed jar top appears first, then shelf lip. Hook actor points: `(1088,380)` at 0ms, `(1084,455)` at 1200ms, `(1074,535)` at 2400ms, `(1074,600)` at 3000ms. S4 inherits the exact final state; no jar pickup in S3.

## Evidence and approval boundary

Evidence under `.artifacts/alice-in-wonderland/scene-3/`: measured board, normalized pose plate, static 16:9/9:16/phone/square projections, `projection-audit.json` (4570 samples, 10 layouts, zero failures), `continuity-audit.json` (3050 prehook frames without premature shelf), `atlas-audit.json`, and isolated reusable `character-art-check.json` (48 walking textures, two portraits, six normalized cells, zero reported issues). All 19 approved runtime/asset hashes remain unchanged.

These historical checks validate the art proposal and source geometry. **They are not runtime, physical-phone, Safari or MP4 certification.** Current S3 runtime evidence is under `.artifacts/qa/alice-in-wonderland/scene-3/`; its Gate4 verdict identifies the tested source version, layouts and newly encoded MP4.

## Authorized implementation supplement

The first S3 action continues the exact S2 partial-entry pose at `(1610,466)`.
At the unchanged depth factor0.701333333, its202world-pixel-wide pose has a
70.834667world-pixel half-width. Complete exterior clearance derives from the
approved aperture's maxx1685 plus that half-width and2world-pixel guard, rounded
outward to the two-pixel grid: **`(1758,466)`**. This is a body crossing the
occlusion plane, not a new walkable path through visible hedge terrain.

The continuation mask uses the original normalized riverbank pixels, subtracts
the unchanged aperture, then intersects the existing x1620 crossing plane through
the full remaining image width/height. It covers the total sprite, never its
still-exterior legs. It replaces the old rim during this action, avoiding double
alpha at the aperture. The camera starts at the exact final S2 frame and follows
continuously toward the union with the clear-entry pose. A140ms already-occluded
settle frame ensures the subsequent700ms whole-shot dissolve captures a fully
crossed entrance. Sister/book, mouth size and existing coordinates are unchanged.

Rabbit route timing uses its approved common progress knots in one continuous
action. Foreground coverage activates at the measured R1 inward turn (progress
0.90), then remains over the final inward steps, preventing an early disappearance
and later reappearance. The full-height coverage includes ears.

`cameras.hookEndRevealBoundsSource = [1108,641,1210,686]` formalizes the exact
approved source-art projection rectangle from `measure.py`. Arrival bounds derive
from the measured aperture and complete standing bodies. Loss/drop framing uses
the union of approved A1/A2/A3 poses; future dialogue space is established before
the line. The last narration frame is retained through export caption fade and
the first1200ms of the hook, followed by its approved reveal interpolation.

## Current S4 edge-contact correction

User-authorized correction20October2026 supersedes the older incoming shelf/jar coordinates above. S3 hook waypoints are now(1088,380) ->(1084,455) ->(1074,535) ->(1074,600). The first jar is a single separate normalized prop at source base(1112,666), at the accessible left tip. Its former baked footprint is always empty in both scenes; there is no pickup-time background cut. S4 inherits the exact frame. Current canonical JSON and edge-correction QA take precedence over earlier boards/verdicts.


S4 constant-zoom correction: the S3 hook-end target shares the viewport-specific S4 zoom plan; S3 performs its existing gradual hook camera movement to that target. Its routes, durations, shelf and jar position remain unchanged. S4 then keeps exactly that zoom through all text/actions and the final hook.
