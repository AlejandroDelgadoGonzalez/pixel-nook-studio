# Migration map

The sibling `entre-lineas-platform` is the read-only backup. `pixel-nook-studio` runs independently; no build step or old patch chain is required. Only current story content and selected runtime assets were migrated. Migration verification records live in `.artifacts/`, outside the source folders.

## Paths

| Original | Current |
| --- | --- |
| `dist/index.html`, `dist/reader.html` | `app/index.html`, `app/reader.html` |
| Reader startup | `app/bootstrap.js` |
| `dist/player.js`, `dist/engine.js`, `dist/text-reveal.js` | `platform/reader/` |
| `dist/story.js` | `platform/reader/story-loader.js` and `story-compiler.js` |
| `dist/library.js` | `platform/library/library.js` |
| `dist/library.json`, `dist/stories/catalog.json` | `stories/catalog.json` and each story's `manifest.json` |
| `dist/video-export.js`, `video-sequence.js`, `video-layer.js` | `platform/video/` |
| `dist/shot-dissolve.js` | `platform/rendering/shot-dissolve.js` |
| Shared parts of `dist/character-art.js` | `platform/rendering/character-art.js` |
| Story atlas measurements in `dist/character-art.js` | `stories/the-odyssey/shared/atlas-cells.js` |
| `dist/landscape-environments.js` | Generic `platform/rendering/environments.js` and `camera.js`; story configuration in `stories/the-odyssey/shared/environments.json` |
| `dist/soundtrack.js` | `platform/audio/soundtrack.js` |
| Theme/language modules | `platform/ui/` |
| Browser persistence and retired passage aliases | `platform/storage/`; original storage keys retained |
| CSS files in `dist/` | `platform/styles/`; original cascade order retained |
| `server.mjs` | `server/server.mjs`, serving the new areas |
| `dist/stories/el-primer-camino.json` | `stories/the-first-path/chapters/chapter-01.json` |
| `dist/workshop.js`, `dist/ambient.js`, letter anchors | `stories/the-first-path/renderers/` |
| `dist/stories/the-second-cup.json`, `dist/terrace.js` | `stories/the-second-cup/chapters/chapter-01.json`, `renderers/terrace.js` |
| `dist/stories/the-odyssey.json` and `the-odyssey-chapter-2..10.json` | `stories/the-odyssey/chapters/chapter-01..10.json` |
| `dist/odyssey.js`, `ithaca.js`, `scheria.js`, `cyclops.js`, `aeaea.js`, `homecoming.js` | `stories/the-odyssey/renderers/`; `odyssey.js` renamed `calypso-island.js` |
| `dist/assets/` selected images | Each owning story's `assets/`, grouped as backgrounds, atlases, props and branding |
| `dist/assets/phaser.min.js` | `vendor/phaser/phaser.min.js` |
| Sibling `concept_art/` | Project `concept_art/`, all 11 references retained unchanged |
| `documentos/La Odisea explicada para niños.docx` | `docs/stories/the-odyssey/sources/odyssey-for-children.docx` |
| 32 root Markdown documents and two review notes | Thematic `docs/rules/`, story contracts and historical provenance; see [rule traceability](rule-traceability.md) |
| Old `work/` scripts and historical QA JSON | Not migrated; reusable checks live in `qa/` |

The exact 83 selected image paths and hashes, plus the 13 excluded images, are in [asset-inventory.json](asset-inventory.json). Version suffixes were removed from destination names; the selected pixels were not regenerated. Native phone images, complete panoramas and portrait-only fill textures serve different rendering modes and are retained when referenced.

## URLs and saved progress

- `/` serves `app/index.html`; `/reader.html` serves `app/reader.html`.
- `/reader.html?story=the-first-path` opens The First Path. The old `story=el-primer-camino` alias still works.
- `/reader.html?story=the-second-cup` opens The Second Cup.
- `/reader.html?story=the-odyssey&chapter=chapter-1` opens Odyssey Chapter 1; chapter IDs through `chapter-10` remain unchanged.
- Code imports use `/platform/` or relative module paths. Chapter data, renderer modules and images resolve under `/stories/<slug>/`.
- Stable story IDs, text IDs, saved-passage aliases and storage keys remain intact. The new default port is 4175. Browser storage is origin-specific: an existing save on localhost:4174 is visible only when using that same origin. Stop the old server before starting the new server with `PORT=4174` if that continuity is wanted. No browser profile was altered by tests.
- `docs/`, `qa/`, `agents/` and `concept_art/` are local authoring areas, not publicly served routes.

## Verification evidence

See the [completed verification summary](verification.md) for the final counts and tested scope.

`npm run qa` discovers all available chapters and saves a fresh `.artifacts/qa/report.json`, screenshots and encoded video samples. See [the QA scope](../../qa/README.md) for the exact assertions and limitations.

The migration-specific `.artifacts/migration-verification.json` records a SHA-256 comparison of every original file against the pre-migration baseline, equality of all 12 chapter data files after reversing only asset paths and the deduplicated chapter index, preservation of all 34 source documents, reference-image equality, the source DOCX, an empty `agents/`, and JavaScript syntax checks. These records are verification output, not scripts needed to author a future story.

`.artifacts/visual-parity.json` compares rendered canvas pixels and camera framing with the original running on a separate read-only localhost server. All 518 saved passages were compared in 390 px phone, 1366x640 desktop and explicit portrait modes: 1,554 matching frames, zero differences. This checks preserved presentation at passages; the reusable motion tests separately sample intermediate actions.

New stories must define measured `spawns`, `anchors`, `walkPaths` and `occluders` inside their own `shared/` file, declared by `stageGeometry` in their manifest. See [new-story.md](../authoring/new-story.md). Existing stories retain their approved geometry and are explicitly marked as migrated; no unmeasured coordinates were introduced during this move.
