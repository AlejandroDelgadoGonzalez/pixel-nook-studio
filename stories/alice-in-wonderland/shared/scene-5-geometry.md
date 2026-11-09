# S5 measured geometry: Solid Ground

Gates 1/2A proposal; main thread only. Canonical data: [scene-5-geometry.json](scene-5-geometry.json). No S5 runtime implementation.

## Coordinates and continuity

S5 source = S4 source minus(48,974). World = 2*(S5 source +[48,974]). The inherited seated foot anchor is source(1032,690), world(2160,3328), scale0.732. Existing seated-braced S4 pose, empty hands and original landing pixels are retained. The inherited fixed jar is source(1066,170), world(2228,2288), on the lower shelf.

| Anchor | S5 source | World | Perspective scale |
| --- | --- | --- | --- |
| A0-seated-s4 | (1032, 690) | (2160, 3328) | 0.732 |
| A1-standing-safe | (1032, 690) | (2160, 3328) | 0.732 |
| A2-leaf-edge | (1220, 740) | (2536, 3428) | 0.774 |
| A3-clear-floor | (1510, 740) | (3116, 3428) | 0.774 |
| A4-corridor-near | (1800, 740) | (3696, 3428) | 0.774 |
| A5-observe | (2160, 650) | (4416, 3248) | 0.6982222222222222 |
| R0-side-passage | (2150, 440) | (4396, 2828) | 0.525 |
| R1-visible-line | (2200, 520) | (4496, 2988) | 0.593 |
| R2-clear-corridor | (2380.741, 615.333) | (4857.482, 3178.666) | 0.6689478667 |
| R3-bend-approach | (2605.926, 576) | (5307.852, 3100) | 0.6371 |
| R4-turn-visible | (2820, 454) | (5736, 2856) | 0.5369 |
| R5-behind-corner | (2940, 442) | (5976, 2832) | 0.5267000000000001 |
| J1-inherited-fixed | (1066, 170) | (2228, 2288) | None |

## Panorama and overscan

The panorama is3344x942: two adjoining1672x942camera territories, each surrounding a1280x720central16:9composition. Each territory has196px lateral and111px upper/lower genuine painted margin:1.30625x width and1.30833x height. The total width is corridor travel, not overscan for one frame. No stretched/duplicated texture. World bounds(96,1948,6688,1884). Imagegen supplied the new corridor and removed the low root blockage; an irregular minimum-error2x2assembly retains the immutable landing at left. Cropping removed only generated white outer letterbox, not playable terrain.

## Walk paths and depth

- alice-leaves-to-observation: (1032, 690) -> (1220, 740) -> (1510, 740) -> (1800, 740) -> (2160, 650)
- rabbit-visible-arrival: (2150, 440) -> (2180, 480) -> (2200, 520)
- rabbit-corridor-to-corner: a smooth cubic from (2200,520), controls (2340,700)/(2630,600), to (2820,454), followed by a cubic with controls (2850,430)/(2890,442) to the unchanged hidden endpoint (2940,442). The JSON records all 33 sampled points and exact world coordinates.

Alice walking is complete before the Rabbit entrance. She stays at A5 throughout his exit and camera return. Each walk is one uninterrupted arc-length traversal; named waypoints are geometric bends, not pauses. Explicit following shots are in the script. Never implement alternating character steps. The Rabbit's revised yellow curve bows over open dirt to maximum source y616.715, away from the wall and above the foreground rock. It retains the 5200ms continuous exit, arrival, speaking point and full-height corner cover. Depth scale grows gradually toward the foreground part of the curve and shrinks again toward the corner.

Apply one continuous ground-y interpolation to both actors: [[400, 0.49], [440, 0.525], [520, 0.593], [600, 0.656], [690, 0.732], [740, 0.774], [800, 0.825]]. Alice standing body180world, Rabbit122world. Natural species size is separate from the shared perspective factor. Alice grows slightly when approaching the foreground bend and shrinks while going deeper to A5; the Rabbit shrinks toward his corner. Shadows and all pose pivots share this factor.

## Full-height physical occluder

The actual near root corner has a measured polygon in JSON extending all the way from y0 to y942. Reuse exactly those backdrop pixels as a foreground mask. The left silhouette follows the physical rock, with no artificial roof cap. Entry begins at an authored side-passage opening; exit ends fully behind the root at source(2940,442). Test every opaque pixel including ear tips and all shadow pixels through and after occlusion. There is no Alice passage through this occluder in S5.

## Camera / caption / boundary

At any fixed viewport/safe area inherit S4 final zoom and hold it for the complete scene. Only camera center moves for the two scripted follow shots and Rabbit-to-Alice return. Safe source coverage[0,0,3344,942]; half-width=w/(4z), half-height=h/(4z). Clamp safe centers inside the panorama before interpolating. Protect whole speaking actors and actual dialogue bounds; all walking and final closure have text cleared. Waiting Alice retains her world position even when camera follows Rabbit out of her view.

The common extended ground plate must be integrated into S4 close and S5 open during the later authorized implementation so full-frame continuity can be verified in every format. Existing S4 production files are frozen at this proposal gate; the landing pixels and pose already match. This is an explicit integration acceptance criterion, not a claim that unimplemented runtime continuity has passed.

## Assets and audits

Four new authored rise/steady/brush poses in alice-s5-rise-v1.png. Reuse S4 seated-braced, S1 walking profiles and the approved Rabbit. All inherit exact68reference body samples; Rabbit retains its calibrated smaller natural height. Panorama operational grid2x2 at720design height. See scene-5-pixel-density.json and scene-5-atlas-cells.json. Read-only checks, source preservation, full-height mask probes, static camera projections and isolated common-renderer atlas check are in `.artifacts/alice-in-wonderland/scene-5/`. Full scene, resize, saved state and MP4 QA belong to Gates3/4 after approval.

## Requested review adjustment: wall clearance

Moment4 Rabbit line is now `Late! Still late!`. The last two Alice route anchors are A4 source(1800,740) and A5 source(2160,650), world(4416,3248). The observation point moved70source pixels right and50down from(2090,600); the preceding bend is40source pixels lower. This gives the final approach more open floor and more space from the left wall. Ground depth automatically updates final scale to0.6982222222222222. The route remains one continuous walk, with no extra stop or changes to the Rabbit path. All16analytical camera layouts and1280composition probes pass after the adjustment.


## Gate3 camera integration

The common approved ground plate is now assembled in the S4 background canvas before either scene is drawn. S5 reuses that exact left canvas and the existing settled leaf sprites, with the new corridor continuation behind it. This avoids nearest-neighbor phase differences between separately anchored canvas surfaces. The source PNGs and S4 landing actions remain unchanged.

At extremely short/narrow client sizes where the two-actor vertical union cannot fit between the toolbar and caption at the inherited fixed zoom, the caption-clear reframe focuses the Rabbit alone for his line. Alice remains fixed at the approved A5 anchor wholly outside the left frame; the standard phone/9:16 shot retains both actors. This is a viewport fallback, not a route or narrative change. It prevents toolbar/body collisions without moving actors or changing zoom. The camera returns to Alice after the Rabbit disappears.

The root foreground uses exact same-source2x2hard-alpha pixels, prepared through one image-data raster operation before playback. Deferred source-canvas paints are resolved before the export clock begins. No art pixels, route coordinates, scale knots or action durations change for this performance preparation.

### Common plate top-edge correction

The first two source rows of the S5 painting contain a light horizontal crop gutter in the right shaft wall. When assembling the common S4/S5 canvas, use measured `s4IntegrationSourceBounds=[0,2,1672,940]` at destination `(48,976)` instead of importing that gutter at y974. The existing continuous shaft rock remains underneath the excluded rows. All source PNGs, registration, shelves, leaf contact, actor anchors and camera plans remain unchanged. Verify the exact S4 passage `alice-c1-s4-stay` ("You had better stay here.") and pixel-identical S4/S5 continuity.
