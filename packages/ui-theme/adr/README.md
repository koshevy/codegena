# UI theme decisions

These proposed records explain shared palette behavior. Requirement words use
the [repository convention](../../../adr/README.md#requirement-language).

## Reading order

1. [Order accent tones by contrast in both themes](001-order-accent-tones-by-contrast.md)
   — keep accent emphasis consistent when a view changes color scheme.

The [shared toolkit decision](../../../adr/005-standardize-react-ui-toolkit.md)
defines MUI, typography, and component ownership.

## Verification

Palette tests check page-relative contrast ordering and fixed-surface
foreground roles for all six accent colors. The palette stories expose both themes. Landing browser cases exercise theme
selection, system preference changes, persistence, and the desktop theme column.
