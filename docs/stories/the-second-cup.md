# The Second Cup

Three scenes and 22 passages. Preserve the terrace, Mara/Ellis, steps and walking, pour, fill levels, handoffs and cups held at the ending. Use the final people atlas and original selected prop atlas. Continuous portrait reading supersedes the early episode-stop description below. Follow the current shared art and export policies.


<a id="source-second-cup-art-md"></a>
<details>
<summary>Historical source: SECOND-CUP-ART.md (not current instructions)</summary>

> Retained source snapshot. Current rules and the October 14 priority table override conflicting directions, old script commands, paths, production status and QA counts.

# The Second Cup — art record

Original generated pixel art, guided by the supplied Arte references. No source reference files were modified. The first, more detailed drafts were rejected; the active v2 assets use large square heads, rectangular eyes, short bodies, stepped outlines and coarse pixel clusters.

## Active assets

- `dist/assets/second-cup-terrace-v2.png`: cottage terrace at dusk; 1448 × 1086.
- `dist/assets/second-cup-atlas-v2.png`: transparent four-column atlas, Ellis and Mara in four poses each, two cups, teapot and table; 1448 × 1086.
- Portraits are cropped from the same atlas at runtime, preserving character consistency.

## Style references

- `../concept_art/Personajes/Codex Image Sep 13, 2026, 12_52_29 PM.png`
- `../concept_art/Escenas/Codex Image Sep 13, 2026, 12_53_09 PM.png`

## Accepted background prompt

Edit target: image 1, a terrace background. Style reference: image 2, the user's pixel-art village. Re-render image 1 to match image 2's visible pixel clusters, palette shading, overhead 3/4 RPG perspective and crisp chunky pixel-art treatment. Preserve image 1's terrace composition and all important positions: cottage door UPPER RIGHT, clear empty terrace floor CENTER, stream left, no people or table. Preserve landscape 4:3. Flatten painterly gradients and remove all depth-of-field blur; consistent discrete pixels and stepped edges throughout, like image 2. Warm sunset light but strictly pixel-art rendering. Do not import the HUD or the person from reference image 2. No cups, no text, no UI. This is a game background whose central area will contain separately animated characters and a tea table.

## Accepted transparent atlas prompt

Edit target: image 1, twelve-cell asset atlas. Character style reference: image 2, the user's twenty chunky pixel characters. Replace ALL eight sophisticated character sprites in the first TWO ROWS with short chunky chibi pixel sprites matching image 2 EXACTLY in proportions, coarse pixel density, thick black stepped outlines, small bodies, oversized square heads, two black rectangular eyes, no detailed anime eyes or smooth skin gradients. Mara in row2 should resemble the long brown-haired woman in the orange shirt (reference row2 column4), but wear a simple mustard shirt and dark skirt; Ellis row1 should resemble the brown-haired glasses character (reference row3 column2), but wear a simple teal cardigan and tan trousers. Four coherent poses per row, column1 front idle, column2 RIGHT side idle, column3 back, column4 RIGHT reach with visible hand. Same head/body proportions in all poses. Preserve twelve separated equal cells, 4columns x3rows; generous transparent gaps and complete feet. Row3 still contains blue teacup, amber teacup, cream teapot, wooden round table, but simplify their texture to match coarse game sprites. All objects separate. TRUE alpha transparency everywhere outside sprites. No checkerboard, no painted backdrop, no labels. The people must look as if they belong to reference image 2's character sheet, not as miniature realistic humans.


</details>


<a id="source-second-cup-audit-md"></a>
<details>
<summary>Historical source: SECOND-CUP-AUDIT.md (not current instructions)</summary>

> Retained source snapshot. Current rules and the October 14 priority table override conflicting directions, old script commands, paths, production status and QA counts.

# The Second Cup

An English, low-stimulation story about an empty cup, an unexpected visitor and a small invitation. The blue cup provides curiosity without an alarming opening. Each episode answers something and leaves a gentle reason to continue; the final scene resolves the story rather than withholding its ending.

## Episode structure

| Scene | Approximate automatic duration | Purpose | Closing beat |
| --- | --- | --- | --- |
| The cup that waited | 64 seconds | Establish Mara, the warm blue cup and Ellis at the door | Someone understood the invitation |
| A small hello | 71 seconds | Introductions, the absent sister, a visible pour | Ellis still needs to ask something |
| A place for tomorrow | 72 seconds | Invitation, handing over the cup, companionship | Tomorrow, there would be biscuits |

Timing estimates include text reveal, reading holds and actions. They assume uninterrupted automatic reading; manual taps and pauses change the duration. The episodes intentionally run a little over one minute, so they need editing if a distribution format requires an exact 60-second limit.

## Vertical continuity audit

The terrace, character placement and props are authored around narrow shots. Desktop expands the same stage. Only the door shot temporarily isolates Ellis; Mara's reply returns the camera to the table.

| Passages | Vertical shot and visible action |
| --- | --- |
| cup-1–2 | Mara, table, warm blue cup, empty amber cup and teapot; steam is subtle |
| cup-3–4 | Mara reaches and lifts the blue cup into her hand; the table remains visible |
| cup-5–6 | The blue cup has been replaced; the camera moves to Ellis at the cottage door |
| cup-7 | Camera returns to Mara and the table before her reply |
| cup-8–11 | The camera first returns to the door. Ellis alternates grounded foot poses, follows waypoints along the stone steps, then crosses the wooden floor to the table; both characters face each other |
| cup-12–14 | Ellis lifts and tips the teapot; a thin pour appears, the amber cup fills, and the pot returns to the table before the completed-action narration |
| cup-15–16 | Both characters remain at the table for the question |
| cup-17–18 | Mara turns the blue handle, then slides the cup toward Ellis along the near edge, clear of the amber cup |
| cup-19–22 | Ellis takes blue, Mara takes amber; both cups remain in their hands through the conclusion |

The first cup was filled before the story begins; the text presents that as a small mystery, then Ellis explains his interpretation. It does not claim an unseen real-time pour. Ownership and positions live in story state. Restart resets both cups; resume replays completed actions up to the saved passage, preserving filled levels and ownership.

## Reading and recording

Normal phone reading uses the available viewport. Portrait episode mode uses a fixed 390 × 693.33 logical frame (9:16), with configurable top/right/bottom/left margins. They are separate layouts. Text, required people and objects are verified within the reading area. Controls are hidden in portrait capture apart from a faint menu handle.

The scene menu can pause at chapter boundaries, continue to the next scene, or read continuously. Choosing a portrait episode reconstructs the state at that scene's start and stops at its end. The final episode uses the normal story conclusion.

## Audio and motion

This version uses a quiet synthesized stream and filtered wind bed with infrequent short bird tones. Music and village bells are disabled for this story. Scene atmospheres fade smoothly. The supplied MP3 is not embedded. Steam, lamp glow and a few leaf clusters move slowly; walking, reaching and pouring are brief story actions. Pausing freezes progression and ambient visual motion and fades the audio.

## Verification

- Full 22-passage story in manual and automatic modes at 360 × 740, 390 × 844, 430 × 932 and 1440 × 1000.
- Text bounds, required character/prop framing and horizontal overflow checked at every passage.
- Complete 9:16 automatic reading at the three simulated phone widths, plus individually selected episodes and their stopping points.
- Pause, restart, previous passage, rapid input guard, history, mute persistence, resume with filled amber cup, fullscreen and resize/rotation checked.
- Library navigation, search, saved stories, preferences, return/resume and both stories checked. The First Path complete-story regression retains all 21 passages.
- Visual inspection of the hook, cottage door, conversation, filled cup, held cups and portrait composition. Timing tests accelerate the story clock; ordinary-speed screenshots are inspected separately.

## Limits

Tests use desktop Edge with simulated phone viewports, not real phones. Audio levels and generated bird timbre still need a listening pass on a phone speaker and headphones. No video export, social publication or hosting deployment is included. Artwork follows the supplied pixel references but remains a first playable version for review.

## Ellis walking revision

The original two straight position tweens made Ellis glide with a fixed lower body and cut across the stair edge. The revised sequence first returns the camera to the door, then follows distance-based waypoints across the stone treads and onto the wooden terrace. Eight articulated frames reuse his existing front and side artwork, alternate shoes, and keep one foot grounded. The body no longer floats above its anchor, and the contact shadow stays under the feet. A short settling action gives the conversation camera time to include both people before cup-8.

`ELLIS-WALK-QA.json` samples the complete movement at normal playback speed in simulated 360, 390 and 430 pixel phone widths, desktop, and portrait 9:16. It checks framing throughout movement, pause freezing, arrival position and reload continuity. `ELLIS-STORY-REGRESSION-QA.json` repeats the entire second story in manual and automatic modes at 390 pixels after the revision. The First Path also passed its complete 21-passage regression in both modes after the shared engine change.


</details>
