# Saved colour themes

Bramble light and dark are the finalised palettes chosen for implementation. Production theme configuration has not yet been changed.
Keep Source Sans 3, Fraunces, type sizes, weights, spacing and layout unchanged.

- [Mischief](mischief.md): muted plum and pale blue.
- [Imp](imp.md): saved stronger violet and blue alternative.
- [Bramble](bramble.md): finalised light and dark palettes.
- [Woodland](woodland.md): moss, cream and berry; preserved original.
- [Bright Trail](bright-trail.md): petrol teal, mint and lime; preserved original.

The active comparison shows Bramble light and dark. All saved alternatives
remain accessible through their direct preview links.

## Palette mapping

Exact values are in each theme record. Optional `mutedBorder` overrides
`border.muted` and `border.subtle` for decorative lines in dark Bramble. The local server maps preview keys to
Chakra CSS variables as follows:

| Preview key              | Chakra roles                                                  |
| ------------------------ | ------------------------------------------------------------- |
| `page`                   | `bg.subtle`, `bg.muted`, page background                      |
| `panel`                  | `bg`, `bg.panel`, homepage cards                              |
| `ink`                    | `fg`, `bg.inverted`                                           |
| `muted`                  | `fg.muted`, `fg.subtle`, `border.emphasized`                  |
| `border`                 | `border`, `border.muted`, `border.subtle`, `bg.emphasized`    |
| `accent`                 | Green/teal `fg`, `solid`, `border`, `focusRing`, `600`, `700` |
| `soft`                   | Green/teal `subtle`                                           |
| `hover`                  | Green/teal `muted`, `emphasized`                              |
| `selection`              | Blue `fg`, `solid`, `border`, `focusRing`, `600`, `700`       |
| `selected`               | Blue `subtle`                                                 |
| `routeColour` (optional) | `--gpsgoblin-route-colour` for map route and markers          |

Saved light palettes use white `contrast` text. Dark Bramble uses its
`contrast` value for green/teal and `fg.inverted`, and `selectionContrast`
for the blue palette. Blue `muted` and `emphasized`
use `border`. If `routeColour` is absent, the map retains its usual Chakra
green. These mappings describe the exploration server; adopting a theme
requires normal Chakra theme configuration, review of semantic status colours
and contrast, and live basemap checks. Both Bramble palettes are finalised; production implementation is separate.
