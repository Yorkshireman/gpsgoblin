# Typography exploration — #19

Explored on 18 September 2026 against `38e6dd5`, for
[issue #19](https://github.com/Yorkshireman/gpsgoblin/issues/19).
**Owner adoption decision: pending.** Source Sans 3 is the owner's current
front-runner. The initial recommendation was Source Sans 3 as a single family;
the [Goblin personality follow-up](goblin-directions.md) compares four added
directions with it.
No adoption, redesign, deployment or change to the published font is included.
This work is ready for the owner's visual comparison, rather than ticket closure.

## Compare the actual pages

The [comparison gallery](index.html) shows Source Sans 3 or the current font alongside
each candidate, with page/state, viewport, text-size and actual-size controls. It uses
viewport captures of the actual static export, not a specimen or an isolated
component. Its live-viewer link opens the real, interactive viewer with a local
font override; any file chosen there stays on the device.

With an existing `out/` build, start the local-only preview:

pnpm typography:preview

Open <http://127.0.0.1:4190/__typography/>. This serves the bundled font files from
localhost. The fonts, gallery and captures live under `docs/`, outside the
public assets and static export. The preview injects only font-family tokens and,
when requested, enlarged root text; it is not a production security-header test.
The live link permits personal files, but the stored evidence uses only synthetic
recordings generated in `scripts/captureTypography.mjs`.

## Initial shortlist and recommendation

| Direction                                       | Appearance and tradeoff                                                                                                                                            | Readability at existing sizes                                                                                                                                                                             |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Current: Chakra's default font stack            | Familiar and restrained; appearance depends on the installed fonts and operating system. The default tokens start with `Inter`, but the app bundles no Inter file. | Clear reference on this Mac. No additional font payload or loading delay; cross-platform consistency is limited.                                                                                          |
| Inter 4.1, headings and body                    | Crisp, broad and more visibly structured. A consistent interface feel, though relatively familiar and less distinctive.                                            | Largest apparent text size of the candidates. Strong small labels and figures; broader text can wrap sooner on narrow screens.                                                                            |
| Source Sans 3, version 3.052, headings and body | Warmer, lighter and less imposing. Gives the name and explanatory pages a modestly different character without suggesting a particular sport.                      | Numerals and units are clear. Its smaller apparent size makes 12–14 px text quieter, so an adoption needs a deliberate small-text review rather than assuming that the same CSS size looks equally large. |

I recommend **Source Sans 3 as one family**, subject to the owner's preference and
the remaining small-text checks. The distinguishing character is strongest in
the homepage and supporting-page headings; it remains restrained in summaries
and controls. Inter is the better choice if stronger apparent small-text size is
the priority. Keeping the current stack remains a reasonable zero-payload choice.

A restrained Inter-heading/Source-body pairing was considered but not recommended:
the contrast between these two sans families adds little hierarchy beyond the
existing sizes and weights, while requiring both files (about 510 KiB before
subsetting). A single family covers headings, body, controls, SVG axes and values
coherently. No font pairing is assumed to be a requirement.

The comparison preserves the existing sizes, weights, colours, spacing and copy.
This exposes genuine wrapping changes, including containers sized in `ch`.
At normal size, the Source homepage card is narrower and its description uses an
extra line; it does not universally save space. Inter's larger apparent size makes
the site name stronger. Neither candidate needs a different brand or logo to work,
and this exploration has no dependency on #18.

## Initial UX evidence

Chrome **153.0.8010.50 on macOS**, light appearance, reduced motion. All four content
viewports from `docs/agents/ux.md` were captured for every font at 100% and 200%
root text size: **1440 × 900, 1280 × 720, 390 × 844, 375 × 667**.
The enlargement changes 16 px root text to 32 px; it is not browser zoom or a
physical-phone test. [Evidence records](evidence.json) include scroll position,
loaded font faces, computed families, axis sizes and visibility measurements.

States: homepage, privacy, support/limitations, empty viewer, immediately after
import, selected point with metric units, selected point with imperial units,
long filename with missing times, and the phone map dialog. The gallery separates
the **immediate chart click/tap feedback** from the selected-state capture taken
after returning to the chart controls. This prevents a repositioned screenshot
from being mistaken for immediate feedback.

The position slider was exercised with the keyboard, then the actual drawn line
was clicked or tapped with touch enabled on phone viewports. Selection was checked
against known synthetic positions. Unit changes updated values; opening the phone
map and returning preserved selection. Map tiles were blocked, leaving the local
route/selection and map-unavailable behaviour; no third-party font or map requests
were allowed by the capture harness. Some map-dialog captures still show the
transient loading message, so they establish text/layout and selection, not settled
basemap rendering.

At **100%**, no captured page state had horizontal overflow. At the chart fold,
selected values and smoothing remained visible on all four viewports. Desktop
also showed the linked map position alongside the chart; phones used the map
dialog. The short laptop clipped the lower position control at that scroll
position, although the selection and smoothing remained visible. On the short
phone, the map button may need scrolling. None of this is a new font-induced
layout change.

At **200%**, all three directions reveal existing limits:

- Phone homepage content overflows horizontally: current 451 px, Inter 458 px,
  Source 431 px, at both 375 px and 390 px viewport widths.
- The long-filename/missing-times page also has modest horizontal overflow in all
  three directions. The filename itself wraps inside its disclosure; the overall
  page does not fully fit.
- Native chart/unit select values truncate visibly on phones. This is a visual
  finding; the automated scroll-width check cannot detect native option clipping.
- A chart click/tap on the short laptop and both phones leaves the selected-value
  panel above the viewport. The plot marker/tooltip changes immediately, but the
  full controls, values and chart do not fit together. Fonts alone do not resolve
  this separation.
- SVG axes and tooltips inherit the candidate family. Axis ticks enlarge from
  12 px to 24 px with the root size, so larger figures consume substantially more
  plot space.

These are findings for an adoption/UX follow-up, not repairs authorised by this
exploration. Normal-size chart numbers, decimal separators, km/h, m/ft, summary
durations, selected-point timestamps, warnings and the full filename were reviewed
in context. Source's quieter small text is the main typography tradeoff. No user
testing, native Safari, Android/iOS hardware or cross-platform font rendering is
claimed; dark appearance and browser zoom remain adoption checks.

## Licence, payload and fallback

Both bundled files are unmodified upstream upright variable WOFF2 files. Their
full copyright/licence notices are included in [fonts/](fonts/). Both use SIL OFL
1.1; redistribution/embedding must retain the notices. Source has the reserved
font name “Source”; any future modified/subset distribution needs to respect its
licence conditions. These are open-source files, not an Adobe Fonts subscription
or a visitor-facing Google Fonts service.

| File                          | Upstream source                                                                                                                                                     | Available weights         | Raw payload               |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ------------------------- |
| `InterVariable.woff2`         | [Inter v4.1](https://github.com/rsms/inter/tree/v4.1/docs/font-files), [licence](https://github.com/rsms/inter/blob/v4.1/LICENSE.txt)                               | Variable 100–900, upright | 352,240 bytes / 344.0 KiB |
| `SourceSans3VF-Upright.woff2` | [Source Sans 3.052R](https://github.com/adobe-fonts/source-sans/tree/3.052R/WOFF2/VF), [licence](https://github.com/adobe-fonts/source-sans/blob/3.052R/LICENSE.md) | Variable 200–900, upright | 170,188 bytes / 166.2 KiB |

These payloads are the actual full files used here, not estimates of a Latin
subset or transferred sizes with HTTP compression. Existing 400/500/600/700
weights are covered; neither italic file was included or assessed. SHA-256:

```text
Inter: 693b77d4f32ee9b8bfc995589b5fad5e99adf2832738661f5402f9978429a8e3
Source Sans 3: 5f16566f7a40d39b339ad26be151fa5a1ab1f0c2574c7a2e619765584a1acbd8
```

The preview uses `font-display: swap` with an explicit system fallback matching
Chakra's platform stack after its unbundled Inter entry. Failed font downloads
were deliberately exercised at 375 × 667; both rendered the homepage and loaded
viewer with no horizontal overflow. See
[Inter fallback](captures/inter-375x667-100-fallback-home.png) and
[Source fallback](captures/source-375x667-100-fallback-home.png).
The font faces reported `error`, while the viewer still imported its file.
Slow-loading layout shifts and fallback metric adjustment were not benchmarked.

## If the owner chooses adoption

Use the chosen local WOFF2 with this installed Next.js version's
`next/font/local`, expose a CSS variable on the root layout, and merge a Chakra v3
configuration into the provider's existing per-instance `createSystem` call.
Set `theme.tokens.fonts.body` and `heading` to that variable plus the system
fallback; preserve the existing mono token and hydration isolation. Verify that
chart SVG text, controls and portals inherit the tokens. This is consistent with
the [Chakra theme API](https://chakra-ui.com/docs/theming/overview) and the installed
Next.js font guides under `node_modules/next/dist/docs/`.

Before adopting, settle the full-file versus licensed subset choice and desired
language coverage, review Source's small text if selected, verify fallback/loading
and real browser zoom, and repeat desktop/phone interaction checks in light and
dark appearances. Do not silently broaden #19 into the existing 200% layout
repairs. Record an explicit owner choice of Source, Inter, current stack or defer;
then agree the scope of any implementation that follows. #19 stays open pending
that choice and its authorised PR workflow.

## Initial verification

The evidence can be regenerated from a fresh static export with
`pnpm typography:capture`; it starts its own loopback server on port 4191, uses the
installed Chrome channel and closes it afterwards. With no font arguments it now
captures every direction; selected font arguments replace only their evidence,
retaining the other directions. The preview defaults to 4190.
No dependency was added. This is a repeatable exploration harness; numerical
behaviour was not changed and no new TDD seam was introduced.

Checks run successfully:

- `pnpm tsc`
- `pnpm lint`
- `pnpm knip` — no findings
- `pnpm format:check` — across the repository
- `pnpm test src/components/ui/provider.test.tsx --runInBand` — 1 test
- `pnpm test --runInBand` — 15 suites, 176 tests
- `pnpm build` — static export and security headers generated
- `pnpm typography:capture` — 232 images, 230 evidence records; 24
  font/viewport/text-size combinations plus two failed-font scenarios

An additional local Playwright check loaded all 152 valid baseline/candidate
gallery comparisons, checked image dimensions, desktop map-state hiding, image
scale, native-control focus order, gallery fit at all four viewports, and the
live viewer's font/choose-file control. Gallery viewport screenshots were visually
inspected at desktop and short-phone sizes. Native-select value changes were
verified through Playwright's select operation; attempts to change its candidate
with the headless macOS popup keyboard interaction did not change the value, so
keyboard candidate selection is not claimed. The viewer's actual position-slider
keyboard selection was verified in the capture harness.

## Initial Standards review

Independent read-only review of `git diff 38e6dd5...HEAD` found no documented
standard violations or baseline smell findings. The diff follows naming/function
conventions, keeps design evidence outside production assets, preserves the
pending owner decision, and reports viewport/interaction evidence with explicit
limitations. Standards: **0 findings**.

## Initial Spec review

Independent read-only review against the same baseline found no technical defect
or scope creep. Actual-page comparisons, the requested text surfaces and viewport
matrix, readability/layout tradeoffs, licences/weights/payloads/fallback and
conditional Chakra integration are documented. Overrides remain local to the
exploration.

One acceptance criterion remains pending: “Record the owner's decision: adopt a
candidate, retain the current font, or defer.” This is an owner decision, not a
fixable implementation defect, and the ticket remains open. Spec: **0 technical
findings; 1 outstanding owner decision**.

Review totals: Standards 0 findings; Spec 0 technical findings, with the owner
decision still required for #19 completion.
