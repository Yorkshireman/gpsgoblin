# Viewer workspace acceptance review — #10

Reviewed on 16 September 2026 against issue #10 and the owner's added request for less writing and a simpler default view. This is an implementation, editorial and browser review, not user testing. Work is on `issue-10-simplify-viewer-workspace`; the issue remains open pending the authorised PR/merge workflow.

## Approved controls follow-up — 16 September 2026

The owner retained stop exclusion after reviewing Pen-y-Ghent, and approved hiding it when no candidates exist. **Advanced Controls** now replaces Chart options in both speed and pace. Its full-width neutral background, border, sliders icon and chevron distinguish it from explanatory disclosures. **Review possible stops** lives inside it. The Stops selector and empty stop-review messages are absent for recordings with no candidates; recording-gap controls remain independently available. No calculation policy changed.

Browser regression coverage now opens the disclosure with Enter, closes it with Space, verifies nested stop review is hidden while closed, and checks return focus after stop inspection. Synthetic sparse and gapped recordings verify that both speed and pace omit unavailable stop controls while retaining the Time axis and gap markers. The local lunch-ride regression replaces an actively filtered recording and verifies that its stop controls and filtered basis disappear. Pen-y-Ghent still supports confirming and restoring its summit interval. Private recordings remain git-ignored and were not published.

Updated browser run: 46 passed, two optional pace-comparison profiles skipped, and two new lunch-ride cases initially failed because the test clicked Chakra's hidden input. After changing the test to click the visible label and assert the checked state, both desktop/mobile lunch cases passed on the focused rerun. Thus all 48 exercised cases pass; the two unrelated optional pace-comparison cases were not run. No application fix was required in this verification pass.

Commands:

```sh
GPSGOBLIN_CONTINUOUS_FILE=private-recordings/Pen_y_Ghent.gpx GPSGOBLIN_LUNCH_FILE=private-recordings/StravaLunchRide.gpx PLAYWRIGHT_PORT=4197 pnpm exec playwright test tests/browser/movingMeasurements.spec.ts tests/browser/workspace.spec.ts tests/browser/paceRange.spec.ts tests/browser/suggestedPaceRange.spec.ts tests/browser/measurementReplacement.spec.ts tests/browser/releaseAccessibility.spec.ts --project=desktop --project=mobile
GPSGOBLIN_LUNCH_FILE=private-recordings/StravaLunchRide.gpx PLAYWRIGHT_PORT=4197 pnpm exec playwright test tests/browser/movingMeasurements.spec.ts --grep='permissioned lunch' --project=desktop --project=mobile --output=/tmp/gpsgoblin-lunch-final
```

`pnpm test --runInBand` passed 176 tests; `pnpm build`, `pnpm exec tsc --noEmit --incremental false`, `pnpm lint`, `pnpm knip` (no findings) and `git diff --check` passed. Automated accessibility scans passed in light/dark mode on desktop/mobile.

Inspected expanded-controls screenshots at 1440×900, 1280×720, 390×844 and 375×667, plus the short-phone selected state and the local lunch ride at desktop/mobile sizes. Keyboard focus remains visible. At scroll position zero, expanding the controls pushes part of the chart below the fold on short screens; after closing and aligning the chart, selected values and smoothing still fit together. On 375×667 the View on map button is near the lower edge and may need a small scroll to expose fully. The map dialog's return action remains fully visible. These later observations supersede the exact fold descriptions below. Chrome emulation and blocked external tiles remain the evidence boundary.

## Findings and changes

### Final owner-approved layout and reset follow-up

The page now uses a muted background with white summary, chart and desktop-map panels. File details and Help with this viewer sit inside the chart panel; their labels match the calculation disclosure's small text size. On phones, the filename wraps above the file actions rather than truncating. Chakra spacing tokens separate the chart heading, selection hint, smoothing, map action and route-position control.

Reset view sits beside Change GPX file and Clear file, using the orange outline variant. It restores the initial selected item and remounts the viewer, resetting chart settings, units, stop choices, point selection, map state and disclosures without reopening the file or disposing its measurement session. It remains available for an open file and is disabled during replacement import. Start of route was removed; the route-position slider retains keyboard access, including Home and End.

The selection hint now appears beneath the chart, disappears while a point is selected and returns on reset. Phone wording names View on map explicitly. Smoothing follows this short hint beneath the motion chart.

Final verification after the spacing changes: `pnpm test --runInBand` passed all 176 tests; `pnpm build`, `pnpm lint`, `pnpm knip` and `git diff --check` passed. `PLAYWRIGHT_PORT=4197 pnpm exec playwright test tests/browser/workspace.spec.ts --project=desktop --output=/tmp/gpsgoblin-spacing` passed four cases, covering 1440×900, 1280×720, 390×844 and 375×667 with touch enabled for phone contexts. These exercise chart selection, units, smoothing, overlay, mobile map return, reset, disclosures and enlarged text. Reset assertions cover metric units, speed chart, default smoothing, cleared selection/overlay and collapsed File details. They do not independently assert every reset state, such as map camera or confirmed-stop selections.

Final reset screenshots were visually inspected at 1440×900 and 375×667. The phone screenshot is scrolled to the chart hint and lower controls; the desktop screenshot includes file actions, totals and the chart/map panels. Local artifacts are in `/tmp/gpsgoblin-spacing`. Earlier exact fold observations below are historical; the additional spacing can require more scrolling. External tiles remain blocked in these checks, and no physical-device or cross-browser claim is made. No commit, publication, deployment or issue closure was performed.

The existing workspace already supplied compact loaded-file controls, a desktop chart/map layout, nearby chart controls and a mobile map dialog. Baseline workspace checks passed at all four required sizes. Repeated introductory and calculation copy, plus a long always-expanded help section, remained the main simplification opportunity.

The opening screen now has a short purpose statement, local-file privacy statement and GPX 1.1 picker. Longer instructions are under **Help with this viewer**. **Calculated distance** and **Elapsed time** remain visible, with their basis under **About these totals**. Missing-time and planned-route notices stay outside that disclosure. Refresh/session information is in File details and help; map-provider information is under Map privacy. The chart selection hint is shorter and disappears after selection. Existing chart options, warning disclosures and active stop-exclusion explanations remain available.

Visual inspection also found the map dialog's return button partly clipped at 375×667. Its body now scrolls within the viewport while the title and **Back to chart** action remain fixed. Opening map privacy cannot push that action off screen. Returning preserves the selected point and restores focus to **View on map**.

## Acceptance evidence

| #10 criterion | Result and evidence |
| --- | --- |
| Initial upload versus loaded workspace | Pass. Initial screenshots show the picker and collapsed help. At scroll position zero after import, only file identity/change/clear controls remain above results. Clear restores the picker. |
| Prompt summary, units and basis; warnings and metadata | Pass. Distance and elapsed time appear in the first viewport at all four sizes. Totals disclosure works with keyboard and phone taps. Missing elapsed time remains explained visibly; warning counts remain discoverable. Long names truncate locally and are readable in expanded details. |
| Desktop chart and linked map | Pass at 1440×900 and 1280×720. With the chart aligned in the viewport, clicking the drawn line shows selected values and the corresponding map marker simultaneously, without scrolling on selection. |
| Nearby metric and unit controls | Pass. Speed/Pace/Elevation and metric/imperial changes retain a visible chart result. Elevation is offered only when available. |
| Mobile active chart and point values | Pass at 390×844 and 375×667. With the chart aligned in the viewport, touch selection shows point values above the chart; the chart and smoothing control remain fully visible together. |
| Mobile linked location and return | Pass. View on map opens the selected marker. The return button is fully visible, including with privacy expanded; returning preserves values and restores focus. The short-phone clipping found during review is fixed. |
| Smoothing and average reference | Pass. Keyboard adjustment updates the duration naturally (1 minute → 1 minute 5 seconds). Smoothing stays directly below the plot; the average remains visible. |
| Optional elevation overlay | Pass. Off initially; clicking its visible label enables the background beside the chart. Imperial elevation units update with the selected display units. |
| Details, source distinctions, sections, missing data | Pass. Calculation explanations, file details and original text remain expandable. Unit tests exercise planned routes, track sections, waypoints and source metadata. Missing timestamps leave elevation usable, with unavailable elapsed time and explanatory warnings. |
| Keyboard, focus, touch and overflow | Pass in the tested Chrome contexts. Keyboard opens/closes disclosures and operates range controls. Mobile tests tap the chart, totals and map actions. Dialog focus stays inside, Escape returns focus, and the return action remains visible. No horizontal page overflow at the four sizes, including 24px root text. |
| Required viewport/state review | Initial, loaded, selected, map, missing-data/long-metadata and enlarged-text screenshots were inspected at the sizes below. Import progress, cancellation, invalid replacement and recovery also passed browser checks. |

## Viewports and limits

| Content viewport | Observed fit |
| --- | --- |
| 1440×900 | Picker and help fit initially. Loaded totals and chart/map appear together. Selected values, chart, smoothing, route-position control and map marker fit after aligning the workspace. |
| 1280×720 | Totals and most of the visual workspace appear immediately. A short scroll exposes the complete smoothing slider. Chart-aligned selection keeps the values, plot, smoothing and map marker together. |
| 390×844 | Loaded totals, full chart, smoothing and View on map fit at the top. Chart-aligned selection keeps its values and map action visible. |
| 375×667 | Loaded totals and chart are visible; scrolling is needed to reach smoothing/map from the top. After aligning the chart, selected values, full plot, smoothing and View on map fit together. The map dialog keeps its return action fully visible. |

Initial and loaded screenshots use scroll position zero. Selected screenshots align the Measurement chart section near the viewport top; selection itself does not change the scroll position. The workspace test attaches viewport/scroll coordinates. Expanded details intentionally require scrolling. With 24px root text and long metadata, the first viewport prioritises file controls, totals and warnings; charts require more scrolling. This check increases text size to 150%, not a claim of browser zoom or 200% coverage.

Screenshots are local in ignored `test-results/`. Chrome phone contexts emulate touch; this is not physical-device or Safari/Firefox coverage. External map tiles were blocked deliberately; the local route and selected marker were verified on the neutral background. No new supplier, calculation, file-format or release-gate decisions were made. Optional tests requiring private local recordings were skipped; the regression run did exercise the repository's sanitised Strava fixture.

## Copy and code review

Reviewed the opening screen, totals, calculation help, general help, file/session information, map privacy and missing-data states. The visible copy answers what to open, what the results mean or how to inspect them. Detailed text remains in returned static HTML behind native disclosures. Important stop/gap qualifications and failure recovery messages are unchanged. Native summaries use meaningful text instead of unexplained information icons, and the added summaries have 44px minimum height.

Reviewed the diff against the repository conventions and issue scope. No analysis or source-data mutation was introduced. The now-unused import-description constant and its export were removed. Existing assertions were updated for the intentional wording/disclosure changes. The workspace test now waits for the replacement file's missing-time result before capturing enlarged-text evidence; previously it could capture the old file during processing.

## Verification

- `pnpm test --runInBand`: 176 passed in 15 suites.
- `pnpm exec tsc --noEmit --incremental false`: passed. The final `pnpm build` also passed its TypeScript check and static export.
- `pnpm lint`: passed.
- `pnpm knip`: passed with no findings.
- `git diff --check`: passed.
- `PLAYWRIGHT_PORT=4197 pnpm exec playwright test tests/browser/workspace.spec.ts tests/browser/releaseAccessibility.spec.ts tests/browser/measurements.spec.ts tests/browser/importRecovery.spec.ts tests/browser/measurementWorker.spec.ts tests/browser/chartSelection.spec.ts tests/browser/recordingGaps.spec.ts tests/browser/movingMeasurements.spec.ts --project=desktop --project=mobile`: 64 passed, 4 optional private-recording cases skipped.
- After the final map-dialog fix, `PLAYWRIGHT_PORT=4197 pnpm exec playwright test tests/browser/workspace.spec.ts tests/browser/releaseAccessibility.spec.ts --project=desktop --project=mobile`: 12 passed. Includes light/dark automated accessibility scans, keyboard focus, all four viewports and the new fully-visible return-button assertion.

No remaining acceptance failures were found within this evidence boundary. Production deployment and issue closure were not performed.
