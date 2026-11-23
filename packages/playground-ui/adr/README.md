# Playground UI architecture decisions

Uppercase requirement terms in these records use the [repository ADR index's RFC 2119 convention](../../../adr/README.md#requirement-language). Descriptions, examples, and trade-offs do not add requirements.

These records capture the architecture that emerged while building `@codegena/playground-ui`. They describe the intended behavior, compare it with the current code, and preserve the alternatives explored during development. They are **proposed** records for maintainer review, not claims of a separate approval event.

## How the decisions are grouped

- **Layout and navigation:** three resizable regions and shared graph IDs coordinate the source, graph/tree, and generated-file views.
- **Code and diagnostics:** Monaco presents source and output, while source-aware logs connect warning controls to the right locations.
- **Component ownership:** feature components and reusable controls follow a one-directional hierarchy.
- **Generated exports:** browser-side archives include the complete graph output, independent of view scope.

## Reading order

The zero-padded filenames follow this sequence from page layout to component ownership.

1. [Compose the playground from three resizable regions](001-compose-three-resizable-regions.md) — layout ownership, visibility, resize behavior, and saved preferences.
2. [Coordinate generated views through GraphPayload](002-coordinate-views-through-graph-payload.md) — one model for the graph, tree, selection, and source navigation.
3. [Use themed Monaco editors for source and generated code](003-use-themed-monaco-editors.md) — editor roles, gutter integration, and theme behavior.
4. [Route diagnostics through the graph payload](004-route-diagnostics-through-graph-payload.md) — warnings at source lines, generated declarations, and file details.
5. [Keep feature component dependencies one-directional](005-keep-feature-components-one-directional.md) — ownership boundaries between the Playground feature, independent views, and shared UI.
6. [Coordinate context menus through view actions](006-coordinate-context-menus-through-view-actions.md) — one menu presentation and action vocabulary across graph, tree, and headers while preserving Monaco behavior.
7. [Package generated files in the browser](007-package-generated-files-in-browser.md) — ZIP all generated files once and reuse the result for direct and notification-driven downloads.
8. [Share appearance with the embedding application](008-share-appearance-and-host-navigation.md) — one theme for loading and ready views, with optional host navigation.

The [repository ADRs](../../../adr/README.md) define the graph payload and shared UI toolkit. The [Storybook and Playwright ADR](../../../adr/008-test-composed-ui-through-storybook-and-playwright.md) explains browser regression coverage for composed UI. The [React code style rules](../../../CODE_STYLE.md#react-rules) supply the detailed implementation rules for component ownership. Read these with the relevant local record before changing a shared contract.

## What the implementation established

- The fixed three-column page and details drawer gave way to resizable regions with persistent manual visibility.
- Graph and tree selection converge on `GraphPayload` IDs; source markers use Monaco's glyph area after an external marker strip caused line-alignment problems.
- Warnings can be reached from source lines, generated declarations, and file details without making those views own separate diagnostic models.
