# New Chapter1 Scene3 — Hall geometry

**Gate2A proposal only. No scene code or runtime registration.**

Existing opening:38.151s unchanged; shared legacy scene-5 geometry stays immutable. Hall source/world mapping: world=2*source; no source-origin offset. Full1664x936; core[192,108,1280,720]; genuine1.30x both axes,192px sides and108px upper/lower margin.

| Anchor | Source feet | World feet | Scale |
| --- | --- | --- | --- |
| H0-entry | [165, 426] | [330, 852] | 0.526700 |
| H1-first-door | [452, 476] | [904, 952] | 0.818667 |
| H2-second-door | [708, 476] | [1416, 952] | 0.818667 |
| H3-table | [np.float64(782.1265), 690] | [np.float64(1564.253), 1380] | 1.140000 |
| H4-curtain | [910, 488] | [1820, 976] | 0.856000 |
| H5-unlock | [np.float64(922.9617), np.float64(488.7228)] | [np.float64(1845.9234), np.float64(977.4456)] | 0.857446 |
| H6-peek | [np.float64(908.4829), np.float64(489.4586)] | [np.float64(1816.9658), np.float64(978.9172)] | 0.858917 |

## Routes, contacts and ownership

Blue routes are measured from the actual floor. Table approach/departure passes to the left of all three glass-leg obstacles, never through them. The new corridor extension follows the same open-floor arc toward the unchanged full-height corner; original Rabbit yellow curve is untouched. The entire head/hair must be hidden before the real-place dissolve.

Key ring rests at source[804.0000294117647, 637.9858468677494]; bottle base[875, 639]. Contact pose for taking AND final placement is carry-key with the exact same feet, grip and scale; numeric source residual below0.0000000px. Alternate placing pose is supplied but not selected for ownership transfer, to avoid a pose-position snap.

One key only: table -> measured hand -> table. Each carried-pose hand pin is an actual opaque skin pixel in chapter-1-scene-3-hall-atlas-cells.json. During pose changes, key must follow the animated hand; static pins do not certify an implemented transition. Bottle remains fixed from hall establishment, not spawned in the final hook.

Door keyhole: source[962.526692607004, 450.68252148997135]. Door leaf states draw through the measured arch mask; the actual stone frame remains the same source pixels. Closed garden leak:0pixels; open garden:286pixels inside the mask. Curtain closed/gathered states retain the fixed rod and clear the view naturally.

## Camera safe limits

Inherit the approved old-S5/S4 zoom for the whole scene; no beat-driven zoom changes. Source half-width=W/(4z),half-height=H/(4z). Camera centers must stay inside the numeric limits below, then satisfy toolbar, full body, hand/prop and actual dialogue constraints. Only centers track the explicitly scripted walks.

| Layout | Zoom | Source cx min/max | Source cy min/max |
| --- | --- | --- | --- |
| short320x480 (320x480) | 0.582627119 | 137.3091, 1526.6909 | 205.9636, 730.0364 |
| short360x480 (360x480) | 0.523305085 | 171.9838, 1492.0162 | 229.3117, 706.6883 |
| short390x480 (390x480) | 0.523305085 | 186.3158, 1477.6842 | 229.3117, 706.6883 |
| Chrome-1366x600 (1366x600) | 0.510593220 | 668.8299, 995.1701 | 293.7759, 642.2241 |
| Chrome-1366x641 (1366x641) | 0.534166667 | 639.3136, 1024.6864 | 300.0000, 636.0000 |
| Chrome-1536x730 (1536x730) | 0.608333333 | 631.2329, 1032.7671 | 300.0000, 636.0000 |
| Chrome-1440x760 (1440x760) | 0.633333333 | 568.4211, 1095.5789 | 300.0000, 636.0000 |
| Chrome-1920x947 (1920x947) | 0.789166667 | 608.2365, 1055.7635 | 300.0000, 636.0000 |
| fullscreen16x9 (1920x1080) | 0.900000000 | 533.3333, 1130.6667 | 300.0000, 636.0000 |
| square (800x800) | 0.666666667 | 300.0000, 1364.0000 | 300.0000, 636.0000 |
| phone360 (360x800) | 0.619674671 | 145.2375, 1518.7625 | 322.7500, 613.2500 |
| phone390 (390x844) | 0.675002766 | 144.4439, 1519.5561 | 312.5913, 623.4087 |
| phone430 (430x932) | 0.748773561 | 143.5681, 1520.4319 | 311.1755, 624.8245 |
| portrait9x16 (720x1280) | 1.066666667 | 168.7500, 1495.2500 | 300.0000, 636.0000 |
| ultrawide (2560x480) | 0.788793103 | 811.3661, 852.6339 | 152.1311, 783.8689 |
| narrow (320x1080) | 0.684322034 | 116.9040, 1547.0960 | 394.5511, 541.4489 |

## Verification boundary

Static projection PASS:16layouts,80held compositions,1696route feet;205px illustrative caption and88px toolbar. This is geometry evidence, not DOM, animation or MP4 certification. qa/pixel_density.py checks all3new assets. Isolated character-art check uses only the common atlas renderer, no ReaderEngine or chapter code. Full Gate4 belongs after approval and implementation.

## Reuse in scenes4–6

Keep all architecture/table/threshold coordinates fixed. Scene4 may add bottle consumption and shrinking; Scene5 adds cake, giant poses and tears; Scene6 adds fan/gloves, water and small swimming poses. These are future asset/state approvals, not implemented here. The current floor/ceiling/lateral margin is real scenery, never a repeated fill. Tiny-door roof mask extends to sourcey0 and must cover complete future sprites only after crossing, not hide Alice while she is merely looking from outside.

## Furniture Ground-Plane & Foot Clearance

H3 feet and both measured front-leg supports share sourcey690, with0px ground difference. Key pickup and placement use the same real carry-key pose and registered grip. H4/H5/H6 full actor silhouettes INCLUDING held key have0overlap pixels with conservative full table bounds plus the bottle. Clear ground is visible between their rear floor and the foreground furniture. The same controls must be repeated on the implemented animation after Gate3 approval.

## Authorized speed and orthogonal route correction, 22 October

This revision supersedes the historical 38151ms frozen opening: its final3s hold is removed and all S3 locomotion is retimed. Existing artwork and ground anchors remain unchanged. Alice uses walkSpeed350/runSpeed650; Rabbit walkSpeed300/runSpeed600, in world px/s at scale1. Actual speed is reference multiplied by instantaneous depth scale; durations are integrated over the measured route. There is no per-waypoint easing.

Outward world route: H3[1564.253,1380] -> [1564.253,976] -> H4[1820,976], back then right. Return: H6[1816.9658,978.9172] -> [1564.253,978.9172] -> H3[1564.253,1380], left then front. Canonical JSON retains full precision. Front/back carry walks reuse approved S1 artwork with separately measured opaque hand contacts, not reflected side poses.

Current automatic budget69494.260791ms; independent export nominal75944.260791ms. Full DOM/motion/export evidence is separate under .artifacts/qa/alice-in-wonderland/s3-speed-voice/. The historical static projection above is retained as prior approval evidence, not current runtime certification.

## Current revision: automatic-only duration and45degree slopes

This user correction supersedes the prior rigidL requirement and shortened-pause experiment. H3/H4/H6 and table are unchanged. Bend source[782.1265,614] is derived as floor(min(H4.y+abs(H4.x-H3.x), H6.y+abs(H6.x-H3.x))-1), using H3.x. It lies above table source top626 and gives at least1sourcepx angular clearance below45degrees on both diagonal legs. Outward: H3 -> bend (back/up) -> H4 (right). Return: H6 -> samebend (left) -> H3 (front/down). No backward detour; one continuous speed at each corner. Actual alpha/hand/ground/camera checks pass the16layout matrix.

Automatic reading is the sole duration gate: target60–80s; inclusive55–85s valid. Natural safe/choice pauses restored. MP4 duration is informational only; no new MP4 is requested or generated for timing. Latest evidence: .artifacts/qa/alice-in-wonderland/s3-slope-auto-only/.

## Authorized support-plane and stationary-box correction

The box is visible at source base[856.4484011940299,690], scale1.14, from the first Hall frame, shared unchanged with S4. No left-support concealment or subsequent push remains. `supportPlanes.table` records source groundY690/world1380 and exact neutral foreground pixel runs measured on the approved panorama. The foreground is copied from that panorama without changing its source. Resting key, bottle and cork use this support depth; Alice uses her feetY so the entire furniture/prop group sorts behind her when she walks in front.
