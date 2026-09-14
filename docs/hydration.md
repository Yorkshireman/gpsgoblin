# Chakra hydration class mismatch

Investigated on 14 September 2026 with Next.js 16.3.4, Chakra UI 3.37.0 and
Emotion 11.14.0. The homepage and viewer share the root provider.

## Cause and reproduction

The live development warning on `/` compared client `css-ap60qa` with server
`css-1rb706t` on the “Supports GPX 1.1…” paragraph. That element uses
`fontSize='sm' color='fg.muted'`; the viewer also renders the equivalent styles in
the opposite prop order.

Chakra's installed `utils/memo.js` sorts object keys to identify equivalent cache
inputs, while its CSS output retains the first input's property order. Emotion
hashes the resulting ordered styles. The module-level `defaultSystem` therefore
allows an earlier server request to determine CSS ordering for later requests,
while a fresh browser has a different cache history.

A probe using two fresh `createSystem(defaultConfig)` instances confirmed the
order difference: one first received fontSize/color, the other color/fontSize.
Repeating fontSize/color on the latter returned color/fontSize. Fresh Chrome
contexts against the running dev server then reproduced the homepage warning
when visiting the viewer and homepage in both orders. The viewer was clean in
that recorded run; this does not claim independent reproduction of every warning
previously seen by the owner.

The root Provider now creates one styling system in a lazy React state initializer.
Each server render and browser mount gets its own cache; normal rerenders retain
that system. No style props, CSS values, bundler, dependency versions or hydration
warning suppression were changed.

## Verification

The provider regression test failed before the change because separate renders
inherited the same cached property ordering, then passed after cache isolation.
The same fresh-browser development probe subsequently completed both page orders
without console errors or page errors. The probe is local at
`/private/tmp/gpsgoblin-hydration.mjs` and exits unsuccessfully for hydration errors.

This fixes the observed class-hash mismatch. Chakra also documents a different
Turbopack/Emotion style-element mismatch in its
[Next.js integration guide](https://chakra-ui.com/docs/get-started/frameworks/next-app#hydration-errors-turbopack).
That is not evidence that switching bundlers is necessary for this issue.

Final checks:

- `pnpm test --runInBand --silent`: 176 tests in 15 suites passed.
- `pnpm tsc --incremental false`, `pnpm lint`, `pnpm knip`: passed; no Knip findings.
- `pnpm build`: static production export passed.
- `pnpm exec playwright test tests/browser/hydration.spec.ts
  tests/browser/chartSelection.spec.ts --config
  /private/tmp/gpsgoblin-discovery-playwright.config.ts --workers=2`: seven passed.
  The temporary config serves the production export on port 4178. Checks cover
  both initial page orders and point inspection/dismissal at the four baseline
  viewport sizes. External map tiles are blocked. No layout or copy changed.

No dependency patch or bundler switch was needed. The system is created once per
mounted provider rather than on each render; cross-request CSS cache reuse is
intentionally removed. The previous point-dismissal work remains intact.
