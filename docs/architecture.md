# Architecture

app contains the two HTML entry points. platform contains reader/engine, library, generic rendering, video, synthesized sound, storage, theme/language and styles. stories owns all chapter data, renderer classes and image assets. vendor retains the existing Phaser build. server serves only app/platform/stories/vendor on localhost.

Each story manifest is loaded from the single catalog. The reader chooses a chapter, loads its environment configuration and imports the declared renderer. The library reads the same manifests, preventing separate catalog/metadata drift. Chapter source URLs and assets are rooted at /stories/. Story IDs and passage IDs remain compatible with existing browser storage.

Run node server/server.mjs or START.cmd. Default port: 4175; PORT can change it. Root / maps to app/index.html, /reader.html to app/reader.html. This is buildless JavaScript; npm dependencies are used for QA only. No dist source tree, hosting identity, remote account or publication is required.

agents/ is intentionally empty and reserved for the next user-requested agent system. Future agents must read docs/rules/ before changes. This migration does not install or run an agent system.
