# GPSGoblin brand assets

## Route-pin mark

**Selected:** grounded goblin map pin, approved by the owner on 19 September 2026.

The GPSGoblin mark combines a conventional rounded map pin and distinct pointed
tail with two small, raised goblin-like ears. A perspective ellipse places the
pin on the ground and gives the flat mark a subtle sense of depth. The pin body
dominates the shape, keeping the character friendly and secondary. It
deliberately has no facial features or internal route line, avoiding marks that
read as eyes or a mouth. Its simple geometry is intended to stay recognisable
at favicon sizes without making the product dependent on a mascot or a
particular sport.

The reusable source artwork is [`src/app/icon.svg`](../src/app/icon.svg). Next.js
also serves that file as the site's favicon through its App Router icon file
convention.

Explored versions are retained in [`docs/brand-candidates`](brand-candidates),
including the original horizontal-route design and the solid goblin-pin
silhouette, along with the wider-eared conventional pin. They remain available
for comparison and later development even when they are not the active favicon.
The ungrounded friendly pin is also retained as the direct predecessor of the
active mark. `grounded-goblin-map-pin.svg` is intentionally retained as a
frozen historical snapshot of the selected design; `src/app/icon.svg` is the
only editable canonical source for the active mark.

The artwork was created for GPSGoblin by OpenAI Codex on 19 September 2026. It
does not incorporate third-party artwork, fonts or generated-image assets. The
repository owner may use, modify and redistribute it with the project.

The mark uses the product's existing route green (`#254e24`) and warm panel
colour (`#fffef4`). The light outline keeps the silhouette distinct against dark
browser chrome; the filled shape remains distinct against light chrome.

## On-page use

The owner approved using the mark in a compact shared header on 19 September 2026. The header pairs the decorative mark with the GPSGoblin name in one
accessible home link. It is deliberately limited to this home link so it does
not displace page titles, viewer controls or results with a larger navigation
system.

## Verification record

The active local SVG is covered by the static-export favicon check and rendered
at 16 px and 32 px on light and dark browser-chrome-colour backgrounds, with
Playwright screenshot artifacts retained locally. The shared header and global
page shell are exercised at 1440×900, 1280×720, 390×844 and 375×667 for the
homepage, GPX viewer (including a loaded file), privacy and limitations pages.
Those checks capture viewport screenshots, keyboard home-link navigation and
touch navigation. The homepage also has 200% text coverage across that viewport
matrix. Every page with the shared header also has 200% text coverage across
the same matrix, checking that its title and home link remain visible without
horizontal overflow. A Chrome local-static-export inspection additionally
confirmed the active favicon in a real browser tab.
