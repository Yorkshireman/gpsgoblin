# Bramble — finalised light and dark themes

Owner decision, 18 September 2026: Bramble light and dark are the finalised
colour palettes chosen for implementation. These are local previews; production theme configuration has not yet
been changed. Preserve Source Sans 3, Fraunces and all existing typography.

Owner amendment, 18 September 2026: light-mode measurement selections use pale
blue (`#DBEAFE`) with dark blue text and actions (`#173DA6`), replacing the
original berry treatment. Dark-mode selection colours are unchanged. The
historical previews below predate this amendment.

## Exact palettes

| Preview key         | Role                                   | Selected light | Selected dark |
| ------------------- | -------------------------------------- | -------------- | ------------- |
| `page`              | Page background on homepage and viewer | `#EBEEDA`      | `#151D17`     |
| `panel`             | Cards and panels                       | `#FFFEF4`      | `#202B22`     |
| `ink`               | Main text                              | `#18291C`      | `#EEF3E4`     |
| `muted`             | Secondary text                         | `#48533B`      | `#CBD5BF`     |
| `border`            | Borders and dividers                   | `#A9B38C`      | `#667C5E`     |
| `mutedBorder`       | Decorative dividers and chart grid     | `#A9B38C`      | `#4C6048`     |
| `accent`            | Actions and chart lines                | `#254E24`      | `#B9D98B`     |
| `soft`              | Subtle action backgrounds              | `#D4E6AF`      | `#2F432B`     |
| `hover`             | Stronger action backgrounds            | `#B8D383`      | `#405834`     |
| `contrast`          | Text on solid green actions            | `#FFFFFF`      | `#172314`     |
| `selected`          | Selected measurement background        | `#DBEAFE`      | `#20344A`     |
| `selection`         | Selected measurement text and actions  | `#173DA6`      | `#BEDBFA`     |
| `selectionContrast` | Text on solid blue actions             | `#FFFFFF`      | `#15283D`     |
| `routeColour`       | Map route and markers                  | `#254E24`      | `#254E24`     |

The dark version uses forest-toned surfaces and warm ivory text instead of
pure black and white. Fresh moss accents keep controls and charts visible;
quiet blue information panels distinguish selected readings and possible stops. Bright solid buttons need
dark text, unlike the white text on solid buttons in the light theme.

Both modes use the same deep green map route (`#254E24`), distinct from the
brighter moss chart line in dark mode and visible against the usual light basemap. Both retain white casing and marker outlines.
Map tiles are not recoloured or replaced by a dark basemap.

## Preview links

With the static export available and `pnpm colours:preview` running:

- [Light homepage](http://127.0.0.1:4192/?colours=bramble)
- [Light viewer](http://127.0.0.1:4192/tools/gpx-file-viewer?colours=bramble)
- [Dark homepage](http://127.0.0.1:4192/?colours=bramble-dark)
- [Dark viewer](http://127.0.0.1:4192/tools/gpx-file-viewer?colours=bramble-dark)

The gallery compares light and dark together. Each preview fixes its own mode
without writing a shared mode preference that would change other tabs.
See the [shared mapping](README.md#palette-mapping) for the Chakra colour roles.
`contrast` supplies green/teal contrast text and `fg.inverted`;
`selectionContrast` supplies blue-palette contrast text. Existing warning,
error and neutral palettes use Chakra's defaults for the respective mode.

## Verification

Chrome checks covered both modes at 1440 × 900, 1280 × 720, 390 × 844 and
375 × 667: navigation, import, keyboard and mouse/touch chart selection,
map markers and phone map dialogs. Page backgrounds matched across homepage
and viewer; opposite system preferences did not override the preview mode.
Dark corrupt-file and missing-readings states were also inspected at 390 × 844.

Dark text contrast ratios are 12.99:1 for primary text on panels, 9.66:1 for
secondary text on panels, 6.82:1 for green text on subtle green actions,
8.90:1 for blue text on selection panels and 10.38:1 for text on solid green
actions. Control borders have 3.22:1 contrast against panels; decorative grid
lines are more subdued. These spot checks are not a full accessibility audit.
External map requests were blocked; live basemap contrast remains unverified.

## Adoption boundary

The palette choices are finalised. Production adoption requires normal Chakra light/dark semantic tokens and appropriate action,
information and success colour roles. Preserve pale blue measurement selections in light mode and blue information/stop
panels in dark mode. The preview reuses existing palette roles; implementation
should distinguish these selection roles from semantic information and success
states. Imp remains [saved separately](imp.md) as a possible future default
or selectable theme. No theme-picker feature is implemented.

Production adoption is tracked in [issue #39](https://github.com/Yorkshireman/gpsgoblin/issues/39).
