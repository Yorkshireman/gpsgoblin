# Woodland — saved light theme

Saved on 18 September 2026. Saved original; Bramble is its bolder variation.
This is an exploration record, not a decision to adopt a production theme.

## Exact palette

| Preview key | Role                                   | Colour    |
| ----------- | -------------------------------------- | --------- |
| `page`      | Page background on homepage and viewer | `#F8F7F1` |
| `panel`     | Cards and panels                       | `#FFFEFA` |
| `ink`       | Main text                              | `#303C27` |
| `muted`     | Secondary text                         | `#62684F` |
| `border`    | Borders and dividers                   | `#D9DAC0` |
| `accent`    | Actions, chart lines and focus rings   | `#49642C` |
| `soft`      | Subtle action backgrounds              | `#E8EFCE` |
| `hover`     | Stronger action backgrounds            | `#D5E2AF` |
| `selected`  | Information and selection background   | `#F5E2ED` |
| `selection` | Information and selection text         | `#873E65` |

## Reopen the original

With the static export available and `pnpm colours:preview` running:

- [Homepage](http://127.0.0.1:4192/?colours=woodland)
- [Viewer](http://127.0.0.1:4192/tools/gpx-file-viewer?colours=woodland)

The palette remains under `woodland` in `scripts/previewColours.mjs`.
See the [shared palette mapping](README.md#palette-mapping) to implement these
colours through Chakra later. Preserve Source Sans 3, Fraunces and all existing
typography and layout. Light mode only.

The original preview retains the existing green map route and markers; there is no map colour override.
Warning/error palettes and map tiles remain unchanged. Chrome checks covered
1440 × 900, 1280 × 720, 390 × 844 and 375 × 667, imports and chart selection.
External map requests were blocked; live basemap contrast and physical devices
remain unverified.
