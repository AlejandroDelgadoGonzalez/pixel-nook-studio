# MEASURED ART BOARD / S2 — Under the Hedge

## Current upper-roof occlusion correction — 20 October 2026

The approved v6 panorama, mouth, earth rim and every route/support coordinate remain unchanged. The runtime occluder now repaints the full source column **[1230,0,74,248]**, derived from the measured outer-rim x span and bottom, with the same aperture subtracted. This extends coverage through all foliage above the roof so tall ears, hair or hats cannot reappear above the old finite rim polygon. Alice retains the existing **world x1620** crossing plane, preserving exterior legs. These are invisible background-pixel overlays, not painted changes or a solid-color rectangle. `occluders[0].roofOcclusion` records the extension; the older finite-polygon predicate is superseded. A regression reproduces the original leak in49 sampled frames and passes with zero after the fix; active sprite/mask alpha is checked at10ms intervals, plus full upper-column coverage. Evidence: `.artifacts/qa/alice-in-wonderland/roof-clip/` and the reusable `qa/checks/low-roof-occlusion.mjs`.

## Current v6 hedge integration — 20 October 2026

The approved v5 small mouth, complete earthen rim, threshold **B=(1632,464)**, Alice supports **(1610,470)/(1610,466)**, all masks, routes, scales and world mapping are unchanged. Active asset is now `riverbank-panorama-v6.png`, **1881×836**, SHA-256 **7fb0bd46cc4b118a4951351c93d31601673130b29d4f1afafeda1edf93d8f7b7**. Only the foliage/soil surrounding the previous visible join was repaired with imagegen and integrated through texture-following joins. The approved mouth and full rim are pixel-exact from v5. Evidence: [local detail](../../../.artifacts/alice-in-wonderland/hedge-seam/after-detail.png), [preservation measurements](../../../.artifacts/alice-in-wonderland/hedge-seam/integration.json), [exact imagegen prompt](../../../.artifacts/alice-in-wonderland/hedge-seam/imagegen-prompt.md). Runtime QA is stored in `.artifacts/qa/alice-in-wonderland/hedge-seam/`. The v5 measurements below remain authoritative for every coordinate and contact; v6 supersedes only the selected image and its hash.

## Current v5 smaller burrow — 20 October 2026

Alejandro authorizes this scene-specific correction through implementation and QA in the main thread. Active panorama: `../assets/environments/riverbank-panorama-v5.png`, **1881×836**, SHA-256 **1d4a2bf19df6118776e6c77b8d3226c49dc270c94d58e3a69167b96cdebc3962**. It uses the original uniform **2.5** world mapping and translation **(-1535,-148)**. Built-in imagegen repainted the smaller opening and surrounding hedge; only its local generated polygon was integrated. **Zero RGB pixels outside that polygon differ from v4.** No atlas or general art rule changed.

Actual connected dark aperture: source **[1241,208,50,35]**, world **[1567.5,372,125,87.5]**, 1204 source pixels. This is lower than Alice's **127.2** standing height here; the authored torso-entry is **85.5627** high. The JSON contains the retraced conservative aperture and outer rim polygons.

Current threshold **B=(1632,464)**, source **(1266.8,244.8)**, on the dry path immediately in front of the mouth. Rabbit approaches **(1500,500) → (1600,480) → B**, turns inward, then enters via **(1632,454) → (1632,432)**. Alice's final walking/kneeling support is **(1610,470)**; hand and torso supports **(1610,466)**. Factors **0.7066667 / 0.7013333** follow the existing measured depth curve. The crossing plane remains **x=1620**. New real-alpha rim measurement: **1420** forward samples covered and **0 of 5774** trailing lower-body samples covered. Legs remain outside.

Canonical current records: [geometry JSON](scene-2-geometry.json), [pose board](../../../.artifacts/alice-in-wonderland/small-burrow/measured-entry-board.png), [measurements](../../../.artifacts/alice-in-wonderland/small-burrow/geometry-measurements.json), [pixel preservation](../../../.artifacts/alice-in-wonderland/small-burrow/art-integration.json), [exact imagegen prompt](../../../.artifacts/alice-in-wonderland/small-burrow/imagegen-prompt.md). Runtime QA is recorded separately in `.artifacts/qa/alice-in-wonderland/small-burrow/`.

Everything below records the historical v4 proposal/measurements. Its aperture, endpoint and hook contact values are superseded by this v5 section and current JSON. The previously approved simultaneous pursuit, earlier routes, fixed reading sister and scene timing remain unchanged.

## Authorized depth and continuous-motion correction — 19 October 2026

This current measurement supersedes the alternating first-leg/tall-window stops described in the initial proposal below. The approved background and atlas source bytes remain unchanged. Rabbit first advances to **(1110,470)**, then waits while Alice rounds the fixed sister along the existing route to **(900,448)**. Immediately on reaching that existing path waypoint, Alice and Rabbit advance **simultaneously in one uninterrupted action** to **(1170,492)** and **(1380,510)**. Intermediate points **(1050,476)** and **(1260,500)** are path samples, never stops. `walkPaths` contains the four measured route subdivisions; there is no alternate actor choreography for narrow windows.

`cameras.trackingPaths["s2-paired-path"]` interpolates the measured `tall-first` and `tall-third` required rectangles and preferred centers using **t=(Alice.world.x−900)/270**, clamped to [0,1], before responsive full-viewport fitting. This explicit continuous tracking phase lets the sister naturally leave through the edge of a narrow viewport; her world position, visibility and reading pose stay unchanged. Captions stay clear during motion. At the stopped dialogue she must be fully outside or wholly fitted in a broad view. This resolves the impossible combination of the original wide group and a 320×1080 viewport without creating terrain, adding bars or alternating actor stops.

Depth is measured in `depthScaling` in both geometry files. Define **f(y)=clamp(0.5,1.1,0.68+(y−450)×0.32/240)**. Render **f(actor.y)/f(actorReferenceY)×actorGain**, around foot origin **(0.5,1)**, after anatomical pose normalization. Alice reference y690, gain1; sister y650, gain1 and fixed; Rabbit y452, gain0.88. NOOK authorized the moderate Rabbit calibration to preserve its naturally smaller silhouette after Alice acquires perspective. The normalized Rabbit122 texture remains unchanged: actual height107.36 at its S1 stop. Apply factor once to bodies, shadows, prop dimensions and local hand offsets. Pose changes never reset it.

Alice scales **1.0 at y690 → 0.664 at y438 → 0.677333 at y448 → 0.736 at y492 → 0.76 at y510**. At the paired stop her standing height is **132.48**, Rabbit **119.52**; conservative walking widths are **100.096 vs 76.414** and bounding-box volumes differ by **1.45×**. These are sprite projections, not anatomical depth inferred from a camera zoom.

The hook keeps its measured supports. Kneel **(1610,478)** uses factor0.717333 and real footprint88.949×116.208; hand/entry **(1610,474)** use factor0.712, sizes116.768×102.528 and143.824×86.864. Forward grounded hand contacts become **(1638.48,474)** and **(1654.144,474)**. The real x1620 crossing-plane mask covers **655** forward opaque texture samples and **0 of 5526** trailing lower-body samples: legs remain outside. Original unscaled contact records are retained only as anatomical reference.

Evidence: [scaled entry contacts](../../../.artifacts/alice-in-wonderland/depth-motion/scaled-entry-contacts.png), [depth measurement](../../../.artifacts/alice-in-wonderland/depth-motion/depth-measurements.json), [continuous camera projection](../../../.artifacts/alice-in-wonderland/depth-motion/tracking-projection.json). Dense source-geometry measurement: **6020 actor projections**, ten formats including 320×1080, 301 progress samples each, zero geometric failures with conservative dialogue reservations. This is 03 source evidence, **not independent runtime certification**; 05 must verify actual rendered alpha, viewport and DOM dialogue.

03 Pixel Art Director → NOOK → Alejandro · 19 October 2026 · **Script and measured routes approved by Alejandro. New authored poses measured; direct implementation authorized.** S1 has been approved by Alejandro and stays unchanged.

The proposal is [scene-2-geometry.json](scene-2-geometry.json). The selected panorama and every sprite/prop are the **already approved S1 assets**, with their SHA-256 fingerprints recorded there. Source **1881×836**, uniform world mapping **x=sourceX×2.5−1535, y=sourceY×2.5−148**, painted bounds **[-1535,-148,4702.5,2090]**. The new overscan rule applies to future new panoramas; this delivery does not recreate this approved background.

## Review images

- [MEASURED ART BOARD / S2](../../../.artifacts/alice-in-wonderland/scene-2/measured-art-board-s2.png): real approved background, existing approved sprites, route lines and support markers. This is a technical proposal, not implemented story.
- [Travel 9:16](../../../.artifacts/alice-in-wonderland/scene-2/measured-travel-9x16.png) · [Travel 16:9](../../../.artifacts/alice-in-wonderland/scene-2/measured-travel-16x9.png).
- [Entrance 9:16](../../../.artifacts/alice-in-wonderland/scene-2/measured-entrance-9x16.png) · [Entrance 16:9](../../../.artifacts/alice-in-wonderland/scene-2/measured-entrance-16x9.png). Alice is shown **before** the hook; the amber marker names the missing entry pose instead of inventing one.
- [Rabbit back pose inside actual aperture](../../../.artifacts/alice-in-wonderland/scene-2/rabbit-aperture-alpha-measurement.png) · [Source/alpha contact measurements](../../../.artifacts/alice-in-wonderland/scene-2/contact-and-aperture-measurement.json).

## Exact continuity and routes

Alice starts **(680,690)** standing, Rabbit **(990,452)** ready with watch pocketed, sister **(810,650)** seated reading. Her book stays owned and attached at **(820,616)**. No reset, dissolve, hidden traversal or waiting-actor repositioning. Preserve the exact S1 camera at the boundary, then widen separately with everyone stationary before the first walk. Clear captions for movement.

| Route | Ordered world supports | Length |
| --- | --- | --- |
| Rabbit first leg | (990,452) → (1110,470) → (1260,500) → (1380,510) | 394.729 |
| Alice joins path | (680,690) → (660,690) → (660,460) → (750,438) → (900,448) → (1050,476) → (1170,492) | 766.636 |
| Rabbit to opening | (1380,510) → (1500,500) → (1600,480) → (1658,472) | 280.945 |
| Rabbit through opening | (1658,472) → (1632,454) → (1632,432) | 53.623 |
| Alice follows | (1170,492) → (1260,500) → (1400,510) → (1500,500) → (1560,484) | 393.307 |
| Hook arrival | (1560,484) → (1610,478) | 50.359 |

The initial westward/uphill Alice leg uses short dry grass before joining the actual ochre path. Keeping x=660 until her feet reach y=460 puts her entire body above the sister before she turns east. **14,544** sampled source-alpha comparisons (606 supports × 24 walking frames/directions) show **zero Alice/sister opaque-pixel overlap**; the first padded walking canvas boxes nearly touch, so this is an actual-alpha result, not a claim of large bounding-box clearance. After the westward step conservative body-box gap is 17 world units. Feet avoid the real tree roots; Alice may appear in front of the rear trunk while using the path below it. That is depth, not a route through the trunk.

Travelers move in separate legs so the Rabbit remains ahead and no paths cross an occupied body. Proposed pacing should respect distances: Rabbit first leg around 2.5–3 s, Alice’s longer joining route around 5 s, later Alice follow around 2.5–3 s. Turns use the appropriate real direction; these are pacing proposals, not implemented timings.

## Cameras and narrow-window sublegs

Main travel required rectangle is **[594,258,825,434]**; entrance **[1104,290,640,222]**. Both fit the measured panorama and a conservative bottom dialogue reservation at 360/390/430×844, 720×1280, 1280×720, 800×800, 500×900, 1600×900 and 2560×480. Technical boards reserve **188 px portrait / 130 px landscape**, plus **12 px** fitting padding. Actual `#dialogue`, controls, resize continuity and pixel-edge coverage still require Gate 3/4 browser QA. Camera rectangles are responsive constraints, not rigid letterboxes.

**320×1080 cannot fit the entire broad travel or entrance shot at once** while respecting the painted bounds. The JSON records this failure instead of declaring universal coverage. For that tall format, use these **proposed extra stopped sublegs on the same measured routes**:

1. Held rectangle **[594,258,555,434]**: Rabbit stops (1110,470), Alice follows to (900,448). Sister remains visible/fixed in the first shot.
2. Both stop; reframe to **[834,258,465,244]**. Rabbit advances to (1260,500), Alice follows to (1050,476). Sister stays in world; she may be offscreen.
3. Both stop; reframe to **[984,296,435,216]**. Rabbit reaches (1380,510), Alice reaches (1170,492); the exact “Wait, please!” line still occurs with both visible.
4. Both stop; reframe to **[1104,290,435,222]**. Rabbit reaches (1500,500), Alice catches up to (1400,510), using existing route waypoints.
5. Both stop; reframe to **[1334,290,410,222]**. Rabbit completes his entry while Alice waits (1400,510). “Just a little farther.” still follows his entry, then Alice completes the remaining approach and hook.

All five tall rectangles mathematically fit 320×1080 using the same painted panorama. These sublegs need joint script/route review and implementation QA; do not improvise camera following, move the sister or crop a required body to hide the constraint. More extreme arbitrary ratios may need additional measured stopped sublegs; no finite panorama guarantees every imaginable viewport without constraints.

## Real aperture, foreground coverage and poses

The actual opening is approximately **[1560,337,155,135]**, with threshold **(1658,472)**. JSON records a conservative inner source polygon and exterior rim polygon traced on the magnified v4 image. The foreground proposal repaints the original panorama’s rim pixels outside the aperture over the actor only after crossing; no flat rectangular hedge overlay, whole-body hiding or unmeasured alpha mask is authorized. Final alpha/stencil implementation must be audited against actual pose silhouettes.

**Rabbit can reuse approved `back` art unchanged.** His real normalized silhouette is **62×122**. At **(1632,454)**, **5,908/5,908** opaque pixels lie over actual dark source pixels (inspection aid R<90/G<75/B<65). At the deeper **(1632,432)**, **685** pixels pass behind the upper rim, while **5,223** remain over the darkness. This supports a short actual inward step and final covered fade; it does not authorize vanishing on open ground. Watch remains pocketed. A new crouched Rabbit drawing is unnecessary.

**Historical art gap (resolved below):** approved Alice `rising` is genuine low hand-supported art and may be reviewed for kneel/support reuse, but the atlas has **no forward torso-entry pose with skirt/knees/lower legs remaining outside**. Do not squash/rotate her standing sprite or claim the rising pose demonstrates crawling. Hook hand contact near **(1640,474)** and partial-ingress support near **(1638,474)** are **proposed targets**, not final authored contact measurements. The missing authored entry pose and its precise rim/hand contacts need review before implementing the hook. The board explicitly marks this gap.

Hook remains exactly **3,000 ms**: final short step 600 ms; kneel 850 ms; hand contact 600 ms; torso begins entry 950 ms. Legs remain outside in the final frame; no interior or fall. This script timing is fully specified, but the last keyframe is not falsely presented as approved art.

## Limits and stop

These are source measurements and technical projections only. No S2 chapter/renderer/manifests, sound, scene QA or publication was created. S1 assets, stage geometry and runtime files remain unchanged. Prior S1 crop audits apply to unchanged reused sprites; they do not certify the missing interaction or the proposed rim. Alejandro reviews the script, measured routes, tall-format sublegs and the explicit Alice-pose gap before Gate 3.


## 19 October update — authored hook poses delivered

Alejandro approved the five-moment script and measured routes, replaced the line with **“Wait, please!”**, and explicitly authorized 03 → 04 → 05 directly once the real entry poses were ready. The previous proposal/gap language above records the prior state; this update resolves it.

- Production asset: `../assets/atlases/alice-s2-entry-v1.png`, **2172×724**, SHA-256 `bd9e5a57c97897b1e638a2868692bef98f12e08c8836dac8c9aee1a972594195`. Built-in ImageGen, original output copied unchanged. Original S1 atlas, sprites and panorama v4 remain untouched.
- Separate measured cuts: [scene-2-atlas-cells.json](scene-2-atlas-cells.json). The standing reference538 source pixels corresponds to Alice180world. One anatomical scale yields **kneel124×162, hand164×144, entry202×122** on the shared two-world-pixel grid. Do not force these interaction poses to standing height. No squashing, rotation or fake crawling.
- All three crops have actual transparent gutters and **one alpha component**. Complete shoes, knees and hands inspected on the [normalized contact sheet](../../../.artifacts/alice-in-wonderland/scene-2/entry-art/normalized-entry-contact-sheet.png). Alpha>80 is hardened by the existing drawCharacter helper; no source image cleanup.
- **Kneel anchor(1610,478)**; **hand anchor(1610,474)**, visible palm ground contact **(1650,474)**; **entry anchor(1610,474)**, advanced palm **(1672,474)**. The previous target contacts1640/1638 were provisional and are superseded by these authored measurements. The approved final walking route still ends(1610,478); lowering4world during articulation is measured support, not a new walk route.
- Real foreground rim polygons remain unchanged. Apply it to Rabbit only inside the opening as measured previously. For Alice, apply it only during `burrow-entry` and only to the portion **worldX≥1620 (sourceX≥1262)** which crossed the entry plane. The trailing knees/legs remain foreground. A blanket mask over the full Alice sprite wrongly hides her outside legs and is prohibited.
- Final pose has **14,296 opaque world pixels**, **1,631** covered by actual rim, and **4,186 trailing lower-body pixels**, **zero covered**. This is partial entry with legs visible, not a fall or complete disappearance. [Measured entry board](../../../.artifacts/alice-in-wonderland/scene-2/entry-art/measured-entry-board.png) shows all three true poses over the actual aperture.
- Body union **[1509,298,202,180]** across standing through hook is contained by the approved entrance rectangle. Conditional safety rectangles for any still-visible fixed sister/book are recorded in JSON; deriving their union from actual measured poses is allowed, moving/hiding her is not.

Source measurement and visual inspection are complete. Actual renderer `character-art`, DOM/dialogue, camera, moving ingress mask and MP4 checks belong to 04/05 and are not claimed passed by these technical boards. Exact hook timing remains **600+850+600+950=3,000 ms**. No S2 runtime was written by 03.
