# S4 measured geometry: The Empty Jar

User-requested shelf-edge correction,20 October2026. Main thread only. Canonical data: [scene-4-geometry.json](scene-4-geometry.json). Current QA: `.artifacts/qa/alice-in-wonderland/scene-4/edge-correction/`. Earlier boards and verdicts describe previous versions.

## Coordinates and continuity

Source coordinates multiply by2 for world coordinates. The S3 closing state and S4 first frame now share `(1074,600)`, scale0.732 and the same jar-free upper painting plus one separate jar. The jar base is `(1112,666)` on the first shelf and `(1114,1144)` on the second. These are4 and4 source pixels inside their respective left tips(1108 and1110); the actual narrower jar foot is supported at the accessible edge. No body detour into either board.

| Anchor | Source | World |
| --- | --- | --- |
| A0-s3-exact-end | (1074, 600) | (2148, 1200) |
| A1-upper-grasp | (1074, 676) | (2148, 1352) |
| A2-upper-clear | (1074, 678) | (2148, 1356) |
| A3-inspect | (1074, 800) | (2148, 1600) |
| A4-lower-approach | (1074, 1010) | (2148, 2020) |
| A5-lower-contact | (1074, 1154) | (2148, 2308) |
| A6-lower-clear | (1074, 1156) | (2148, 2312) |
| A7-returned | (1074, 1280) | (2148, 2560) |
| A8-leaves-visible | (1080, 1550) | (2160, 3100) |
| A9-precontact | (1080, 1652) | (2160, 3304) |
| A10-first-contact | (1080, 1658) | (2160, 3316) |
| A11-compression | (1080, 1661) | (2160, 3322) |
| A12-seated-s5 | (1080, 1664) | (2160, 3328) |
| J0-upper-base | (1112, 666) | (2224, 1332) |
| J1-lower-base | (1114, 1144) | (2228, 2288) |

## Airborne paths

No walkPaths: Alice descends in the fixed shaft. Root X stays1074 through pickup, inspection, placement and empty-hand clearance. Only after the last interaction does the existing gentle descent settle toward landing X1080. The approved3000ms leaf-contact/compression/seated hook is unchanged.

- upper-pickup: (1074, 600) -> (1074, 676) -> (1074, 678)
- carry-and-inspect: (1074, 678) -> (1074, 720) -> (1074, 800) -> (1074, 1010)
- lower-place: (1074, 1010) -> (1074, 1154) -> (1074, 1156)
- descent-to-leaves: (1074, 1156) -> (1074, 1180) -> (1074, 1280) -> (1080, 1450) -> (1080, 1550) -> (1080, 1652)
- landing-hook: (1080, 1652) -> (1080, 1658) -> (1080, 1661) -> (1080, 1664)

## Registered poses and Held Props

Eight real authored frames in `alice-s4-pass-motion-v1.png` share a176x182world crop and measured registration origin. The eye/torso remains aligned with S3; the arms lift and withdraw the jar, then reverse that motion at the lower edge. Ownership changes only at physical contact. A separate prop follows the current measured hand pin with jar neck grip(0.16,0.15), adjusted smoothly within the actual fingertips at the lower contact, owner scale0.732 applied once. The fixed and upright carried appearances use the same normalized texture. Source cuts, hand pins and registration anchors are in [scene-4-atlas-cells.json](scene-4-atlas-cells.json).

## Local wall repair and density

Built-in imagegen produced clean solid rock for the noisy left wall. The clean source is canonical1720x1916, NN only; its native1188x1324 output is retained in `.artifacts/`. A fixed texture-aware2x2 contour in [scene-4-wall-mask.json](scene-4-wall-mask.json) integrates the generated repair without isolated dither pixels or a straight/curved geometric patch outline. Shelves and the approved leaf floor retain their previous source pixels.

All new cells use the immutable Golden Masters:68 logical samples per reference standing body; panoramas use2x2source cells at720design height. `qa/pixel_density.py` verifies every active asset. No master or legacy story art changed.

## Camera and overscan

World coverage stays `[96,0,3248,3832]`; full viewport, arbitrary aspect ratios, actual dialogue exclusion. The original continuation remains at(48,34). Two adjoining1672x941territories surround1280x720core frames:1.30625x width and1.30694x height;196px lateral and110.5px vertical margins. These are measured territories, not a claim that the entire1882height is overscan for one720frame.

## QA required

`node qa/alice-s4.mjs`: eight layouts, actual-alpha Alice and carried jar clearance against both shelves, constant root column, registered eye continuity, fixed-to-held jar-bound transfer <=2world quantization, pause and save/export parity, pixel-identical S3/S4 boundary. Also run the story suite, resize sweep, density audit and new normal-speed MP4 for both changed S3 reveal and S4. Physical phone/Safari are not covered by browser simulation.

## Current support and zoom correction
The active composed lower shelf top at the left edge is source y1144, not the earlier uncomposited y1138. Jar base(1114,1144) moves down6source pixels and inward2. Contact root(1074,1154), withdrawal(1074,1156); actor X remains fixed. A measured7source-pixel shift within the real extended fingertips and the matching neck grip offset align the jar without translating Alice sideways. Machine-readable lowerPlacementGrip and hand pins are authoritative.

Zoom is now computed once for the full viewport/safe-area layout, using the complete scene's opening/top, bottom leaf margin and measured composition envelope. It is identical for every S4 action, text, hook and reconstructed state. Panorama limits clamp center only. Context scenery can leave the frame before a required body or held object. Resize/safe-area changes create a new plan. S3 final hook eases to that same plan so S4 begins with identical framing and no one-frame zoom change. `qa/alice-s4-support-zoom.mjs` tests Chrome window sizes, actual jar-foot pixels on painted wood and actual fingertip alpha.

Very short clear-caption entrance frames can temporarily lend unused panel space to the protected character/jar union. This adjusts only center constraints, never the locked zoom; the reserved text area is fully respected before text appears.
