# Goblin personality — typography follow-up to #19

18 September 2026. Authorised follow-up: explore more options taking Goblin's
personality into account, with **Source Sans 3 the owner's best option so far**.
Source was the interim preference for this round. The owner has since selected
**Fraunces headings + Source Sans 3 body and data** as the preferred direction
for planned adoption. This extends the [initial findings](README.md) on the same
ticket branch; production implementation remains separate.

## Owner decision

On 18 September 2026, after reviewing the added directions, the owner said:
“I like the Fraunces + Source Sans 3 the most.” This selects the pairing over
Source alone: Fraunces carries the name and headings' warm, playful character;
Source Sans 3 retains clear body copy, controls, numbers, units and chart axes.
The gallery now opens with this pairing selected.

The intended adoption uses the previewed Fraunces settings (`SOFT=50`, `WONK=1`,
automatic optical sizing) and existing heading weights, with Source for body and
data. The [integration guidance below](#intended-pairing-integration) records the
Chakra approach and remaining checks. This decision completes the exploration's
owner-choice gate; it does not implement the production fonts, approve a wider
redesign, or authorise publishing or deployment. Issue #19 remains open until its
PR is merged.

Decision-update verification: `pnpm tsc`, `pnpm lint`, `pnpm knip` (no findings),
`pnpm format:check`, and `pnpm test --runInBand` (15 suites, 176 tests) passed.
Local Chrome checked the gallery at 1440 × 900, 1280 × 720, 390 × 844 and
375 × 667: Fraunces is selected, Source remains the comparison reference, images
load, live links use Fraunces, keyboard focus moves from reference to candidate,
and the page has no horizontal overflow. Desktop and short-phone viewport
screenshots were visually inspected. The underlying page captures are unchanged;
production adoption checks remain pending.

### Decision-update Standards review

No Standards findings. The owner’s preference is accurately recorded as Fraunces
headings with Source Sans 3 body and data. Gallery defaults, labels and live links
agree with that decision. Earlier recommendations and reviews are clearly marked
as historical, and production implementation remains explicitly separate.

The full exploration remains consistent with the previously reviewed standards;
no baseline smell warrants refactoring. Standards: **0 documented-standard
violations; 0 smell findings.**

### Decision-update Spec review

No Spec findings against `38e6dd5...HEAD`, including the owner-selection update.
The requirement to record the owner’s decision is satisfied by the recorded
Fraunces/Source direction and exact owner preference. Intended Chakra integration
and remaining implementation/verification work are covered. Production
implementation remains separate; existing layout limitations remain documented.
Spec: **0 technical findings; 0 outstanding exploration acceptance criteria.**

Decision-update review totals: Standards **0 findings**; Spec **0 findings**.
Publishing and merge remain governed by the authorised PR workflow.

## What the name contributes

The first shortlist prioritised readable interface typography and underweighted
the name. This round treats “Goblin” as mischievous, resourceful and slightly
eccentric: a useful little creature doing file chores. Those are interpretations
to compare with the owner, not new product requirements. The site remains a
restrained, sport-neutral toolkit.

The [gallery](index.html) now defaults to **Source Sans 3 as the reference** and
offers the current stack as an alternative reference. Each added direction keeps
Source Sans 3 for body copy, control labels, numbers, units and chart axes. This
lets the name/headings carry more personality while preserving the best interface
candidate so far. Live links open the actual homepage and viewer with the selected
local override. Nothing is added to production routes or assets.

## Added directions

| Direction                                          | Why it belongs in this exploration                                                                                                                                                                      | What the actual pages show                                                                                                                                                                                                                                                         |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bricolage Grotesque headings + Source Sans 3       | An expressive sans with unusual proportions: inventive and slightly eccentric. [Designer/project](https://github.com/ateliertriay/bricolage).                                                           | The gentlest change. Its rounded shapes keep the name approachable and give the viewer's headings more presence, but at the existing weights and sizes the Goblin character is fairly subtle.                                                                                      |
| Fraunces headings + Source Sans 3                  | A soft serif with adjustable softness and deliberately irregular forms: warm, playful, storybook character. [Project](https://github.com/undercasetype/Fraunces).                                       | The strongest additional contender for characterful headings. “GPSGoblin” gains a recognisable serif silhouette; supporting pages feel more editorial. The effect is friendlier than a stark display serif, but more traditional than Source alone.                                |
| Grenze headings + Source Sans 3                    | A Roman/blackletter hybrid: explores a more literal fantasy association. [Foundry](https://www.omnibus-type.com/fonts/grenze/).                                                                         | Compact, angular and gothic-flavoured. Clear at the tested heading sizes, but the magazine/storybook tone is quite specific. It adds less friendly mischief than Fraunces and would need to earn its place beyond the name.                                                        |
| Goblin One homepage name + Source Sans 3 elsewhere | An expressive display face to test a bolder, sign-painted personality directly in the name. [Distribution description](https://github.com/google/fonts/blob/main/ofl/goblinone/DESCRIPTION.en_us.html). | Strongest personality, with broad, chunky letters and sharp serifs. It fits the normal phone homepage, but becomes too wide at 200% text. The rest of the site, including the viewer, intentionally matches Source alone. Its name is not evidence that it is the right brand fit. |

**My assessment:** Source Sans 3 remains the strongest single-family balance.
Fraunces + Source Sans 3 is the pairing worth considering if more personality in
the name/headings is desired. Bricolage is a modest sans alternative; Grenze and
Goblin One make the aesthetic cost of a more literal Goblin reading visible.
This was the assessment before the owner selected the Fraunces/Source pairing.

All existing sizes, spacing, copy and colours are retained. Bricolage uses its
normal width and automatic optical sizing. Fraunces uses `SOFT=50`, `WONK=1` and
automatic optical sizing; the normalisation of small optical sizes is part of its
design. Goblin One is the one role/weight exception: it is applied only to the
homepage “GPSGoblin” h1 at its native 400 weight, avoiding synthetic bold. Other
headings remain Source. An eventual wordmark/shared header still belongs to #18;
this comparison does not create one or make #19 depend on it.

## Whole-page and interaction evidence

The four additions were captured in Chrome **153.0.8010.50 on macOS**, at
**1440 × 900, 1280 × 720, 390 × 844 and 375 × 667**, with **100% and 200% root text**.
The same actual homepage, both supporting pages, empty/loaded viewer, metric and
imperial selection, immediate chart feedback, long filename/missing-times and
phone map states were used. These add 312 images and 308 evidence records, bringing
the complete exploration to **544 images and 538 records**.

Keyboard position selection and clicks/touch-enabled taps on the actual chart
line selected known synthetic locations. Units updated selected values; phone
map opening and returning preserved selection. In this round map-dialog captures
wait for the map-unavailable message after blocked tiles, avoiding the transient
loading state recorded in some initial captures. Both Source and display font
downloads were also blocked to exercise system fallback; the viewer still
imported the file, without horizontal overflow. The Goblin One face is unused in
the viewer by design; its failed download is recorded in the homepage fallback
status separately.

At **100%**, none of the added directions has horizontal page overflow in the
captured states. At the chart fold the selected values and smoothing stay visible
at every viewport. Body, filename, numeric summaries, chart axes, units and
selected-point text retain Source's readability and wrapping. The serif faces
are confined to headings, where they are large enough to read comfortably. Some
supporting-page heading wrapping differs, without introducing normal-size clipping.

At **200%**, the three heading pairs retain Source's known phone homepage width
of 431 px and the same long-filename-page overflow (400 px at a 390 px viewport,
393 px at 375 px). Goblin One increases the homepage width to **508 px**, and the
end of the name is visibly outside the phone viewport. That is a candidate-specific
disadvantage; it needs a responsive wordmark treatment if this direction is ever
chosen. We retain the evidence rather than disguise it by reducing the type size.
All additions retain the existing enlarged-text control/result separation: after
a chart tap, the selected-value panel is above the viewport on short laptops and
phones, although the plot marker/tooltip is visible. Native phone select values
also truncate. These are not solved by adopting a heading font.

Screenshots and [evidence records](evidence.json) preserve the viewport/fold and
scroll position. Actual homepage, supporting-page and selected-viewer captures
were visually inspected on desktop and phones. This is desktop Chrome with touch
emulation, not physical-phone or user testing. Browser zoom, cross-engine/platform
rendering and dark appearance remain adoption verification work.

## Provenance, licence and payload

Font binaries are unmodified upstream files, pinned to the following commits.
All added families use **SIL OFL 1.1**; complete notices accompany the files in
[fonts/](fonts/). Licence/log whitespace is normalised without changing its words.
Grenze's upstream font log is also included. Goblin One reserves the name “Goblin”;
future modifications/subsets must respect its licence. The preview serves fonts
from localhost, with `font-display: swap` and the explicit system fallback from
the initial exploration. There is no visitor request to a font service and no
paid service or dependency addition.

| Font file                  | Pinned upstream commit                                                                                                     | Available upright weights | Extra raw bytes / KiB | With Source Sans 3                           |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------- | --------------------- | -------------------------------------------- |
| `BricolageGrotesque.woff2` | [84745e5](https://github.com/ateliertriay/bricolage/tree/84745e5b96261ae5f8c6c856e262fe78d1d6efdd/fonts/webfonts)          | Variable 200–800          | 204,636 / 199.8       | 366.0 KiB                                    |
| `Fraunces.woff2`           | [7ccdec3](https://github.com/undercasetype/Fraunces/tree/7ccdec31c6028118dce3e47fe864e3744460371d/fonts/webfonts/variable) | Variable 100–900          | 205,500 / 200.7       | 366.9 KiB                                    |
| `Grenze.woff2`             | [2af38b2](https://github.com/Omnibus-Type/Grenze/tree/2af38b2f951f5d2d601825c896c2be9b8b282092/fonts/webfonts)             | Variable 100–900          | 63,844 / 62.3         | 228.5 KiB                                    |
| `GoblinOne.ttf`            | [90abd17](https://github.com/google/fonts/tree/90abd17b4f97671435798b6147b698aa9087612f/ofl/goblinone)                     | Single 400                | 36,736 / 35.9         | 202.1 KiB on homepage; Source only in viewer |

These are full-file raw payloads, not transfer-size estimates or Latin subsets.
Goblin One uses the pinned TTF, not a claimed WOFF2 conversion. No italics were
added. SHA-256:

```text
Bricolage: b51a8ebd169637e47cb7db430431ab3e122d2f09b03ee2a03ea06f4cb46f1a8e
Fraunces: e6638ea113d0027354a08f957a4068975c8066395a0d0f7bb7861f6409621be3
Grenze: 18c7c0aed73f486c2b2231b23d2ec17cb5a2107d2f7292e88ce3218cca323209
Goblin One: 26a15eafd8911f547e846066a1eea0521af2d870d6f17b8ecf0741768b99d099
```

## Intended pairing integration

The Next/Chakra integration from the initial report applies to the selected pair.
Expose separate local-font variables for Source body and Fraunces headings;
set Chakra's `fonts.body` and `fonts.heading` tokens separately, preserve mono and
the provider's per-instance system, and keep the preview's custom axis settings
for Fraunces. Use self-hosted files via `next/font/local`, retain the OFL notices,
and preserve the system fallback. Any shared-header integration requires its own
agreed scope.

Settle font role, language/subsetting and payload, check slow-loading/fallback
metrics, and verify real zoom and the required viewports before adoption. Goblin
One's enlarged-text fit finding remains evidence about a rejected alternative.
Fraunces is selected for headings only; controls and chart data retain Source.
The planned implementation must verify these roles across pages, controls and
portals in light/dark appearance, plus font failure, slow loading and real browser
zoom. Existing enlarged-text layout limits remain distinct from font adoption.

## Verification and review

The new captures were generated with:

pnpm typography:capture bricolage fraunces grenze

pnpm typography:capture goblin

Each command replaces only those fonts' records and retains the others. With no
arguments the capture command regenerates every direction.

Successful checks for this follow-up: `pnpm tsc`, `pnpm lint`, `pnpm knip` (no
findings), `pnpm format:check`, and `pnpm test --runInBand` (15 suites, 176 tests).
The production app code and export configuration did not change; the captures
use the same static build verified in the initial exploration.

A separate local Playwright run checked all **912** valid gallery comparisons
(six candidates, two references, all states/viewports/text sizes), image dimensions,
reference switching, gallery fit at the four viewports, control focus order,
image scale, and each added face's live homepage/viewer role. It confirmed Goblin
One is applied to the homepage name and Source to the viewer. Gallery screenshots
were captured at all four sizes for inspection. Native-select candidate keyboard
selection remains the initial harness limitation; the viewer's position keyboard
selection is verified.

Independent reviews used the agreed `38e6dd5` baseline, with the authorised
Goblin-personality follow-up included in scope.

## Exploration Standards review (before owner decision)

No Standards findings. The expanded exploration keeps fonts and captures outside
production assets, preserves Source Sans 3 as an interim preference, and separates
aesthetic interpretations from agreed requirements. Font roles, the Goblin One
weight exception, viewport evidence and candidate-specific clipping are clearly
documented.

No baseline smell warrants refactoring this bounded local harness.

Standards: **0 documented-standard violations; 0 smell findings.**

## Exploration Spec review (before owner decision)

No technical Spec defects or scope creep found against `38e6dd5...HEAD`, including
the authorised request to “explore more options taking Goblin personality into
account.”

The four added directions preserve Source Sans 3 for body text and data, compare
actual homepage/supporting/viewer states, and document aesthetic tradeoffs,
licensing, weights, payload, fallback and conditional integration. The required
viewports and enlarged text are covered. Goblin One’s enlarged-phone name clipping
is explicitly recorded as a candidate disadvantage, consistent with the
requirement to “Note wrapping, clipping and any effect on keeping controls and
results visible together”; adoption or a responsive repair is not implied.

One owner gate remains: “Record the owner’s decision: adopt a candidate, retain
the current font, or defer.” Source Sans 3 is correctly recorded as the current
front-runner, while adoption remains pending. This is not a technical defect.

Spec: **0 technical findings; 1 outstanding owner decision.**

Exploration review totals at that point: Standards **0 findings**; Spec **0
technical findings**, with the owner decision outstanding. The subsequent
[owner decision](#owner-decision) resolves that gate; implementation and the
authorised PR workflow remain separate.
