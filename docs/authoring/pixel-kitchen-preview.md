# Pixel Kitchen Preview — static queue and touch editor

[Workflow contract](pixel-kitchen-workflow.md) · [Sequential Chef role](../../agents/07-pixel-chef.md)

The public page preserves the Cook → Phaser pilot and adds **Kitchen Queue & Touch Editor**. It is static hosting: no cloud write backend, GitHub client token, PC disk access or network pairing. Editing changes an in-memory native pixel array. Export before closing the tab.

## Review on a phone

Open `/app/pixel-kitchen-preview/`. Alice front is the active demo task; Drink Me is waiting. Each task displays its selected **full-resolution large Original**, scaled only for presentation, beside a native 64×64 or 32×32 editor. Pencil, eyedropper, eraser, undo/redo, palette and zoom controls are at least 44px high. Pan the editor container when magnified. Base selection offers Chef when prepared and pure Cook. Switching discards unsent edits only after confirmation.

**Approve & Copy Chef Handoff** creates the complete JSON, displays it in a selectable text area and attempts clipboard copy. **Download handoff JSON** is always the fallback. Paste that JSON into the Chef chat on PC. Nothing is adopted by the browser. A waiting task is inspectable but cannot be approved until the local workflow prepares/activates it.

The handoff pins task/asset, edit revision and PNG hash, Chef-or-Cook comparison base, expected consumer revision, canvas and exact coordinate changes. An empty list means direct approval. `finalSha256` hashes the deterministic **pk-rgba-png/1** byte encoding (RGBA PNG, filter0, stored DEFLATE); it is not an arbitrary browser canvas PNG hash or canonical record hash. Python and JavaScript use the same encoding.

## Local execution and static publication

```text
python -B tools/pixel-kitchen/chef_workflow.py init
python -B tools/pixel-kitchen/chef_workflow.py receive handoff.json
python -B tools/pixel-kitchen/chef_workflow.py candidate reviewed-recipe.json
python -B tools/pixel-kitchen/chef_workflow.py export
```

The CLI uses the existing **private, approved local pilot seed**; source originals and their full validation graph must exist on the PC. A Git checkout alone can run synthetic contract tests and serve the public preview, but is not a replacement for that private source archive. `receive` validates and atomically commits adoption/learning/queue advancement, then exports the recoverable static package. It does not push Git. Replay is idempotent. Rejected packages preserve the active revision and return JSON status409 / nonzero CLI exit. `learning/` is materialized from authoritative transaction state.

Chef is the agent role, not a bundled AI model. Candidate recipes record actual inspection against Original plus exact coordinates. The initial Alice and bottle inspections found no justified surgical edit: the initial Chef pixels deliberately equal Cook. They remain draft proposals, not invented retouch results. The next recipe consults learning; source-specific intent requires the sequential Chef's visual review, not blind coordinate transfer. No autonomous daemon or hidden generation occurs.

Public queue assets under `app/pixel-kitchen-preview/queue/` are explicit selected copies, including only the two required large originals, Cook and prepared Chef PNGs. Their hashes/size/pixels are pinned in `queue.json`. Private source directories and local receipts/state are not published. The five Phaser PNGs retain their original bytes, root(32.5,60), object root(16,30), world scale1, view alternation and nearest ×4. The selected source approvals are now recorded: `valid=true`, `ready=true`; source alpha and production scene certification are separate. The earlier published pending snapshot remains historical in Git. No narrative or NookForge change is included.

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

Run both browser checks against the public Vercel URL after deployment. Tests exercise390×844 and1280×720, native touch coordinates, no scroll jump, undo/redo, denied-clipboard fallback, JSON download, Cook approval and waiting32px task, static resource hashes, Phaser views/zoom and existing home/reader entry points. Evidence is written only below `.artifacts/`. These are emulated viewports, not a physical-phone claim. The real phone→pasted handoff test remains Alejandro's next action.

Learning reuse is limited to exact Cook lineage and matching before-RGBA at each coordinate; other assets require fresh visual judgement. No cross-character coordinate transfer.

To view the adopted local consumer in Phaser, run `python -B tools/pixel-kitchen/local_editor_server.py --port 8895 --session .artifacts/pixel-kitchen-transition/chef-queue/session-v1`, then open `http://127.0.0.1:8895/preview/?manual=1&view=front`. It reads the same active snapshot; a loaded view stays pinned until reload. The public Phaser panel retains the accepted Cook composition while the queue evolves.
