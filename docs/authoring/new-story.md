# Create a new story

1. Read ../rules/ in full, the architecture and story-renderer-contract. Inspect concept_art/ and the existing Odysseus/Calypso/Hermes art family.
2. Create stories/<slug>/ with manifest.json, chapters/, renderers/, shared/ and assets/. Register its manifest once in stories/catalog.json. Do not edit player.js to add a story.
3. Before writing routes, inspect the actual final background in both native phone and complete panorama views. Record image dimensions, world bounds, camera mapping and walkable surfaces.
4. Every NEW story MUST define its logical stage geometry in stories/<slug>/shared/stage-geometry.json (or an equivalently named JSON file in shared/). Include spawns, anchors, walkPaths and occluders for each environment. The manifest MUST declare stageGeometry pointing to that file. Entries identify measured coordinates, surface, relevant asset and evidence/reference. Routes name their start/end anchors and ordered waypoints; occluders describe actual foreground shapes and depth. Never invent coordinates blindly or infer a path from nearby vegetation alone.
5. Use that shared geometry from authoring/rendering, with explicit world mapping for native/panorama variants. Validate endpoints, complete silhouettes, prop ownership, waiting actors, caption clearance and noncrossing parallel paths. If variants differ, document and inspect both. Dynamic staging can derive from named anchors, not untraceable numeric guesses.
6. Author phone shots first. Establish arrivals, motivations, causal transitions and outcomes. Use durable chapter state and stable IDs. Register measured atlas cells and renderer diagnostics.
7. Keep only selected assets. Record provenance; never add generators or chapter-specific patch chains as runtime dependencies. Use the final editable JSON as the source of truth.
8. Run npm run qa -- --story=<slug>, inspect saved screenshots and completed export samples, then run the full suite for shared changes. Reports go to .artifacts/qa. State the tested browser, dimensions, export completion and remaining limits accurately.

The three migrated stories retain their approved coordinates and existing data layout. They are explicitly marked as migrated geometry in their manifests; do not pretend that their coordinates have been newly measured. New stories cannot use that exemption. An agent must inspect the artwork before authoring or changing geometry.

