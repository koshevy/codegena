---
status: proposed
date: 2026-10-13
decision-makers: Codegena project maintainers
---

# Route diagnostics through the graph payload

## Why

Warnings can relate to generated declarations, source lines, or neither at once. Independent warning stores in the graph, tree, editor, and details view would disagree on location and selection behavior.

## Decision

> [!IMPORTANT]
> **Use `GraphPayload.logs` and item `data.logs` as one diagnostic source; each view presents and navigates those logs in its own context.**

- **📍 Source lines:** Monaco glyphs and Codegena-owned diagnostic markers use each log's `jsoncNode` location. A marker starts at the line's left edge and ends after the JSONC value at the reported column, such as the full `{}` at line 271. Schema validation warnings are suppressed while JSON syntax errors remain available. Its native problem viewer offers **View in file details**, routed through the same warning action as the glyph. A declaration and warning on one line share a compact choice popover; a warning without a declaration still has a glyph.
- **🧪 Story fixtures:** Story loaders **SHOULD** convert real schemas with a conversion-scoped `CollectingLogger`, then pass `getLogs()` to `createGraphPayload`. Warning stories reflect generator diagnostics, not independently maintained warning fixtures.
- **🔔 Generated views:** File, graph, and tree items **MUST** show warning/error indicators. Warning navigation **MUST** open details and reveal the exact log through the shared virtual list's warning-row index. It preserves an already active item or selects an inactive related item.
- **✨ Reveal feedback:** A warning opened from JSON briefly blinks after scrolling. An item warning icon scrolls without that highlight and switches details to Show selected. The centered shortcut remains until a warning is at least 60% visible.
- **📋 Detail scope:** Selected-file mode derives and deduplicates item logs; Show all uses graph-wide logs, including warnings without a selected declaration. Sort by source line. One explicit selection preserves the current scope; multiple explicit selections switch to Show selected.
- **🔎 Return to source:** Clicking a warning's excerpt reveals the JSON editor at its line and column, reopening source if needed.
- **📄 Copy:** A card copies one warning; the list copies displayed warnings in order. Shared [warning utilities](../misc-ui/warning-utils/) format location, message, numbered nearby lines, and caret. Notification feedback **MUST** follow a successful clipboard write, never a failed one.

The Playground presents diagnostics; `graph-core` owns their production and source association. This is not a separate global diagnostics console.

## Trade-offs

- **✅ Good:** One warning can be found from both source and generated output, even without a generated declaration on its line.
- **⚠️ Cost:** Scope, deduplication, and viewport visibility need derived-state hooks. Nested-source attribution depends on graph-core's rule.

## Alternatives

- **Details-only list:** Hidden until selection and disconnected from the source line.
- **A store per view:** Risks disagreement about severity, identity, and location.

## Where to look

[Glyph lines](../json-editor/create-declaration-glyph-lines.ts) combine source-line actions. [Navigation](../navigation/use-playground-navigation.ts) reveals warnings. [Generated details](../generated-file-details/generated-file-details.tsx) composes the warning UI from [GraphPayloadLog](../../graph-core/src/graph-payload-log.ts).

**Known gap:** `handleRevealWarning` currently calls `handleRevealNode` even for an already selected related item, which can replace other selected IDs. Preserve multi-selection when closing this gap.

## Verification

- [ ] Shared-line and warning-only glyphs open the correct action; details scrolls to the exact sorted warning.
- [ ] Item indicators preserve selection and skip blink; source excerpts navigate to the correct JSON location.
- [ ] Show all includes graph-wide logs, and warning copy emits feedback only on success; related Nx/browser checks pass.
