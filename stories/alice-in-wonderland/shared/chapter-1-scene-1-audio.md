# Alice — Scene 1 local MP3 pilot

This replaces both procedural sound pilots. There is no A/B/C or 1–5 selector.
The reader/exporter only decodes and mixes local MP3 files. It does not synthesize
instruments and never calls ElevenLabs.

## Current state: four real local MP3s ready

All four authorized files are permanently saved in `assets/audio/scene-1/`.
Each has exactly one completed ElevenLabs generation; no second generation
request was sent. The initial batch reported busy, but its nodes subsequently
completed; existing results were retrieved rather than regenerated. The provider
reports 516 credits total (450 melody, 40 steps, 12 watch, 14 rustle).

`generation.json` records the prompts, requested settings, actual returned models,
generation IDs, durations, prices and SHA-256 hashes. Expiring provider URLs are
not part of the runtime. The reader, QA and exports only load these local files.
All four files have passed full MP3 decoding and non-silent signal checks.
The source steps and rustle are unusually quiet; per-cue gains of 3 and 1.4
respectively balance them against the low music gain of 0.14. The watch gain is
0.5 and the overall default volume is 0.35. Original MP3 bytes remain unchanged.

| File | Intended use |
| --- | --- |
| s1-riverbank-melody.mp3 | One 30-second instrumental acoustic music-box/harp/celesta cue, locally looped at low gain throughout S1. |
| s1-rabbit-hurried-steps.mp3 | One 4-second soft path-footstep file, reused only during authored S1 walking actions. |
| s1-pocket-watch.mp3 | One 1.2-second brass-watch click/tick file. Start 540 ms into watch extraction, when the watch appears; finish before the Rabbit's dependent line at 1,800 ms. |
| s1-burrow-rustle.mp3 | One approximately 1.4-second foliage/soil file (provider reports 1.36 s) reused and trimmed to the Rabbit's aperture/covered actions and Alice's hand/torso entry actions. |

Some stable action IDs contain `-s2-` because the released first scene merges
historical segments. They still belong to `scenes[0]`, A Small Surprise. The new
sheet validates every binding against that released scene. Actual released S2–S6
have no cues or music. The scope also disables S1 audio when independently
exporting S2, even if its opening replay contains earlier S1 actions.

All chapter data, renderer files, stage geometry, actor positions, cameras,
sprites and approved durations remain unchanged. Pause/mute stop file voices;
resuming an ongoing effect seeks to the current reading-clock offset. Leaving
S1 stops all its voices. Exports decode the same local files into their own
context and never write reader progress or preferences.

## Reuse and validation

1. Reuse all four saved files. Do not regenerate them on reload, QA, export or
   retries. No S2–S6 generation is authorized.
2. Retrieve/download existing successful results without rerunning them. Verify
   true MP3 encoding, duration and successful decode; local format conversion or
   trimming is allowed without another generation. Do not create empty/fake MP3s.
3. Verify file hashes against the permanent generation ledger. The audio sheet's
   `available` is true because all four verified local files exist.
4. Run `node qa/alice-file-audio.mjs`, shared QA and the guarded
   `node qa/alice-file-audio-export.mjs` (S1 with sound and without sound).
   Generated evidence belongs only in `.artifacts/qa/alice-scene-1-files/`.
5. Listen at normal reading speed and present the actual S1 audio to Alejandro.
   Passing wiring tests while files are pending is not listening approval.
