---
status: proposed
date: 2026-11-14
decision-makers: Codegena project maintainers
---

# Order accent tones by contrast in both themes

## Why

Switching themes should preserve a color token's contrast role. Previously,
`secondary.dark` was dark purple in both themes: legible on a light page, but
subdued on a dark page. Callers had to change tone names to retain emphasis.

## Decision

> **Accent `dark` and `light` tokens describe contrast against the theme's page
> background, rather than absolute brightness.**

- **🎨 Stronger tone:** `primary`, `secondary`, `info`, `success`, `warning`,
  and `error` **MUST** use `dark` for the higher-contrast tone and `light` for
  the softer tone in both themes.
- **🌓 Fixed light surfaces:** Each accent **MUST** provide `lightSurface`
  for a deliberately pale fill and `onLight` for a darker accent foreground.
  These roles stay the same in both page modes. They do not guarantee a text
  accessibility ratio on every background; check the actual text and surface.
- **🧩 Consumers:** Styles **MUST** read the token for the surface they render
  on. They **MUST NOT** inspect `palette.mode` to swap accent tone names.
  Use `dark` for emphasis against the page, `text` on the accent's `surface`,
  and `contrastText` on `main`. A pale panel that stays pale in both themes
  uses `onLight`. Use `lightSurface` when the fill itself must stay pale,
  such as an expanded folder icon.
- **🎨 Ownership:** Both palette definitions own these values. Keep the
  meaning of every token consistent across themes; a component must not
  compensate for a missing role with its own palette selector.

## Consequences

- **✅ Predictable emphasis:** The same tone name has the same contrast role
  against the page in either theme.
- **⚠️ Framework behavior:** MUI's contained-button hover can brighten in dark
  mode because it uses the `dark` token. Text still uses `contrastText`.
- **⚠️ Migration:** A caller relying on absolute brightness must be reviewed.
  A token swap alone does not guarantee contrast on an unrelated colored panel.

## Verification

Palette tests compare accent contrast against each theme's paper background
and verify the fixed-surface foreground roles. Check the
landing's light and dark menus, headings, editors, and feature sections, then
run related UI browser suites. Changed existing images require human approval.

See the [shared toolkit decision](../../../adr/005-standardize-react-ui-toolkit.md).
