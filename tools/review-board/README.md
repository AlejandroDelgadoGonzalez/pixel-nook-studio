# NOOK Review Board

This is NOOK's offline packer for the five-gate workflow. Pixel Kitchen supplies Cook and optional finishing outputs. Scene staging, evidence, and decisions belong to NOOK.

Generate one board per revision from the repository root:

```text
python -B tools/review-board/build.py path/to/board.json .artifacts/path/to/REVIEW-BOARD.html
python -B tools/review-board/pilot.py
node tools/review-board/check.mjs
```

The generated HTML includes its raster bytes, data, styles, and script. The adjacent receipt pins the HTML and input hashes. Use separate revision folders and retain prior receipts. The old packer and historical certifications keep their prior meaning.

## Input contract

See `pilot.py` for a complete working data fixture. The input uses schema `nook-review-board/1`.

- Use explicit `storyId`, `sceneId`, `reviewId`, `title`, and `gate`. Supply actual `decisions` by gate with status, approval evidence, and pending work. Audio stays paused.
- Supply full English `narrative` with `chapterMap`, `causal` rows, complete `text`, and `beats` including timing and continuity.
- Register `assets` by ID with repository-relative path, exact SHA256, revision, status, and label. List reused IDs in `reused` with consuming beats. List large originals in `precooked` with the pose, references, and body calibration where applicable.
- Supply `measure` in one logical world coordinate space. Include the complete background ID, world dimensions, points, roots, support pins, contacts, surface vertices, occluder polygons, and route samples with elapsed milliseconds. Each point identifies its consumer and evidence. Supply all 18 viewport/format framing records with frustum and safeFrame as world-space `[x,y,width,height]`. In a real scene use measured renderer and dialogue geometry. The fixture uses a labeled illustrative inset.
- Keep `cook` and `finishing` empty in G1/G2. In G4/G5 add actual Cook source/native pairs, revision, and effective geometry. Add optional before/after pairs, state, and exact diff to `finishing` when available.
- List actual static, runtime, encoded export, and physical device evidence separately in `evidence`. A standalone board does not execute the scene runtime.

The pilot reuses the prior isolated art and geometry inputs. Its faux narrative and overlay examples are for review of the format in isolation. Each phase has its own HTML, so the pre-Cook file contains no hidden Cook payload.
