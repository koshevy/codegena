---
status: proposed
date: 2026-10-31
decision-makers: Codegena project maintainers
---

# Use MUI tooltips for hover titles

## Why

Browser-native `title` popups vary by platform. They cannot share the
Codegena theme and are difficult to inspect in an interaction test. The UI
already uses Material UI for controls and themed overlays.

## Decision

> [!IMPORTANT]
> **Hover explanations in Codegena React UI MUST use
> `@mui/material/Tooltip` by default.** Interactive controls still need their
> own accessible name; a tooltip does not replace it.

- **🎨 One presentation:** Tooltip text follows the active MUI theme in light
  and dark modes.
- **🏷️ Name the target:** A file, directory, or declaration tooltip identifies
  the entity. An action tooltip describes what clicking does.
- **♿ Keep the control usable:** Icon buttons and other actions MUST expose a
  meaningful `aria-label` or visible text. Tooltip text MAY add context.
- **🧪 Check the visible result:** Storybook and Playwright can inspect the
  tooltip through its `tooltip` role after a real hover.

Native `title` remains appropriate for non-React content that MUI does not
own, such as browser-managed editor surfaces.

## Trade-offs

- **✅ Good:** Hover copy is consistent with the shared theme and observable
  in browser tests.
- **⚠️ Cost:** Each React hover target needs a Tooltip wrapper and a suitable
  element to anchor it.

## Where this applies

- **Implementation:** [Graph nodes](../packages/graph-ui/src/lib/codegena-graph-view/)
  and [Playground controls](../packages/playground-ui/src/lib/).
- **Related decision:** [Accessible browser interactions](009-make-ui-interactions-accessible-and-testable.md)
  defines the independent accessible-name requirement.

## Verification

- [ ] Hovering a title shows an MUI tooltip with the intended entity or action.
- [ ] The target keeps a distinct accessible name and keyboard behavior.
