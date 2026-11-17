# Pixel Kitchen Preview — static publication

This is the accepted, read-only Cook → Phaser pilot. It does not certify Pixel Kitchen, approve pending sources, start the new Alice story, or implement cloud editing. Future editing and writes belong to the local/LAN workflow.

## Versioned release

- Page: `app/pixel-kitchen-preview/index.html`.
- Runtime: its adjacent `viewer.js`, the existing local `vendor/phaser/phaser.min.js`, and `pilot.json`.
- Art: exactly five existing cooked PNGs in `app/pixel-kitchen-preview/assets/`. No images are generated, resized, recolored or recooked to publish.
- Entry: **Pixel Kitchen Preview**, a quiet link below the existing home library.
- Public route: `/app/pixel-kitchen-preview/index.html` (also available as the directory index).

The existing `tools/build.mjs` already copies `app/` and `vendor/` to `dist/` and scopes their root URLs for mounted deployments. No build-engine or shared-reader change is required. The page uses adjacent static resources, never Python, localhost, Windows paths or excluded working artifacts. No editor, account service or write endpoint exists.

`pilot.json` is the portable release snapshot: exact PNG SHA256/size/color pins, source identities and hashes, original review states, the existing Alice-side visual receipt, body calibration, common roots and validation result. `valid=true`, **`ready=false`**, four source-review pendings and `adopted=false` remain unchanged. Accepting and publishing the demonstration does not promote the draft front/back, bottle or scene source records. Approval of Alice side remains separate from alpha/geometry conformity.

The PNGs retain their approved bytes: Alice front/side/back are 64×64, Drink Me is 32×32 with 18 useful pixels, and the opaque indexed scene is 640×360 with 48 colors. All sprites keep world scale 1 and one native pixel per world unit. The character root is (32.5,60), placed at world (395.5,300); the object root is (16,30), placed at (445,300). The existing source calibration and nearest-neighbor camera inspection ×4 are retained. Responsive CSS fits the viewport uniformly; it never changes per-asset world scale.

## Rebuild and verify

```powershell
npm run build
npm run preview:pixel-kitchen
# Second terminal, same checkout:
npm run qa:pixel-kitchen-preview -- http://127.0.0.1:8872
node --test qa/tests/*.test.mjs
```

After deployment, the same browser/asset checks target the production site:

```powershell
npm run qa:pixel-kitchen-preview -- https://pixel-nook-studio.vercel.app
```

The checked-in test pins the original five PNG hashes independently of the manifest, verifies served bytes and geometry, opens the home entry, tests all three views at both zooms on 390×844 and 1280×720, checks real native texture draw calls for smoothing, and returns to the library. Controls have minimum 44 px height. It reuses the existing library/search/saved/preferences/legacy-slug regression and starts the first available chapter of all four stories in both viewports. Evidence stays in `.artifacts/pixel-kitchen-preview/`; `PIXEL_KITCHEN_QA_OUTPUT` can select another directory below `.artifacts/`. Tests use isolated browser contexts, not the user's saves or browser profile.

The optional Node static server binds only `127.0.0.1:8872`, serves `dist/`, and accepts GET/HEAD only. It supplies local QA, not the future editor/LAN server; Vercel does not run it. These are browser viewports, not a physical-phone or complete scene/export certification. No narrative, saved-state format, NookForge code or story assets are changed. Remaining work: review the retained source/alpha/measurement pendings and explicitly scope the later local manual-final/diff/adoption pilot.
