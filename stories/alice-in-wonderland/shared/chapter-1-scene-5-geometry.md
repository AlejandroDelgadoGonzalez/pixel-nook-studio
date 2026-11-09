# Eat Me — measured S5 geometry

Alejandro approved Gates 1/2A on 28 October 2026 with two spatial corrections: the open central box remains visible; Rabbit stops on the left. Gate 3 is authorized for this scene only. NOOK performs all roles sequentially in the main thread.

Canonical files: chapter-1-scene-5-geometry.json, chapter-1-scene-5-atlas-cells.json and chapter-1-scene-5-pixel-density.json. Registered in the chapter and stage registry. Historical scene-5-geometry.json concerns the old well sequence, not Eat Me.

The approved Hall panorama is unchanged: 1664x936 source maps uniformly to 3328x1872 world. All beats inherit S4's final camera x/y/z for the actual viewport. Zero beat reframing or dissolves.

| Anchor | Source x,y | World x,y / purpose |
| --- | --- | --- |
| Inherited Alice | 875,698 | 1750,1396; exact S4 final frame, body 0.32 |
| Growth and giant poses | **915,720** | **1830,1440**; feet right/down of box |
| Box base | 856.448401,690 | 1712.896802,1380; fixed open base and lid |
| Key ring | 804.000029,637.985847 | 1608.000059,1275.971694; inherited pin |
| Tear impact | 888,734 | 1776,1468; free floor before shoes |
| Rabbit entry to stop | **700,535 to 760,535** | **1400,1070 to 1520,1070**; left of table and Alice |

Small Alice walks 1041.919ms at walkSpeed235 times ground perspective times0.32. Rabbit walks 547.112ms at235 times perspective. His appearance continues after stopping until2000ms, then holds fully visible1000ms. Silent hook totals3000ms. Rabbit faces right toward Alice; Alice faces left toward him. RunSpeed650; no third speed or easing. Orientation follows the45degree slope rule.

Growth:0.32 to1.10 in3000ms, dialogue, then1.10 to1.50 in2000ms. Feet remain1830,1440. Empty raised hands clear the open lid during intermediate growth; surprise pose follows at full height. New authored leaning pose reach-key-clear-box reaches the inherited ring without covering the box. Complete shoes and calibrated opaque palm have zero source-coordinate contact error. No camera zoom simulates growth.

Support depths: table/resting key/cork/box1380; floor bottle1400; giant Alice1440; settled tears1468. Held cake/key follow the real palm and owner's support plane at physical scale1.14, independent of magical body size. Falling tears follow Alice's plane until impact. Three cumulative masks preserve existing water; no more drops after the brief cry.

Open central base/lid remain visible and fixed in all13moments. The initial tiny-hand interaction can cover part of the rim naturally; giant Alice has zero opaque overlap with either box part, including intermediate growth. Cake changes owner only after palm contact and is consumed before growth. Key returns to exact inherited resting texture/crop/position/scale/flip before crying. Bottle/cork never move.

Scene6 must inherit the open empty box, resting props, tears, giant Alice at the same feet facing left, and Rabbit stopped on the left carrying fan/gloves. This is a handoff contract; Scene6 is not implemented here.

New art:4selected atlases,7Alice poses,3Rabbit poses,4props (14measured cuts), normalized with qa/pixel_density.py against the immutable original Odyssey Golden Master:68vertical anatomical samples, hard alpha, two-world-pixel raster. Earlier approved art remains byte-identical. Corrected measured board uses actual runtime frames under .artifacts/alice-in-wonderland/chapter-1-scene-5/.

Initial Automatic Reading budget: **70.653s**, including silent3s hook. Reading duration only; do not trim narration/pauses to match MP4. Gate4 evidence: .artifacts/qa/alice-in-wonderland/eat-me/.

## 28October2026 — UI Layout Lock

Original bottom-centred dialogue restored, with exactly the same dimensions and typography as S1. Fixed room envelope source[733.5,414,1007.5,740], world[1467,828,2015,1480]. Eight screen pixels above, twelve-pixel minimum reservation before the standard lower card. Same fixed camera from final S3 throughout S4/S5; no per-beat changes. Approved panorama, character/prop geometry, text and durations unchanged. Alejandro explicitly selected usual sizes rather than expanding art for extreme proportions. Tested usual layouts:360x800,390x844,430x932,1366x600,1366x641,1536x730,1440x760,1920x947,1920x1080,800x800,720x1280. See .artifacts/qa/alice-in-wonderland/ui-layout-lock/.

29Oct2026 tear-continuity correction: cryTime800→5100 reveals the clean-blue540x112world lagoon at1470,1480, depth1300;12falling drops use the same palette. Full lagoon is fixed from alice-c1-eat-tears through allS6. No old first-tears texture is drawn. See shared JSON props.tears.lagoon and .artifacts/qa/alice-in-wonderland/tear-continuity/verdict.json.

Pacing correction: Moment9 is5250ms, linear cry clock,80successive opaque-area expansion stages; full lagoon at5100ms. Every other moment/dialogue/pause unchanged.
