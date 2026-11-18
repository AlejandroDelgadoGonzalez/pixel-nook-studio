# Pixel Chef — sequential local role

Read [the workflow contract](../docs/authoring/pixel-kitchen-workflow.md) first. This is a role executed by the current PC chat, never a subagent, separate delegated chat, autonomous daemon or cloud service. Stories and NookForge remain untouched. Audio is paused.

## Incoming handoff

Alejandro pastes a `pixel-kitchen-handoff/1` JSON block (optionally fenced) exported by the static touch editor. It includes `taskId`, `assetId`, `baseRevision`, **PNG byte** `baseSha256`, `editedFrom` (`chef`, `cook` or `final`), `comparisonBase`, `expectedCurrent` (exact consumer pin), `canvas`, `changes: [{x,y,hex}]`, `hashEncoding: pk-rgba-png/1`, and expected `finalSha256`. Empty changes explicitly approve the exact candidate. Record hashes are separate from PNG hashes. Do not infer approval from the existence of a file, from mtime, or from a package provided only as an example.

## Four mandatory steps, in order

1. **Reconstruct and validate.** Resolve the exact local task/base, compare PNG bytes and revision, reconstruct immutable Final and exact RGBA diff. Run `check_adoption`: canvas, body root, transformation, support pins, contacts and protected actual pixels. Reject with status `409` on stale/missing base, consumer conflict or invariant violation. Preserve the active revision. No silent rebase. A copied package is approval intent, not proof of local adoption.
2. **Adopt automatically.** On success update only the registered compatible isolated consumer, retaining the previous revision for rollback. No second routine approval. An already loaded reader/export remains pinned; next load uses the adopted revision. Production consumers require a separate integration; this pilot does not migrate Alice.
3. **Learn from the actual diff.** Store the exact Chef→human or Cook→human comparison with its immutable lineage in `learning/`. Record observations, not invented motives or universal cosmetic rules. No training of model weights and no automatic rewriting of canonical rules. Rejected edits are not approved learning.
4. **Prepare the next authorized task.** Inspect its full large Original next to Cook, read learning, preserve anatomy, curves, filled dark clothing, reflections and protected geometry. Submit a source-specific coordinate recipe through the candidate CLI, or explicitly retain Cook pixels if no justified improvement is found. Never transfer coordinates between unrelated sprites. Validate the draft candidate, export the static package, and publish only when that task/flow authorizes publication. No background agent. No fabricated Chef changes merely to make the images different.

The CLI commits Final/adoption, learning and queue advancement in one authoritative snapshot under an OS lock. It prepares the next candidate from a **previously visually inspected, pinned recipe**; it is not a semantic vision model. Chef reviews any new human lesson against that recipe before publication, and updates the candidate recipe when needed. Files in `learning/` are recoverable projections of the committed state. A failure preparing the next candidate prevents the transaction from publishing its state; orphaned immutable attempt files are not active revisions.

## Commands

Run from the project root:

```text
python -B tools/pixel-kitchen/chef_workflow.py init
python -B tools/pixel-kitchen/chef_workflow.py receive path/to/handoff.json
python -B tools/pixel-kitchen/chef_workflow.py receive -
python -B tools/pixel-kitchen/chef_workflow.py candidate path/to/reviewed-recipe.json
python -B tools/pixel-kitchen/chef_workflow.py export
```

`--session` precedes the subcommand. Default: `.artifacts/pixel-kitchen-transition/chef-queue/session-v1`. A recipe contains `inspection` (actual visual findings) and `changes: [{x,y,hex}]`. The CLI pins Original and Cook hashes. Keep generated receipts, learning and transaction state local; publish only selected static review assets and the public queue. Full source folders, local paths, tokens and private transaction records never belong in that public package.

After receiving, report accepted/rejected, changed-pixel count, final hash, active consumer, next task, and whether a new queue was published. Exact replay is idempotent. A modified replay of an already completed task is rejected. No automatic Git push by the CLI.

Learning reuse is limited to exact Cook lineage and matching before-RGBA at each coordinate; other assets require fresh visual judgement. No cross-character coordinate transfer.

Completed tasks accept further edits from the exact approved Final while that revision is active. The handoff uses `editedFrom: "final"` and `comparisonBase: "final"`. Learning records the incremental changes against that Final, while the canonical revision keeps its inherited Chef or Cook comparison.
