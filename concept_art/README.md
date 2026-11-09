# Pixel Nook visual canon

The ONLY global visual authority is `concept_art/characters/` and `concept_art/scenes/`. Use direct cataloged sources; never chain S1 â†’ S2 â†’ S3 generations. Eight character sheets and sixteen scene references are registered. Technical checks do not grant visual approval.

| Character sheet | Status |
| --- | --- |
| [master-pose-sheet-alice.png](characters/master-pose-sheet-alice.png) | Part 1 explicitly approved by Alejandro |
| [odyssey-core.png](characters/odyssey-core.png) | canonical-source-preserved |
| [second-cup-people.png](characters/second-cup-people.png) | canonical-source-preserved |
| [casual-modern-core.png](characters/casual-modern-core.png) | approved 100% by Alejandro |
| [storybook-classic-core.png](characters/storybook-classic-core.png) | approved 100% by Alejandro |
| [fantasy-medieval-core.png](characters/fantasy-medieval-core.png) | pending Alejandro 400% review |
| [world-tales-core.png](characters/world-tales-core.png) | pending Alejandro 400% review |
| [diverse-everyday-core.png](characters/diverse-everyday-core.png) | pending Alejandro 400% review |

| Scene reference | Status |
| --- | --- |
| [01-forest-cottage-river.png](scenes/01-forest-cottage-river.png) | Reference art explicitly approved by Alejandro in Tanda5request |
| [02-harbor-market-docks.png](scenes/02-harbor-market-docks.png) | Reference art explicitly approved by Alejandro in Tanda5request |
| [03-forest-pond-waterfall.png](scenes/03-forest-pond-waterfall.png) | Reference art explicitly approved by Alejandro in Tanda5request |
| [04-snowy-winter-village.png](scenes/04-snowy-winter-village.png) | Reference art explicitly approved by Alejandro in Tanda5request |
| [05-crystal-mine-cavern.png](scenes/05-crystal-mine-cavern.png) | Reference art explicitly approved by Alejandro in Tanda5request |
| [06-grand-wooden-library.png](scenes/06-grand-wooden-library.png) | Reference art explicitly approved by Alejandro in Tanda5request |
| [07-medieval-castle-plaza.png](scenes/07-medieval-castle-plaza.png) | Reference art explicitly approved by Alejandro in Tanda5request |
| [08-rustic-cottage-interior.png](scenes/08-rustic-cottage-interior.png) | Reference art explicitly approved by Alejandro in Tanda5request |
| [09-modern-cozy-city-street.png](scenes/09-modern-cozy-city-street.png) | Reference art explicitly approved by Alejandro in Tanda5request |
| [10-modern-loft-apartment.png](scenes/10-modern-loft-apartment.png) | Reference art explicitly approved by Alejandro in Tanda5request |
| [11-moonlit-botanical-garden.png](scenes/11-moonlit-botanical-garden.png) | Explicitly approved by Alejandro in scene-reference-lock request |
| [12-sunset-desert-oasis-bazaar.png](scenes/12-sunset-desert-oasis-bazaar.png) | Explicitly approved by Alejandro in scene-reference-lock request |
| [13-grand-palace-marble-hall.png](scenes/13-grand-palace-marble-hall.png) | Explicitly approved by Alejandro in scene-reference-lock request |
| [14-autumn-zen-shrine-bridge.png](scenes/14-autumn-zen-shrine-bridge.png) | Explicitly approved by Alejandro in scene-reference-lock request |
| [15-vintage-steam-train-platform.png](scenes/15-vintage-steam-train-platform.png) | Explicitly approved by Alejandro in scene-reference-lock request |
| [odyssey-panorama-c4-2.png](scenes/odyssey-panorama-c4-2.png) | canonical-source-preserved |

Each new character gets one canonical story master atlas at first appearance, referenced directly to approved character sheets and reused throughout the story. Every additional pose extends that same master. Native cleanup requires solid one-cell eyes, flat facial skin, warm central neck attachment, dark sealed exterior, three warm hair tones with distinct strands and simple garments of 2â€“3 flat tones. Character downsampling/projection to 68 rows is forbidden; old sample statistics are diagnostic only. Existing story identity and geometry remain preserved.

New three-character masters use four poses: front, walking right, back, reaching right. Storage cells include at least four logical transparent cells on every side, independently of the tight content frame used at runtime. The restored world-tales canvas is 1364Ã—1443; diverse-everyday is 1336Ã—1542. Their complete native head silhouettes are checked against the original generation inputs. The other three four-pose sheets received transparent storage padding only; their approved foreground drawings are preserved exactly. Source pixels were edited categorically at native resolution, not rescaled. Measured head envelopes include hair/headwear; back-view jaw levels are authored anatomical landmarks. Current restoration, source proofs and 400% previews: `.artifacts/qa/atlas-unification-zero-clipping/`. Historical prompts and raw generation sources remain in `.artifacts/qa/character-expansion-part3/`; its old destructive cleanup script must not be reused.

```powershell
python qa/pixel_density.py check-directory --directory concept_art --output .artifacts/qa/visual-canon.json
python qa/pixel_density.py check-stories --output .artifacts/qa/story-visual-inventory.json
python qa/character_cores.py --output .artifacts/qa/character-cores.json
```

Gate 4 invokes the first two audits automatically, followed by story-specific density/master and runtime checks. New PNGs require explicit measured contracts. Legacy artwork is pinned by exact hash in `qa/legacy-visual-locks.json`; preservation is not a certificate of semantic eye/hair purity. Never add new art to that exception list. No scene implementation, physical-device or MP4 approval is granted by concept QA. All sixteen scene references are now approved as visual masters; story implementation and staging approvals remain separate.

Square-pixel closure: the two restored sheets preserve original source anatomy, including headwear. Synthetic repeated torso rows have been removed; measured source head/body ratios are reported without forcing a 45–50% result by stretching a body. Current exports and evidence: `.artifacts/qa/square-pixel-closure/`.

## Mandatory Concept-Art Scene Reference

`scenes/` contains exactly 16 immutable approved PNG masters; diagnostic rasters are absent. Auxiliary layouts/density files are archived in `.artifacts/qa/scene-reference-lock/archived-scene-metadata/`. All 15 numbered references use 1664×936, a 2×2 source grid, 1280×720 base crop and 1.30× overscan. The preserved Odyssey master is a historical 2171×724 original; do not resize or relabel it as 1664×936. New story panoramas use the numbered equivalent directly in image_gen and must meet the new-format contract.

Declare `panoramas[]` in the story manifest with `path`, `reference_scene_master`, `reference_scene_master_sha256`, `dimensions`, `blockSourcePx`, `overscanFactor`, `space`, and `generation` (`tool: image_gen`, `primaryStyleReference`, `referenced_image_paths`). The master must be passed as an actual input image, not just mentioned in a prompt. Include the actual generation request in local evidence. Previous scenes may supply secondary continuity only; they never replace the canonical primary style input.

Interior declarations also require `fullRoomInterior: true` and `exteriorCutaway: false`. Beams/ceiling fill the top, room walls frame the whole width, openings are viewed from inside, and indoor floor fills the lower walkable strip. Use 08 (rustic), 06 (library), 10 (modern) or 13 (palace). Metadata/raster QA cannot replace visual inspection of room composition or prove an API call occurred.

Existing story PNGs are preserved by the exact pre-policy hashes in `manifest.json.sceneReferencePolicy.legacyPanoramas`. These are preservation records, not invented image_gen provenance or acceptance of exterior cutaways. New/changed panoramas cannot use this path. Alice C2-S5 must be remade on resumption using 08 directly, with 11 only for lunar window light; its current art, geometry and implementation remain untouched in this task.
