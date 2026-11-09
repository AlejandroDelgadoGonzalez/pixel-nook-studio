# Superseded decisions and provenance

Only docs/rules and the current contracts below govern new edits. Original source excerpts are preserved losslessly for audit; they describe historical states and must not be executed as instructions. Refer to source-to-target.md for renamed code and assets. No old patch script is required or shipped.

| Earlier decision | Current decision |
| --- | --- |
| Keep Chapter 5 byte-identical to its expanded-journeys revision | The October 14 document explicitly authorized 20 later corrections. Preserve that final state. |
| Sequential Chapter 4 cave entry and Chapter 5 scouts disembarking | Those requested groups now travel together on noncrossing paths. |
| One giant throws two stones sequentially | Two giants release one stone each together; two companion ships sink together. |
| Separate generated wings and feathered center in horizontal mode | A single complete panorama. Legacy fills are vertical-only where still required. |
| Repeat the bottom floor strip horizontally | Keep the camera inside complete artwork; use deeper ground when necessary. |
| Preserve Chapters 1-4 and 6-10 wording unchanged | The user authorized the later causal review; preserve its resulting text. |
| Reapply old build/apply/fix scripts in order | Edit the migrated final source directly. Historical scripts remain only in the untouched backup. |
| One or two available Odyssey chapters; later chapters upcoming | All ten chapters are implemented. Old status/duration/QA counts are historical. |
| Portrait reading stops at each episode | Continuous automatic portrait reading is the approved behavior. |

Historical test claims below are not results of the migration. New results are generated in .artifacts/qa/.


<a id="source-agents-md"></a>
<details>
<summary>Historical source: AGENTS.md (not current instructions)</summary>

> Retained source snapshot. Current rules and the October 14 priority table override conflicting directions, old script commands, paths, production status and QA counts.

# Project conventions

The user's October 14 document `C:/Users/aleja/Desktop/Alejandro/Correciones visuales.docx` explicitly authorizes its 20 corrections, including Chapter 5 revisions. This supersedes the earlier byte-identical Chapter 5 freeze and the recording's serial disembarkation requirement: the requested groups now disembark and enter together on noncrossing paths. Let visible travel explain itself when the user removes redundant narration; show completed boarding before describing a return aboard. Keep ramps fixed to shore while departing boats move. Ship passengers and distinct fleet sailors stay inside the hull. Two cliff giants release one stone each together, hitting and sinking the two companion ships together. Reapply `work/apply-visual-doc-corrections.cjs` LAST after older authoring scripts. Retired saved passage IDs migrate to valid nearby passages.

The user approved Chapter 5's expanded journeys and authorized the same causal review in Chapters 1–4 and 6–10. This supersedes older instructions to preserve those chapters' wording unchanged; their approved artwork and physical staging remain the starting point. A child must understand who is present, where they came from, why they act, how they reach the next place, and whether the telling is in the present or in Odysseus's memories. Add a visible arrival, path, return, boarding or departure when it explains an important journey. Clearly report meaningful offscreen events instead of pretending they just happened on screen. Explain a new companion's prior duty, keep waiting people in the world, and connect each consequence to its cause. Define unfamiliar roles in simple words. Review complete motion as well as saved paragraphs: parallel paths must not cross bodies, and held routes must fit captions in both orientations. Keep approved Chapter 5 byte-identical. See `ODYSSEY-CAUSAL-CONTINUITY.md`; `work/apply-odyssey-causal-continuity.cjs` reapplies the causal authoring after older review scripts.

Keep stories and interface in English. Design phone shots first, then expand the same staging for desktop. Preserve the current reading, saving and export behavior.

Never fill a wider environment by reflecting or repeating the complete central background. Horizontal Odyssey scenes use one complete authored panorama per environment, with uniform pixel density and continuous architecture, ground and water. Never overlay a sharper native center on differently drawn or softer side pieces. Preserve the original vertical composition, world coordinates, terrain anchors and camera framing; expand that staging for desktop. Keep each panorama's full native ground depth rather than squeezing every scene into the same aspect ratio. Review at actual rendering scale, including the outgoing background during dissolves, rotation, immersive reading and exports. See `PANORAMA-BACKGROUNDS.md`; `LANDSCAPE-BACKGROUNDS.md` records the superseded wing implementation.

The user approved Chapter 2's complete panoramas and authorized the same correction in every other affected chapter. Chapters 4–10 now follow that policy through the shared environment helper; Chapters 1 and 3 already use complete backgrounds. Keep Chapter 2's approved images and proportions unchanged. Phone, portrait and vertical exports retain the original artwork, framing and existing off-frame fill where an unusually wide vertical establishing shot needs it. Those legacy side textures must never render in horizontal mode. Both current and previous layers must refit when orientation changes. See `CHAPTER-2-PANORAMAS.md` for the original trial and `PANORAMA-BACKGROUNDS.md` for the approved rollout.

The user currently wants all work and previews on localhost. Do not publish, push a Sites release, or update the live Site until the user explicitly requests it again.

Inspect the bottom of complete panoramas at the actual reading camera, including location-change dissolves. A coherent image can still expose a repeating floor strip when its camera goes beyond the authored ground. If restricting the camera would hide a required character behind dialogue, extend the complete ground instead. Keep native phone/portrait/export rendering unchanged. Chapter 4's coast uses a deeper complete panorama and no tiled horizontal floor, including its outgoing layer; see `C4-BOTTOM-EDGE.md`.

The shared `keepCameraInsideEnvironment` guard now protects all horizontal environment edges and suppresses current/outgoing tiled floors. Preserve geometric coverage, safe cast/prop/landmark framing, complete route planning before held walks, and native floor restoration on rotation. Chapter 4's cave uses camera refitting; Chapter 5's harbor uses a deeper complete sea panorama because the separated ships did not fit the original depth. See `CAMERA-EDGE-LIMITS.md`. Never solve this by simply hiding the floor while leaving the camera outside the artwork, or by clipping a required person behind dialogue.

Use the causal visual-review procedure in `ODYSSEY-VISUAL-REVIEW.md` for future chapters. Read every passage against the phone shot and inspect moving intermediate frames: actor, listener, prop owner, terrain, route, surface and resulting state. Establish a held camera before a walk when waiting actors remain visible; reframe separately. Keep props in their actual place when cutting away. Release an object only after its holder stops. Show a completed action before describing it as complete; use reported news for important offscreen events. Walking frames must preserve complete two-pixel blocks and facing must follow each path leg. Chapters 4–10 now use opt-in `travelFacing` and scene-authored camera holds; preserve the approved Chapters 1–3.

For recorded feedback, review both the complete timestamped speech and the corresponding visible moments. Chapter 4's recording requires arrival, separate disembarkation, visible waiting crew and departure before cutting to open water; its cave arrival and escape share one exterior panorama. The phone image is a crop of that complete panorama with its full authored foreground depth. Preserve gradual physical entrances for animals as well as people, and show consumed contents becoming empty. Use the exact authored path leg for facing; never differentiate nearby interpolated samples, which can flicker on equal diagonals. Camera destinations must be safe before interpolating, and route planning must include briefly deferred boarding states and still-hidden incoming props. Allow a new subject to enter the frame during a deliberate reframe; do not clip it during the following held action. See `work/c4-video-review/requests.md` and `C4-VIDEO-FEEDBACK.md`.

The user's Chapter 5 review requires understandable journeys as well as correct intermediate animation. Introduce a companion and explain earlier offscreen duty before relying on that companion; establish whose ships travel together. Show arrival, landing, the route to a meeting, the return to waiting people, boarding and departure. If someone stays with a ship, show that waiting state and return to the same landing. Keep each impact tied to the specific ship it destroys. Same-place scene boundaries retain the cast and props. Chapter 5's two landing panoramas and its open-sea panorama use one complete bitmap for horizontal and a central-third crop for native phone/portrait/export views. Their bounded native cameras must never expose a repeated floor strip. Preflight a hidden arrival and its carried props from the authored entry point, rather than the actor's stale coordinates from an earlier location. Preserve the six episode identities and existing saved text IDs. `work/apply-c5-continuity.cjs` reapplies this revision after the older visual-review authoring pass.

A scene or episode number does not by itself justify a cut or cast reset. In consecutive scenes at the same place and time, retain character positions, visibility, posture and object ownership; change only what the next action actually does. Someone who is listening must stay present. A musician can stop playing while remaining seated with the instrument. Use a complete-shot dissolve for an actual location/time change. Chapter 3's hall scenes 3–5 are continuous; see `C3-HALL-CONTINUITY-QA.json` and `CHARACTER-STAGING.md`.

Completion buttons must show readable labels before hover, including primary links styled as buttons. Keep at least 14 px between adjacent primary completion actions, with consistent sizing and visible keyboard focus. Check light and dark themes on desktop and 360, 390 and 430 px phone layouts when editing completion screens.

Character entrances and exits must be motivated by the environment. Keep the retro fade, but use an authored doorway, path, vegetation or frame edge as the origin/destination. Check ground surfaces and foreground occlusion in the actual art; nearby vegetation alone does not make an arrival believable. A physical entrance becomes opaque during emergence and then walks; an exit stays opaque until its final steps. Waiting characters retain their coordinates while others move; any intentional repositioning needs visible walking. People who remain behind stay in the world when the camera leaves. Characters already present in another place/time appear within a complete-shot dissolve, never as individual stationary fades. Reserve spectral/magical appearances for explicit story events. Review the phone crop, pause/resume, saved reconstruction and repeated export openings. See `CHARACTER-STAGING.md` and `CHARACTER-STAGING-QA.md`.

Inspect a physical route against both native and complete panorama terrain; matching world coordinates alone do not prove that a path avoids both versions' walls and plants. The latest user-authorized Chapter 2 correction supersedes its older guest entrance: the traveler uses the central paved approach and a held `guest-arrival` shot. `preserveHeight` is opt-in for this planned route; do not apply it to unrelated establishing shots. See `C2-TRAVELER-ROUTE.md`.

Text reveal must lay out the full paragraph before the first letter appears. Use the shared `createTextReveal` helper in both the initial paint and animation updates; reveal by opacity without replacing the paragraph with a growing substring. Words and the advance cue must keep their final positions while letters appear. Video captions must wrap the complete paragraph before revealing its lines. Check word beginnings at line boundaries on 360, 390 and 430 px phone layouts, desktop and portrait when changing typography or the reading panel. See `READING-TEXT-QA.md`.

For every new or revised character, follow `CHARACTER-ART-STYLE.md` and visually compare with Odysseus, Calypso and Hermes in `dist/assets/odyssey-atlas-v1.png`. Use the shared `drawCharacter` rendering policy for characters and derive portraits from those textures. Never introduce smooth illustrated characters or gradients into this pixel-art family. Inspect every direction and interaction pose on mobile and in portrait exports before accepting it.

When an atlas is reused by different chapter renderers, share its measured cell boundaries. Do not assume equal row heights without checking complete feet and neighboring silhouettes in every direction. Extract clean cells before generating portraits or walking frames. The Ithaca hosts use `ithacaHostCell` in `dist/character-art.js` for both Chapter 2 and Chapter 10; their row boundary is y=476 of 887, not the midpoint. See `ITHACA-HOST-CROPS.md`.


</details>


<a id="source-landscape-backgrounds-md"></a>
<details>
<summary>Historical source: LANDSCAPE-BACKGROUNDS.md (not current instructions)</summary>

> Retained source snapshot. Current rules and the October 14 priority table override conflicting directions, old script commands, paths, production status and QA counts.

# Landscape backgrounds: local Odyssey correction

**Superseded horizontal policy (2026-10-11):** after reviewing and approving Chapter 2, the user authorized its complete-panorama approach in the remaining affected chapters. Chapters 2 and 4–10 now render one continuous image per horizontal environment, without an original-center overlay or separate wings. Native phone, portrait and export artwork is retained, including legacy off-frame fill needed by some unusually wide vertical shots. See `PANORAMA-BACKGROUNDS.md` for the current implementation and verification. The wing implementation and its historical checks are documented below; they are not the current desktop policy.

The central phone scenes remain the source of the staging. Desktop now uses tighter establishing shots and newly authored lateral scenery instead of reflected copies of the same room. The shared policy caps an initial desktop shot at 720 by 320 world units, then expands it to include every required actor, prop and landmark. The camera stays within the original central image whenever that complete composition fits.

The audit covered all ten chapters and 51 scenes. Chapters 2 and 4–10 used reflected background sides and now share `dist/landscape-environments.js`. Chapters 1 and 3 already fit their original art and were left unchanged. Story text, actor coordinates, character art, action sequences and the approved Calypso tree entrance were not changed.

The original central source remains in place. Desktop alone feathers its outer 48 world pixels against the authored lateral sections. Phone and portrait centers retain their original texture and full opacity. Lateral scenery is never flipped. Current and outgoing room layers use the same extension mapping during their existing dissolve. Portrait and export stages remain vertical even on a desktop screen, so the tighter desktop framing does not activate there.

## Artwork

The harbor's desktop floor continuation uses the bottom water strip across its full authored width. It avoids duplicating shoreline rocks beneath the wider coast. Phone floor textures remain unchanged, and the same policy follows the outgoing layer during a dissolve. The final chapter 5 playback check is saved in `LANDSCAPE-PLAYBACK-FLOOR-QA.json`.

Generated with the built-in `image_gen` editing tool, using the existing environment artwork as locked-center outpainting references. Exact final prompts and reference paths are recorded in [LANDSCAPE-ART-PROMPTS.json](LANDSCAPE-ART-PROMPTS.json). Only the generated lateral thirds are used; generated centers are not substituted into the story. Eight saved assets supply 24 distinct environments, including two individual replacements for seams that were too visible in the initial harbor and ocean atlas sections.

- `C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/dist/assets/odyssey-landscape-c2-v2.png`
- `C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/dist/assets/odyssey-landscape-c4-v2.png`
- `C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/dist/assets/odyssey-landscape-c5-v2.png`
- `C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/dist/assets/odyssey-landscape-voyage-v2.png`
- `C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/dist/assets/odyssey-landscape-passage-v2.png`
- `C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/dist/assets/odyssey-landscape-home-v2.png`
- `C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/dist/assets/odyssey-landscape-harbor-wide-v2.png`
- `C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/dist/assets/odyssey-landscape-sea-wide-v2.png`

## Verification

- `LANDSCAPE-REVIEW-QA.json`: 70 chapter/layout combinations. Simulated phone widths 360, 390 and 430 px; 390 px portrait; desktops 1366×640, 1440×900 and 2560×1080. Checks reconstruct every step, sample actions at start/middle/end, inspect required actor/object/landmark placement and active background extensions, and check the first complete paragraph of each scene for clipping. All 40 phone/portrait combinations match the original camera and character-state baselines with zero coordinate difference.
- `LANDSCAPE-PLAYBACK-QA.json`: complete automatic playback of all ten chapters, using an accelerated test clock. All 729 non-ending steps are visited; pause, saved reconstruction and phone/portrait switching are checked.
- `LANDSCAPE-EXPORT-QA.json`: one real-time chapter 2 scene 1 MP4 export with audio, opening logo and the next-scene arrival; repeated chapter 2 opening actions match; reading state and local storage are preserved. Artifact: `work/landscape-export-c2-scene-1-with-transition.mp4`.
- `LANDSCAPE-FORMAT-QA.json`: fullscreen, deliberately unavailable native fullscreen, immersive fallback, resizing and orientation checks in chapters 2, 5, 7 and 9.
- Scene screenshots and visual contact sheets are stored under `work/landscape-review-*` and `work/landscape-contact-*`.

Phone checks use simulated Edge viewports, not physical phones or Safari. No Sites release was made.

## Future scenes

Preserve the vertical composition and terrain anchors before making a wider version. Author distinct sides with the correct horizon, surface depth, palette and native pixel density. Inspect the join at full game scale, rather than accepting the generated atlas thumbnail. Do not use a regenerated center if it moves terrain beneath existing actors or boats. Give problematic rooms individual references with their original aspect ratio. Recheck outgoing background layers, paused states and portrait exports after changing the shared environment renderer.


</details>


<a id="source-qa-md"></a>
<details>
<summary>Historical source: QA.md (not current instructions)</summary>

> Retained source snapshot. Current rules and the October 14 priority table override conflicting directions, old script commands, paths, production status and QA counts.

# Local validation

The platform was tested with Edge/Chromium on simulated viewports: 360 × 740, 390 × 844, 430 × 932 and desktop 1440 × 1000. No physical phone was used.

Passed:
- Home, Search, Saved and Settings navigation, including desktop sidebar and mobile bottom navigation.
- Initial mobile Read story button above the bottom navigation; no horizontal overflow in any view.
- Save/remove, reload persistence, saved empty state, query/theme search, category filtering and no-results recovery.
- Sound, volume and automatic reading preference persistence and integration with the reader.
- English reader, library return, local checkpoint and exact passage resume.
- Return link and essential reader controls do not overlap.
- All 21 passages of the existing story in manual and automatic mode, followed by the library's Read again state.
- Text and required actors remain inside the reader framing during passages.
- No browser page errors during these flows.

Complete-story automation accelerated the animation clock to cover the sequences. Interface checks and screenshots used the normal clock. Reports: `PLATFORM-QA.json` and `STORY-INTEGRATION-QA.json`.

This version contains one story, local browser storage and no accounts, cloud synchronization or publishing dashboard. No Sites publication was performed.


</details>


<a id="source-readme-md"></a>
<details>
<summary>Historical source: README.md (not current instructions)</summary>

> Retained source snapshot. Current rules and the October 14 priority table override conflicting directions, old script commands, paths, production status and QA counts.

# Pixel Nook — local platform prototype

A mobile-first library with **The First Path**, **The Second Cup** and the complete ten-chapter adaptation **The Odyssey — The Long Way Home**. The platform and new story are in English. This version is local only; these additions have not been published to Sites.

## Run locally

Open `INICIAR.cmd` on Windows (Node.js or the existing Codex Node runtime), then visit **http://localhost:4174**. Alternatively run `node server.mjs` in this directory. Keep the server running while reading. No install or build step is required.

## What works

- Home: story cover, synopsis, reading time, Continue reading and Start from beginning when progress is saved.
- Search: title, synopsis, category and theme search; category filters and empty results.
- Saved: add/remove stories and reload persistence.
- Settings: light theme by default, saved dark mode preference, ambient sound, volume and automatic reading.
- Bottom navigation on phones; sidebar at desktop widths.
- `dist/reader.html`: the existing animated reader, with a Library return link and shared preferences. Local checkpoints are used to resume and completion is remembered.
- The Second Cup: three calm episodes (~64, 71 and 72 seconds in automatic playback), original pixel art guided by Arte, animated cup interactions and a soft synthesized water/wind/bird atmosphere without music.
- Reader menu → Story scenes: continuous reading, jump to a scene, or start continuous portrait reading from a selected scene. Portrait reading never pauses at scene boundaries; individual exports add a text-free preview of the next scene’s opening actions. The existing video margin sliders remain configurable.

Storage is browser-local. There is no authentication, synchronization or publishing dashboard. The story itself retains its bilingual data for future use; the platform currently exposes only English.

## Add stories later

Story content stays in `dist/stories/`. The reader registry is `dist/stories/catalog.json`; library presentation metadata is `dist/library.json`. Add a story to both registries, then provide its assets and compatible scene data. The source story title and description are reused by the library instead of duplicated in HTML.

Previous ZIP downloads remain unchanged. Local development continues in this workspace; publishing this complete edition to the existing Sites URL requires a later user request.

## Second story records

- `SECOND-CUP-AUDIT.md`: story staging, episode structure, verification and limitations.
- `SECOND-CUP-ART.md`: selected assets, references and accepted generation prompts.
- `SECOND-CUP-QA.json`, `SECOND-CUP-PORTRAIT-QA.json`, `SECOND-CUP-INTERACTION-QA.json`: browser verification results. These are simulated phone viewports, not physical devices.

## Export vertical videos

In a story, open the menu → Export a scene, choose a scene and whether to include ambient sound, then select Export vertical video. Download the finished file when it is ready. Exports are 720 × 1280 (9:16), use automatic reading and include no buttons, navigation, progress bars or browser UI. The scenario fills the video edge to edge. Video safety margins protect the dialogue and camera focus rather than creating an outer border, and dialogue follows the selected theme.

Every exported scene opens with a title logo that fades out over three seconds. The Odyssey uses the pixel-art “The Odyssey — Pixel Edition” logo; other stories use a title wordmark. Once the final passage has fully appeared and finished its reading hold, the caption fades away in 450 ms. The video then plays the next scene’s opening actions and holds their result briefly, without revealing its prose. Those same actions repeat in the next scene’s own export. The last available scene ends on its own artwork without inventing unavailable content. These additions apply only to exports.

The export plays an independent copy of the same story engine and scene renderer. It does not change reading progress, objects, automatic-mode preferences or saved checkpoints. All scenes in The First Path and The Second Cup are available.

Export happens locally in real time. Keep the browser tab visible: switching away cancels the job to avoid incomplete animation or audio. Browsers with MP4 recording support produce H.264/AAC MP4; otherwise the exporter uses supported WebM. Unsupported browsers show an unavailable message. No export server, upload or external publishing is involved.

Verification: PIXEL-NOOK-QA.json, PIXEL-NOOK-LAYOUT-QA.json and VIDEO-EXPORT-QA.json. One full normal-speed MP4 was decoded and visually inspected, and scene selection, sound inclusion, cancellation and progress preservation were tested. Phone tests use simulated viewports in Edge, not physical phones.

## The Odyssey — complete local series

Visit `http://localhost:4174/#story/the-odyssey` for the series sheet. All ten chapters are available, with 51 scenes and approximately 56 minutes of automatic reading before export previews. Chapter 1, **The Shore That Wasn’t Home**, has five scenes and 51 passages. Chapter 2, **The House That Waited**, adds five scenes and 45 passages. Chapter 3 reaches Scheria; Chapters 4–7 recount the voyage; Chapters 8–10 complete the return to Ithaca.

The final five chapters add 25 scenes and 174 passages: **The Voices Below**, **What the Sea Keeps**, **Home, Unrecognized**, **The Bow in the Hall** and **The Tree Beneath the Bed**. Important actions have visible props and authored poses: Elpenor's oar is planted above his grave, Odysseus is tied to a real mast, the ship becomes wreckage, Eurycleia kneels to wash his bare foot, a single arrow passes the twelve axes, and Penelope's rooted bed stays in one place. The concluding conflict is deliberately abridged around Athena's intervention. See `ODYSSEY-CHAPTERS-6-10-ACTION-AUDIT.md` for the adaptation and continuity contract, and `work/odyssey-chapters-6-10-art.json` for the eleven generation prompts and asset paths.

New assets follow the actual `concept_art/Escenas` and `concept_art/Personajes` references. Odysseus, Calypso and Hermes have separate directional sprites and portraits. Tools, raft, sail, supplies and departure persist through save/resume; first-chapter completion is separate from whole-story completion. The same renderer and story engine are used for the five video exports.

Starting from scratch shows the welcome. Continuing opens the checkpoint directly. Mobile portrait uses the visible viewport; desktop portrait and exports use 9:16. Safety margins apply to reading content and camera framing, while the scene fills the frame.

Chapter 2 has four new pixel-art environments and six characters guided by the Arte references. Penelope walks to the loom, sits and unpicks its cloth; the shortened cloth persists when Eurycleia returns. Telemachus offers bread, boards a boat along a visible gangplank, sails away and lifts/lowers a cup in Sparta. Room entrances open wider before settling into close reading shots. Quiet room ambience transitions to water at the harbor. `chapter=chapter-2` selects the chapter; generic Continue reading resolves its saved passage automatically. Chapter 1's completion offers Chapter 2, and completion is stored separately for each chapter. Export filenames include the chapter to avoid replacing another chapter's scene video.

See `ODYSSEY-CHAPTER-2.md`, `ODYSSEY-CHAPTER-2-ART.md`, `ODYSSEY-CHAPTER-2-LAYOUT-QA.json`, `ODYSSEY-CHAPTER-2-INTERACTION-QA.json`, `ODYSSEY-CHAPTER-2-EXPORT-QA.json` and `ODYSSEY-CHAPTER-2-NORMAL-EXPORT-QA.json`. These are simulated Edge viewports, not physical phones. A complete normal-speed sample is saved at `work/odyssey-c2-scene-3-with-transition.mp4`.

See `ODYSSEY-ART.md`, `ODYSSEY-AUDIT.md`, `ODYSSEY-LAYOUT-QA.json`, `ODYSSEY-INTERACTION-QA.json` and `ODYSSEY-EXPORT-QA.json`. Phone widths are simulated browser sizes, not physical-device tests. Full-story QA of the two existing stories remains part of regression validation.

Portrait continuity verification: `PORTRAIT-CONTINUOUS-QA.json` tests both portrait entry buttons, complete automatic reading of all three available stories at simulated phone and desktop sizes, legacy stop-at-scene preferences, and recovery from an already-open scene boundary.

Export configuration lives with story data: `videoExport.logo.src` and `durationMs`, `captionFadeMs`, `previewHoldMs`. Optional per-scene `videoExport.openingThrough` can stop an opening preview after a specific action; the default uses contiguous opening actions before the first passage. The normal reader never consumes the export-only sequence.

## Complete Odyssey verification

`ODYSSEY-FINALE-QA.json` collects the final results for Chapters 6–10. All 174 passages passed 1,914 layout checks across 55 chapter/viewport combinations: phone widths of 360, 390 and 430, short phone screens, desktop and portrait reading. Manual/automatic playback, 348 checkpoint comparisons, 69 character fade checks, pause, history, resume, fullscreen/immersive mode, rotation and continuous portrait reading passed. The final chapter offers a clean ending and replay; the whole-series read flag requires all ten chapter completion flags.

All 25 new video exports passed integration recording with an 8× story clock, including the caption fade, repeated next opening, no following prose, cancellation and unchanged reader/storage. Three samples were recorded at normal speed, fully decoded as 720×1280 H.264/AAC MP4, and visually inspected. They are saved as `work/odyssey-c7-scene-1-with-transition.mp4`, `work/odyssey-c9-scene-2-with-transition.mp4` and `work/odyssey-c10-scene-3-with-transition.mp4`. Four contact sheets compare 20 character identities/directions and the special actions with the original family. The First Path, The Second Cup and navigation from Chapter 5 to Chapter 6 passed regression checks.

These are Edge simulations, not physical-phone or Safari/iOS tests. Export previews remain within a chapter; its last scene ends on its own art. The complete local edition has not been published to Sites.

Export logo/transition verification: `VIDEO-TRANSITIONS-QA.json` covers all 11 available scenes using an accelerated integration-test clock, with/without ambient sound, cancellation and unchanged reading/storage. `VIDEO-NORMAL-TRANSITION-QA.json` checks all repeated Odyssey opening models and records two complete normal-speed examples under `work/odyssey-scene-1-with-transition.mp4` and `work/odyssey-scene-2-with-transition.mp4`. Captured and decoded frames confirm the fading title and caption-free character arrivals. Recording cadence depends on browser resources; these are Edge browser simulations rather than physical-phone tests.


</details>
