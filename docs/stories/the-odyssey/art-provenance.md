# The Odyssey: art provenance

Final assets and SHA-256 values are in ../../migration/asset-inventory.json. Selected pixels are unchanged. Historical asset names map to current paths there. The canonical art family and shared cuts are governed by ../../rules/art-and-panoramas.md.


<a id="source-odyssey-art-md"></a>
<details>
<summary>Historical source: ODYSSEY-ART.md (not current instructions)</summary>

> Retained source snapshot. Current rules and the October 14 priority table override conflicting directions, old script commands, paths, production status and QA counts.

# The Odyssey — art records

Created with the built-in image generation tool, using the local references below. The original references were not overwritten. Runtime cropping of the transparent atlas selects individual sprites; it is not a replacement for authored character art.

## References inspected and supplied to generation

- `../concept_art/Escenas/Codex Image Sep 13, 2026, 12_53_09 PM.png`: lush 3/4 RPG village perspective, color clustering, pixel detail and vegetation.
- `../concept_art/Escenas/Codex Image Sep 13, 2026, 12_53_40 PM.png`: layered environment, stone, water, warm lamp and depth.
- `../concept_art/Personajes/Codex Image Sep 13, 2026, 12_52_29 PM.png`: chunky expressive heads, strong contours and simple readable silhouettes.

## Final project assets

- `dist/assets/odyssey-island-v1.png`: square island scene, displayed in a 1536 × 1536 world. Central sand and sea form the primary vertical composition. Desktop reveals the cave and vegetation at the sides.
- `dist/assets/odyssey-atlas-v1.png`: transparent atlas, three character rows and one prop row. Odysseus, Calypso and Hermes each have front, right, back and reaction/work poses; left is mirrored. The lower row supplies bound timber, a rigged raft, tools and provisions. Generated row boundaries were visually inspected and authored explicitly in the renderer.

## Accepted island prompt

Create one game BACKGROUND asset for The Odyssey chapter one in Pixel Nook. References are STYLE REFERENCES ONLY: match their lush detailed chunky crisp pixel art, dark pixel contours, clear clustered colors and 3/4 top-down RPG perspective. New subject: Calypso's Mediterranean island, peaceful golden daylight. NO UI, NO text, NO people, NO boats, NO raft, NO loose tools. Square image 1536x1536 if possible. Design VERTICAL FIRST: central narrow composition is a usable phone shot. Top 48 percent turquoise open sea, gently curving shoreline at y=690. Center middle sandy shore with unobstructed clear sand across x=400..1100 y=700..1150 for animated actors and a raft to be added separately. At LEFT edge only: small ancient Greek vine-covered stone shelter / cave entrance, olive trees, purple flowers, warm little hanging lamp. At right edge rocky headland with pines. Bottom corners lush olive foliage framing open central sandy space. Sea horizon implied by distant low islands top, no modern buildings. A flat rock seat on left of central sand at x=530 y=840. Wide horizontal versions will reveal edge context but vertical central sand+sea must read beautifully. No photographic gradients, no painted blur, no isometric diamonds, no modern props. Pixel texture and scales coherent with reference, warm quiet atmosphere. All large interactive open sandy area must stay clear; the boat and people will be runtime sprites.

## Accepted sprite prompt

Production pixel art sprite atlas for a warm quiet RPG adaptation of Homer's Odyssey. Match the reference chunky chibi sprites exactly in visual language: big expressive heads, simple dark eyes, strong black/brown pixel outline, restrained pixel clusters, 3/4 RPG perspective. Genuine transparent background, NO text NO grid lines NO shadows painted in. Square image, a STRICT 4 columns by 4 rows equally sized grid. Each sprite entirely contained in its own cell, center aligned, same human scale, wide blank gaps. Row1 all ODYSSEUS: mature brown-haired man with short brown beard, worn cream Greek tunic, muted teal shoulder cape, leather belt and brown sandals. Columns 1 front idle,2 right profile walking,3 back looking away,4 right profile kneeling/reaching hands forward to work wood (no wood baked in). Row2 all CALYPSO: long honey-gold hair with olive leaf wreath, ivory Greek dress with sage sash, gold bracelets. Columns front idle,right profile walking,back, right profile hands out offering. Row3 all HERMES: young black-haired man, short pale blue Greek tunic, rust cape, gold belt, little bronze winged travelling cap and winged sandals. Columns front idle,right profile walking,back, right profile holding slender messenger staff. Row4 props only: column1 horizontal bundle of five parallel pale wooden logs tied by TWO brown ropes, flat 3/4 topdown raft with NO sail; column2 the SAME raft footprint and TWO ropes but with a mast and triangular cream sail, readable usable boat, no people; column3 bronze axe with wood handle beside one short timber; column4 neat coil of brown rope next to two terracotta drinking flasks tied together. All 16 sprites hand finished consistent chunky pixel style, no realistic painting or modern clothes. The raft rows are props for placement on shore and ocean, isolated transparent. Strict four-by-four regular cell placement, all objects centered.

## Animation

Small leg articulation advances with traveled distance instead of translating a stiff sprite. No body bob or rotation during walking. Visible near-shore reflections and a thin pixel foam wash move slowly through a roughly seven-second cycle, alongside distant glints; the afloat raft moves by less than two world pixels vertically. Work posture and small wood flecks are restrained. The main scene clock freezes during pause. There is no overhead speaker marker; identity stays in portrait/name below.

Idle characters have a tiny breathing stretch anchored at their feet. During work, Odysseus kneels at the left-front edge of the raft; the tools sit separately to the right. Deck depth is based on the ground surface behind his working position.

The prop row uses its own third/fourth-column boundary at reference x=932 (of 1254), keeping the full rope/provisions sprite out of the axe-and-timber crop. This removes the detached strip seen beside the tools without modifying the source atlas.

## Export title logo

`dist/assets/odyssey-logo-v1.png` is a transparent pixel-art gold/navy title wordmark generated from the user’s title-logo screenshot reference. The exact lettering is “The Odyssey” and “Pixel Edition”. It is drawn only on the export canvas, above visible faces and inside the configured safe area, then fades out by three seconds. The source PNG is retained under the Codex generated-images folder; the shipped copy lives locally with the story assets.


</details>


<a id="source-odyssey-chapter-2-art-md"></a>
<details>
<summary>Historical source: ODYSSEY-CHAPTER-2-ART.md (not current instructions)</summary>

> Retained source snapshot. Current rules and the October 14 priority table override conflicting directions, old script commands, paths, production status and QA counts.

# Chapter 2 art

Generated with the built-in image-generation tool. Style references are the supplied Arte scene and character images, plus the existing Odyssey character atlas. Assets are saved locally under `dist/assets/odyssey-*-v1.png`. No generated files are referenced from temporary folders.

The sprite atlases are sliced into directional and interaction poses at runtime. Small bread, cup, thread and oil-lamp details are drawn by the scene renderer so their state can change with the story. Backgrounds keep their native aspect ratio.

Reference files: `../concept_art/Escenas/Codex Image Sep 13, 2026, 12_53_09 PM.png` and `../concept_art/Personajes/Codex Image Sep 13, 2026, 12_52_29 PM.png`, together with Chapter 1's `dist/assets/odyssey-atlas-v1.png`. The selected corrected props sheet is `dist/assets/odyssey-ithaca-props-v1.png`; the boat fits entirely in its own cell, and custom row boundaries preserve all character feet. The original rejected layout remains in `work/odyssey-ithaca-props-original.png` for comparison.

For tall phone viewports, the renderer continues each background's bottom floor texture below its native artwork. Characters can then remain above the reading panel without forcing a crop or adding outer borders. This continuation and the main artwork fade together during location changes.

## Accepted prompts

### chamber

Use case: illustration-story. Production pixel art RPG environment, square composition, no UI no words no characters. Match reference image ONLY for hand-crafted chunky pixel clusters, detailed warm village textures, 3/4 overhead orthographic game perspective and strong readable forms. Ancient Greek palace weaving chamber at night in Ithaca. Honey limestone walls, simple wooden ceiling beams, blue moonlight through a small high window, very soft amber oil-lamp illumination. Upper quarter back wall, door on right near x80% y35%, shelves and rolled linen along left edge, a quiet lamp on a wall shelf at x30% y28%. The central half at x30%-70%, y45%-72% is clear warm sandstone floor for two characters and a freestanding loom to be overlaid by game sprites; DO NOT draw loom, chairs, tables or characters in that area. Lower quarter patterned worn floor and edge of a simple woven rug, side edges have pottery and cloth baskets, central floor readable not busy. Intimate lived-in modest royal room, quiet and cozy but not luxurious. Scene must work as a tall central phone crop; desktop reveals the side furnishings. No modern objects, no rain, no photorealism, no smooth painted rendering.

### hall

Use case: illustration-story. Production pixel art game environment, square, no text no UI no characters. Match reference as stylistic guidance: warm detailed chunky 16-bit pixel clusters and 3/4 overhead orthographic RPG perspective. Interior courtyard-hall of Odysseus's house in ancient Ithaca, warm morning light, honey limestone, wooden beams, simple reddish terracotta details and ivy by an open doorway high on right x76% y35%. In the upper-left distance at x15%-35%, y24%-35%, one long dining table with a few clay jugs and plates, no chairs in central area. Center floor x35%-70% y45%-72% must be empty walkable stone for two separately rendered people and a small table. Give the door a level threshold and a clear path down to that central area, no steps between. Lower quarter a simple geometric worn rug and tiles; edge of room bounded by pots and low walls. Make a compelling vertical central composition with recognizable door, glowing stone, lush small vine accents at edges. All important central action furniture will be separate sprites; no table in central half. Clear moderate pixel scale, sharp nearest-neighbor look, no soft painting, no modern objects.

### harbor

Use case: illustration-story. Square production pixel-art RPG background matching the reference's rich handmade chunky 16-bit village environment and 3/4 overhead orthographic view. Ancient Ithaca harbor at dawn, amber limestone promenade at bottom/center and calm turquoise sea in upper half. Sea/paving boundary horizontal around y44%, a wide stone pier goes from central pavement x48%-67% toward top to y26%, so people can walk on level ground to a ship placed on water LEFT of the pier near x43% y39%. No boat or characters baked in: those are separate sprites. Assembly space on stone ground center x38%-68% y52%-73% is empty and walkable, with low stone benches only at left and right edges, olive trees and Greek village houses along outer sides. A few mooring posts at pier edges, ropes, pale stone paving, distant hills and subtle morning clouds near top edge. Must work in a central vertical phone crop with space for ship and people above a bottom dialogue panel; desktop reveals town edges. Beautiful quiet water, distinct clear pixels and consistent cluster size; no smooth painting, no text, no UI, no modern objects.

### ithaca-atlas

Use case: illustration-story. A production transparent pixel art CHARACTER SPRITE ATLAS, square, STRICT 4 equal columns x4 equal rows. Match these references exactly for chunky chibi 16-bit RPG characters with large expressive heads, dark outline, simple black eyes, warm natural skin tones, readable shaded clothing, strong pixel clusters. Each sprite entirely inside its equal cell with a wide transparent gap to all neighbors; no labels no grid no shadows no props connecting cells. Row1 PENELOPE: adult Greek woman, dark chestnut hair under a muted plum veil, deep plum dress with cream sleeves and small gold belt, tired thoughtful face. Col1 front standing, col2 right-facing walking, col3 back standing, col4 right-facing seated with knees bent and both hands reaching forward to work at a loom, NO stool/loom drawn. Row2 TELEMACHUS: young adult son of reference Odysseus, tousled chestnut hair, NO beard, sea-green short Greek tunic, cream undershirt, little ochre shoulder cape and belt, brown sandals. Col1 front, col2 right-facing walking, col3 back, col4 right-facing standing with both hands held forward to offer bread or a cup, hands EMPTY. Row3 ATHENA IN DISGUISE: a mature male traveler with short gray-brown hair and close short beard, olive-green cloak, sand-colored Greek tunic, simple sandals, no helmet no divine glow no staff. Col1 front, col2 right walking, col3 back, col4 right-facing one hand extended gently while speaking. Row4 EURYCLEIA: elderly woman with warm gray hair in a bun, slate-blue shawl over beige full-length dress, softly lined warm face. Col1 front, col2 right walking, col3 back, col4 right-facing reassuring open-hand gesture. Same scale and body proportions for all sprites, faithfully consistent with reference Odyssey sprites. True transparent alpha background, crisp pixel edges, no checkerboard baked in, no antialias.

### ithaca-props

Use case: illustration-story. Production transparent pixel art RPG sprite atlas, landscape 4 columns x3 EQUAL rows, 12 separate sprites. Match reference Odyssey sprites: chunky chibi proportions, strong dark pixel outlines, warm shaded 16-bit pixel art, true transparent background, clear gaps between every cell, no text no grid no shadows. Row1 MENELAUS, middle-aged Greek king with russet beard, wavy red-brown hair, ochre tunic with deep red cloak and modest gold clasp, sandals. Col1 front, col2 right-facing walking, col3 back, col4 right-facing hand raised conversational gesture. Row2 AN ITHACAN ELDER, old man with short white beard and sparse white hair, dusty gray-blue Greek robe with tan sash, sandals. Col1 front, col2 right-facing standing, col3 back, col4 right-facing folded arms skeptical pose. Row3 GAME PROPS: col1 freestanding upright wooden ancient Greek weaving loom, simple rectangular dark-brown frame viewed 3/4 overhead, many thin vertical cream warp strings and an EMPTY open area between strings, no woven cloth panel (the game adds one); col2 small plain round wooden table 3/4 top-down, clean bare oval tabletop, four legs, no food; col3 small ancient wooden sailboat viewed 3/4 overhead, readable empty interior DECK with three transverse benches, bow to LEFT, raised little mast and cream triangular sail at REAR left, no people no water, boat deck must be spacious for one sprite; col4 low plain wooden stool, same wood and perspective as table, no people. Entire props inside their respective cells with generous gaps. Keep each row centered in its allocated THIRD of the canvas; consistent pixel cluster scale and 16-bit game aesthetics. No modern furniture, no ship windows, no cartoon outline smoothing.

### sparta

Use case: illustration-story. Square detailed pixel art RPG background, no characters no text no UI. Use the attached village image only as style reference for sharp chunky 16-bit pixel clusters, warm lush colors and 3/4 overhead game perspective. Interior of King Menelaus's modestly splendid ancient Greek guest hall in Sparta. Warm reddish sandstone columns at sides, back wall upper third bearing a simple red-and-gold woven banner and bronze round shields, a low hearth glowing amber at far-left edge, open arched doorway on upper right x80% y35%. The floor has cream and terracotta geometric stone mosaics. Central zone x34%-72% y46%-74% is clear walkable floor, left entirely free for two chibi characters and a separate small table sprite. No furniture in central area. Along side edges only: jars, rolled rugs, small benches. A little olive tree in a pot by doorway. Bright afternoon light falls diagonally across the floor. Intimate hospitable atmosphere, strong distinct warm red/gold identity compared with Ithaca, restrained beautiful pixel textures. Design central vertical phone crop first; desktop can reveal the side columns. No modern objects, no painted smooth gradients.

### props-layout-correction

Edit only the layout of the attached transparent sprite atlas. Preserve all six rows? IMPORTANT this is a FOUR COLUMN, THREE ROW sheet (12 cells), with Menelaus in top row, elder in middle row, props in bottom row. Keep all artwork identities, colors, shapes, pixel texture and alpha transparency. The sailboat currently extends upward into the elder's row and sideways into the stool cell. Scale down and move ONLY the sailboat so it fits wholly within bottom-row third cell with at least 20 transparent pixels separating it from every other sprite. Keep the loom, table and stool and all 8 character poses unchanged in appearance. The boat must remain complete with full mast, sail, bow and stern, but can be smaller within its cell (the game scales it independently). Entire sheet 4 columns and 3 rows, no gridlines no labels. Do not add any pixels or props. Preserve transparent background.


</details>


<a id="source-work-visual-doc-review-2026-10-14-sailor-art-md"></a>
<details>
<summary>Historical source: work/visual-doc-review-2026-10-14/sailor-art.md (not current instructions)</summary>

> Retained source snapshot. Current rules and the October 14 priority table override conflicting directions, old script commands, paths, production status and QA counts.

# Four distinct fleet sailors

Created with the built-in image generation tool, transparent background. Selected output: `dist/assets/odyssey-fleet-sailors-v1.png`. The original generated PNG is retained at `C:/Users/aleja/.codex/generated_images/01a09398-6bf1-7f80-8009-12ce7f8f02de/exec-9083a994-47be-4821-a92b-f3671dd910a9.png`.

References: `dist/assets/odyssey-atlas-v1.png`, `dist/assets/odyssey-cave-people-v1.png`, and `concept_art/Personajes/Codex Image Sep 13, 2026, 12_52_29 PM.png` (finish only). All were inspected before generation. The four atlas cells use the shared two-pixel character renderer, alpha bounds and hull occlusion. They are front-only deck extras; they do not need walking or side poses for these shots.

## Prompt

Create a transparent PNG 2 by 2 sprite atlas with FOUR DIFFERENT adult male ancient Greek sailors, ONE full-body FRONT-FACING neutral standing sprite per equal quadrant. This is for the Pixel Nook Odyssey story. Match the first two supplied reference atlases EXACTLY in the coarse chibi pixel art finish: oversized heads, short bodies, hard square visible pixel blocks, thick very dark stepped outlines, compact limited palette, no antialiasing, no gradients, no soft painted detail. Third reference is only for coarse pixel finish; costumes must be ancient Greek. All four consistent same height/proportions as Odysseus, Calypso, Hermes and the crew in refs. New characters cannot duplicate existing Odysseus, blond Polites or black-haired Eurylochus. Top left: dark brown skin, cropped black hair and short beard, blue cloth headband, ochre tunic, sandals. Top right: fair skin, red hair and red beard, navy scarf, cream tunic, red belt, sandals. Bottom left: olive skin, bald head and grey beard, plum tunic and slate shoulder cape, sandals. Bottom right: medium tan skin, short curly brown hair and mustache, brown vest over cream tunic with blue sash, sandals. Simple friendly readable faces. Arms resting at sides. No weapons, props, scenery, text, shadows or feet fragments. Keep ample transparent margin around each independent sprite, no part touching quadrant edges. Each sprite centered at same relative height and baseline in its quadrant. Crisp low-resolution sprite language, not smooth illustration. Output wide enough to retain unambiguous transparent independent cells, 1024 by 1024 if possible.


</details>
