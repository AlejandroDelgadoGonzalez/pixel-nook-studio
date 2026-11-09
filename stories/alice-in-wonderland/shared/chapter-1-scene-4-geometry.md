# Drink Me — measured S4 art / geometry proposal

Gates1/2A approved22October; implemented and explicitly corrected25October2026. Current rules below supersede the initial planning budget and tracking-camera proposal.

Canonical runtime data: `chapter-1-scene-4-geometry.json`, `chapter-1-scene-4-atlas-cells.json`, `chapter-1-scene-4-pixel-density.json` in this directory. Do not confuse them with the historical `scene-4-geometry.json` for the old well segment.

Approved Hall reused byte-for-byte: source 1664 × 936, uniform world mapping ×2, world 3328 × 1872. Source table bounds [792,626,112,64]; front supports finish at y690. Key ring remains [804.000029,637.985847], bottle initially [875,639], gathered curtain [906,414], closed door at [926,474].

| Anchor | Source feet (x,y) | Use |
| --- | --- | --- |
| H3-table | 782.1265,690 | Exact S3 inherited logical position; current raster snaps world x to1564. |
| S4-bottle-take | 907.520389,690 | Empty-hand neck contact; shoes and table feet share y690. |
| S4-open-floor | 970,700 | Set bottle down; uniform magical shrink at fixed feet. |
| S4-small-door | 948,488 | Compare small body against closed door; never cross its leaf. |
| S4-glass-attempt | 901.379136,690 | Fingers touch right leg; lip/key remain beyond reach. |
| S4-box | 875,698 | Final kneeling pose in front of table supports; same foot root for crouching/lifting. |

The single empty bottle rests at source [933.509815,700], with its normal depth scale preserved. Alice shrinks uniformly 1.00 →0.32, separate from depth scaling, with zero camera zoom change. Her small body at the door is about24.65 source pixels high versus the34-pixel aperture. At the glass, hands remain more than20 source pixels below the front lip: the failure is visible rather than declared arbitrarily.

The closed casket is physically small:28×16 reference-world units, measured relative to Alice's180-unit anatomical standing reference. Its base is fixed at source [856.4484011940299,690], centrally beneath the table, from the first Hall frame in S3 through S4. Both scenes reuse the same closed-box sprite, texture, scale1.14 and coordinates. There is no push or transport: Alice approaches across the free front floor and opens it during the three-second hook. Former transport passage IDs retain their quiet discovery pauses for save compatibility.

Final authored kneeling high-arm pose clears every table support in its lower support band:0 opaque overlap pixels. Its selected skin pin is0.312 source pixels from actual opaque lid pixels. Open lid remains attached at the rear rim; cake stays within the box footprint and is never eaten in S4. These are static composition measurements, not a certification of the full opening animation.

Three new atlases contain8 Alice poses and7 props/variants,15 measured cuts total. Original generations, rejected bottle alternatives, prompt set and normalization reports are in `.artifacts/alice-in-wonderland/chapter-1-scene-4/`. Each generation attaches the immutable original Odyssey master. `qa/pixel_density.py` normalizes only these new atlases using68 logical samples per180-unit reference body, proportional samples for crouches/props, nearest-neighbor and hard alpha. Approved art is excluded from normalization.

Locomotion uses the approved Hall profile exclusively: walkSpeed235 / runSpeed650, with measured ground-depth scaling and magical body scale applied once. All S4 paths use walk; small Alice walks at32% of the corresponding full-size speed. Segment durations are analytical distance/depth integrals. Vertical-dominant segments face up/back or down/front; ties and horizontal-dominant segments face left/right. No new speed, waypoint easing or forced orthogonal path policy.

`MEASURED ART BOARD / S4` includes the full panorama/routes plus eight static states. The shrink strip uses identical source crops before/after. Phone art studies use the measured390px inherited reference zoom for width comparisons; they are static composition proofs, not real S4 DOM/viewport certification. Exact per-layout camera, manual/automatic reading, save reconstruction, all motion and independent export remain Gates3/4 work after approval.

The historical first-creation authoring budget was69.9266s. The55–85s acceptance band applies only to initial creation; these authorized revisions report actual Automatic Reading duration without enforcing that band or trimming dialogue or existing pauses. MP4 duration never determines acceptance. The final hook is exactly3000ms without text.

Evidence: `gate-2a-art-check.json` (static geometry), `pixel-density-check.json` (new atlases), `character-art-check.json` (isolated15cuts /56walking textures), all in the S4 artifact folder. Existing released story regression: `.artifacts/qa/alice-in-wonderland/s4-gates-1-2a-regression/` —5 chapter/layout cases,0errors,0missing resources.61 original story/master sources remain byte-identical. That evidence describes the historical Gate2A snapshot; the current approved implementation contains4 released scenes.

##25October2026 authorized correction

Hall walkSpeed235, corridor350 unchanged. Multiply by magical size0.32 for small Alice. Use shared/hall-locomotion.json calibration. Add600ms after first door and unlock; bottle uncork1800ms, sip2200ms, lower1800ms, floor placement2400ms. No prior dialogue/pause/action is shortened. First-creation55–85s gate does not apply to this correction.

One fixed room frame established at the end of S3 and reused through every S4 beat; world envelope[1467,880,2015,1468]. The corrected front approach runs through source[830,740] and[907.520389,740]. Open-floor anchor[970,700] and bottle base[933.509815,700] retain their supported hand pin. The small return passes through[994,738] and[920,738], below the bottle silhouette. The box approach uses[910,716],[875,716],[875,698], clear of the feet of the table. This historical compact top/side caption workaround was removed on28October2026; UI Layout Lock preserves the original lower centred card. Key texture/frame/origin/scale/rotation/flip/alpha/world position are frozen at the S3 resting state, independent of actor walking.

## Support planes and stationary central box — authorized correction

The table, resting key, resting bottle and resting cork share source groundY690 / world depth1380. Alice uses actual raster feetY as depth, so passing in front of the table places her in front of all its props. Table foreground pixels are copied exactly from the approved panorama using the measured opaque runs in S3 geometry; no rectangular floor patch or altered panorama is introduced. Floor bottle depth is its baseY1400; carried props follow the owner's support plane. The central box uses its baseY1380, with only local ordering for the open lid/cake. QA checks actual display-list order, opaque sprite intersections along the small walking routes, and the fixed central box throughout both scenes.

## 28October2026 — UI Layout Lock

Original bottom-centred dialogue restored, with exactly the same dimensions and typography as S1. Fixed room envelope source[733.5,414,1007.5,740], world[1467,828,2015,1480]. Eight screen pixels above, twelve-pixel minimum reservation before the standard lower card. Same fixed camera from final S3 throughout S4/S5; no per-beat changes. Approved panorama, character/prop geometry, text and durations unchanged. Alejandro explicitly selected usual sizes rather than expanding art for extreme proportions. Tested usual layouts:360x800,390x844,430x932,1366x600,1366x641,1536x730,1440x760,1920x947,1920x1080,800x800,720x1280. See .artifacts/qa/alice-in-wonderland/ui-layout-lock/.
