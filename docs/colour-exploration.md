# Light colour exploration

Bramble light and dark are the finalised palette choices. The remaining saved
palettes are alternatives for possible future use. Source Sans 3,
Fraunces, typography and the app layout remain unchanged.

The active gallery compares
[the finalised Bramble light and dark themes](themes/bramble.md). This records
the design choice; the production Chakra theme has not yet been changed.

[Imp](themes/imp.md) is saved intact for possible later adoption or a future
selectable theme. [Woodland](themes/woodland.md),
[Bright Trail](themes/bright-trail.md) and [Mischief](themes/mischief.md) are
also preserved. Their direct preview links still work; the originals are
hidden from the gallery. No user-facing theme picker is implemented.

## Local preview

The static export must exist (`pnpm build`). Start `pnpm colours:preview` and
open <http://127.0.0.1:4192/__colours/>. The gallery shows actual homepage
previews, with links to open each homepage or viewer in a separate tab. Import
the same file into the viewer tabs to compare results. Navigation preserves
the candidate; a full page navigation still clears imported data as usual.

All previews use the same page background on the homepage and viewer, including
the current palette baseline. Homepage cards keep the panel background colour.

The server binds to localhost and injects CSS colour overrides into responses.
It does not modify the static export or add a production route. Each preview fixes its own light or dark mode only on this origin, without
changing the mode of another preview tab. No fonts or dependencies are downloaded.

Bramble light and dark use the same deep green map route (`#254E24`)
against the unchanged basemap. The chart's moss green is brighter
in dark mode for contrast with the dark panels. Map tiles retain their normal
appearance, and warnings/errors use the existing Chakra defaults for each mode.
The complete palettes and implementation boundaries are in the
[Bramble record](themes/bramble.md).

## Verification — 18 September 2026

Chrome checks cover Bramble light and dark at content viewports 1440 × 900,
1280 × 720, 390 × 844 and 375 × 667, including opposite system preferences to verify that each preview
keeps its intended mode and that the two gallery previews remain independent. Checks exercise gallery links by
keyboard, homepage-to-viewer navigation, synthetic GPX import, the route
position slider by keyboard, and selection by clicking or tapping the drawn
chart line. Body and heading font families match across candidates. No
horizontal overflow was detected in selected chart states.

Screenshots cover the gallery, homepage, empty viewer, initial imported result
and chart selection. At the selected chart scroll position, the selection
panel and chart are visible together; the short phone requires scrolling to
reach the remaining route position controls. Desktop shows the linked map
alongside the chart. Screenshot evidence is local in `/private/tmp/colours-*`.
The new gallery headings, descriptions, links and limitations were reviewed
in context. This is browser emulation, not physical device or user testing.
External map requests were blocked, so the background-map-unavailable state
was exercised; live basemap appearance remains unverified.

Native select menus remain unchanged. Further styling is deferred to
[issue #38](https://github.com/Yorkshireman/gpsgoblin/issues/38) and requires
browser/device coverage and user testing before adoption.

Production adoption is tracked in [issue #39](https://github.com/Yorkshireman/gpsgoblin/issues/39).
