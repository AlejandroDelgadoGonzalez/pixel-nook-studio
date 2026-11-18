# Pixel Kitchen Preview — static queue and touch editor

[Workflow contract](pixel-kitchen-workflow.md) · [Sequential Chef role](../../agents/07-pixel-chef.md)

The public page preserves the Cook → Phaser pilot and adds **Kitchen Queue & Touch Editor**. It is static hosting: no cloud write backend, GitHub client token, PC disk access or network pairing. Editing changes an in-memory native pixel array. Export before closing the tab.

## Review on a phone

Open `/app/pixel-kitchen-preview/`. Alice front and Drink Me are complete and open on **Final (Approved)**. Use the full-resolution Original for comparison. Chef and Cook remain available in **Base**. To submit another edit, start from the adopted Final. In landscape, use **Fullscreen** and **Tools** to show or hide the controls.

**Approve & Copy Chef Handoff** creates the complete JSON, displays it in a selectable text area and attempts clipboard copy. **Download handoff JSON** is always the fallback. Paste that JSON into the Chef chat on PC. Nothing is adopted by the browser. A waiting task is inspectable but cannot be approved until the local workflow prepares/activates it.

The handoff pins task/asset, edit revision and PNG hash, Chef, Cook or Final comparison base, expected consumer revision, canvas and exact coordinate changes. An empty list means direct approval. `finalSha256` hashes the deterministic **pk-rgba-png/1** byte encoding (RGBA PNG, filter0, stored DEFLATE); it is not an arbitrary browser canvas PNG hash or canonical record hash. Python and JavaScript use the same encoding.

## Local execution and static publication

```text
python -B tools/pixel-kitchen/chef_workflow.py init
python -B tools/pixel-kitchen/chef_workflow.py receive handoff.json
python -B tools/pixel-kitchen/chef_workflow.py candidate reviewed-recipe.json
python -B tools/pixel-kitchen/chef_workflow.py export
```

The CLI uses the existing **private, approved local pilot seed**; source originals and their full validation graph must exist on the PC. A Git checkout alone can run synthetic contract tests and serve the public preview, but is not a replacement for that private source archive. `receive` validates and atomically commits adoption/learning/queue advancement, then exports the recoverable static package. It does not push Git. Replay is idempotent. Rejected packages preserve the active revision and return JSON status409 / nonzero CLI exit. `learning/` is materialized from authoritative transaction state.

Chef is the agent role, not a bundled AI model. Candidate recipes record actual inspection against Original plus exact coordinates. The initial Alice and bottle inspections found no justified surgical edit: the initial Chef pixels deliberately equal Cook. They remain draft proposals, not invented retouch results. The next recipe consults learning; source-specific intent requires the sequential Chef's visual review, not blind coordinate transfer. No autonomous daemon or hidden generation occurs.

Public queue assets under `app/pixel-kitchen-preview/queue/` are explicit selected copies, including only the two required large originals, Cook, Chef and adopted Final PNGs. Their hashes/size/pixels are pinned in `queue.json`. Private source directories and local receipts/state are not published. Phaser loads the adopted Finals for Alice front and Drink Me, retaining their measured roots and world scale 1. Side and Back retain Cook. Nearest ×4 is available. The selected source approvals are now recorded: `valid=true`, `ready=true`; source alpha and production scene certification are separate. The earlier published pending snapshot remains historical in Git. No narrative or NookForge change is included.

## Verification

```text
python -B tools/pixel-kitchen/run_tests.py
node --test tools/pixel-kitchen/packaging.test.mjs
node --test qa/tests/*.test.mjs
npm run build
npm run preview:pixel-kitchen
node tools/pixel-kitchen/check_queue.mjs http://127.0.0.1:8872
npm run qa:pixel-kitchen-preview -- http://127.0.0.1:8872
```

Run both browser checks against the public Vercel URL after deployment. They cover adopted assets, Final-based handoff export, Phaser and library/reader regression in emulated viewports. Evidence stays under `.artifacts/`. Both physical-phone handoffs were received and adopted. A new end-to-end check can start from either adopted Final.

Learning reuse is limited to exact Cook lineage and matching before-RGBA at each coordinate; other assets require fresh visual judgement. No cross-character coordinate transfer.

To view the adopted local consumer in Phaser, run `python -B tools/pixel-kitchen/local_editor_server.py --port 8895 --session .artifacts/pixel-kitchen-transition/chef-queue/session-v1`, then open `http://127.0.0.1:8895/preview/?manual=1&view=front`. It reads the same active snapshot; a loaded view stays pinned until reload. The public Phaser panel uses the adopted revisions published in the queue manifest.
