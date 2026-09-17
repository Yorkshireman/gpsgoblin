# Production basemap

Provider assessment for issue #5, checked 14 September 2026. OSM public raster tiles are selected for the initial release, with integration evidence below. The owner accepts best-effort availability and possible withdrawal; these risks do not by themselves disqualify OSM.

## Brief alternatives comparison

| Candidate                           | Fit for this project                                                                                                                                                                                                                     |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OpenStreetMap Standard raster tiles | Normal interactive viewing is permitted subject to the tile policy. No supplier account, card, API key or billing subscription is needed. Preferred for this release.                                                                    |
| MapTiler Cloud                      | Offers vector and raster maps, but its Free plan is described as testing, personal or non-commercial use. The advertised Flex plan starts at $30/month with extra traffic billed. No advantage under our no-unapproved-spend constraint. |
| Stadia Maps                         | Offers standard basemaps, but Free explicitly excludes commercial use. Starter permits it at $20/month. No advantage under our current cost constraint.                                                                                  |

This is a bounded comparison, not an exhaustive supplier survey or a visual ranking. Sources: [MapTiler pricing](https://www.maptiler.com/cloud/pricing/) and [Stadia pricing](https://stadiamaps.com/pricing/).

## OSM service assessment

- Commercial use: not excluded; normal interactive viewing must comply with the [tile policy](https://operations.osmfoundation.org/policies/tiles/) and linked terms.
- Renderer: MapLibre supports XYZ raster sources; use the exact HTTPS tile endpoint, 256-pixel tiles and a separate local route overlay. See [MapLibre raster example](https://maplibre.org/maplibre-gl-js/docs/examples/add-a-raster-tile-source/).
- Attribution: keep linked “© OpenStreetMap contributors” visible on the map, including phone views.
- Caching: honour server cache headers through the browser's normal HTTP cache. No cache bypass, tile archives, bulk downloads or offline prefetching.
- Identification: normal browser User-Agent and valid Referer; do not strip the site origin. No proxy or anonymous library client.
- Allowance and metering: no published numerical request entitlement. Count tile requests, not visits or map loads. There is no billing unit, automatic overage charge or card requirement for this public service; excessive/inappropriate use can be blocked.
- Limits and failure: no SLA; access may be withdrawn. This is non-billable access, not a promise of unlimited capacity. Retain local geometry, summaries and charts when tiles fail, and support operator disablement.
- Privacy: OSMF receives the viewed tile coordinates and network metadata, including IP address and Referer. The imported file, filename and local GeoJSON must not be sent. See [OSMF privacy policy](https://osmfoundation.org/wiki/Privacy_Policy). Tile coordinates reveal the viewed area even though the file stays on the device.

## Operation

`NEXT_PUBLIC_BASEMAP_DISABLED=true pnpm build` produces a static build with no external basemap requests. Set this build variable in the deployment configuration and rebuild/redeploy to disable backgrounds; remove it and rebuild/redeploy to restore them. It is a build-time switch, not an instant change to an already open page. This task does not deploy either build.

Provider endpoint, tile options and attribution are isolated in `src/features/gpx-viewer/basemap.ts`. Change that integration when changing supplier; local overlays do not need rewriting. There is no automatic supplier failover. A tile error or 15-second initial loading timeout removes the basemap layer and source, retaining the route, selected marker and local results. Reopening the map retries the background. A renderer/WebGL failure retains textual results and charts but cannot retain a working canvas.

## Verification

Visible Chrome 153 on macOS loaded a synthetic three-point York route. With DevTools docked, the content viewport was 645 × 1999 CSS pixels and map canvas 595 × 318. The initial view requested 8 tiles at z16; visible keyboard zooming requested another 9 at z17 and 10 at z18. Of 27 total attempts, 24 returned 200 and 3 were cancelled during zoom. These counts are a sample, not a visits-to-requests conversion or guaranteed maximum. See [sanitised request evidence](benchmarks/basemapRequests.json).

The live OSM-filtered HAR showed GET tile URLs, browser User-Agent, origin-only Referer (`http://127.0.0.1:4175/`), no `no-cache` request headers and server cache headers plus ETag. Chrome's “Disable cache” remained unchecked. No custom proxy, cache or offline storage is used. The full viewer regression additionally checks outbound URLs, methods and bodies: only local assets and OSM tiles, no file/name upload. Verify the same origin/referrer behaviour on the deployed host when releasing, particularly if hosting headers change.

Focused Chrome browser checks cover 1440 × 900, 1280 × 720, 390 × 844 and 375 × 667. Screenshots of loaded and failed backgrounds were inspected. On phones the map dialog shows attribution, privacy text and a return-to-chart action; the small-phone failure notice remains readable, with minor dialog scrolling after keyboard focus. Desktop shows chart selection alongside the map; the short window requires normal scrolling to the lower controls/notice. Keyboard route selection and map zoom preserve the marker and measurement; phone touch lifecycle checks preserve selection and return focus to “View on map”. Zoom can move the selected location outside the current map bounds as expected. No physical-device testing is claimed.

The operator-disabled static build passed in all four sizes with no tile requests and retained selection. Automated tests use a shared external-tile block; basemap tests override it only with synthetic tiles/429 responses. Never use automated headless pan/zoom loops against OSM.

Commands: `pnpm build`; `NEXT_PUBLIC_BASEMAP_DISABLED=true pnpm build`; focused `pnpm test:browser` with a temporary configuration using port 4174 and the four sizes above (the existing port 4173 preview was unresponsive). Final static checks, full Jest suite and review are recorded in the task completion report.

O2's provider decision and local integration are resolved. Production deployment, host-header verification and other Stage 1 release gates remain separate work.
