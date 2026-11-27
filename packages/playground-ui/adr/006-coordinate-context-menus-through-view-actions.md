---
status: proposed
date: 2026-10-15
decision-makers: Codegena project maintainers
---

# Coordinate context menus through view actions

## Why

Tree and graph show the same generated entities. Separate right-click policies could drift on selection, Shift behavior, warnings, and details navigation. Monaco still needs its own editor menu.

## Decision

> [!IMPORTANT]
> **One neutral menu renders actions; feature owners decide what each action does.**

- **🧩 Reusable popup:** [`ContextMenu`](../../ui-unified/menus/context-menu/) supports optional heading, uniform icons, disabled items, and dismissal. It owns no graph selection or navigation.
  - Button and glyph menus **MUST** use `anchor`; `anchorOrigin` and `transformOrigin` align the menu to an edge. The top-header appearance menu aligns right.
  - Viewport-coordinate menus **MUST** use `position`. A caller **MUST NOT** supply both `anchor` and `position`.
- **🪝 Action ownership:** Components prepare their menu items and toolbar choices in adjacent, focused hooks. The shared popup and toolbar render those choices; feature owners supply state and callbacks. Keep a pure item factory when an event supplies the context, as with a graph-node right click.
- **🔘 Exclusive choices:** Controlled options highlight the chosen row and expose `menuitemradio` semantics without a visible radio control. `ThemeModeMenu` defines Light/Dark/System; Playground owns the chosen mode.
- **🌳 Shared node actions:** Tree and graph offer select/deselect, select all declarations, reveal warnings, and two details scopes. Declaration menus offer Reveal in specification only while the source panel is hidden.
  - [Shared item construction](../playground/generated-output/create-node-context-menu-items.tsx) keeps wording and policy aligned; each view updates its own explicit selection.
  - Playground owns the cross-view actions that select a target, open a panel, and navigate to a source or generated file.
  - Disable actions that make no change.
- **🧭 Surface precedence:** Header menus use actions from their owning region. Generated-output background offers selection clearing and directory collapse in both graph and list views. A Playground fallback menu toggles source, details, and graph/list mode. Specific menus **MUST** stop propagation and take precedence without making `ContextMenu` aware of Playground.
- **📂 Directory actions:** Generated-output headers and backgrounds offer Expand all and Collapse all when directories exist. Their enabled state follows visible rows, so an expanded descendant under a collapsed parent does not make Collapse all actionable. A directory node offers the opposite action for its current state; the view owns the expansion change.
- **📋 Warning copy:** A warning card offers Copy warning; its list offers Copy all displayed warnings. The card stops the event from opening the list menu. Formatting and notification feedback stay outside the generic popup.
- **⌨️ Editor boundary:** Suppress the browser menu and ordinary text selection on the Playground surface. Preserve Monaco's custom menu and selectable editor text; warning messages remain selectable.

**Shift selection:** Select adds; deselect removes only its target. A file and its sole declaration act as one pair; deselecting a file clears its nested declarations. Without Shift, select focuses one item and deselect clears selection. Opening the menu alone changes nothing.

## Trade-offs

- **✅ Good:** Graph, tree, glyphs, and headers share presentation while retaining their own state ownership.
- **⚠️ Cost:** Views need small adapters from menu actions to local selection behavior.

## Alternatives

- **Duplicate whole menus:** Fewer shared files, but action behavior diverges.
- **Put selection in `ContextMenu`:** Couples neutral UI to GraphPayload and Playground.
- **Browser menu everywhere:** Cannot expose feature actions and conflicts with Monaco.

## Verification

- [ ] In the comprehensive Storybook view, tree and graph menus agree on Shift selection, disabled actions, warnings, and details behavior.
- [ ] Right-click in Monaco keeps its editor menu; warning-card and list copy actions remain distinct.
- [ ] Related graph-ui and playground-ui Nx lint/build and browser checks pass.
