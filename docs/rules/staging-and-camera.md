# Physical staging and camera

- C3 fixed-zoom correction (2026-11-12): keep conversation zoom constant through arrival and departure. Follow the measured crest with smooth Y-only pans during physical actions with the caption hidden, returning to conversation focus before showing text; no zoom-out/in or horizontal drift. Fit the actual visible silhouettes above the viewport edge throughout the pan.

- Review every passage against its phone shot: actor, listener, prop owner, terrain, path, supporting surface and resulting state. Check desktop afterward. Review complete movement and intermediate frames, not only saved paragraphs.
- Define new-story geometry in a file under that story's shared/ directory: spawns, anchors, walkPaths and occluders. Ground coordinates in inspected native and panorama art, measured image dimensions and world mapping. Do not invent coordinates blindly. See ../authoring/new-story.md.
- Physical entrances emerge from an authored doorway, path, foliage edge or frame edge, with a visibly gradual retro fade, then walk opaque. Do not finish the fade entirely behind cover. Exits walk opaque and fade only during their final steps. Animals follow the same rules.
- Presence origins apply only to hidden actors before capturing the action's start. Keep endpoints and intermediate paths aligned so completion and saved reconstruction agree. Waiting people retain coordinates and remain in the world when the camera leaves. Any repositioning needs visible movement.
- Inspect routes on both versions of the terrain. Avoid walls, vegetation, furniture, solid cliffs and other bodies. Nearby foliage alone is not evidence of occlusion. Preserve natural foot-based depth; do not globally lift actors above props.
- Establish a held camera before a walk with waiting actors. Plan the full route, still-hidden arrivals and carried props from the real entry point, including briefly deferred boarding. Reframe separately. Explicit approved following shots, such as the Chapter 3 river departure, remain continuous and do not insert stops.
- Face the exact authored path leg; never derive facing from nearby interpolated samples. Keep travelFacing and preserveHeight opt-in. Author complete two-pixel walking blocks; keep feet grounded and shadows aligned.
- Camera destinations must be safe before interpolation. Fit required cast, silhouettes, props, landmarks and captions. A deliberate reframe may bring a new subject into view; the following held action must frame it completely. Protect active and outgoing panorama edges and never clip a required person to satisfy coverage.
- Real place/time changes use a complete-shot dissolve, including cast, props and shadows. Apply setup atomically, then walk in a separate action. Pause freezes the dissolve on the story clock; resize settles the destination and reconstruction clears the snapshot. Same-place scene boundaries remain continuous.
- Props keep their place when cutting away. Carried props stay hand-anchored, share owner visibility and follow the actual pose throughout the walk. Release, place or hand over only after the holder stops. Do not show an owned object through its owner's back. Consumed or emptied contents change visibly.
- Finish boarding before clipping legs inside the hull. Keep all passengers and distinct fleet sailors inside their vessel. Ramps stay fixed to the shore while boats depart. Use simultaneous noncrossing disembarkation where the October 14 correction requests it; do not restore serial entry there.
- Explicit ghosts, magic, transformations and losses have distinct presence rules; do not use them as shortcuts for ordinary arrivals. Transform complete silhouettes at the same foot anchor.
- Review pause/resume, saved reconstruction, orientation round trips and repeated export openings after staging changes. Review complete timestamped speech together with the visible moments when feedback comes from a recording.


<a id="source-c2-traveler-route-md"></a>
<details>
<summary>Historical source: C2-TRAVELER-ROUTE.md (not current instructions)</summary>

> Retained source snapshot. Current rules and the October 14 priority table override conflicting directions, old script commands, paths, production status and QA counts.

# Chapter 2: the traveler approaches the table

Local user-requested correction, October 13, 2026. Affects `odyssey-c2-s2-welcome-the-traveler`.

The previous entrance began at (1120, 420), then descended through (1050, 850). In the complete horizontal panorama that right-side route crossed the planted wall beside the column. The native phone image has different doorway/planter placement, so checking the native crop alone did not catch it.

Both unchanged backgrounds were inspected. The corrected common paved approach is (950, 490) → (950, 750) → (950, 875) → (900, 875). The traveler walks down facing forward, turns left for the final approach, and stops facing Telemachus when the bread is offered. The final position, 3400 ms walk duration and original 350 ms gradual entrance remain unchanged. No artwork or dialogue was regenerated.

The scene establishes a `guest-arrival` shot before the walk: center (780, 630), width 520, height 630. Its opt-in `preserveHeight` keeps the complete vertical route in the horizontal view. The arrival action holds the camera; Ithaca now honors that per-action field. Telemachus stays at (635, 875), the table at (770, 880). The next action moves to the existing closer conversation framing after the traveler has stopped.

## Verification

- Sampled all 68 fifty-millisecond states in six layouts: 360/390/430 × 844, 1366 × 768, 1366 × 640, and 390 × 844 portrait mode. The camera and waiting son remained fixed. The traveler stayed on the measured floor corridor and did not cross the table or the son; visible head/body stayed clear of the dialogue and screen edges.
- Inspected snapshots at 0, 175, 350, 850, 1700, 2550 and 3300 ms against the native and complete panorama artwork. Pause preserved each sampled model/camera; saved reading resumed at the same arrival result.
- Chapter 2's 45 passages passed manual/automatic playback, prop-state checks, rapid-tap handling, history, resume, restart, chapter navigation, portrait continuous playback and fullscreen. The older acceptance script's library fixtures were updated in a separate copy to reflect ten available chapters, zero upcoming chapters and 51 scene links. No library implementation changed.
- Twelve source-state comparisons passed between the previous scene's exported teaser and this scene's repeated opening. The actual 720 × 1280 export midpoint was inspected, then the recording was cancelled. No complete new MP4 was encoded.

Evidence: `C2-TRAVELER-ROUTE-QA.json`, `C2-TRAVELER-INTERACTION-QA.json`, `C2-TRAVELER-EXPORT-QA.json`, `work/c2-traveler-route/` (baseline source, snapshots and export preview), `work/c2-traveler-route-qa.cjs`, `work/c2-traveler-export-qa.cjs` and `work/c2-route-existing-check.cjs`.

Tests are local simulated Edge layouts, not physical-phone/Safari validation. Work remains on localhost.


</details>


<a id="source-c4-bottom-edge-md"></a>
<details>
<summary>Historical source: C4-BOTTOM-EDGE.md (not current instructions)</summary>

> Retained source snapshot. Current rules and the October 14 priority table override conflicting directions, old script commands, paths, production status and QA counts.

# Chapter 4 coast: continuous lower ground

Local correction, October 13, 2026. The reported frame is `odyssey-c4-s1-p5`, “The ship is ready.”

The desktop camera reached roughly 73 screen pixels below the 1,536-world-unit panorama. The fallback floor repeated a 32-unit strip, which made rocks, vegetation and sand visibly repeat. Limiting the camera to the old image alone put Doros behind the reading panel, so that trial was rejected.

The coast now has one complete, deeper panorama: `dist/assets/odyssey-panorama-c4-0-ground-v4.png` (1848 × 851). Its lower foreground continues the sand, rocks and vegetation. The whole image renders at a uniform scale and uses its full ground height, approximately 2,122.6 world units. Desktop camera limits remain inside this image. Neither the active nor the outgoing coast uses the tiled floor in horizontal mode. Other chapter environments keep their existing images.

Story data, timing, character coordinates and native phone/portrait/export artwork are unchanged. The new ground is used whenever Chapter 4 returns to this same coast, so its departure/return shots share the correction.

## Asset provenance and prompt

Created with the built-in image generation tool using `work/c4-bottom-edge/outpaint-target.png`. The edit target contains the original panorama above a magenta bottom region. The selected complete output is saved in the project under the filename above; previous art remains available.

Final prompt:

> Edit target: the attached 2172 x 1000 pixel game panorama. OUTPAINT ONLY THE SOLID MAGENTA BOTTOM STRIP (rows 724 through 999). Preserve the entire existing landscape above that strip EXACTLY in its same size and position: no recenter, resize, repaint, blur, smoothing or rearrangement. Fill all magenta with a seamless downward continuation of this sunny Greek-island pixel-art beach. The central sandy path continues downward with irregular tiny stones and sand flecks; the existing rock faces, flowers and dense foliage on the left and right continue naturally downward from their exact existing boundary pixels. Match the sharply defined pixel blocks, existing pixel size, golden sand, dark rock outlines and sun direction. It must be one connected foreground, with no repeated row patterns, vertical stripes, duplicated rocks, tiling, stretched pixels, horizontal seams or soft blurred transitions. Do not add trees in the central walking area. No new water below, no buildings, no characters, no interface, no text. Exact same image width, same upper composition, ONLY extend the missing bottom ground.

The generated output has a different native resolution; the renderer maps the complete image uniformly. Exact pixel identity is claimed only for the unchanged native phone/portrait/export rendering, not the generated panorama.

## Verification

`C4-BOTTOM-EDGE-QA.json` checks all 46 Chapter 4 passages at desktop 1366 × 608, 1366 × 640 and 1920 × 1080. No coast overscroll or required-element clipping remains. Before/after comparison checks every native phone frame/model/camera at 360, 390 and 430 × 844, plus desktop portrait mode. The real vertical export canvas for the reported passage is pixel-identical before/after; recordings were cancelled. Story JSON is byte-for-byte unchanged.

`work/c4-bottom-edge/reading-qa.json` covers complete manual/automatic playback, reconstruction, pause, owned objects and framing across five layouts. `work/c4-bottom-edge/motion-export-qa.json` covers walking/camera holds, opening sequences and cancelled real export previews for all five scenes. `C4-BOTTOM-TRANSITION-QA.json` checks the three coast location changes at 50 ms intervals and paused dissolve midpoints. Captures are under `work/c4-bottom-edge/`.

This is local Edge/Chromium simulation, with no Sites publication or new complete encoded MP4.


</details>


<a id="source-camera-edge-limits-md"></a>
<details>
<summary>Historical source: CAMERA-EDGE-LIMITS.md (not current instructions)</summary>

> Retained source snapshot. Current rules and the October 14 priority table override conflicting directions, old script commands, paths, production status and QA counts.

# Odyssey environment camera limits

Local correction, October 13, 2026. Supersedes the coast-only camera protection in `C4-BOTTOM-EDGE.md`.

## Observed defect and correction

A desktop audit of all ten chapters found camera overscroll in Chapter 4's cave (20 sampled states across three views) and Chapter 5's harbor (12 sampled states across two views). The Chapter 4 coast correction was already inside its deeper background. Chapters 1–3 and 6–10 did not expose the background edge in the original 1366 × 608 audit.

The cave artwork is unchanged. A shared horizontal camera guard now measures the actual rendered background bounds and, only when a camera leaves those bounds, refits its zoom and center. It also checks the required cast, props, landmarks and reading-panel space. For a held walk, it includes the complete route and any moving prop endpoints in advance. Both current and outgoing horizontal tiled floors are hidden. Rotation restores the native floor visibility in vertical layouts.

The guard is used by Ithaca, Scheria, Cyclops, Aeaea and Homecoming. Chapter 1's existing camera already fits its complete island image. No story JSON, dialogue, timing, character coordinates, controls, or native phone/portrait artwork changed.

The harbor could not fit both the original bottom boundary and the separated ships above dialogue during the escape. It now uses one complete, deeper foreground sea panorama: `dist/assets/odyssey-panorama-harbor-wide-ground-v4.png` (1723 × 913), uniformly mapped to 4608 × approximately 2441.8 world units. The earlier panorama remains available. This change applies to Chapter 5's harbor only; other background assets are retained.

## Asset prompt and provenance

The built-in image generation tool used `work/camera-edge-review/harbor-outpaint-target.png`, containing the previous harbor above a blank magenta bottom area. The generated image was copied into the project under the filename above. The generated panorama has a different native resolution; exact pixel identity is claimed for the unchanged native vertical exports, not the generated panorama.

Final prompt:

> Outpaint the attached 2172 x 1150 pixel-art game background. Change ONLY the solid magenta blank area below row 724. Keep the entire existing Greek cliff harbor above the blank area in exactly its original position, size, composition and lighting, without repainting or moving the coast, cliff ends, clouds, ruins or distant sea. Fill the magenta bottom area with a continuous foreground sea extending downward naturally from the existing lower image boundary. Turquoise near the existing rocks becomes deeper blue toward the bottom; small crisp pixel wavelets and sparse underwater stones near the coast. The two existing cliff ends must join their lower water foam seamlessly; below them there is open water, never new land, ships, islands or repeated coastlines. Match the existing pixel-art palette and sharply stepped pixel detail; no blur, no softened seam, no stretched pixels, no repeated horizontal bands or tiles, no mirrored or repeated wave patterns. Retain the same width and the original upper composition; extend only the lower foreground. One complete coherent panoramic image. No characters, ships, interface, text, logos or magenta.

## Verification

- Audited all ten chapters, all passages, and action starts/midpoints/near-endpoints at 1366 × 608, 1920 × 1080 and 844 × 390: 5358 sampled states. No camera extended beyond the active background in the final results. No new required-element clipping was found in the affected cave/harbor cases. Pre-existing Chapter 1 intermediate boarding bounds are outside this correction; its renderer and framing are unchanged.
- Chapter 4/5 complete manual/automatic runs, reconstruction, pause, owned objects and passage framing passed across 360, 390 and 430 × 844, desktop 1366 × 640 and portrait 390 × 844.
- Desktop actions sampled every 50 ms passed: 24 authored camera holds and 18 location-change actions. Waiting actors stayed fixed, paused models/cameras remained fixed, and neither the current nor outgoing floor became visible.
- Compared 4550 native frame/model/camera states across 24 chapter/layout combinations before/after: 390 × 844 and desktop portrait in every chapter, plus 360/430 phones in Chapters 4/5. All matched. Rotation back to vertical restored the original frame and native floor visibility.
- Actual 720 × 1280 export canvases for the cave and escaping harbor ship were pixel-identical before/after. The four recordings were cancelled; no new complete MP4 was encoded.
- Visually inspected the reported cave passage and harbor escape at actual rendering size. No browser errors or module syntax errors occurred.

Evidence: `work/camera-edge-review/before.json`, `final.json`, `final-1080.json`, `final-short.json`, `reading-qa.json`, screenshots and saved baseline modules; `CAMERA-EDGE-NATIVE-QA.json`; `CAMERA-EDGE-MOTION-QA.json`. The compact landscape reading panel was already present; no CSS or UI layout was changed. These are local Edge/Chromium simulations, not physical-device or Safari testing. No Site deployment occurred.


</details>


<a id="source-character-staging-qa-md"></a>
<details>
<summary>Historical source: CHARACTER-STAGING-QA.md (not current instructions)</summary>

> Retained source snapshot. Current rules and the October 14 priority table override conflicting directions, old script commands, paths, production status and QA counts.

# Character staging verification — 2026-10-10

## Chapter 3: continuous hall scenes 3–5 — 2026-10-12

Removed the scene 4/5 shot dissolves and blanket cast/prop resets. The king, queen and guest stay at the end positions of scene 3. The musician arrives from the palace doorway with his lyre, sits in the clear upper right aisle, and stays seated when the song ends. His stool is present from the hall's initial establishment, and carried bread and instrument ownership remain continuous. Scene 5 retains the bowed head/tears until the authored eye-contact gesture. The song and name shots share the same geometry and cast requirements.

`C3-HALL-CONTINUITY-QA.json` covers desktop 1366 × 640, simulated Edge phone widths 360/390/430 and 390 portrait: no boundary camera jump, shot/background fade or waiting-cast coordinate/visibility changes; unchanged furniture; owned lyre alpha follows its carrier; the singer's silhouette avoids the king and queen; pause and checkpoint restore remain stable. Both full-chapter playback modes finish and all 43 passage checkpoints reconstruct the same models. Shore and river scene data and all assets match the preceding version.

`C3-HALL-EXPORT-QA.json` compares the repeated next-scene opening actions with the following standalone export and inspects two cancelled 720 × 1280 export previews with controlled passage samples. Royal positions/visibility, instrument ownership, and reading/storage state remain consistent. Simulated rotation keeps all four participants within the reading area. No browser page errors. This verifies export previews, not a newly encoded MP4; no physical phone/Safari test was performed.

## Chapter 3: Alcinous approaches the table — 2026-10-12

The previous diagonal action faced left while moving right/down, crossed Arete's silhouette, explicitly shifted her by (-35, -10), and reframed during the walk. Alcinous now starts in the open right aisle, walks down facing front, then left toward the table. Arete and Odysseus stay fixed; both walk legs hold the established camera. A separate 650 ms action moves into the welcome framing after he stops. The two walking legs take 2650 ms; scene 3's duration estimate increases by two seconds.

`C3-ALCINOUS-ROUTE-QA.json` records desktop 1366 × 640, simulated Edge widths 360/390/430, and 390 portrait. Both playback modes retain waiting coordinates and an exactly fixed camera during the walks, correct movement directions, and disjoint king/queen silhouette bounds throughout (minimum separation 9 world pixels). Pause and checkpoint reconstruction pass, and the complete chapter finishes with all 43 passages in both modes. Captures cover the descent, turn, and approach endpoint.

`C3-ALCINOUS-EXPORT-QA.json` verifies simulated orientation changes during a paused approach and two cancelled real scene 3 export previews using the same action data and camera holds. Reading state and local storage remain unchanged by export. No browser page errors. Captures are under `work/c3-alcinous-*.png`; no physical phone, Safari or completed encoded-video test is claimed.

Local source: `dist/`; preview: `http://localhost:4174/`. No Sites release was made.

The ten Odyssey chapters now distinguish 22 physical entrances, 10 physical exits, four narrative losses and 13 explicit magical/spectral presence changes. People remaining behind keep their visibility, and scene setup uses full-stage dissolves instead of individually materializing an already-present cast. Character textures and portraits were preserved.

## Completed checks

- `CHARACTER-STAGING-QA.json`: all 406 passages completed in both manual and automatic engine playback. Saved reconstruction matched the complete model at every passage. Physical arrivals became opaque during emergence; departures remained opaque until their final steps. Pause froze action state and clock. All 135 repeated next-scene opening actions matched their standalone export equivalents at start and during motion.
- `CHARACTER-LAYOUT-QA.json`: 2,030 passage framing checks and 110 entrance midpoint checks across all ten chapters at 360, 390 and 430 px, desktop 1366 × 720, and 390 px portrait mode. No remaining text overflow or required actor/prop framing failures. Adjusted Hermes's temporary portrait entrance shot, and widened the available backgrounds in chapters two and four so short desktop windows can fit their staging above the panel.
- `CHARACTER-RENDER-QA.json`: 27 actual complete-stage dissolves across the chapters that use them. The first frame matched the previous canvas exactly; alpha reached one-half and zero on the story clock. Pause held the snapshot, resize settled the shot, and saved reconstruction removed it. Both earlier short stories still completed manual and automatic playback.
- `CHARACTER-EXPORT-QA.json`: completed 720 × 1280 recordings of chapter one / scene one and chapter ten / scene two. Confirmed walking entrances, text-free next-scene openings, and the whole-shot dissolve in the chapter-ten export. The reader state and local storage were unchanged after export. These recordings used a four-times accelerated story clock for integration checks; their pace is not a production-speed assessment.
- `TEXT-REVEAL-QA.json` and `TEXT-REVEAL-EXPORT-QA.json`: the previous stable word-wrapping correction remained valid across all stories/chapters and export captions.

Screenshots in `work/character-portrait-*.png` sample authored motion states. Their retained text comes from the test's previous paragraph, so they are framing references rather than sequential story screenshots. `work/character-export-*-ending.png` shows completed text-free export endings.

## Limits

Phone sizes were simulated in Edge, not tested on physical phones. All chapter logic and paragraph framing were checked, with sampled visual inspection and renderer transitions; this does not claim a real-time visual review of every frame of all ten chapters or an export of every scene. Existing supernatural appearances were intentionally preserved. Audio assets and character artwork were not revised.

## Chapter-one tree and waiting-character follow-up

Calypso now emerges from behind the lower-left tree, walks across sand, and keeps the existing brief fade. The tree's foreground mask covers her body and ground shadow at the origin; no new artwork was introduced. Removed unintended coordinate changes from Odysseus during her arrival and Calypso during Hermes's departure and the later launch. Held the camera during Calypso's approach and Hermes's departure/Odysseus's return. Hermes's arrival route was preserved.

- `TREE-ENTRY-QA.json`: five desktop/phone/portrait layouts; zero exposed pixels when an artificially opaque Calypso is placed at her hidden origin. Waiting actors and camera framing remained fixed through all sampled movement frames. Pause and reconstructed passage positions matched.
- `CHARACTER-LAYOUT-QA.json`: chapter one refreshed at 360/390/430 px, 1366 px desktop, and 390 px portrait; all 51 passages and three entrance midpoints passed in each layout. Screenshots at 12/30/50/90 percent of Calypso's approach were visually reviewed.
- `TREE-ENTRY-EXPORT-QA.json`: actual 720 × 1280 recordings of chapter-one scenes one and three, including the next scene's real opening actions. Both exports completed with the reader and storage unchanged. Integration clock accelerated four times, as above.

Reproduce the focused checks with `work/tree-entry-qa.cjs`, `work/character-layout-qa.cjs --chapters=1`, and `work/character-export-qa.cjs --tree-entry`. Mobile coverage remains simulated.

The subsequent fade adjustment extends Calypso's opacity ramp from 350 to 2,000 ms within the same 3,000 ms walk. Previously the ramp finished while the tree still hid her. Refreshed `TREE-ENTRY-QA.json` verifies visible rendered pixels at 900 ms with actor opacity 0.42525 in all five layouts, and full opacity at 2,000 ms. The route, foreground, shot, stationary actors and total action duration remain the same. Both focused recordings in `TREE-ENTRY-EXPORT-QA.json` were repeated with this adjustment.

## Chapter-two loom follow-up — 2026-10-11

Eurycleia previously stopped at (955, 885), behind the loom's y=890 render depth. She now follows the right aisle to (1080, 985), then walks to (955, 985), in front of the loom. This changes only her arrival path and endpoint in the story data; ordinary floor-based depth sorting, artwork, text, timing and checkpoints remain unchanged.

`EURYCLEIA-LOOM-QA.json` and `work/eurycleia-loom-qa.cjs` cover desktop 1366 × 640, simulated Edge phones at 360/390/430 × 844, and explicit 390 × 844 portrait mode. Fifteen reader captures sample the arrival, Eurycleia's dialogue and Penelope seated afterward. Eurycleia stays in front and in frame; Penelope remains fixed during the arrival. The scene completes manually and automatically, pause freezes the model, reconstructed checkpoints match, and the preceding export's repeated scene-five opening matches the scene-five export sequence during motion. No page errors occurred. Export checks compare the shared sequence; no new MP4 was encoded for this change. The other chapters do not reuse this loom object.


</details>


<a id="source-character-staging-md"></a>
<details>
<summary>Historical source: CHARACTER-STAGING.md (not current instructions)</summary>

> Retained source snapshot. Current rules and the October 14 priority table override conflicting directions, old script commands, paths, production status and QA counts.

# Character entrances, exits and changes of shot

The user likes the retro pixel-art appearance effect. Preserve it while giving ordinary arrivals and departures an understandable environmental origin. This is a staging correction, not an art-style change.

## Physical movement

Author the phone framing first. Name the doorway, path, bushes or edge used by each person; check the actual background and avoid paths through solid scenery. An ordinary person must not fade into the middle of open ground or disappear while standing there.

Action data uses `presence[character]`:

```json
{
  "kind": "enter",
  "fadeMs": 350,
  "zone": "Left stone path beside the bushes",
  "from": { "x": 370, "y": 735 }
}
```

`enter` fades only during the first `fadeMs`, then keeps the character opaque for the remaining walk. The optional `from` applies only to a hidden character, before capturing the action's starting model. Keep the endpoint in `effects.actors` and intermediate walking coordinates in `paths` so completion, backwards navigation and saved reconstruction agree.

The user wants the gradual opacity effect to remain visible as a person emerges from cover. Do not finish the entire fade behind an occluder or outside the phone crop. Calypso's three-second approach uses a two-second fade: she is still translucent when first seen beside the tree, then becomes solid before reaching Odysseus. Keep the environmental origin and walking route when adjusting this effect.

`exit` keeps the person opaque until the final `fadeMs`. Include an actual walking destination and correct direction/pose. Someone who stays behind should retain visibility while the camera departs. Do not hide the entire cast in a closing action just to prepare the next scene.

The first chapter gives Calypso a route from behind the lower-left tree onto the sand and Hermes a route from the right coastal vegetation. The island's `foregroundOccluders` reuse the background with an authored world-space mask, so foliage covers Calypso and her shadow during emergence. Do not route a ground-bound person across cliff pixels or treat a point near vegetation as sufficient occlusion. Temporary entrance shots reveal the approach, then settle into the conversational framing. Exit routes include the coastal path, hall aisles, stairs and chamber doors.

Waiting people keep their existing world coordinates while another person enters or leaves. Change their facing or posture when appropriate, but do not include incidental `x`/`y` adjustments in the moving person's action. A necessary step needs its own walking pose/path. Odyssey actions may declare `camera: {"hold":true}` to retain the established framing during a walk; resize and saved reconstruction still recalculate the shot. Calypso's approach and Hermes's departure/Odysseus's return use this hold so a camera drift cannot suggest that the waiting person moves.

## People already present in a new shot

Use `transition: {"kind":"shot", "durationMs":700}` on the action that establishes a new place/time. Its effects apply atomically. `installShotDissolve` retains the previous complete canvas frame and dissolves it over the established destination shot. A separate screen-space camera prevents rounding offsets or a full-opacity flash of the new cast. The story clock controls opacity, so pause freezes the transition. A resize settles the destination shot rather than stretching the old snapshot. Restart and saved reconstruction clear the overlay.

Do not put real walking paths on these atomic setup actions. Use a subsequent action for an actual arrival. Landmark closeups hide people outside their framing without a second individual fade when the camera returns.

This rule also applies to location changes inside a scene, not only its opening action. Chapter 3, scene 1 changes from the sea to the river bank in `odyssey-c3-s1-reach-sheltered-ground`. It uses a 1400 ms complete-shot dissolve: the outgoing image contains Odysseus and the broken raft, while the destination establishes him on the sand without the raft. Never crossfade only the environment while independently interpolating the old cast and props across it; that makes them look teleported. The following inland walk remains a separate action.

`CHAPTER-3-SHORE-DISSOLVE-QA.json` records complete-frame snapshot checks, five transition samples at desktop and simulated 360/390/430 px phone widths plus portrait, a paused midpoint, and all 43 passages in manual/automatic reading with saved-state reconstruction. Export scene 1 retains the same shot transition metadata; no new encoded MP4 was produced for this correction.

A scene boundary alone is not a change of place. Chapter 3 continues from scene 1 into scene 2 on the same river bank: `odyssey-c3-s2-frame` must not declare a shot transition. Its camera eases toward the arrival framing, Odysseus retains (730, 945), and Nausicaa subsequently walks in. Her basket is already present when the river bank is established, so it does not materialize at the scene boundary. `C3-RIVER-CONTINUITY-QA.json` checks the uninterrupted initial camera, fixed waiting actor, persistent basket, no background/shot overlay, and checkpoint reconstruction in five desktop/phone/portrait layouts. Reserve complete-shot dissolves for actual location/time changes or intentionally authored cuts.

Chapter 3's scenes 3, 4 and 5 also share one continuous hall. Scenes 4 and 5 must not dissolve or reset the cast. Their opening frames update only the framing/scene index, retaining Odysseus (650, 875), Arete (885, 795), and Alcinous (955, 940). Demodocus enters from the palace doorway at (1200, 735), carries his lyre with matching opacity, and sits at (1100, 760) on the stool already established at (1100, 773). This clear upper aisle avoids the listening royalty and the table. The song and name shots share the same four-person composition. When the song stops, only `singing` fades to zero; the bard, lyre, stool, bread and other furniture remain. Odysseus keeps his bowed head and tears until the separate eye-contact action. Narration describes this continuous moment, without an invented time jump or repeated royal entrance.

Nausicaa enters scene 2 from the upper sandy path at (900, 780), descends through (860, 865), and reaches (875, 960) beside the basket. The previous origin (1050, 840) and waypoint (970, 900) crossed the right rocky bank. Her 900 ms entrance fade stays visible on the path; she walks facing front and then turns left toward Odysseus in a separate 350 ms action. Both the scene setup and explicit presence origin agree. The route was checked against `odyssey-river-v1.png` and rendered at desktop, simulated 360/390/430 px phone widths and portrait; captures use `work/c3-river-*-entry.png` and `*-walk.png`. The waiting actor and continuous scene boundary remain fixed, and manual/automatic playback and checkpoint reconstruction still pass.

## Narrative exceptions

Use `magic` only for explicit supernatural events, such as underworld shades or Athena's transformation. These retain the original gradual interpolation. `loss` is a separate narrative event, with physical movement appropriate to falling or being taken, rather than an ordinary doorway exit. It uses the short final fade.

## Continuity and future stories

Narration must describe the visible staging. Chapter 3 scene 3 shows Alcinous standing and approaching the table, so its passage says "Alcinous approached the table" rather than claiming he came from a seat. If an action requires furniture, show the furniture and the action within the relevant phone shot, or rewrite the line to match what the scene actually depicts.

Alcinous is established at (1005, 710) in the hall's clear right aisle. He walks facing front to (1005, 940), then turns and walks left to (955, 940). Separate actions give each leg its matching direction. Arete stays at (885, 795) and Odysseus at (650, 875); neither receives incidental coordinates in the king's actions. The endpoint leaves the king's entire silhouette below Arete's feet and beside the table. Both walking actions declare `camera: {"hold":true}`, supported by `Scheria`; the welcome closeup begins in a separate 650 ms action after the king stops. A stationary person's screen position must remain fixed during the held walk as well as their world coordinates. Resize and checkpoint reconstruction still refit the camera to the available reading area.

Carried objects stay attached to their owner throughout a walk and share the owner's visibility during entrances/exits. In Chapter 3 scene 3, Odysseus carries the bread plate into the hall; its ownership must not change to the table during that walk. A separate 900 ms reach action places it on the tabletop after he stops. The bread's hand anchor is 26 world units toward the facing side and 36 above the feet (centered for a front/back pose), visually checked against the walking and reaching sprites. Hidden carried props must not remain visible or drive the camera. `C3-CARRIED-BREAD-QA.json` records hidden/fading/carrying/placing/table states across desktop, simulated 360/390/430 px phones and portrait. Full Chapter 3 manual/automatic playback and saved-state reconstruction also passed.

The same action data drives manual reading, automatic playback and exports. Export previews repeat the next scene's real opening actions; never create a separate entrance with different coordinates or timing. Keep the current pixel-art rendering policy and existing controls. Review entrances and exits at the beginning, middle and end of motion, including their shadows and held objects, before accepting a new story.

In Chapter 2, scene 5, Eurycleia walks down the right aisle to (1080, 985), then approaches Penelope at (955, 985). The loom's feet are at y=895, so her final stance sits on the floor in front of it and preserves her full silhouette. Keep the endpoint and path aligned; an arbitrary render-depth override would leave the staging behind the furniture. Penelope's position stays fixed during this arrival, and Eurycleia keeps this stance through the conversation and Penelope's return to the stool.


</details>


## Puppet Limb Tweening Ban — permanent, 2026-11-13

Never cut, detach, overlay, rotate, warp or interpolate arms, hands, legs or other anatomical parts independently. Pick up, pocket, offer, eat and drink exclusively through instantaneous swaps of intact authored full-character atlas cells, as in C1-S4 Drink Me and C1-S5 Eat Me. Keep the foot/body root fixed across pose swaps; anchor each held prop to the selected complete pose. Whole-body uniform magical scaling and whole-character travel remain allowed. Locomotion must face its authored route from elapsed0 before X moves, using complete authored poses; no reversed facing during any moving frame. This rule overrides historical part-rig/mesh instructions, even if their raster QA previously passed. Do not introduce new articulated helpers or reuse legacy limb deformation. No legacy helper or historical approval exempts anatomical part animation from this prohibition.


## Canonical Walk vs. Run Rule — permanent, 2026-11-13

Every ordinary walk MUST reuse the shared upright createPixelWalkFrames helper from platform/rendering/character-art.js used by Solid Ground/Mary Ann, with the upright right (or corresponding front/back) source and the canonical130ms cadence. Never invent a per-scene gait or alternate inclined run poses during normal walking. Run cells/cadence are allowed ONLY when the script explicitly calls for full-speed running, urgent pursuit or escape. Face the route from0ms; preserve measured foot roots and hand anchors, routes, timing and uniform scale. This user-approved canonical locomotion helper is the specific exception to the earlier no-derived-legs wording: its existing standard footstep cycle may be reused; the Puppet Limb Tweening Ban remains strict for hands/arms and all interaction poses. Do not create new limb rigs, interpolate joints, or alter the helper to animate reaching/eating.
