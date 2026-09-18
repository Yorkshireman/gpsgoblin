# Bright Trail — saved light theme

Saved on 18 September 2026. Saved original; hidden from the active comparison.
This is an exploration record, not a decision to adopt a production theme.

## Exact palette

| Preview key | Role                                   | Colour    |
| ----------- | -------------------------------------- | --------- |
| `page`      | Page background on homepage and viewer | `#F4F9F5` |
| `panel`     | Cards and panels                       | `#FCFEFB` |
| `ink`       | Main text                              | `#213E3D` |
| `muted`     | Secondary text                         | `#516A60` |
| `border`    | Borders and dividers                   | `#C9DFCF` |
| `accent`    | Actions, chart lines and focus rings   | `#146361` |
| `soft`      | Subtle action backgrounds              | `#DEF0E5` |
| `hover`     | Stronger action backgrounds            | `#BDE2D0` |
| `selected`  | Information and selection background   | `#EAF3BC` |
| `selection` | Information and selection text         | `#506218` |

## Reopen the original

With the static export available and `pnpm colours:preview` running:

- [Homepage](http://127.0.0.1:4192/?colours=trail)
- [Viewer](http://127.0.0.1:4192/tools/gpx-file-viewer?colours=trail)

The palette remains under `trail` in `scripts/previewColours.mjs`.
See the [shared palette mapping](README.md#palette-mapping) to implement these
colours through Chakra later. Preserve Source Sans 3, Fraunces and all existing
typography and layout. Light mode only.

The original preview retains the existing green map route and markers; there is no map colour override.
Warning/error palettes and map tiles remain unchanged. Chrome checks covered
1440 × 900, 1280 × 720, 390 × 844 and 375 × 667, imports and chart selection.
External map requests were blocked; live basemap contrast and physical devices
remain unverified.
