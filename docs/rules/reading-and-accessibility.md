# Reading, controls and saved state

- Preserve manual/automatic reading, pause, keyboard advance/back, history, restart, scene selection, saved continuation and completion. First tap reveals the paragraph; the next eligible tap advances. Guard rapid taps against accidental skips.
- Lay out the complete paragraph before the first glyph appears. Use createTextReveal for initial paint and animation updates. Change glyph opacity, never replace text with a growing substring. Words and advance cues retain final positions; UTF-16 timing remains compatible with grapheme boundaries. Check line-start words at 360/390/430 px, desktop and portrait.
- Preserve phone-first framing, short-screen usability, native fullscreen and immersive fallback. Rotation and resize retain model, pause state and appropriate native art. Portrait reading continues automatically across scene boundaries, including older stop-at-scene preferences and entry from an already-open boundary.
- Completion primary buttons and links have readable default labels before hover, at least 14 px between adjacent primary actions, consistent sizing and visible keyboard focus. Verify light/dark themes and all three phone widths plus desktop.
- Keep story IDs, scene IDs, passage IDs and chapter IDs stable. Continue resolves the saved chapter and bypasses the welcome; explicit starts retain the welcome. Completion is per chapter, with series completion only after all available required chapters are complete. The final chapter offers the final ending.
- Canonical public slug the-first-path accepts the old el-primer-camino alias. Existing entrelineas: and betweenlines: browser keys remain intentionally compatible. Favorites using the old slug normalize on read. Keep saved-passage aliases, including Chapter 5's seven retired passages.
- Browser storage belongs to the origin. localhost:4174, localhost:4175 and 127.0.0.1 are not interchangeable storage origins. Test with isolated storage; never clear the user's real saved progress.
- The library retains search, category/theme filtering, Saved, Settings, navigation, return links and preference persistence. English is the exposed language; retained bilingual source data is not an invitation to switch the interface language.


<a id="source-reading-text-qa-md"></a>
<details>
<summary>Historical source: READING-TEXT-QA.md (not current instructions)</summary>

> Retained source snapshot. Current rules and the October 14 priority table override conflicting directions, old script commands, paths, production status and QA counts.

# Stable progressive text reveal

## User requirement

Words must begin on their final line from their first letter. A word must never start on one line and move to the next as additional letters appear. Preserve the gradual reveal and the first-tap-reveals / next-tap-advances interaction.

## Cause and correction

Both `paint()` and the scene tick callback in `dist/player.js` previously replaced `#text.textContent` with a growing prefix. The browser repeatedly wrapped that prefix, including its unfinished final word.

`dist/text-reveal.js` now inserts the entire paragraph once, using grapheme spans. Hidden glyphs occupy their final space. Updates change opacity only, in either direction, so pausing, revealing immediately, going back, restarting and changing text all use the same layout. UTF-16 offsets remain compatible with the existing engine's timing. Typography and story data are unchanged.

`dist/video-export.js` already wraps the complete caption before drawing the visible prefix of each line; preserve that policy in future changes.

## Verification on 2026-10-10

- All 406 Odyssey passages across ten chapters, plus 22 passages in The Second Cup and 21 in The First Path.
- 60 story/layout combinations: 360, 390 and 430 px phone widths, 1366 px desktop, and 390 px portrait for every chapter/story.
- 2,245 passage/layout checks and 807,340 glyph-position comparisons. First letters of every word were checked against their completed paragraph positions. No wrapping shifts, cue shifts or overflow were found.
- Live interaction checks on the reported “edge of” passage: pause, double tap, right/left arrows, local resume, history, restart and complete chapter-one automatic reading.
- Visual inspection of the reported paragraph at desktop and simulated phone widths, including its first “e” on the final line from the start.
- One complete scene-one MP4 integration export with a 4× test clock: 2,657 caption samples across nine passages remained on their fixed baselines; reader state and storage stayed unchanged. The export ending retained its text-free next-scene preview.

Evidence: `TEXT-REVEAL-QA.json`, `TEXT-REVEAL-EXPORT-QA.json`, `work/text-reveal-visual-qa.json`, and `work/text-reveal-edge-*.png`.

Run `node work/text-reveal-qa.cjs` and `node work/text-reveal-export-qa.cjs` while the localhost server is running. `--visual-only` refreshes the screenshots and interaction checks without repeating every chapter/layout combination.

These are simulated Edge browser viewports, not physical phones. Safari/iOS was not tested. This correction is local only.


</details>
