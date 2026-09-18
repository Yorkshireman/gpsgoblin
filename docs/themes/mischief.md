# Mischief — saved light theme

Saved on 18 September 2026 for possible future use. This is the final preview
the owner liked, not the selected production theme. The active comparison
continues with Woodland and Bright trail.

## Palette

| Preview key | Role                                                | Colour    |
| ----------- | --------------------------------------------------- | --------- |
| `page`      | Page background, identical on homepage and viewer   | `#EDF2F7` |
| `panel`     | Cards and panels                                    | `#FFFFFF` |
| `ink`       | Main text                                           | `#3E3143` |
| `muted`     | Secondary text                                      | `#6E5F6E` |
| `border`    | Neutral borders and dividers                        | `#DBD0D7` |
| `accent`    | Plum actions, chart lines and focus rings           | `#684171` |
| `soft`      | Subtle plum action backgrounds                      | `#EDE3EF` |
| `hover`     | Stronger plum backgrounds                           | `#E1CEE3` |
| `selected`  | Information and selected-measurement backgrounds    | `#EDF3F9` |
| `selection` | Information text, selection actions and focus rings | `#385E82` |

The character comes from muted plum against pale blue. Keep information
panels quiet and recognisably blue. White panels provide separation from the
page background. Do not restore the earlier peach information panel, pinker
plum accents or lavender page background.

## Typography and scope

Preserve Source Sans 3 for body text and Fraunces for headings, including all
existing sizes, weights, spacing, optical sizing and variation settings. This
candidate changes colours only; it does not introduce a different layout or a
dark theme.

## Reopen the saved preview

The `mischief` palette remains in `scripts/previewColours.mjs` but is hidden
from the comparison gallery. With the static export available and
`pnpm colours:preview` running, open:

- [Saved homepage](http://127.0.0.1:4192/?colours=mischief)
- [Saved viewer](http://127.0.0.1:4192/tools/gpx-file-viewer?colours=mischief)

## Mapping for future implementation

The preview overrides Chakra CSS variables. To adopt the theme, move these
values into normal Chakra light-mode theme configuration rather than relying
on the preview server.

- `bg` and `bg.panel` use `panel`; `bg.subtle` and `bg.muted` use `page`.
  `bg.emphasized` uses `border`, and `bg.inverted` uses `ink`.
- `fg` uses `ink`; `fg.muted` and `fg.subtle` use `muted`.
- `border`, `border.muted` and `border.subtle` use `border`;
  `border.emphasized` uses `muted`.
- The existing green and teal action palettes use `accent` for `fg`, `solid`,
  `border`, `focusRing`, `600` and `700`; `soft` for `subtle`; `hover` for
  `muted` and `emphasized`; and white for `contrast`.
- The existing blue palette uses `selection` for those accent roles,
  `selected` for `subtle`, `border` for `muted` and `emphasized`, and white
  for `contrast`.
- Page backgrounds use `bg.muted`; homepage cards use `bg.panel`.

The preview retains the current green map route lines and markers, original
basemap tiles, and warning/error palettes. These are preview limitations, not
decisions to recolour all success states plum. Review semantic status colours,
contrast and routes against a live basemap before adopting the theme.

The saved candidate was checked in Chrome at 1440 × 900, 1280 × 720,
390 × 844 and 375 × 667, including file import, keyboard chart selection and
mouse/touch selection. Backgrounds matched between homepage and viewer.
External map requests were blocked; live basemap appearance and physical
devices were not verified.
