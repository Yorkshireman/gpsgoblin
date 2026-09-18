# Imp — saved light theme

Saved on 18 September 2026. Preserved alternative; Bramble was chosen instead.
This is an exploration record, not a decision to adopt a production theme.

The owner may return to Imp later, either as the default or as a selectable
theme. A user-facing theme picker has not been agreed or implemented. Keep
this palette intact while exploring Bramble dark mode.

## Exact palette

| Preview key   | Role                                   | Colour    |
| ------------- | -------------------------------------- | --------- |
| `page`        | Page background on homepage and viewer | `#E1EAF5` |
| `panel`       | Cards and panels                       | `#FFFFFF` |
| `ink`         | Main text                              | `#21132F` |
| `muted`       | Secondary text                         | `#51435F` |
| `border`      | Borders and dividers                   | `#AAA0B8` |
| `accent`      | Actions, chart lines and focus rings   | `#542080` |
| `soft`        | Subtle action backgrounds              | `#E6D5F5` |
| `hover`       | Stronger action backgrounds            | `#CFB1E8` |
| `selected`    | Information and selection background   | `#DCEAFE` |
| `selection`   | Information and selection text         | `#174C98` |
| `routeColour` | Map route and markers                  | `#542080` |

## Reopen the original

With the static export available and `pnpm colours:preview` running:

- [Homepage](http://127.0.0.1:4192/?colours=imp)
- [Viewer](http://127.0.0.1:4192/tools/gpx-file-viewer?colours=imp)

The palette remains under `imp` in `scripts/previewColours.mjs`.
See the [shared palette mapping](README.md#palette-mapping) to implement these
colours through Chakra later. Preserve Source Sans 3, Fraunces and all existing
typography and layout. Light mode only.

The map route and selected marker use the saved violet colour, with white casing and outlines.
Warning/error palettes and map tiles remain unchanged. Chrome checks covered
1440 × 900, 1280 × 720, 390 × 844 and 375 × 667, imports and chart selection.
External map requests were blocked; live basemap contrast and physical devices
remain unverified.
