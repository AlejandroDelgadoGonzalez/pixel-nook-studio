# Art, atlas cells and panoramas

> **Current visual authority:** `concept_art/characters/` and `concept_art/scenes/`; exact catalog approval states apply. Native-only character cleanup, complete source heads and four logical transparent storage cells are mandatory. The 68-row authoring filter is disabled. See the permanent Zero Bounding-Box Clipping rule in profiles 03/05.


Current rules precede historical source excerpts. The canonical character reference is stories/the-odyssey/assets/atlases/characters/odyssey-core.png (originally odyssey-atlas-v1.png), especially Odysseus, Calypso and Hermes. Only `concept_art/` is the active reference collection; its manifest pins byte-identical copies of Odyssey core, Second Cup people and Odyssey panorama-c4-2. The former coarse/hyperdetailed references are archived outside that active tree.

- **Golden Master density is mandatory:** use direct approved sources in `concept_art/`, native pixel contracts and source-head alpha preservation. No chained scene generation, row deletion or 68-row character projection. Preserve measured physical sizes, anchors and the runtime two-world-pixel grid. Backgrounds retain their independent measured density/overscan contracts.


- Use chunky pixel clusters, stepped diagonals, dark continuous outlines, expressive large heads, rectangular eyes and limited flat palettes with two or three shade blocks per material. No gradients, smooth illustration, painterly highlights or antialiasing.
- Draw every character through platform/rendering/character-art.js. Preserve the two-world-pixel grid, hard alpha and nearest-neighbor scaling. Portraits come from the same normalized textures. Keep identity, standing height and foot anchors stable.
- Author front, right, back and interaction poses; mirror right for left where appropriate. Use real authored sleeping, bound, kneeling, hanging, seated, aiming and released poses. Do not squash an idle sprite to imitate an interaction. The four fleet sailors are front-only deck extras, a documented exception to directional-pose requirements.
- Keep people and interactive props separate where the existing atlas permits it. Do not edit a final mixed atlas just to reorganize its file. Held hands are empty unless the story requires a permanent object. Preserve legitimate detached details such as wings and staffs.
- Measure transparent gutters and complete feet; never assume equal rows. Share reused cell definitions in the story's shared/atlas-cells.js. Ithaca hosts use y=[0,476,887] on their 1774x887 sheet; Hermes's side crop ends at y=961 in reference coordinates to exclude the adjacent mast. Original prop cuts include the x=932 boundary. Preserve other measured cuts in the renderers.
- Generated walking leg cuts, half-body splits, strides and lifts must remain complete two-pixel blocks. Inspect every direction, mirrored texture and interaction pose at equal standing height, then at 360/390/430 px, desktop and portrait/export size.
- Author phone composition first, then extend the same staging. Horizontal Odyssey environments use one complete panorama at uniform pixel density. No mirrored or repeated center, separate mismatched wings, sharper center overlay, feathered seams, stretched ground or compressed uniform aspect ratio.
- **Mandatory Canvas Margin / Overscan rule (1.25xâ€“1.35x) for every newly created panorama:** author the complete canvas between 1.25x and 1.35x larger around the main 16:9 frame, preserving pixel density and sharpness, with 25%â€“35% extra sky above, ground below and lateral scenery outside the base frame. Paint genuine continuous scenery; never tile, stretch or resize the center to simulate extra margin. Record the base 16:9 rectangle, complete canvas bounds, margins and uniform world mapping in the story's `shared/` geometry. On a standard 16:9 screen, frame that central area with the planned slight base zoom. As the window becomes taller, square or affected by browser bars, cover its edges by revealing the overscan instead of forcing additional zoom onto the characters. Validate full-viewport coverage and complete bodies clear of the dialogue panel in those formats; resolve insufficient measured margins before implementation.
- Preserve original phone/portrait artwork, world coordinates, terrain anchors and framing. Retain approved vertical off-frame fill only where still required. Never render those fill textures horizontally. Preserve approved Chapter 2 panorama proportions.
- Keep each complete panorama's authored ground depth. Inspect all edges at the real reading camera, including outgoing layers, orientation changes, immersion and exports. Extend complete artwork if limiting the camera would hide required people behind dialogue. Never hide the floor while leaving the camera outside the art.
- Both current and previous layers refit on orientation changes. Restore native floors on return to portrait when the environment permits them. New bounded exteriors use the complete panorama with the approved central crop; Chapter 4's final departing-boat shot explicitly permits the complete panorama in vertical mode.
- Keep final pixels unchanged during migration. Store actual dimensions and provenance; do not claim requested 4K output when the generated image was smaller.


<a id="source-chapter-2-panoramas-md"></a>
<details>
<summary>Historical source: CHAPTER-2-PANORAMAS.md (not current instructions)</summary>

> Retained source snapshot. Current rules and the October 14 priority table override conflicting directions, old script commands, paths, production status and QA counts.

# Chapter 2 continuous panorama trial â€” 2026-10-11

The user selected the complete harbor panorama as the desired horizontal composition and initially limited the trial to Chapter 2. The user has since reviewed and approved it and authorized the same correction in other affected chapters. Chapter 2 remains unchanged; the approved rollout is documented in `PANORAMA-BACKGROUNDS.md`.

The previous renderer combined a high-resolution native center with lower-resolution wings extracted from a four-room atlas. Their separately drawn architecture and pixel density did not match. Chapter 2 now renders each horizontal environment as one complete image with a uniform source resolution and its natural 3:1 aspect ratio. There is no differently drawn center overlay, feathered join, mirrored scenery or separate wing. Current and outgoing backgrounds follow the same policy. Below the artwork, the floor continues from that panorama's own bottom strip.

Four individual 2172 Ã— 724 backgrounds replace the 1086 Ã— 362 atlas panels, giving four times the source pixel count per horizontal environment. They retain the approved complete panorama compositions, with sharper pixel clusters referenced to the original phone artwork. The built-in image generation tool produced them; requested 3840 Ã— 1280 output was not returned, so these assets must not be described as 4K.

Saved assets:

- [Moonlit chamber](<C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/dist/assets/odyssey-c2-chamber-panorama-v3.png>)
- [Entrance hall](<C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/dist/assets/odyssey-c2-hall-panorama-v3.png>)
- [Harbor](<C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/dist/assets/odyssey-c2-harbor-panorama-v3.png>)
- [Sparta](<C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/dist/assets/odyssey-c2-sparta-panorama-v3.png>)

The exact prompts, reference paths, output paths and actual dimensions are recorded in [CHAPTER-2-PANORAMA-PROMPTS.json](<C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/CHAPTER-2-PANORAMA-PROMPTS.json>). Reference crops and generated originals are retained. Story data, actor coordinates, characters, dialogue, controls and checkpoints are unchanged.

## Trial verification (before rollout)

- `CHAPTER-2-PANORAMA-QA.json`: all 74 chapter steps reconstructed in seven layouts: 360/390/430 Ã— 844 phones, 390 Ã— 844 portrait, and 1366 Ã— 640, 1440 Ã— 900 and 2560 Ã— 1080 desktops. Required people and objects remain in the reading area, and the sampled dialogue panels have no text clipping or horizontal page overflow.
- Phone/portrait models and camera frames match the pre-change helper exactly at every step. Twenty rendered passage comparisons, covering all five scenes at four vertical layouts, are pixel-identical before and after. The existing phone artwork is retained.
- Forty-seven captures cover scene passages plus sampled entrances, the harbor approach, boarding and departure. Visual review included the complete background joins, continuous masonry and shore, actor/furniture placement and clear ground during arrivals. Action captures can retain the previous test paragraph; use passage captures for accurate text/scene pairs.
- Paused scene transitions keep their model and clock fixed. Fullscreen and portrait/landscape resizing preserve the current reading state and choose the appropriate background format.
- Ten rendered before/after comparisons of Chapters 4 and 9, the other chapters shown in the user's screenshots, are pixel-identical. Their existing extension policy remains unchanged.
- `CHAPTER-2-PANORAMA-EXPORT-QA.json`: a frame from the actual 720 Ã— 1280 harbor export preview is pixel-identical before and after. The export is cancelled after capture; reading state and local storage are preserved. No new encoded MP4 was produced for this visual correction.
- Zero page errors in these checks.

Phone tests used simulated Edge viewports, not physical devices or Safari. Work remains local at localhost:4174. The Chapter 2 result has been approved for application to other affected chapters.

Reproduce with `work/chapter-2-panorama-qa.cjs` and `work/chapter-2-panorama-export-qa.cjs`. The former routes the saved `work/landscape-c2-before-continuous.js` helper for native-format and other-chapter comparisons.


</details>


<a id="source-character-art-style-md"></a>
<details>
<summary>Historical source: CHARACTER-ART-STYLE.md (not current instructions)</summary>

> Retained source snapshot. Current rules and the October 14 priority table override conflicting directions, old script commands, paths, production status and QA counts.

# Pixel Nook character art

The permanent visual reference is `dist/assets/odyssey-atlas-v1.png`: Odysseus, Calypso and Hermes. All future stories must match this family.

- Chunky RPG pixel clusters, stepped diagonals and a continuous dark outline.
- Flat, limited palettes: two or three shade blocks per material. No smooth gradients, soft edges or painterly highlights.
- Large expressive heads, rectangular eyes and readable clothing silhouettes. Preserve each identity across all directions and portraits.
- Author front, right walking, back and right interaction poses; left uses mirroring. Keep held story objects separate and hands empty unless the script requires otherwise.
- Transparent backgrounds, equal cells, generous gutters, feet wholly inside each cell. Furniture goes in a separate atlas.
- Every renderer imports `drawCharacter` from `dist/character-art.js`. It uses a common two-world-pixel grid, hard alpha and nearest-neighbor drawing. Portraits come from the same normalized character texture.
- Generated walking frames must keep leg cuts, half-body splits, strides and foot lifts on that same two-world-pixel grid. An odd cut can slice an outline block into a one-pixel strip. Chapter 3's `Scheria.walkFrames` snaps these values before drawing; verify the complete walking cycle as well as the standing pose.
- Preserve story-specific standing heights and foot positions. Do not change narrative blocking just to fit new art.

Before accepting assets, inspect all poses side by side at equal standing height alongside the three reference characters, then check the actual reader at 360, 390 and 430 px, desktop and portrait export. Check eyes, outline weight, palette, feet, hand-to-object contact, seated poses and cropping. Keep story IDs and reading checkpoints stable.

Check every crop for pixels belonging to a neighboring atlas cell before normalizing its size or generating walking frames. Transparent gutters can contain the tip of an adjacent object. Hermes's side pose in the original atlas ends at y=956, while the sail below begins at y=965. `odysseyCharacterCell` stops that cell at y=961 and is shared by Odyssey and Aeaea, preventing a detached black line beneath his feet. Keep wings, staff and outlines intact; do not apply a blanket removal of disconnected details. Review generated and mirrored walking poses too. See `HERMES-ART-QA.md`.

Current atlases: `first-path-people-v2.png`, `second-cup-people-v3.png`, `odyssey-atlas-v1.png`, `odyssey-ithaca-atlas-v2.png`, `odyssey-ithaca-hosts-v2.png`, under `dist/assets/`. Original props remain separate and unchanged.

Chapter 3 adds `odyssey-scheria-people-v1.png`: Nausicaa, Arete, Alcinous and Demodocus, each with four matching poses. `Scheria` reuses the original Odysseus row and the shared character grid. Atlas cuts follow the transparent gutters, not assumed equal row heights; inspect crops before approving. The bard's eyes are closed and his interaction pose is seated; this identity difference preserves the same pixel density and outlines.

Chapter 4 adds `odyssey-cave-people-v1.png`: Doros, Eurylochus, a lotus islander and Polyphemus. The giant is physically larger but uses the same character grid and outline family. `odyssey-under-ram-v1.png` contains authored horizontal hanging poses for Odysseus and Eurylochus; do not squash standing sprites for this action. `odyssey-cyclops-actions-v1.png` adds the giant's standing wine and prayer poses. Closed-eye runtime textures derive from these same character drawings. `Cyclops` continues to reuse the unchanged original Odysseus row for ordinary directions and portraits.

Chapter 5 adds `odyssey-aeaea-people-v1.png`: Aeolus, Circe and Polites, each with four poses. `Aeaea` reuses the unchanged Odysseus and Hermes rows and Chapter 4's Eurylochus row. The authored sleeping Odysseus and back-facing Laestrygonian giant are in `odyssey-winds-actions-v1.png`. People atlas gutters are measured at x=399/770/1130 and y=346/691; they are not assumed to be exact quarters. Human-to-pig transformation crossfades two complete silhouettes at one foot position. The same two-world-pixel policy applies to all new people, the sleeping pose and the distant giant.

Chapters 6â€“10 add `odyssey-underworld-people-v1.png` (Anticleia, Tiresias, Elpenor and Achilles) and `odyssey-homecoming-people-v1.png` (Eumaeus, Odysseus' old disguise, Laertes and Antinous). They each have front, right, back and interaction poses. The dead use whole-character opacity rather than a different drawing style. Existing Odysseus, Circe, Calypso, Athena, Telemachus, Penelope, Eurycleia, Alcinous and companions retain their established atlases.

`Homecoming` uses authored bound, seated barefoot, clinging, stringing and bow-release poses in `odyssey-return-actions-v1.png`, `odyssey-disguise-sea-actions-v1.png` and `odyssey-bow-actions-v1.png`. `odyssey-nurse-kneeling-v1.png` gives Eurycleia a low reaching gesture at the scarred leg. Keep these specific gestures when extending the staging; ordinary standing figures cannot replace them. Disguised portraits use the same grey-haired sprite in both the reader and exports. Every pose still uses `drawCharacter` and the original character grid.

All cell boundaries are recorded in `work/build-odyssey-finale.py`. In particular, the reused elder row of `odyssey-ithaca-hosts-v2.png` begins at y=476; an assumed midpoint includes pixels from the preceding row. Both `Ithaca` and `Homecoming` use the shared `ithacaHostCell` in `dist/character-art.js`: the 1774 Ã— 887 sheet has row boundaries [0, 476, 887], preserving Menelaus's complete feet and excluding them from the elder. Extract clean cells before deriving portraits and walking frames. See `ITHACA-HOST-CROPS.md` for the verified regression checks. New backgrounds are tall compositions with continuous ground or water, not repeated strips. Furniture, targets, animals and held objects remain separate. The bed and olive root are one immovable object.


</details>


<a id="source-hermes-art-qa-md"></a>
<details>
<summary>Historical source: HERMES-ART-QA.md (not current instructions)</summary>

> Retained source snapshot. Current rules and the October 14 priority table override conflicting directions, old script commands, paths, production status and QA counts.

# Hermes atlas crop correction â€” 2026-10-10

The reported black line was a fragment of the adjacent sail's mast, not Hermes's outline or ground shadow. The nominal side-pose cell contained the character at source y=658â€“956 and 115 unrelated pixels at y=965â€“969. Normalization turned the fragment into 18â€“20 opaque pixels underneath Hermes and duplicated it in the side-walking frames.

`odysseyCharacterCell` in `dist/character-art.js` excludes the neighboring mast before silhouette measurement and pixel normalization. Both `Odyssey` (chapter one) and `Aeaea` (chapter five) use the same crop. The original atlas, other characters, props, story actions and reading checkpoints were preserved.

`work/hermes-sprites-before.json` and `work/hermes-sprites-after.json` record all 48 Hermes textures: four authored poses and 16 walking frames in chapter one, plus four poses and 24 walking frames in chapter five. After correction, every texture has one connected silhouette and no detached fragment. Corresponding contact sheets were visually inspected, including boots, wings, staff, outline and walking frames.

`CHARACTER-LAYOUT-QA.json` includes refreshed phone 360/390/430, desktop and portrait checks for both affected chapters. `HERMES-EXPORT-QA.json` records 720 Ã— 1280 test exports of chapter one / scene three and chapter five / scene six. Export checks use a four-times accelerated clock; phone layouts are Edge simulations, not physical devices. Work stays local.


</details>


<a id="source-ithaca-host-crops-md"></a>
<details>
<summary>Historical source: ITHACA-HOST-CROPS.md (not current instructions)</summary>

> Retained source snapshot. Current rules and the October 14 priority table override conflicting directions, old script commands, paths, production status and QA counts.

# Ithaca host crop correction

Chapter 2 split the 1774 Ã— 887 `odyssey-ithaca-hosts-v2.png` sheet at its assumed midpoint, y=444. Menelaus's feet reach y=464, so this cut truncated his boots and included their remaining pixels above the elder's head. The dialogue portrait inherited the same contaminated texture.

`ithacaHostCell` in `dist/character-art.js` now supplies the measured transparent gutter at y=476 to both `Ithaca` and `Homecoming`. The original artwork, story content, standing heights, foot anchors and saved checkpoints are unchanged. Clean base textures supply portraits and generated walking frames.

Verified locally on 2026-10-11:

- All eight source cells have transparent outer borders and one connected silhouette at the rendering alpha threshold. No neighboring fragments or cut feet remain.
- Visually reviewed all four directions for Menelaus and the elder, both portraits and their 48 generated walking frames in Chapter 2.
- The reused elder in Chapter 10 remains pixel-identical to the previous version across all 29 base, walking and portrait textures.
- Both characters and portraits checked in the reader at 1366 Ã— 640, 360 Ã— 844, 390 Ã— 844 and 430 Ã— 844, plus explicit portrait mode at 390 Ã— 844. Phone tests used simulated Edge viewports, not physical devices.
- Captured both characters and portraits through the actual 720 Ã— 1280 export renderer. Cancelled after preview capture and verified that reading state and local storage were preserved. A complete encoded MP4 was not part of this crop check.
- No browser page errors in these checks.

Evidence: `ITHACA-HOSTS-CELLS-QA.json`, `ITHACA-HOSTS-QA.json`, `ITHACA-HOSTS-EXPORT-FRAMES-QA.json`, the before/after contact sheets and individual reader/export captures under `work/`. Reproduce using `work/ithaca-hosts-inspect.cjs --after` and `work/ithaca-hosts-qa.cjs` against localhost:4174.

Future reused atlases must share measured cuts rather than assuming equal rows. Inspect source neighbors before normalizing or deriving secondary textures; retain legitimate disconnected details in other sprites instead of applying a blanket component filter.


</details>


<a id="source-nausicaa-feet-qa-md"></a>
<details>
<summary>Historical source: NAUSICAA-FEET-QA.md (not current instructions)</summary>

> Retained source snapshot. Current rules and the October 14 priority table override conflicting directions, old script commands, paths, production status and QA counts.

# Chapter 3: Nausicaa's walking feet

The reported thin vertical black line came from derived front-facing walking frames, not a neighboring atlas cell. The normalized front pose is 86 pixels wide; the old x=43 half-body split cut a two-pixel outline block in half. Leg cuts and stride offsets also used odd coordinates.

`dist/scheria.js` now snaps those cuts and movements to the same two-world-pixel grid used by `drawCharacter`. Original character textures, portraits, story data, entry paths and timing remain unchanged. The fix applies to Chapter 3's derived walking textures.

Local verification:

- Inspected all four Nausicaa poses and all 24 derived walking frames before and after.
- Checked every two-by-two pixel block in all 120 Chapter 3 walking frames: zero split blocks after the correction. The reproduced old Nausicaa front frame had 370 mismatched blocks.
- Captured the reported front-facing entry frame on desktop 1366 Ã— 640, simulated Edge widths 360, 390 and 430, and 390 portrait mode.
- Verified the manual entry, automatic endpoint `(875, 960)` and left-facing turn, pause stability, and checkpoint reconstruction.
- Opened and cancelled the real scene 2 export preview twice and checked that it uses the corrected walking texture.
- No browser page errors. No physical phone, Safari or completed encoded-video test was performed.

Evidence: `NAUSICAA-FEET-QA.json`, `work/nausicaa-sprites-before.png`, `work/nausicaa-sprites-after.png`, `work/nausicaa-feet-*.png`, and `work/nausicaa-export-preview-*.png`.


</details>


<a id="source-panorama-backgrounds-md"></a>
<details>
<summary>Historical source: PANORAMA-BACKGROUNDS.md (not current instructions)</summary>

> Retained source snapshot. Current rules and the October 14 priority table override conflicting directions, old script commands, paths, production status and QA counts.

# Complete Odyssey panoramas â€” approved rollout, 2026-10-11

The user approved Chapter 2's full-background result and authorized the same correction in every other affected chapter. Chapters 4â€“10 now render one complete panorama per horizontal environment. Chapters 1 and 3 already have complete backgrounds. Chapter 2 retains its approved images, source proportions and framing.

The previous horizontal implementation overlaid a sharper native center on independently generated lateral sections. That produced different texture density and visible joins in floors, columns and shorelines. The shared helper now selects a single image for the full horizontal environment and hides every legacy wing, including outgoing layers. There is no mirrored scenery, separate center overlay or feathered horizontal join.

The new canvases were authored as three original widths at the original full height. Taller vertical environments retain their terrain depth rather than being compressed into a uniform 3:1 panorama. World coordinates, actor staging, dialogue, action sequences, controls and the tighter desktop camera policy are unchanged. The floor continuation in the Cyclops and Aeaea renderers uses the active panorama's own complete bottom strip, including during dissolves.

Follow-up on October 13: Chapter 4's coast exposed repeated rows from that floor continuation below its original bottom edge. It now uses `odyssey-panorama-c4-0-ground-v4.png`, one deeper complete panorama, and hides its tiled floor on desktop in both active and outgoing layers. Its camera stays inside the authored ground. Native phone/portrait/export rendering and the other panoramas remain unchanged. See `C4-BOTTOM-EDGE.md` and `C4-BOTTOM-EDGE-QA.json` for the superseding coast asset and checks.

Phone, portrait and vertical exports continue to render the existing native image. Some very wide vertical establishing shots reach beyond that image; their existing off-frame fill is preserved to avoid an empty strip. Those side textures are never shown in horizontal mode. Both active and outgoing background layers refit on orientation changes.

## Artwork and prompts

Twenty individual bitmap assets were created with the built-in image generation tool in editing/outpainting mode, guided by the original native scene and the earlier wide context. They use a single uniform source resolution across each complete frame. The returned assets range from 1628â€“2172 pixels wide and 724â€“966 pixels high; they are not 4K assets. Their exact dimensions, complete prompts, references, generated original paths and saved paths are recorded in [PANORAMA-ART-PROMPTS.json](<C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/PANORAMA-ART-PROMPTS.json>).

| Environment | Chapters | Saved panorama |
| --- | --- | --- |
| Island coast | 4 | [c4-0 ground v4](<C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/dist/assets/odyssey-panorama-c4-0-ground-v4.png>) |
| Rough open sea | 4, 5 | [c4-3](<C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/dist/assets/odyssey-panorama-c4-3-v3.png>) |
| Lotus shore | 4 | [c4-1](<C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/dist/assets/odyssey-panorama-c4-1-v3.png>) |
| Cyclops cave | 4 | [c4-2](<C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/dist/assets/odyssey-panorama-c4-2-v3.png>) |
| Aeolus courtyard | 5 | [c5-0](<C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/dist/assets/odyssey-panorama-c5-0-v3.png>) |
| Circe's house | 5 | [c5-1](<C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/dist/assets/odyssey-panorama-c5-1-v3.png>) |
| Island harbor | 5 | [harbor-wide ground v4](<C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/dist/assets/odyssey-panorama-harbor-wide-ground-v4.png>) |
| Aeaea forest | 5, 6 | [c5-3](<C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/dist/assets/odyssey-panorama-c5-3-v3.png>) |
| Dark shore | 6 | [voyage-0](<C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/dist/assets/odyssey-panorama-voyage-0-v3.png>) |
| Open sea | 7 | [sea-wide-full](<C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/dist/assets/odyssey-panorama-sea-wide-full-v3.png>) |
| Strait | 7 | [voyage-1](<C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/dist/assets/odyssey-panorama-voyage-1-v3.png>) |
| Sun god's island | 7 | [voyage-2](<C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/dist/assets/odyssey-panorama-voyage-2-v3.png>) |
| Storm | 7 | [passage-1](<C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/dist/assets/odyssey-panorama-passage-1-v3.png>) |
| Calypso's island | 7 | [passage-2](<C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/dist/assets/odyssey-panorama-passage-2-v3.png>) |
| Scheria | 7 | [passage-3](<C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/dist/assets/odyssey-panorama-passage-3-v3.png>) |
| Ithaca shore | 8 | [voyage-3](<C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/dist/assets/odyssey-panorama-voyage-3-v3.png>) |
| Eumaeus's hut | 8 | [home-0](<C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/dist/assets/odyssey-panorama-home-0-v3.png>) |
| Orchard | 9, 10 | [home-3](<C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/dist/assets/odyssey-panorama-home-3-v3.png>) |
| Palace hall | 9, 10 | [home-1](<C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/dist/assets/odyssey-panorama-home-1-v3.png>) |
| Bedchamber | 10 | [home-2](<C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/dist/assets/odyssey-panorama-home-2-v3.png>) |

Reference crops and the blank-side authoring canvases are retained under `work/panorama-*-native.png` and `work/panorama-*-target.png`. No character or story assets were regenerated.

## Verification

- `PANORAMA-ALL-QA.json`: all ten chapters in seven layouts (70 combinations): 360/390/430 Ã— 844 phone reading, 390 Ã— 844 portrait, and 1366 Ã— 640, 1440 Ã— 900 and 2560 Ã— 1080 desktop. All 5,173 step/layout reconstructions passed the required actor/object framing checks. The first complete paragraph in every scene was checked for clipped text and horizontal page overflow. There were no page errors.
- All phone/portrait models and camera frames match the saved pre-change helper at every step. The 249 rendered passage comparisons are pixel-identical: all 51 scenes in four vertical layouts, plus Chapters 1, 2 and 3 in three desktop layouts. The approved Chapter 2 result is unchanged.
- `PANORAMA-PLAYBACK-QA.json`: complete automatic playback of all ten chapters, with an accelerated test clock. All 729 non-ending steps were visited without skipped sequences. Pausing leaves the model, clock and camera fixed; saved-step reconstruction retains the model. Phone and portrait switching passed.
- `PANORAMA-FORMAT-QA.json`: Chapters 2 and 4â€“10 passed native fullscreen in headless Edge, deliberately unavailable native fullscreen with immersive fallback, phone resizing and rotation back to landscape. Progress and pause state remain unchanged; active and outgoing legacy wings remain hidden in horizontal mode.
- `PANORAMA-EXPORT-QA.json`: seven before/after pairs from the actual vertical export renderer, covering a scene in each changed chapter. All 720 Ã— 1280 preview frames are pixel-identical to the previous vertical composition. Cancelling and closing the export preserves reading state and local storage. These exports were cancelled after the captures; no new encoded MP4 was produced for this visual correction.
- Visual review covered the first paragraph of all 51 scenes and all 20 distinct replacement environments, including rooms introduced later within a scene. Captures are retained in `work/landscape-review-*`, `work/panorama-*`, and the four `work/panorama-room-contact-*.png` sheets. `PANORAMA-VISUAL-ROOMS.json` maps each replacement to its visible passage. Review included continuous floors, columns, water/shore boundaries, the hall doors, and actor/prop placement.

Phone tests used simulated Edge viewports, not physical phones or Safari. The sources retain their actual generated resolution; wider displays enlarge pixel art rather than create extra image detail.

Reproduce the focused checks with `work/panorama-all-qa.cjs`, `work/panorama-format-qa.cjs`, `work/panorama-export-compare.cjs`, `work/panorama-playback-qa.cjs` and `work/panorama-room-review.cjs`. The before/after tests route the saved helper in `work/landscape-before-all-continuous.js` without changing the running project.

Work remains local at [localhost:4174](http://localhost:4174/#story/the-odyssey). No Sites release was made.


</details>


Puppet Limb Tweening Ban (2026-11-13): never cut, detach, overlay, rotate, warp or interpolate anatomical parts. Use intact authored full-sprite pose swaps for pickup, pocketing, offering and consumption, and intact authored cells for new locomotion; preserve feet roots and face the route before X moves. Whole-character travel and uniform magical scaling remain allowed. This permanent rule overrides older limb/mesh/derived-leg instructions.
