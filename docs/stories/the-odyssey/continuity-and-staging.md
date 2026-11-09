# The Odyssey: current continuity contract

The migrated chapter JSON is the final source of truth: ten chapters, 51 scenes and 475 readable passages. Preserve the October 14 result, including all seven saved-passage aliases. No older prose draft or patch is an authoring dependency.

- Chapter 1: retain Calypso's visible tree emergence, existing staging and causal opening; Odysseus chooses the uncertain return home.
- Chapter 2: retain the shortened cloth and loom staging, measured host crops, paved guest-arrival path, held camera and Sparta landing. Ramp stays fixed to shore while the boat departs. Approved panorama images/proportions remain.
- Chapter 3: the sea-to-shore change dissolves the complete shot. Retain sand placement, Nausicaa's grounded arrival, hand-owned bread hidden by the back-facing body, and uninterrupted river travel with a following camera. Basket and cloak stay behind. Hall scenes 3-5 remain continuous; all listeners, stool, lyre and food stay present.
- Chapter 4: show lotus arrival, the waiting crewman, return, boarding and departure. Cave arrival/escape/prayer share the same exterior. The three men disembark and enter together on separate noncrossing routes. The doorway stone rests to the left between entrance and fire, covers the entrance and moves with the giant. Finish the reframe before he sits. Empty wine after drinking; rams emerge physically. The ship leaves diagonally toward open upper-left water.
- Chapter 5: introduce Polites's earlier ship duty and the companion fleet. Preserve arrivals, walking, return, boarding and departure at Aeolus and Circe. Keep waiting crews and props. Show return aboard before the retained narration; do not restore deleted redundant passages. Four distinct sailors remain clipped inside companion hulls. Two cliff giants release one stone each simultaneously, hitting their own ships together. Polites and Eurylochus disembark together.
- Chapter 6: introduce Elpenor before reported news of his death; explain Tiresias. Preserve living crew and Polites, journeys and waiting ship. Keep ghosts spectral, basin on the shore, three separate failed embraces, burial on earth and the planted oar.
- Chapter 7: explain wax and ropes, six other sailors and the named survivors. Show departure, landing, meadow route, boarding and consequences of the broken promise. Preserve real mast/bindings, wreckage and Calypso's arrival. Explicitly finish the memories and return to the same listening hall with Arete and the seated singer.
- Chapter 8: explain the fresh Phaeacian crew, sleeping delivery and Telemachus's return. Preserve disguise, staff, bread and hut continuity; people walk around the table and meet without crossing. Restore disguise before the palace journey.
- Chapter 9: show the hut-to-palace journey. Argos stays on the ground after death. Retain the hidden-tear turn, Penelope's exit, carried basin, placement after stopping, nurse kneeling and contact with the visible scar before completed narration. Keep bow ownership, full delivery/withdrawal routes, twelve axes, one arrow, secured doors and explicit non-graphic consequences.
- Chapter 10: connect news to arrival and explain the bed test. The bed/root stays immovable; show contact with it. Preserve husband and son while others move, next-morning journey, Laertes's identity, grief of the families and Athena's peace. Carry the bow to the orchard and lower it separately; frame father and son in the closing vertical shot.

The measured coordinates, poses and chapter-specific exceptions are retained in the source excerpts below and in the migrated renderers/data. Older conflicting arrangements are historical, not current instructions.


<a id="source-c4-video-feedback-md"></a>
<details>
<summary>Historical source: C4-VIDEO-FEEDBACK.md (not current instructions)</summary>

> Retained source snapshot. Current rules and the October 14 priority table override conflicting directions, old script commands, paths, production status and QA counts.

# Chapter 4: recorded feedback corrections

All requested changes in the 9:28 recording `Cambios capitulo 4.mkv` are applied locally. The complete timestamped request list is in `work/c4-video-review/requests.md`; its transcription and source frames are retained beside it.

The lotus sequence now shows the three travelers landing, Odysseus and Doros disembarking, and Eurylochus waiting visibly aboard. It shows their return, boarding and departure before the sea shot. The islander remains on the departing beach snapshot and does not appear in the sea.

The cave sequence now has a visible exterior entrance connected to the landing by a sandy path. The three men disembark separately, walk along that path and enter without crossing one another. The later escape returns to that same beach, with the waiting ship and a visible boarding/push-off sequence. The new complete panorama has authored foreground depth; its phone view is a crop of the same artwork.

Eurylochus's initial diagonal has stable facing. Cup anchors follow the actual carrying pose, and the liquid well becomes empty after drinking. The larger, wider entrance stone blocks the opening and moves farther aside at dawn. Rams emerge gradually from the open left floor, walk into place and retain their wool/under-body poses. The stretched line previously drawn near the giant's eye is removed.

Camera destinations are constrained before smooth interpolation. Preparatory shots include the full upcoming route, incoming animals and briefly deferred boarding states. Waiting actors and the camera remain fixed during held movement; furniture/props retain their location and ownership. The original first boarding and final name/prayer events remain.

## Validation

- All 46 paragraphs passed manual/automatic completion, pause and saved-model reconstruction in 360, 390 and 430 px simulated phone layouts, 1366×640 horizontal reading and 390 px portrait mode. Completed passages have no required subject clipped by dialogue or the stage edges.
- 30,015 intermediate states were sampled across those five layouts. All 31 held actions retain the camera and waiting actors; no held-action clipping, ground-contact candidates or source overscroll was detected. Eurylochus has zero spurious facing changes on the initial diagonal.
- Four phone→horizontal→phone round trips preserve the model, original native texture and camera. The new exterior never exposes a tiled native floor. Waiting Eurylochus, the arriving three-person crew and the sea-only cast were checked explicitly.
- All five actual 720×1280 export previews were checked and cancelled. Twenty-one repeated opening actions agree between the previous scene's teaser and the next scene's opening, at the start and three intermediate points. This validation does not claim a newly encoded MP4.
- A compatibility audit sampled 1,906 states across all ten chapters at 1366×608, with no camera outside its panorama. A final focused Chapter 4 audit covered 379 states, also without overscroll.

These are local Edge simulations, not physical-phone or Safari testing. Nothing was published to Sites. `C4-VIDEO-FEEDBACK-QA.json` records the results and validated source/asset hashes. Intermediate framing can naturally reveal a new subject from the previous crop; it must be fully framed before its following held action.

## Assets and authoring

Final new asset: `dist/assets/odyssey-cave-approach-panorama-v2.png`. It was produced with the built-in image generator using the existing Odyssey coast and the project's Arte scene as references. Exact prompts are retained in `work/c4-video-review/art-prompts.json`. Character atlases were not edited.

`work/apply-c4-video-feedback.cjs` rebuilds these corrections from the saved before-video baseline. The older Chapter 4–10 authoring script reapplies this newer Chapter 4 override, preserving the user's recording feedback on future reruns. The other chapters' story JSON was not rewritten for this task.


</details>


<a id="source-c5-story-continuity-md"></a>
<details>
<summary>Historical source: C5-STORY-CONTINUITY.md (not current instructions)</summary>

> Retained source snapshot. Current rules and the October 14 priority table override conflicting directions, old script commands, paths, production status and QA counts.

# Chapter 5: clear journeys and character continuity

Chapter 5 now continues visibly from the ship at the end of Chapter 4. Its six episode identities remain, with 72 readable passages instead of 47 and approximately 15 minutes of automatic playback. All 47 existing passage IDs remain valid for saved reading.

Polites is introduced as the companion who stayed with the ship during the cave visit. Two other ships are established as crews who sailed from Troy and waited at sea. The same three named companions remain aboard throughout the sea journeys.

The Aeolus visit shows the approaching ship, separate disembarkation, the stone path to the court, the meeting and bag handoff, the return down the path, boarding, placing the bag on deck and departure. The second visit returns to the same landing and the same waiting crew. The narration explains nine days of sailing, the tenth morning near Ithaca, the released winds, the return and the following six days of rowing.

At the giants' harbor, Odysseus keeps his ship outside the entrance. One giant throws two separate stones. Each stone destroys its own ship; the second vessel stays afloat after the first impact. The three named companions escape in the main ship, and the narration explains the fate of the other crews.

The arrival at Aeaea shows the landing, Polites and Eurylochus getting off, and Odysseus waiting aboard. The scouts follow the beach and forest paths to Circe's house. Eurylochus stays on the path while Polites accepts the cup and is changed. His return reaches the same waiting ship. Odysseus disembarks to help, Eurylochus boards to guard the ship, and the visible path leads to Hermes and the rescue. Circe and Polites remain at the house while the camera follows that journey. After Polites is restored, he returns to fetch Eurylochus, and their reunion keeps Odysseus and Circe in their existing positions.

Physical walks have separately prepared, held cameras; waiting actors retain their positions. Real location changes dissolve the whole shot. Same-place episode boundaries preserve the cast and objects. A carried bag, cup, wand or moly remains hand-anchored. Moly uses the other hand while Odysseus holds the cup. The wand points toward Polites for his restoration.

## Art and framing

The existing character atlases and shared two-pixel walking frames are reused. Two new complete landing panoramas were created with the built-in image-generation tool using the existing Odyssey environments and the project's Arte scene as references:

- [Aeolus landing panorama](<C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/dist/assets/odyssey-aeolus-landing-panorama-v1.png>)
- [Circe landing panorama](<C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/dist/assets/odyssey-circe-landing-panorama-v1.png>)

Their specification was an unoccupied pixel-art coast, a continuous traversable path from the lower shore to the existing court or cottage, and enough foreground water to show arrival and boarding. The existing `dist/assets/odyssey-panorama-sea-wide-full-v3.png` supplies continuous open water. All three rooms use the complete bitmap in horizontal mode and its central third in phone, portrait and export mode. Their native cameras stay inside the artwork and never show repeated floor strips.

The exact prompts and reference paths are retained in [image-generation requests](<C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/work/c5-continuity-review/art-prompts.json>). Both final images are saved in the project; no external generation key or fallback CLI was used.

Routes were shortened within the visible ground where a full route, its waiting ship and the dialogue could not fit simultaneously. The camera guard preflights hidden arrivals and their carried props from the actual entry point, without including stale coordinates from an earlier location.

## Validation

- All 72 passages pass manual and automatic completion, pause and saved-model reconstruction at 360, 390 and 430 px simulated phone widths, 1366×640 horizontal reading and 390 px portrait mode. No required subject is clipped in the completed passages.
- 53,595 intermediate animation states across those five layouts pass checks for held cameras, fixed waiting actors, character and furniture contacts, carried-prop anchoring, opaque flying stones and background coverage. All 47 held routes pass without clipped required subjects.
- Keyboard advancement/back, pause, actual reload-and-continue, history, portrait continuity, restart, chapter completion and the link to Chapter 6 pass. Eight phone→horizontal→phone round trips retain the model, native texture and camera.
- Six real 720×1280 export previews were sampled and cancelled. All 16 repeated opening actions agree between the previous scene's teaser and the next scene's opening at the start and three intermediate points. All 144 generated walking textures preserve complete two-pixel blocks. This is preview validation, not a claim of newly completed MP4 files.
- The shared horizontal camera compatibility audit covers 2,351 states across all ten chapters, with no camera outside the authored panorama. The other chapter JSON files remain byte-identical; Chapter 1's scene and initial-state data remain unchanged. Its series catalog metadata now reports Chapter 5 as 15 minutes. The library estimate increases by eight minutes.
- Every passage and important movement was inspected in the 144 phone samples and 12 desktop samples, supplemented by export preview inspection. The record is `C5-STORY-CONTINUITY-QA.json`; detailed reports and captures are under `work/c5-continuity-review/` and `work/review-4-10/c5-continuity-final/`.

These are local Edge simulations. Physical phones and Safari were not tested. Nothing was published to Sites.

## Authoring and prevention

`work/apply-c5-continuity.cjs` reconstructs this revision from the immutable Chapter 5 baseline. The older visual-review authoring pass reapplies this override, preserving the clearer journeys. `AGENTS.md` records the requirements for future stories: establish where people came from, show necessary travel and boarding, retain those who wait, match each impact to its target and keep the narrative aligned with visible actions.


</details>


<a id="source-odyssey-audit-md"></a>
<details>
<summary>Historical source: ODYSSEY-AUDIT.md (not current instructions)</summary>

> Retained source snapshot. Current rules and the October 14 priority table override conflicting directions, old script commands, paths, production status and QA counts.

# The Odyssey — Chapter 1 staging audit

This is a local production chapter, not a claim that all ten chapters are playable.

## Passage and action contracts

| Scene | What the phone sees | Visible action and continuity |
| --- | --- | --- |
| The Other Shore | Odysseus facing water above the text | Shore and water remain visible. Home, wife and son are explicitly memories, not offscreen present actions. No narration of the cave, fruit or a distant horizon that the phone crop cannot show. |
| A Life Without an Ending | Two characters on the shore | Calypso follows a short sandy path to Odysseus. They face each other for their dialogue. Portrait/name identify the speaker; narration has neither. |
| The Visitor | Calypso and Hermes, winged sandals visible | Odysseus leaves, Hermes enters on foot, and explicit listeners orient Hermes toward Calypso. Calypso turns toward the visible water after the message. |
| Wood and Rope | Timber, tools, Odysseus and Calypso | Hermes departs. Odysseus walks to the timber, kneels and works. The four days are a narrated time compression, not real-time construction. A rigged raft replaces the bare timber; supplies appear before the completed-action passage. Tools are hidden when work is done. |
| Beyond the Shelter | Raft and Odysseus, Calypso visible for the farewell | The raft moves to the water; Odysseus walks toward it, boards before the past-tense passage, then remains attached to the raft. The camera follows its departure; Calypso leaves the crop as her visibility fades. Water and provisions stay aboard. |

Directional portraits, foot shadows and depth ordering follow the same world positions as the camera. Props have one model state and are never independently reset by dialogue. Start-from-passage replays preceding effects to reconstruct the complete scene; a new reading resets every prop.

## Platform

- The series sheet distinguishes one available chapter from nine in preparation.
- Future chapters are noninteractive; the full first manuscript draft is saved in `ODYSSEY-SCRIPT.md`.
- The chapter's scene links open the welcome, then start the selected scene explicitly.
- Continue opens saved progress without the welcome. New reading shows it.
- Completion records the available chapter, not the whole Odyssey.
- Manual/automatic modes, scenes, transcript, sound, restart and export use the existing engine.

## Verification

`ODYSSEY-LAYOUT-QA.json` checks all 51 passages at simulated 360, 390, 430 and 1440 widths in ordinary and portrait layouts. Required characters stay above the reading panel; text stays inside it; no horizontal overflow. Representative dialogue, work, complete raft and departure frames are captured under `work/odyssey-*` and visually inspected.

`ODYSSEY-INTERACTION-QA.json` covers the entire chapter manually and automatically using an accelerated test clock, resume after rigging/supplies, pause freezing, transcript, restart reset, and full-screen entry/exit. Both earlier stories are also read to completion in both modes to check regressions.

`ODYSSEY-EXPORT-QA.json` records five accelerated integration exports and one normal-speed export. Acceleration is test-only and is not shipped. Exports use the full-frame scenario and no UI. The main reading/checkpoint must remain unchanged.

Limitations: desktop browser simulations, no physical phone or mobile Safari test. Only Chapter 1 has final scene assets and playback. Animated assembly uses a short working gesture and a change from timber to rigged raft rather than a complex multi-piece construction animation. Ambient sound is synthesized sea/wind/occasional birds with a very quiet instrumental layer.

Additional UI validation (`work/odyssey-ui-qa.cjs`): series availability, all five scene links, selected scene after welcome, rapid double presses revealing without skipping, right/left keyboard navigation. Normal MP4 verified as 720 × 1280, 30 fps, H.264 + stereo AAC, 69.95 seconds; a decoded frame was visually inspected.

## Entry, depth and ambient-motion corrections

- The shared engine retains the starting alpha when an appearance action is entered. Visibility is interpolated immediately from that value; there is no one-frame forced opacity of 1. Fade-in sampling verifies all three Odyssey entrances from the zero-time frame through completion.
- The worker is staged to the left/front of the raft, walks around the deck rather than through it, and draws in front of the ground-level timber. The loose wood and axe are placed to the right with non-overlapping bounds. Boarding still attaches Odysseus to the raft; earlier chapters and exports use the same corrected engine.
- Near-shore glints and a slow pixel foam wash now lie inside the first scene’s phone crop. Small idle breathing keeps feet planted. Motion stays quiet, the reading camera stays still, and pause freezes the animation clock.
- `ODYSSEY-FIXES-QA.json`: complete alpha samples for all three arrivals, visible worker/depth assertions, separated tool bounds, desktop and simulated 390 px screenshots, and pause checks. Water image comparison between 0 and 2500 ms shows 1196 changed pixels within the visible 390 × 115 water region; character/UI pixels are excluded.
- All 51 passages checked again at 360, 390, 430 and 1440 px in regular/portrait layouts. Full manual and automatic regression runs pass for all three stories; resume, restart, history and fullscreen still pass. Scene 4 also exported successfully using an accelerated 8× test clock without altering the main reading checkpoint.

Portrait reading now forces continuous scene transitions and automatic playback, including when an older saved preference disabled continuous reading. Switching to portrait from an existing scene-break screen resumes it immediately. Scene selection can start portrait reading at a later scene, then continues to the chapter end. Individual video exports retain their separate scene boundary logic.

The first scene includes a visible shoreline pacing action after the second passage: Odysseus walks 90 world pixels to the right, turns toward the sea, then returns and faces the water. The camera stays still, the movement is finite rather than looped, and the same action sequence runs manually, automatically and in scene exports. First-scene duration is now approximately 75 seconds.

## Export logo and next-scene preview

- Every export begins with a title logo: fully visible for the first half second, easing to zero opacity at three seconds. The Odyssey uses a transparent gold/navy pixel-art logo guided by the supplied screenshot. Its placement respects configured video margins and leaves room above visible faces. Other stories use their own title wordmark. No logo is drawn in ordinary or portrait reading.
- After the final passage completes its normal reveal and reading hold, the caption fades away over 450 ms. The same engine then performs the next scene’s contiguous opening actions, holds the result for 900 ms, and fades the audio at the end. The next scene’s prose is never included. The last available scene finishes on its own artwork.
- Scene 1 now ends with Calypso appearing and approaching Odysseus; scene 2 repeats that arrival and later previews Hermes. Scene 3 previews tools/timber preparation; scene 4 previews taking the completed raft to the water.
- `dist/video-sequence.js` builds an independent export sequence from the localized story data. The main reader does not consume this sequence or its caption phases. Configurable logo source, fade/hold times and optional preview end-action live in story data.
- `VIDEO-TRANSITIONS-QA.json`: all 11 available scenes across all three stories exported with an accelerated integration-test clock, export-only caption phases and exact opening action IDs verified, final scenes handled, audio-on/audio-off, cancellation cleanup, unchanged reading state and browser storage.
- `VIDEO-NORMAL-TRANSITION-QA.json`: two complete normal-speed Odyssey exports with ambient audio; title opacity at the beginning/middle/after three seconds and text-free incoming-character frames captured. Every Odyssey scene boundary also verifies that the repeated opening actions have identical starting models and motion.
- Normal sample files: `work/odyssey-scene-1-with-transition.mp4` and `work/odyssey-scene-2-with-transition.mp4`. Decoded MP4 frames were visually inspected. Both videos are full-frame 720 × 1280 H.264/AAC, with no controls or outer green border. Browser recording uses variable frame cadence depending on available resources. QA uses desktop Edge with simulated mobile widths, not a physical phone.


</details>


<a id="source-odyssey-causal-continuity-md"></a>
<details>
<summary>Historical source: ODYSSEY-CAUSAL-CONTINUITY.md (not current instructions)</summary>

> Retained source snapshot. Current rules and the October 14 priority table override conflicting directions, old script commands, paths, production status and QA counts.

# Odyssey: cause, journey and timeline continuity

The user approved Chapter 5's expanded storytelling and requested the same review throughout the other chapters. These revisions are local to the reader at `http://localhost:4174/`. Chapter 5's approved story file remains byte-identical.

## Story review

| Chapter | Gap addressed | Result |
| --- | --- | --- |
| 1 | The opening assumed the reader already knew the family, the war, Calypso's captivity and Hermes's purpose. | Establish Ithaca, Penelope and Telemachus; explain the late starting point, the choice Calypso offers, the gods' decision and the materials for the raft. |
| 2 | Ithaca's parallel story and the reason for the suitors were implicit; the trip to Menelaus skipped the crossing and arrival. | Explain the cloth and nightly undoing, Athena's disguise, the unsuccessful meeting and the boat's destination. Show a sea crossing, Sparta landing, disembarkation and palace path. Explain Eurycleia's role and the return of the telling to Ithaca. |
| 3 | Odysseus's return to the main journey and the river-to-palace connection needed context. | Recall the raft departure, identify Nausicaa's island and parents, and show both travelers following the curved river path. Mark the start of the earlier memories before Chapter 4. Keep the approved continuous hall scenes. |
| 4 | The raid's losses, lotus forgetfulness, the false name and Poseidon's motive were too implicit. | Tie each consequence to its cause. Keep the recorded-feedback arrivals, boarding and cave staging. Add a little space to the last disembarkation so the boat and Doros stay within the portrait frame. |
| 6 | The dead-world trip, the crew left behind and the return for Elpenor's burial were abrupt. | Introduce Elpenor before the reported accident; define the prophet's role. Keep Polites with the surviving crew. Show departure from Circe's island, boarding, the crossing, a rocky landing, the return to the waiting ship, sailing back, disembarkation and the inland path. Explain whose spirits appear and why. |
| 7 | The Sirens' safety plan, six unnamed sailors, the Sun's warning and the return from the flashback needed connecting steps. | Show the departure after burial and explain wax and ropes before the song. Distinguish the six other sailors from the named survivors. Show the Sun-island landing, meadow path, return and boarding. Connect hunger, the broken promise, Helios's request and Zeus's punishment. Explicitly catch the memories up to Calypso and return to the listening hall. |
| 8 | The new crew, Telemachus's return and the disguise used in the next chapter were unexplained. | Show the promised voyage with a fresh Phaeacian crew; explain why Odysseus sleeps and wakes ashore without them. Explain Telemachus's return from Sparta. Show Athena restoring the disguise, the son's departure and Eumaeus's return with news. |
| 9 | The hut-to-palace journey, the absent son and the private conversation needed context; the bow plan assumed too much. | Show the next-morning departure, passage through the gate, arrival at the fire, staff placement and Eumaeus leaving the interview. Explain where Telemachus is, the bow test, Antinous and the earlier removal of weapons. Secure the doors before the identity reveal. Plan the full bow-delivery and withdrawal routes before holding the camera. |
| 10 | The news, bedroom test, orchard journey and arriving opponents lacked enough connections. | Connect Eurycleia's report to Penelope's arrival, explain the bed test, show the walk out of the hall and the following morning's bedroom departure. Explain the son's meeting, Laertes's identity, the families' grief and why Athena stops another fight. |

An explicitly reported offscreen event is intentional when the visible result is the subject: the roof accident, the sleeping traveler's carriage ashore, the earlier hiding of weapons and the families receiving news. The text states what happened and who did it. It does not leave readers to invent those links.

## Rules for later stories

Before accepting a scene, answer six questions using both the text and the image: who is here, where are they, how did they arrive, why do they act, what changes because of that action, and when does it happen relative to the previous scene?

Introduce a named companion before relying on them. Explain where missing companions wait and return to the same waiting state. Show meaningful landings, paths, boarding and departures. A scene number alone never resets the cast or cuts the shot. Use a complete-shot dissolve for a real place or time change. State when a memory starts and when it returns to the present. Keep narration in the right order: an action is described as completed after the visible action finishes, or explicitly as reported news.

Use the existing pixel-art family. Keep owned objects attached through movement, and place them only after the holder stops. Inspect intermediate movement, not just final paragraphs: parallel routes must keep companions apart, walking direction must follow the authored leg, and waiting people must keep their world coordinates. Preflight the entire route and the incoming object extents before a held walk. Include enough space for the real walking and boat silhouettes, including portrait margins.

## New art

Both new images are complete 1774 × 887 panoramas, generated using the existing Odyssey environments and an image in the Arte folder as references. The horizontal reader shows the whole bitmap with uniform scale. Native phone, portrait and export framing uses a nearest-neighbor central-third crop of the same image. These exteriors have bounded native cameras and never expose a repeated floor strip.

- `dist/assets/odyssey-sparta-landing-panorama-v1.png`: the shore, stone path, steps and red-and-gold palace exterior for Telemachus's arrival.
- `dist/assets/odyssey-sun-landing-panorama-v1.png`: the shore and meadow approach for the crew's arrival at the Sun's island.

The exact final image-generation prompts, saved output filenames and reference paths are in [art-prompts.json](work/causal-continuity-review/art-prompts.json). Existing character atlases and approved environment images were preserved. Chapter 6 reuses the same Polites crop as Chapter 7; the small Phaeacian deck crew uses tinted copies of an existing pixel texture.

## Verification

The final authoring keeps 51 scenes across ten chapters and retains every previously saved paragraph ID. Chapters 1–4 and 6–10 now contain 410 reading passages. Each new route has an authored preparation shot; consecutive moves are tested in real continuous playback as well as reconstructed saved paragraphs.

- Reading QA: 45 chapter/layout combinations; manual and automatic completion, 2,050 saved-paragraph reconstructions, pause checks and intermediate held-action framing. Chapter 1's approved entrance animations are unchanged; its new text and saved states are checked.
- Continuous motion QA: 136,115 intermediate states across Chapters 2–4 and 6–10 at 360, 390 and 430 px, 1366 × 640 horizontal and portrait. No held-camera drift, waiting-actor movement, new route crossings, caption/edge clipping or detached owned props remained.
- Actual app QA: resume, pause, reading history, portrait continuity and phone/horizontal orientation round trips for representative new passages in Chapters 2, 3 and 6–10.
- Export QA: all 45 selectable scenes in the revised nine chapters use the real 720 × 1280 export renderer. Each preview is cancelled and its temporary renderer cleaned up; the normal reader remains unchanged. Repeated next-scene openings compare equal at their starts and intermediate points. Further route checks cover the revised river departure and cave disembarkation.

Results are saved under `work/causal-continuity-review/`; the aggregate snapshot is `ODYSSEY-CAUSAL-CONTINUITY-QA.json`. These checks use simulated viewports in Edge, not a physical phone or Safari. No completed MP4 export or new Sites publication is claimed.

## Authoring and preservation

The immutable starting snapshots are in `work/causal-continuity-review/baseline/`. The causal text and travel modules are `work/odyssey-causal-text.cjs` and `work/odyssey-causal-travel.cjs`. The driver `work/apply-odyssey-causal-continuity.cjs` reproduces this revision from those snapshots and updates the master durations and catalog. Do not run it over later independent edits without first updating the authoring sources. The older visual-review script calls the causal module after its earlier transformations; Chapter 5 still uses its separate approved authoring module.

The full approved Chapter 5 file has SHA-256 `d537df3314e7ce5cd07f27ae4076b703bb1c27a179a7a7cb81d99cc6bb4ac198` before and after this revision. The chapter selector still uses the same URLs and episode identities.


</details>


<a id="source-odyssey-chapter-2-md"></a>
<details>
<summary>Historical source: ODYSSEY-CHAPTER-2.md (not current instructions)</summary>

> Retained source snapshot. Current rules and the October 14 priority table override conflicting directions, old script commands, paths, production status and QA counts.

# Chapter 2 — The House That Waited

Implemented English adaptation for Pixel Nook: five scenes, 45 passages, approximately six minutes of automatic reading. This chapter condenses the Telemachy; Athena appears in a traveler's disguise. Original prose is abridged and rewritten, guided by the public-domain [Odyssey text](https://www.gutenberg.org/files/1727/1727-h/1727-h.htm). It remains a quiet reading experience with visible, finite actions.

## Staging before implementation

| Scene | Vertical focus | Action and persistent objects |
|---|---|---|
| The Unfinished Cloth | Penelope beside her loom, stool and oil lamp | She crosses the room, sits, and unpicks the woven panel. The cloth visibly shortens and the loose thread reaches her hand. This cloth state must still be present in scene 5. |
| A Guest at the Door | Telemachus welcomes a disguised Athena beside a small table | The traveler walks from the visible doorway. Telemachus places bread on the actual tabletop. Both face each other. No unseen feast is described as an on-screen event. |
| The Son Who Stayed | Telemachus addresses an island elder, then the harbor | He steps forward to speak. The camera then reveals the prepared boat before it is mentioned. He walks along the pier and boards; Athena waits nearby. No walking through furniture or across water. |
| News Across the Water | Telemachus and Menelaus at a table in Sparta | A clear location change introduces the host. A cup moves from tabletop to Telemachus's hand; he lowers it when he learns his father is alive. Earlier visits are compressed into a brief recollection rather than described as current unseen actions. |
| A Promise in the Dark | Penelope, Eurycleia, the shortened cloth and oil lamp | Eurycleia enters through the chamber door. Penelope rises to listen and returns to the stool. The lamp remains lit and the cloth retains scene 1's undone state. |

## Chapter navigation

Keep one Odyssey entry in the library. Chapters 1 and 2 each have five local scenes, their own availability and completion status, and direct scene links. Continue reading must resolve the saved passage's chapter. Starting from the beginning starts Chapter 1; starting Chapter 2 explicitly shows its welcome. Chapter 1's ending offers Chapter 2. Later chapters remain unavailable.

## Export behavior

Use the existing title logo, three-second fade, automatic reading and next-scene opening preview. Opening actions must be self-contained and replay identically when exported as the start of their own scene. The final scene does not invent an unavailable chapter preview.

## Validation

- All 45 passages at simulated 360, 390, 430 and 1440-pixel desktop width, in normal and portrait layouts. Checks cover faces, important props, readable text and horizontal overflow. Representative frames were inspected visually.
- Full manual and automatic chapter, rapid advance/reveal protection, back navigation, pause during actions, history, fullscreen, restart and generic saved-passage recovery into Chapter 2 without the welcome.
- Two available chapter cards, ten scene links, eight unavailable chapters, per-chapter completion and Chapter 1's link to Chapter 2.
- Five complete scene exports using an accelerated integration-test clock, sound inclusion/exclusion and cancellation; reading state and local storage remain intact.
- A complete normal-speed harbor video with sound, the fading title, boarding action and caption-free Sparta preview. Repeated next-scene opening models were compared at their beginning and during movement.

Reports are saved in the `ODYSSEY-CHAPTER-2-*-QA.json` files. Export recording remains browser-dependent and takes real time. There is no cross-chapter video teaser; the last scene ends on its own image. Phone sizes were simulated in Edge, not tested on physical phones. Later chapters remain in preparation. Nothing was published.


</details>


<a id="source-odyssey-chapter-3-action-audit-md"></a>
<details>
<summary>Historical source: ODYSSEY-CHAPTER-3-ACTION-AUDIT.md (not current instructions)</summary>

> Retained source snapshot. Current rules and the October 14 priority table override conflicting directions, old script commands, paths, production status and QA counts.

# Chapter 3 — A Stranger from the Sea

Original English abridgment of Homer, Odyssey V–IX. Source: [Samuel Butler's public-domain translation](https://www.gutenberg.org/files/1727/1727-h/1727-h.htm). The name reveal begins Book IX. The divine rescue and the day of games are condensed; the five scenes focus on exhaustion, kindness, hospitality, memory and trust.

| Scene | Vertical frame | Action and visible objects | Persistent result |
|---|---|---|---|
| The Broken Raft | Odysseus and the raft, then the sheltered river shore | Timber raft rocks, bindings give, sail fades into wreckage; Odysseus holds the wood with his lower body in water. Crossfade to sand, then a few grounded steps inland. | The raft remains broken and is left in the sea; he is on the shore. |
| The Girl by the River | Two people, basket, food and folded cloth | Nausicaa walks down the visible sandy path; open hands, bread passed between them; cloak laid beside him. | Bread is in his hands; cloth rests by the river. |
| Bread for a Stranger | Odysseus, Arete, Alcinous and the table | He walks around the table's foreground side from the doorway. Alcinous approaches from the bench; the guest lifts bread. | Food leaves the table for his hands; lamp stays on the table. |
| The Song of Troy | Guest, singer, lyre, stool and the same table | Demodocus walks around the table, sits on a visible stool, moves his hand over the lyre. Odysseus bows his head and a small tear appears. | Lyre held at his knees; table and lamp retain their positions. |
| A Name at Last | The guest and both hosts | Singer stops; king approaches around the table; Odysseus raises his head and gives his name. | Same hall and furniture; Chapter 4 remains in preparation. |

All important objects and required faces fit above the dialogue in mobile reading and 9:16 export. Desktop expands these same shots. No text describes the distant gate, coastline or ships unless the camera shows them.

Every action is reconstructible from its scene data. Restart, previous passage and saved continuation rebuild object positions and ownership; runtime movement contains no narrative state. Fade and next-scene opening in exports use the shared sequence logic.

Art anchor: `dist/assets/odyssey-atlas-v1.png`. Odysseus reuses it; four new characters use `odyssey-scheria-people-v1.png`, the same hard-alpha grid and matching portrait crops. Props are separate. Accepted image prompts and original output paths are in `work/odyssey-chapter-3-art.json`.


</details>


<a id="source-odyssey-chapter-4-action-audit-md"></a>
<details>
<summary>Historical source: ODYSSEY-CHAPTER-4-ACTION-AUDIT.md (not current instructions)</summary>

> Retained source snapshot. Current rules and the October 14 priority table override conflicting directions, old script commands, paths, production status and QA counts.

# Chapter 4 — The Name in the Cave

English, vertical-first adaptation of Homer, *Odyssey*, Book IX. Source checked against the public-domain Samuel Butler text at https://www.gutenberg.org/files/1727/1727-h/1727-h.htm. All dialogue and narration are original abridgments.

The earlier chapters remain the frame story. Chapter 4 explicitly opens years earlier, after Troy. The raid at Ismarus is recalled in its aftermath. Doros is an invented representative companion whose loss condenses the deaths in the cave. Eurylochus represents surviving sailors. The blinding is shown through a short stake movement and a closed eye, without gore. Other Cyclopes are heard about in narration and never presented as visible speakers. The rock throwing, extra days and repeated killings are omitted.

| Scene | First phone view | Actors and objects | Visible action and resulting state |
| --- | --- | --- | --- |
| After the War | Three companions beside a beached wooden ship | Original Odysseus, Doros, Eurylochus, ship | Odysseus walks back; heads lower while losses are remembered; all walk aboard. Hull covers their feet only after boarding. The setting crossfades to water and the ship rocks slowly. |
| The Sweetest Forgetting | Three people on the sandy lotus path | Odysseus, Doros, islander, blossom | Islander approaches holding the blossom. It crosses to Doros, rises toward his mouth, then is consumed. Odysseus approaches his arm and brings him toward the visible ship. |
| The Open Cave | Travelers entering the real doorway and walking to the cheese baskets | Odysseus, Doros, Eurylochus, Polyphemus, cheese, amphora, door stone | Polyphemus walks in. The stone crosses the actual doorway and remains there. Doros is drawn toward the giant and fades out; the survivors lower their heads. Doros never reappears later in the chapter. The camera returns to the blocked exit when the text explains it. |
| Nobody | Odysseus approaches the giant with the filled cup | Odysseus, Eurylochus, Polyphemus, cup, stake, stone | The cup crosses to the giant's authored accepting hand, rises for drinking and lowers. Giant settles into the seated pose; cup rests on floor. Stake is lifted before the completed-action narration. A brief thrust, retreat and closed eye imply the injury. Camera then shows the rams. |
| The Name He Gave Away | Two men lower themselves beneath two rams, beside the cave exit | Odysseus, Eurylochus, Polyphemus, two rams, stone, ship | Authored hanging poses retain anatomy under the wool. Stone rolls aside; rams walk through the visible opening while a hand passes over their backs. In open air, men release the wool, then board. Camera follows Odysseus' boast, cuts to the giant's authored prayer pose, then returns to the departing ship. |

## Continuity and rendering

- Original Odysseus assets are reused. Four new characters, two authored hanging poses and two giant interaction poses follow `CHARACTER-ART-STYLE.md` and `drawCharacter`.
- Cell cuts follow alpha gutters. The generated lotus backdrop is portrait and keeps its source aspect ratio; it is not compressed into a square.
- Foot-based actor sorting, ram wool occlusion, ground shadows and a separate ship hull control depth. Ownership transfers interpolate from one hand to another.
- Character entrances begin at zero opacity, with no default-opacity frame. Walking frames follow traveled distance. Rams have articulated steps.
- Camera interpolates only toward a new shot or moving action. During text it settles. Dialogue, audio, animations and export share the reading clock, so pause freezes them together.
- Ambient sound uses the existing synthesized nature system with per-scene profiles: quiet coast and lotus water/birds, restrained cave wind and distant water. No rain or thunder.
- The common export pipeline retains 720×1280 output, configurable safe margins, three-second logo fade, caption fade and repeated opening actions from the following scene. Normal portrait reading remains continuous.
- Checkpoints retain the shared series ID `the-odyssey-v1`; the `odyssey-c4-` prefix resumes Chapter 4 without a welcome overlay.
- Work remains local. No Site release or deployment was requested or performed.

## Validation artifacts

The layout report checks all 46 passages at 360, 390, 430 and 1440 px, in normal and portrait layouts. These are simulated browser viewports, not physical phone tests. Interaction and export reports record the actual results separately. Refer to `ODYSSEY-CHAPTER-4-QA.json` for the final combined status.


</details>


<a id="source-odyssey-chapter-5-action-audit-md"></a>
<details>
<summary>Historical source: ODYSSEY-CHAPTER-5-ACTION-AUDIT.md (not current instructions)</summary>

> Retained source snapshot. Current rules and the October 14 priority table override conflicting directions, old script commands, paths, production status and QA counts.

# Almost Home — staging before implementation

Original abridgment of Homer, Odyssey Book X. Source: https://www.gutenberg.org/files/1727/1727-h/1727-h.htm . English, six episodes; phone shots define the staging, with desktop extending their surroundings.

| Episode | Person and action | Object / place | Visible result and vertical framing |
|---|---|---|---|
| The Keeper of Winds | Odysseus walks into Aeolus's court. Aeolus extends his hand and passes the tied bag. | Oxhide bag, silver cord, walkable stone court. | Bag starts in Aeolus's hand, travels into Odysseus's hand and stays closed. Both faces and bag share a close shot. |
| The Shore in the Distance | The survivors sail toward Ithaca; Odysseus watches, then falls asleep. | Same ship, closed bag on deck, authored seated sleeping pose. | Shore and houses appear above the ship before home is mentioned. No dialogue assumes an unseen landmark. Camera moves once toward coast, then rests. |
| What Was in the Bag | Polites approaches the bag and unties it. Winds escape; Odysseus wakes. Aeolus refuses a second gift. | Closed/open variants of one bag; wind trails; return to the same court. | Cord and mouth change visibly; no treasure appears. Ship turns away as home leaves the frame. Empty open bag accompanies Odysseus on the return, then is retired after the refusal. |
| The Empty Harbor | Giant throws stones; other ships are lost. Odysseus rows his ship clear. Eurylochus and Polites scout Circe's doorway. | Cliff ledge, distinct ships inside the harbor, sole ship outside, falling stone and floating wreckage. | Establish fleet and the outside ship, move closer to the cliff and endangered boats for the attack, then follow the surviving ship through the opening. Intact fleet fades as impacts arrive; wreckage remains. Scouts walk along the courtyard path; Eurylochus stays outside, Polites enters. |
| The House of Circe | Circe emerges and offers Polites a cup, then uses her wand. Eurylochus returns to warn Odysseus. | Same visible doorway, actual table, cup, wand, authored pig. | Polites becomes a pig at the same position. Eurylochus never claims to have witnessed the transformation. |
| The White Flower | Hermes gives moly; Odysseus returns, drinks safely and requires his friend's release. | Black-rooted white-flowered moly, same cup, table and wand. | Root is handed over and retained on Odysseus; cup changes owner, lifts to mouth and returns to the table. Circe reverses the change; human and pig never appear fully together. |

Crew is represented by Eurylochus and Polites. Polites is a distinct surviving companion, never Doros from Chapter 4. Laestrygonian losses are shown without gore; their fleet is condensed to two representative ships. Circe's domestic episode is condensed to hospitality, transformation and release; the year on Aeaea and departure belong to Chapter 6. No synthetic suspense interrupts ordinary reading.

Export-only logo and next-opening previews use the existing export clock. Scene 4's ending previews Circe walking out to greet Polites; Scene 5 repeats that exact opening with no narration during the preview. Ordinary portrait reading continues without episode cards.

All durable changes live in story state: bag opened, sleeping/waking, fleet loss, pig transformation, object ownership. Pause freezes movement; returning to a saved passage reconstructs actions rather than replaying an inconsistent prop state.

Estimated episode lengths: 62, 60, 69, 81, 50 and 72 seconds before export previews. A sixth episode, The White Flower, gives the rescue its own short-video structure instead of making Circe's encounter a two-minute episode. Cup, root and wand rest visibly on the table at the reunion; tabletop depth is checked separately from screen bounds.

Final visual pass: the held bag hangs below the gripping hand, away from Odysseus's face. The loom remains background scenery; narration only mentions the visible open doorway. Tall portrait versions of the two courts remove repeated floor strips from vertical exports. Circe's entrance follows waypoints to the right of Polites instead of crossing his position.


</details>


<a id="source-odyssey-chapters-6-10-action-audit-md"></a>
<details>
<summary>Historical source: ODYSSEY-CHAPTERS-6-10-ACTION-AUDIT.md (not current instructions)</summary>

> Retained source snapshot. Current rules and the October 14 priority table override conflicting directions, old script commands, paths, production status and QA counts.

# Odyssey chapters 6–10: vertical action and continuity contract

English original abridgment of Books X–XXIV, checked against the public-domain Butler translation at https://www.gutenberg.org/files/1727/1727-h/1727-h.htm. Greek names follow the existing adaptation. All work remains local.

| Chapter | Action, object, place | Visible result and phone shot |
|---|---|---|
| 6 | After one year Circe sends Odysseus to consult Tiresias. Elpenor has died in a fall from the roof. | The courtyard remains familiar. Elpenor's absence is explained before his ghost appears. No fall is staged offscreen as present action. |
| 6 | Elpenor asks for burial; Tiresias warns against the Sun's cattle; Anticleia tells her son why she died. | One ghost at a time faces Odysseus on the dark shore. Three attempted embraces pass through a fading silhouette. The prophecy describes future events explicitly. |
| 6 | Return to Aeaea; bury Elpenor and plant his oar. | Grave mound and separate oar are visible together. Odysseus approaches, carries the oar, lowers it into the mound; it stays planted. Circe then gives the next warning. |
| 7 | Sirens; Odysseus bound to mast; crew row with sealed ears. | Authored tied pose includes actual rope and mast. Siren and vessel fit the vertical shot. Nobody hears a loud distracting music effect. |
| 7 | Scylla and Charybdis; six companions lost. | Establish the whirlpool and cliff in two deliberate vertical shots before the choice, then focus on ship and six-headed Scylla. Representative sailors fade; text explicitly states they represent the six lost men. Eurylochus and Polites survive this scene. No gore. |
| 7 | Cattle of Helios killed while Odysseus sleeps; ship destroyed after leaving. | Cattle are separate persistent objects. One is removed during a cut to the visible sacrifice brazier; surviving cattle remain. Storm brings wreckage; Eurylochus and Polites disappear only after the ship breaks. |
| 7 | Odysseus alone reaches Calypso, finishes his account in Scheria. | Original Calypso and Alcinous are reused. Narration explicitly reconnects the flashback with Chapter 1 and returns to the listening king; it does not repeat seven years of story. |
| 8 | Phaeacians leave sleeping Odysseus on Ithaca; Athena changes his appearance. | Shore, actual sleeping pose and belongings visible. Old disguise crossfades complete silhouettes at the same feet; portraits derive from current identity. |
| 8 | Eumaeus offers bread to a stranger; Telemachus returns; father reveals himself. | Hut and pigs are visible before narration names them. Bread travels from hand to table. Eumaeus leaves by the doorway before the reveal. Disguise restores smoothly, father and son approach without overlapping through one another. |
| 9 | Argos recognizes master; dies. Penelope questions disguised husband. | Dog visible beside path; ears/body move subtly, eyes close at death. Same dog stays on ground; no disappearing pet. Dialogue keeps disguise intact. |
| 9 | Eurycleia washes his foot and recognizes old scar. | Authored seated, barefoot, extended-leg pose, water basin at his foot, nurse approaches and kneels with her hands low. Scar is already on the leg, not floating above it. |
| 9 | Penelope retrieves bow; suitor fails; Odysseus strings it and shoots through twelve axes. | Bow has one owner at a time. Single-file runtime arrangement of twelve authored axe heads, no two parallel target rows. An unstrung bow becomes strung in an authored gesture. The aiming pose changes to an empty-arrow release pose while the single separate arrow travels toward aligned holes. |
| 9 | Telemachus secures hall; suitors killed; aftermath. | Doors already closed in background. Bow and supporters visible; non-graphic staged fade to aftermath, no suggestion they merely went home. Caption explains violence and cost plainly. |
| 10 | Penelope tests the bed; Odysseus explains olive root. | Rooted bed visible before dialogue names it, stays fixed at x=820/y=1390 across both bedroom scenes. Eurycleia reaches but cannot move it. Camera focuses the living post/root while whole bed remains visible. |
| 10 | Recognition, Laertes' orchard, threat of renewed violence, Athena ends it. | Couple approach, old father meets his son in the orchard clearing. Recognition relies on remembered tree names; it does not claim a second scar display that the standing pose cannot show. Athena comes between armed groups, weapons are lowered. The abridgment explicitly condenses Book XXIV's final conflict to the peace-making moment. |

All actions have reconstructible numeric/string state in the initial model. Props multiply visibility by their owner; transfer paths interpolate before owner changes. Required actors, objects and landmarks are included in camera fitting. No speaker marker. Same actions run for manual reading, automatic playback, checkpoints and export previews. New poses use the shared two-world-pixel character grid; no reshaped idle figure substitutes for a seated/bound/aiming action.


</details>


<a id="source-odyssey-script-md"></a>
<details>
<summary>Historical source: ODYSSEY-SCRIPT.md (not current instructions)</summary>

> Retained source snapshot. Current rules and the October 14 priority table override conflicting directions, old script commands, paths, production status and QA counts.

# The Odyssey — The Long Way Home

Original abridged adaptation for Pixel Nook, based on Homer. Narrative reference: Samuel Butler’s 1900 prose translation, https://www.gutenberg.org/ebooks/1727. New dialogue and narration; not a reproduction of a modern translation.

## Production status

Chapters 1 and 2 are implemented locally, each with five playable scenes. Chapter 2 has 45 passages and four new environments. Chapters 3–10 below remain a first prose draft, with assets and staging still in preparation.

## Editorial direction

English. Warm, clear prose; restrained sound and motion; strong silhouettes based on the supplied Arte references. Keep consequences, grief and agency. Calypso’s detention is not recast as a voluntary holiday. Violence is conveyed without graphic imagery. The sequence starts on Calypso’s island, cuts to Ithaca, then uses Odysseus’s account for the earlier travels. The later aftermath is condensed; this is explicitly an abridgment.

Each produced scene has its own emotional movement, lasts roughly 45–90 seconds where the material supports it, and remains readable continuously. No inserted marketing hooks or forced cliffhangers inside the story. Only mention a prop, actor or action when its vertical framing can show it.

## Chapter 1 — The Shore That Wasn’t Home

### The Other Shore

Every morning, Odysseus watched the sea.

It had carried him to this island. It had never carried him home.

This shore had kept him alive for years. It had begun to feel like the edge of his life.

Ahead of him was the one thing it could not offer: a way to leave.

He had survived a war. He had survived the sea. Now he was surviving another quiet morning.

Somewhere beyond the blue was Ithaca. A house. A wife. A son who would no longer be small.

He could remember the weight of an oar. The sound of his son’s voice was becoming harder.

He watched the water until the sunlight hurt his eyes.

There was no ship on the water. Still, he looked.

Production: playable; 75 seconds estimated.

### A Life Without an Ending

Calypso came to the shore. She had watched him watch it for years.

Calypso: “You could have a life here.”

Odysseus: “I have a life somewhere else.”

Calypso: “A life that changes. People grow old there. They leave. They forget.”

She offered him a place untouched by age. Nothing he loved here would have to end.

Odysseus looked at the woman beside him, then at the water.

Odysseus: “Penelope will have changed. So will I.”

Calypso: “And that is what you want?”

Odysseus: “I want the chance to find her. Even if I find her older.”

Calypso said nothing. For a moment, only the water answered.

The island could keep a man alive forever. It could not make him stop missing home.

Production: playable; 70 seconds estimated.

### The Visitor

That afternoon, another pair of sandals crossed the sand. Small wings shone at their heels.

Calypso knew the messenger before he spoke.

Calypso: “Hermes. What have the gods decided?”

Hermes: “The man must be allowed to leave.”

Calypso: “They remember him now?”

Hermes let the question rest between them.

Hermes: “You must help him prepare. The crossing itself will still be his.”

Calypso turned toward the water where Odysseus had looked for so many mornings.

There would be no ship waiting for him. No crew. No promise of a gentle sea.

Only permission to try. After all these years, it was enough to change the day.

Production: playable; 66 seconds estimated.

### Wood and Rope

Calypso gave him tools, timber and rope. This time, her gifts could carry him away.

Calypso: “A raft is a small thing to put between yourself and the sea.”

Odysseus: “Then I will have to make it carefully.”

He knelt beside the timber and worked the bindings tight.

Four days went into the wood: measuring, joining, checking the same knots again.

His hands remembered how to make something that might hold.

On the last day, a small sail stood above the timber. The raft was ready.

The raft stood ready on the sand, with water and provisions secured on its timber.

Calypso: “I cannot promise what you will find.”

Odysseus: “Neither can I.”

For the first time, the next morning would be different.

Production: playable; 80 seconds estimated.

### Beyond the Shelter

When the wind was right, the raft reached the water. A little wave lifted it, then set it down again.

Odysseus stayed beside it for one last moment.

Calypso: “You may still stay.”

Odysseus: “I know.”

He stepped aboard before fear could become another year.

Calypso watched from the sand. She did not reach out to stop him.

The small sail filled. The water opened between him and the shore.

He had no map that could promise the end of this journey.

But the wind was moving him. For today, that was enough.

Beyond the island, the sea widened. Somewhere across it, a house was still waiting.

Production: playable; 71 seconds estimated.

## Chapter 2 — The House That Waited

### The Unfinished Cloth

By lamplight, Penelope drew a thread out of the cloth.

Every morning, she wove. Every night, she quietly undid a little of her work.

She had promised to choose a husband when she finished a burial cloth for Odysseus’s father.

The men who wanted her hand believed they were waiting for a piece of work.

They were waiting for her to run out of time.

Another row loosened. Another small part of the morning came away.

She could not bring Odysseus home by pulling a thread.

But she could keep his place from being given away before morning.

Another day. Tonight, that was what she could make.

Production: playable; 68 seconds estimated.

### A Guest at the Door

In the hall, Telemachus offered bread to a stranger.

The house still belonged to his father. He wanted it to remember how to welcome a guest.

The traveler was Athena, hidden in another person’s shape.

“Eat first. You can tell me where you have come from afterward.”

“And where would you go, if you could leave?”

“Somewhere a person might have seen my father.”

“Then ask. A son can seek an answer, even when a house has learned to wait.”

Telemachus turned toward the doorway.

For years, he had watched it for someone coming in. Now he imagined himself going out.

Production: playable; 64 seconds estimated.

### The Son Who Stayed

At dawn, Telemachus spoke at the assembly. His voice shook. He used it anyway.

“Men are eating through my house while they ask to marry my mother.”

“And what do you ask of us?”

“A ship. And the chance to learn whether my father is alive.”

The elder looked at him for a long moment. No promise followed.

At the harbor, the traveler was waiting beside a prepared boat.

Athena had found the help that the assembly had not offered.

Telemachus stepped aboard. Speaking had not solved his trouble. It had made him ready to move.

For the first time, waiting would have to happen without him.

Production: playable; 73 seconds estimated.

### News Across the Water

In Sparta, King Menelaus welcomed the son of a man he had known at war.

He had followed one memory to the next. At last, a host had more than memories to offer.

“Your father found a way when the rest of us could not see one.”

Telemachus lifted his cup, then held it without drinking.

“Did you hear what became of him?”

“I heard he was alive. Held on an island, with no ship to carry him away.”

He set the cup down carefully. Alive.

It was not the same as home. It was not a promise that the sea would be kind.

But it was a word he could carry back to his mother.

Production: playable; 70 seconds estimated.

### A Promise in the Dark

In Ithaca, Eurycleia brought Penelope the news: her son had sailed.

“You knew?”

“He asked me to wait before telling you. He feared that you would grieve.”

“And so he left me to do it afterward.”

Eurycleia stayed beside her. There was no answer that could make a mother less afraid.

“He took provisions. He found companions. He prepared, my lady.”

Penelope sat beside the unfinished cloth. The loose thread lay where she had left it.

A husband somewhere beyond the water. A son now crossing it.

She could keep the lamp lit. She could not see beyond its circle.

Production: playable; 63 seconds estimated.

## Chapter 3 — A Stranger from the Sea

### The Broken Raft

Far from Calypso’s shore, Poseidon found the man he had not forgiven. The sea broke the raft apart. Odysseus clung to a beam until even that became impossible. Ino gave him a veil and told him to swim. He let the wood go. After days of struggling, a river mouth offered quieter water. He crawled beneath leaves and slept without knowing whose land had saved him.

### The Girl by the River

Nausicaa came to the river with her companions to wash clothes. When a stranger emerged from the trees, the others ran. She stayed. Odysseus stopped at a distance and asked for clothing and a way to the town. He had no gifts and no rank anyone could recognize. She handed him what he needed. Before he could tell his story, someone had already decided to help.

### Bread for a Stranger

In the palace of the Phaeacians, Queen Arete studied the clothes he wore. Odysseus explained how her daughter had helped him. King Alcinous offered a place by the fire and passage onward. “We can ask your name after you have eaten.” Odysseus accepted the bread. For so long, every shore had demanded something from him. This one had offered something first.

### The Song of Troy

The singer Demodocus began a song about the war. Men in the hall listened to a tale of courage and cleverness. Odysseus listened to voices he would never hear again. He covered his face. Alcinous noticed and asked the singer to stop. The hall grew quiet. “That song belongs to you somehow,” the king said. The stranger lowered his hands.

### A Name at Last

“My name is Odysseus. My home is Ithaca.” Saying it made the room feel different. He was no longer only a wet man brought in from the sea. Alcinous asked what had kept him from returning. Odysseus looked into the fire. “We left Troy thinking the hardest part was over.” He began with the ships, full of men who still expected to see home.

## Chapter 4 — The Name in the Cave

### After the War

At the coast of the Cicones, the men took what was not theirs and stayed when Odysseus urged them to sail. A counterattack drove them back to the ships. Empty places appeared at the oars. They had carried the habits of war onto a new shore. The sea did not make those habits harmless. They left with less than they had brought.

### The Sweetest Forgetting

On another island, some men tasted the lotus. Their shoulders loosened. They no longer wanted to send messages or board the ships. They were content to remain, forgetting what they had once missed. Odysseus pulled them back and tied them beneath the benches until they were clear of the shore. A place could be dangerous without hurting anyone. It could simply make leaving seem unnecessary.

### The Open Cave

They found a cave full of cheese and pens of animals. The men wanted to take food and go. Odysseus wanted to meet its owner. When Polyphemus returned, he rolled a stone across the entrance that none of them could move. The giant did not honor guests. By morning, their welcome had become a terror. Odysseus understood too late that curiosity could cost other people their lives.

### Nobody

He offered the giant strong wine. Asked his name, he answered, “Nobody.” When Polyphemus slept, they blinded him with a heated stake. His cries brought the neighboring Cyclopes to the entrance. “Nobody is hurting me!” he shouted. They left him to his trouble. At dawn, the surviving men hid beneath the sheep and slipped past his hands. A false name had given them a way out.

### The Name He Gave Away

From the departing ship, Odysseus could not bear to leave his victory unnamed. He shouted who he was. Polyphemus lifted his hands and prayed to his father, Poseidon. Let the man return late, alone, and find trouble in his house. The men bent over their oars. Odysseus had escaped the cave. His pride had given the sea a name to follow.

## Chapter 5 — Almost Home

### The Keeper of Winds

Aeolus welcomed the travelers and listened to their story. When they left, he gave Odysseus a sealed bag holding the contrary winds. One gentle wind remained free to carry the ships toward Ithaca. Odysseus kept the bag close. For days he held the course himself, unwilling to lose the chance. Home was becoming more than a memory. It was becoming a direction.

### The Shore in the Distance

The island rose ahead. The men could make out land in the morning light. Odysseus, exhausted by watching the course, finally slept. Near his feet lay a gift none of the others had seen opened. The crew spoke quietly about treasure and shares. They had followed him through losses. They wondered why he alone should carry something hidden.

### What Was in the Bag

They loosened the knot. The winds rushed out together, filling the sails the wrong way and tearing the ships from the coast they had almost reached. Odysseus woke to a sea he no longer recognized. For a moment, he thought of letting it take him. Then he stayed aboard. He had been close enough to imagine the doorway. Now he had to survive being far away again.

### The Empty Harbor

Aeolus refused a second gift. Later, among the Laestrygonians, a sheltered harbor became a trap. Giants broke the ships and attacked the men trying to escape. Odysseus had moored outside the narrow entrance. His ship alone got clear. He counted the survivors. A fleet had become one vessel. The spaces left by the missing men were larger than the deck.

### The House of Circe

On Circe’s island, some of the crew accepted food and were changed into pigs. Hermes warned Odysseus and gave him protection. He went to her house, resisted her magic and demanded his men back. Circe restored them, then offered rest. They stayed long enough to feel safe. When the crew asked again for home, Circe told him that their next guide was among the dead.

## Chapter 6 — The Voices Below

### One More Farewell

Before sailing, Odysseus discovered that Elpenor, the youngest of his companions, had died after falling from Circe’s roof. There had been no battle, no monster to blame. They had been preparing to leave and had not noticed one man missing. They sailed with work still owed to him: a burial, a marker, a place for his name.

### A Shore Without Morning

They reached the place Circe had described. Odysseus made the offerings and waited. Shadows gathered around him. Elpenor came first, asking to be buried when they returned. Odysseus promised. Even here, among the dead, the journey was not only about his own homecoming. There were obligations the living could still fulfill.

### The Mother He Missed

Then he saw his mother. He had left her alive. For a moment, he could not ask anything. She told him of Penelope, of his son and of his father growing old in sorrow. Longing had worn her down. Odysseus tried to hold her. Three times his arms closed on air. Home had been changing while he was away. Some of it could never be recovered.

### The Cost of Returning

Tiresias spoke of the road ahead. The cattle of the Sun must remain untouched. If the men harmed them, the ship would be lost. Odysseus might still reach Ithaca, but late and alone. He listened without interrupting. For years he had wanted someone to name the way. Now someone had, and the warning was part of it.

### What He Carries Back

Other voices spoke from the dark: kings, companions, men remembered for victories that had not made death easier. Odysseus returned to the ship carrying no treasure from that shore. He carried a promise to Elpenor and the sound of his mother’s voice. When they reached Circe’s island again, they buried their companion. This time, no one left without remembering him.

## Chapter 7 — What the Sea Keeps

### The Song Beyond the Mast

Circe warned them about the Sirens. Odysseus sealed his men’s ears with wax and asked them to bind him to the mast. The singing offered knowledge of everything he had suffered. He struggled against the ropes, begging to be released. The men tied him tighter and kept rowing. Sometimes surviving meant trusting the promise you had made before desire began to speak.

### Between Two Dangers

One side of the passage held a whirlpool. The other held Scylla. There was no route with no cost. Odysseus urged the crew onward. Six men were taken from the deck, reaching toward him as the ship escaped. He would remember those hands. In the Phaeacian hall, telling this part of the journey, he did not call it a victory.

### The Island of the Sun

They landed near the sacred cattle. Odysseus made his men promise not to touch them. Then the wind held the ship there, and the food ran low. While he was away praying, hunger made the forbidden animals look like a solution. Eurylochus argued that dying hungry was worse. The men broke their promise. By the time Odysseus returned, the choice had already been made.

### The Last Companions

When they finally sailed, Zeus struck the ship. Wood split. The men fell into the sea. Odysseus held to the broken mast and keel, carried back toward the dangers they had barely escaped. There were no orders left to give. No hands at the oars. He kept holding on because he was alive, though being alive had never felt so lonely.

### One Man on the Water

The sea delivered him to Calypso’s island. That was where the story had found him: one man watching the shore. In the Phaeacian hall, the fire had burned lower while he spoke. Alcinous did not ask for another adventure. He ordered a ship prepared. At last, someone else would hold the course while Odysseus slept.

## Chapter 8 — Home, Unrecognized

### The Familiar Shore

He woke beside gifts on a shore hidden by mist. At first, he thought he had been abandoned again. Athena appeared and let the veil of mist lift. Ithaca. Odysseus bent to the ground. It was an ordinary stretch of earth, and he had crossed so much sea to touch it. Athena warned him that reaching home was not the same as entering it safely.

### A Face No One Knows

She changed his appearance into that of an old beggar. His household was occupied by suitors who wanted Penelope, his property and his son out of the way. Odysseus hid the gifts and walked inland. The disguise made him small in other people’s eyes. For now, that would let him see what his name might have prevented him from seeing.

### The Keeper of Pigs

Eumaeus welcomed the old stranger to his hut. He offered food he could spare and spoke with affection of the absent master he still believed in. Odysseus listened without revealing himself. Here was loyalty that had not been rewarded with certainty. Eumaeus had kept doing the daily work. His kindness asked nothing about the stranger’s usefulness.

### The Son at the Threshold

Telemachus returned from his journey and came to Eumaeus’s hut. Odysseus studied the young man who entered. He had been missing a child. Here stood someone grown, carrying worries of his own. Athena restored Odysseus’s appearance when father and son were alone. Telemachus stepped back. The stranger had become impossible to explain.

### Two Men, One Home

“I am your father.” Telemachus feared a god was deceiving him. Odysseus spoke again, and at last the distance between them broke. They held each other and wept. They could not recover the years by holding tighter. Afterward, they sat together and planned. The house ahead was full of enemies. For the first time, neither of them would face it alone.

## Chapter 9 — The Bow in the Hall

### The Dog at the Gate

Back in his disguise, Odysseus approached the house. An old dog lay neglected near the entrance. Argos lifted his head and recognized what no one else could see. His tail moved. Odysseus turned away to hide his tears from Eumaeus. The dog died after seeing his master once more. At the threshold of home, there was already a farewell.

### A Stranger by the Fire

Inside, the suitors mocked the beggar and threw insults more easily than they offered food. Penelope asked to speak with him. He told her enough to give her hope without revealing himself. She listened carefully. Hope had hurt her before. She did not reject it, but she did not surrender to it either. He had forgotten how much courage waiting could require.

### The Scar

Eurycleia washed the stranger’s feet. Her fingers found an old scar and stopped. She had known him as a child; she knew him now. Odysseus held her hand and asked her to keep silent. Recognition had come through a small piece of ordinary care. The old nurse looked toward Penelope. There was news she wanted to give, and a danger that made her wait.

### The Bow That Waited

Penelope brought out Odysseus’s bow. Whoever could string it and send an arrow through the line of axe heads would win her hand. One man after another failed to bend it. Then the beggar asked to try. The suitors laughed and objected. Telemachus insisted. Odysseus took the bow gently, as someone might take an instrument kept too long in silence.

### The Doors of the Hall

He strung it and sent the arrow through. Then he put aside the disguise and named himself. The hall became a battle. Telemachus and the faithful servants stood with him; Athena helped them hold. When it ended, the suitors were dead. Odysseus stood inside the home he had wanted for so long. Recovering it had left another terrible silence.

## Chapter 10 — The Tree Beneath the Bed

### After the Noise

Eurycleia went to Penelope with the news. Her husband had returned. Penelope followed her into the hall, but she did not run into the stranger’s arms. Telemachus could not understand her distance. Odysseus could. Twenty years had taught her that a story, a face and a promise might all be made to look convincing.

### The Woman Who Waited

He washed and put on clean clothes. Penelope watched him. This man knew the house, but she needed something that belonged only to them. The answer would not come from the scars everyone knew or the names anyone could repeat. She turned to Eurycleia and asked her to move their bed outside the chamber for him.

### Move the Bed

Odysseus looked up sharply. “Who has moved it?” He had built that room around a living olive tree, shaping its trunk into one bedpost. The bed could not be carried away unless someone had cut through what held it. He began to explain the work, anger and fear entering his voice. Penelope stood. No visitor could have borrowed that memory.

### The Root That Stayed

She crossed the room and held him. The tree was still there. So was the person who remembered making a life around it. They spoke through the night, telling each other what neither had been there to witness. He could not make her waiting disappear. She could not bring his companions back. They could listen. After so many years, they had time to begin.

### A Morning Without Leaving

Odysseus went to find his father, Laertes, and gave him signs that only his son would know. Outside the household, the families of the dead suitors demanded an answer. The violence might have begun again, but Athena stopped it and called for peace. Ithaca still had grief to carry. That morning, Odysseus had no ship to prepare. The difficult work of staying could begin.

## Visual production map for remaining chapters

- Chapter 3: damaged raft / river bank / palace / fire and singer. Keep the veil, clothing and offered food visible when mentioned; new clothes persist.
- Chapter 4: ship / lotus grove / Cyclops cave / sheep pens. Establish entrance stone, stake and sheep before using them. No graphic deaths; use reactions and empty places.
- Chapter 5: wind keeper / ship and sealed bag / harbor / Circe’s house. The bag is a persistent prop; opening changes the wind. Fleet loss requires a different ship count afterward.
- Chapter 6: shore of the dead / isolated mother and son / burial. Use clear softened visual transitions to distinguish shades. Show failed embrace without making either character pass through ordinary scenery.
- Chapter 7: mast and ropes / narrow strait / cattle island / broken ship / Phaeacian fire. Wax and bindings established before song. Broken raft continuity connects back to Calypso; fire shot explicitly ends the flashback.
- Chapter 8: Ithaca shore / Eumaeus’s hut. Separate disguised and restored sprites; hide treasure on screen. Father and son recognize one another before the reunion dialogue.
- Chapter 9: gate and Argos / palace / foot-washing / bow and axe heads / hall aftermath. Keep the scar and bow framed closely. Violence is not made into a flashy loop.
- Chapter 10: reunion hall / rooted bed / father’s orchard / quiet Ithaca. Show the living-tree bedpost for the recognition, but do not actually move the immovable bed. Peace is a resolution, not an advertisement for another episode.


</details>


<a id="source-odyssey-visual-document-review-md"></a>
<details>
<summary>Historical source: ODYSSEY-VISUAL-DOCUMENT-REVIEW.md (not current instructions)</summary>

> Retained source snapshot. Current rules and the October 14 priority table override conflicting directions, old script commands, paths, production status and QA counts.

# Correcciones del documento visual

Se aplicaron los 20 puntos de **Correciones visuales.docx**, revisando su texto, sus 21 imágenes y las 12 páginas renderizadas. El documento original se leyó sin modificarlo; su huella SHA-256 sigue siendo `da9e31e9d605fa685cfe5fe5d764c0cedbb6f257696c258c3f5dedf4fee5b3db`.

La versión está disponible en [localhost](http://localhost:4174/#story/the-odyssey). Los cambios son locales. El Site publicado no se actualizó.

## Los 20 cambios

| Punto | Lugar | Resultado |
| --- | --- | --- |
| 1 | C2, escena 3 | La rampa se queda en el muelle y desaparece gradualmente. Su extremo no sigue al barco ni se estira. |
| 2 | C3, escena 1 | Odiseo queda 26 píxeles más abajo al alcanzar la orilla, por debajo de la piedra. |
| 3 | C3, escena 2 | Odiseo y Nausicaa recorren el camino sin las tres paradas anteriores. La cámara los sigue. El pan conserva su dueño, pero su cuerpo lo oculta cuando mira de espaldas. La cesta y la capa quedan en la orilla. |
| 4 | C4, escena 2 | Los pasajeros están un poco más juntos dentro del barco, también al volver a subir. |
| 5 | C4, escena 3 | Los tres desembarcan juntos, cruzan el umbral juntos y se internan en la cueva por caminos separados que evitan atravesarse. |
| 6 | C4, escenas 3–5 | La piedra se redujo de 580 a 546 píxeles de alto y se estrechó, conservando tamaño suficiente para tapar la entrada. Espera a la izquierda, entre la fogata y la entrada. El cíclope la cierra desde ese lado y la devuelve allí al amanecer, moviéndose junto a ella. |
| 7 | C4, escena 4 | La cámara termina de encuadrar antes de que el cíclope se siente y permanece fija durante ese movimiento. |
| 8 | C4, escena 5 | El barco se aleja en diagonal hacia arriba y a la izquierda, por el agua abierta. La cámara lo sigue; en vertical se utiliza el mismo panorama completo para poder mostrar esa parte del mar. |
| 9 | C4, escena 5 | La oración de Polifemo vuelve a la misma playa y entrada de la cueva de donde salió el barco. Los cortes al mar cambian el plano completo. |
| 10 | C5, toda la flota | Los barcos secundarios llevan cuatro marineros nuevos y diferentes. La parte inferior de sus cuerpos queda recortada y oculta por el casco. |
| 11 | C5 y barcos posteriores | Los pasajeros quedan más juntos, conservando sus lugares al embarcar y navegar. Se revisaron los capítulos 4–10: había pasajeros visibles en barcos de los capítulos 4–8; en 9–10 no apareció el mismo caso. |
| 12 | C5, escena 1 | Se eliminó el párrafo que repetía que Odiseo desembarcó y dejó a sus compañeros esperando. El recorrido sigue siendo visible. |
| 13 | C5, escena 1 | La narración del regreso con la bolsa y la advertencia a la tripulación aparece después de volver a subir al barco, mientras aún la lleva en la mano. |
| 14 | C5, escena 1 | Se eliminó la narración adicional «With everyone aboard…». Se conserva la colocación de la bolsa en la cubierta y la salida. |
| 15 | C5, escena 2 | Los dos barcos secundarios se colocaron en agua abierta, detrás del principal. El encuadre muestra los tres, sin barcos sobre la montaña o las rocas. |
| 16 | C5, escena 3 | Se quitó la narración repetida sobre la espera de Eurylochus y Polites y el regreso de Odiseo por el camino. Se conserva la caminata. |
| 17 | C5, escena 3 | La narración del regreso sin otro regalo y la necesidad de remar aparece con Odiseo ya a bordo. |
| 18 | C5, escena 4 | Dos gigantes están sobre el suelo del acantilado. Cada uno lanza una piedra; ambas salen al mismo tiempo y cada una alcanza su propio barco. Los dos cascos se rompen juntos. La narración coincide con esto. |
| 19 | C5, escena 4 | Polites y Eurylochus desembarcan juntos en la isla de Circe, por dos recorridos que mantienen sus cuerpos separados. |
| 20 | C5, escenas 5–6 | Se eliminaron las dos narraciones repetidas del regreso de Eurylochus. Se conservan la advertencia sobre Polites, la decisión de Odiseo y sus recorridos visibles. |

## Comprobaciones realizadas

- Lectura manual y automática de los capítulos 2–10 en 360, 390 y 430 × 844, horizontal 1366 × 640 y modo retrato: 45 combinaciones y 2.105 puntos de lectura. Sin diferencias al reconstruir la lectura guardada ni recortes de los elementos requeridos.
- Animación completa de esos capítulos, incluidas posiciones intermedias: 184.710 muestras. Sin desplazamientos indebidos de personajes que esperan, cruces de los nuevos recorridos, objetos separados de su dueño ni cámaras fuera del escenario.
- 236 comprobaciones de pasajeros dentro de los límites del casco, incluyendo a Odiseo dormido y las poses especiales posteriores.
- Comprobaciones específicas de la rampa fija y su desvanecimiento, caminata continua, pan oculto de espaldas, cámara estable al sentarse, desembarcos simultáneos, piedras simultáneas y narraciones posteriores al embarque.
- Los siete identificadores de párrafo retirados conservan una ruta de continuación hacia un párrafo válido. Se probó la recuperación real desde el navegador.
- Pausa, retroceso con teclado, historial, continuidad en retrato, final de capítulo, reinicio y botón de siguiente capítulo. Ocho cambios de orientación de ida y vuelta.
- 46 vistas previas reales de exportación a 720 × 1280, canceladas después de comprobarlas, y 764 comparaciones entre los comienzos que se repiten de un video al siguiente. Se conserva el estado de lectura al cerrar la exportación.
- Se inspeccionaron las capturas de los cambios en teléfono y horizontal. Las pruebas se hicieron con Edge simulado; no se afirma una prueba en un teléfono físico o Safari ni la creación de un MP4 nuevo.

## Arte y archivos de revisión

Los cuatro marineros se crearon con la herramienta integrada de generación de imágenes, con fondo transparente. El archivo seleccionado es [odyssey-fleet-sailors-v1.png](<C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/dist/assets/odyssey-fleet-sailors-v1.png>). Se compararon con Odysseus, Calypso y Hermes y con la carpeta Arte. Las cuatro figuras se dibujan con el mismo sistema de bloques de dos píxeles y bordes duros que los demás personajes. El [registro del arte](<C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/work/visual-doc-review-2026-10-14/sailor-art.md>) conserva el prompt completo, las referencias y la imagen original generada.

La extracción del documento, sus imágenes, páginas, copia previa de los archivos, capturas y resultados de pruebas están en `work/visual-doc-review-2026-10-14/`. [verification.json](<C:/Users/aleja/Desktop/Alejandro/Crear juegos/entre-lineas-platform/work/visual-doc-review-2026-10-14/verification.json>) contiene los recuentos y las huellas de los archivos finales.

La autoría se puede volver a aplicar con `work/apply-visual-doc-corrections.cjs`, **después** de los generadores anteriores. Esta revisión del documento sustituye la antigua regla de no modificar el capítulo 5. El capítulo 1 conserva sus escenas, y la narración de los capítulos 6–10 sigue intacta. Para futuras escenas, usar el recorrido visible cuando basta para explicar la acción y reservar la narración para información que la imagen no puede comunicar.


</details>


<a id="source-odyssey-visual-review-md"></a>
<details>
<summary>Historical source: ODYSSEY-VISUAL-REVIEW.md (not current instructions)</summary>

> Retained source snapshot. Current rules and the October 14 priority table override conflicting directions, old script commands, paths, production status and QA counts.

# Odyssey Chapters 4–10: local visual review

Reviewed on October 13, 2026. Work remains on localhost. The original Chapters 4–10 review preserved the approved Chapters 1–3. A subsequent user-requested Chapter 2 traveler-route correction is documented in `C2-TRAVELER-ROUTE.md`; Chapters 1 and 3 remain byte-for-byte unchanged.

Subsequent user review identified a repeated floor strip at the bottom of Chapter 4's first coast shot. The focused correction uses a deeper complete horizontal panorama; native vertical shots and story data are unchanged. See `C4-BOTTOM-EDGE.md`, `C4-BOTTOM-EDGE-QA.json` and `C4-BOTTOM-TRANSITION-QA.json`. The consolidated results use the final Chapter 4 reading/motion checks from `work/c4-bottom-edge/`.

A further camera-bound audit of all ten chapters corrected the Chapter 4 cave and Chapter 5 harbor edges. A shared guard keeps horizontal cameras inside their actual background without exposing tiled floors; the harbor has a deeper foreground sea image. See `CAMERA-EDGE-LIMITS.md` for the audit, native rendering comparisons and desktop motion checks. The consolidated reading checks use `work/camera-edge-review/reading-qa.json` for Chapters 4/5.

## The review method learned from Chapters 1–3

The user's review follows a character, object and place through successive moments. Each sentence creates a visual expectation. A successful frame needs to preserve that expectation before, during and after its action.

For every passage, identify the speaker or acting character, the listener, the needed object, the visible terrain, the route, and the resulting state. Inspect the vertical shot first. Then inspect the wider desktop shot. Scrub entrances, exits, handoffs and scene boundaries at intermediate frames; checking only a completed paragraph misses important errors.

The previous implementation repeatedly failed in these ways:

| Previous mistake | Required correction |
| --- | --- |
| A growing word changed its line while being revealed | Lay out the complete paragraph and reveal only its opacity. Keep this existing shared text policy. |
| An ordinary person faded into an arbitrary open spot | Start on an actual path, doorway, foliage edge or visible ground route. Preserve the gradual retro reveal. |
| A person disappeared in place without leaving | Walk to a motivated exit and fade during the final steps. Explicit ghosts, transformations and deaths have different narrative rules. |
| An approaching person crossed a listener or furniture | Inspect the actual floor and route around the obstruction. Face the current leg of the walk. |
| A waiting person shifted during another person's action | Preserve their world coordinates and hold the camera during the walk. Reframe before or after it when needed. |
| A new scene number reset the same conversation | Preserve the existing cast, furniture, posture and object ownership. A scene number is an editorial boundary. |
| The background changed beneath opaque characters and objects | Dissolve the complete shot for a real location or time change. Weather developing around the same ship can remain continuous. |
| A carried object traveled independently toward a surface | Keep it hand-anchored while its owner walks. Use a separate short handoff or placement after stopping. |
| Narration described an unseen or unfinished action | Stage the visible action first, announce it prospectively, or report an earlier event as news. |
| A crop included another sprite's feet or a one-pixel fragment | Share measured atlas cells and preserve complete two-pixel blocks in derived walking frames. |
| Horizontal scenery used mirrors or mismatched side pieces | Keep the previously approved complete panoramas and native phone artwork. |

## Corrections applied

| Chapter | Main changes |
| --- | --- |
| 4 — The remembered shores and Cyclops | Spread the crew across a wider hull. Boarding keeps complete walking legs until arrival. Preserve the continuous cave conversation. Establish a visible olive stake, then show pickup, carrying, thrust, lowering and withdrawal. Keep rams on the beach, leave cave objects in the cave, and dissolve the ship and crew together on departure. Fit the giant's wider drinking pose and the entrance boulder. |
| 5 — The winds and Circe | Bring Aeolus and the traveler close before the bag handoff. Keep the sleeping crew and wind bag continuous. Circe walks around the table with her cup before passing it. Eurylochus returns through the lower left paved path without crossing the table or sliding the waiting friends. Place the root and wand separately after the reunion. |
| 6 — The dead | Present Elpenor's death as Eurylochus's news. Preserve the dark shore and traveler through the three conversations. Leave the offering basin on the stones before the embraces. Show separate attempts to reach his mother, with correct retreat directions. Keep the spectral fades. Use existing meadow art for the burial clearing so the grave is on earth. |
| 7 — The last companions | Release the mast before describing the completed release. Walk away before changing to a sleeping pose. Remove unshown landmarks and premature sailing descriptions. Calypso gradually emerges from foliage along the lower sand path toward a resting survivor. Return to the hall with Arete and Demodocus still listening, the singer seated with his lyre, and the table, food, oil bowl and stool retained. |
| 8 — The return | Keep the shore, disguise and hut conversations continuous. Preserve staff, table and bread. Place the staff separately. Eumaeus walks around the table to welcome the son. Athena appears before transforming the father; the son visibly steps back. Father and son walk around the table and reach for each other in front of it. |
| 9 — The house and bow | Show the hidden tear's turn. Penelope physically leaves; Eurycleia walks in with the basin still in her hands, places it beside his foot and touches the scar before the completed narration. She kneels clear of the brazier. Antinous carries the bow around the axe line for each handoff. Keep the disguise through the contest and reveal the owner before the reckoning. Preserve the hall, axe line and waiting cast across that boundary. |
| 10 — The rooted bed and peace | Keep the quiet hall and bed conversation continuous. Penelope enters gradually from the upper hall passage. Show a visible touch on the bed frame. Keep the waiting husband and son fixed. Bring the bow with the traveler to the orchard and lower it separately. Include father and son in the closing vertical shot. |

All later chapter walking textures use the approved two-pixel-grid derivation. Walking direction follows each authored path leg through an opt-in `travelFacing` field. Same-place conversations retain their world state. Where a walk needs more space, its data defines a preparation shot, a held camera during the action, and a return to the conversation afterward.

Existing central backgrounds, complete panoramas, reference sprites, controls, local saving, title logos and export format are retained. The burial clearing reuses existing story artwork; no raster artwork was regenerated for this review.

## Validation and evidence

- Inspected the 36 scenes and all 267 passages against phone screenshots, intermediate action snapshots and their authored effects. Character direction and interaction sheets were visually compared. Seven desktop contact sheets cover the opening and closing passage of every scene.
- Full simulated manual and automatic chapter runs, all passage reconstructions, pause checks and required-element framing checks passed at 360, 390 and 430 × 844, desktop 1366 × 640, and portrait 390 × 844: 35 chapter/layout combinations. No required character or object was clipped at the completed passage checkpoints.
- Sampled 68 held walks at 50 ms intervals. Waiting actors and their cameras stayed fixed; no unintended close-contact route candidates remained. Motion framing issues found in the cave entrance and reunion were corrected and retested.
- Checked 1,096 generated walking textures for intact two-pixel blocks. Compared 151 next-scene opening actions between the previous video's teaser and the following video's opening.
- Opened and inspected actual 720 × 1280 export canvases for all 36 scenes, then cancelled the recordings. They retained the title logo, vertical framing and absence of reader buttons. Cancellation left the reading engine unchanged.
- Re-ran the approved Chapter 1 tree/stationary-cast, Chapter 2/10 host crop, and Chapter 3 hall-continuity checks.
- Tested the actual reading UI for each of the seven chapters: reload/resume selects the saved chapter and passage, skips the welcome screen and reconstructs the same model; keyboard advance/back, history, pause, rotation, continuous portrait playback, theme switching and restart passed. Test contexts had isolated local storage.

`ODYSSEY-VISUAL-REVIEW-QA.json` consolidates the latest passing results and the reviewed story hashes. Evidence lives in `work/review-4-10/`: the baseline data, passage inventories, before/after/final screenshots, `qa.json`, `motion-export-qa.json`, `final-route-qa.json`, `final-hall-qa.json`, `final-hall-export-qa.json`, `final-scar-qa.json`, `final-scar-export-qa.json`, and `reading-ui-qa.json`. The final route report supersedes the earlier Chapter 4/5 motion-clipping entries; the final hall reports cover the retained Chapter 7 listeners and furniture. The final scar reports cover Chapter 9's closer washing gesture and its corrected action order. Older screenshot batches record intermediate versions.

These are local Edge/Chromium simulations, not physical-phone or Safari testing. The export checks are cancelled real previews and sequence comparisons; this review does not claim a newly encoded complete MP4 or a Sites deployment.

## Acceptance procedure for future chapters

Before accepting a chapter, read it in order and answer: where did the person come from, what carries the object, which surface supports the action, what changed, and what should remain? Verify both ends of each scene boundary and every moving intermediate state. Keep a waiting actor fixed. Check the phone safe area before desktop context. Reconstruct every affected saved passage and compare repeated export openings. Record the tested scope and review the final images after the last correction.


</details>


<a id="source-work-c4-video-review-requests-md"></a>
<details>
<summary>Historical source: work/c4-video-review/requests.md (not current instructions)</summary>

> Retained source snapshot. Current rules and the October 14 priority table override conflicting directions, old script commands, paths, production status and QA counts.

# Chapter 4 recording feedback

Source: `pixel-nook/video de cambios/Cambios capitulo 4.mkv`, 9:28.366. Complete Spanish timestamped transcription and visual review at ten-second intervals, plus detailed frames at each pointed-out event. The transcription is an aid; visual context determines character names and actions where automatic speech recognition is imperfect.

| Recording time | Requested correction | Implemented behavior |
| --- | --- | --- |
| 00:00–00:27 | Eurylochus rapidly alternates side/front while walking. | Facing uses the exact authored path leg, with deterministic equal-diagonal orientation. |
| 00:51–01:37 | Show all three arriving at the lotus island, then two disembarking while Eurylochus stays aboard. | Visible approach, landing, separate disembarkation, waiting crewman retained in the ship. |
| 01:37–02:31 | Eurylochus is missing on the return; show boarding and leaving. | He stays on board through the entire island visit. Odysseus and Doros return, climb aboard, and the whole crew pushes off before the sea shot. |
| 02:36–03:20; 08:12–08:39 | Show the three arriving by ship, disembarking and entering the cave; reuse the later escape beach. | One complete exterior panorama shared by arrival and escape. Three separate disembarkations, clear sandy route, visible entrance and sequential entry. |
| 03:20–03:38; 04:58–05:11 | The cup floats away from Odysseus's hand. | Cup anchors matched to side/front/back/reaching poses; ownership retained during all walking. |
| 03:55–04:23; 05:11–05:31 | Smooth zoom is interrupted by a snap. | Required routes are framed before walking; valid destination is constrained before interpolation; reframes finish smoothly on their story-clock duration. |
| 04:24–04:58 | Stone leaves room to escape. | Larger and slightly wider stone centered over the complete cave opening. |
| 05:50–07:04 | Rams appear in the middle of the scene. Keep gradual appearance but have them walk in from a side. | Rams emerge gradually on the clear left floor and walk past the waiting crew, avoiding the closed fence. |
| 07:08–07:29 | The cup still contains red wine after drinking. | A derived empty-cup texture changes only the liquid well, preserving bowl, handle, stem and foot. |
| 07:49–08:12 | Strange connector appears by the giant's eye. | Removed the generated stretched connector; the authored seated pose provides the visible hand. |
| 08:48–09:12 | Show the survivors boarding and the ship leaving before the open-sea view. | Boarding, settling inside the hull and visible push-off are distinct actions. |

The opening boarding sequence and the final name/prayer dialogue praised in the recording retain their prose and events. Existing character atlases remain unchanged. Changes are local only.

Authoring: `work/apply-c4-video-feedback.cjs` applies the recording corrections to an immutable before-video baseline. The older Chapter 4–10 correction authoring script applies these overrides after its original Chapter 4 edits, so it cannot silently discard the newer requested work.

Art: built-in image generation, using the existing Odyssey coast and `concept_art/Escenas/Codex Image Sep 13, 2026, 12_53_09 PM.png` as style references. Final exterior is `dist/assets/odyssey-cave-approach-panorama-v2.png`; the native phone view is a runtime crop of that same complete panorama, never a sharper separate center. `art-prompts.json` records the exact final prompts. Original v1 is retained as generation history.


</details>
