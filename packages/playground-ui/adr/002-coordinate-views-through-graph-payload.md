---
status: proposed
date: 2026-10-13
decision-makers: Codegena project maintainers
---

# Coordinate generated views through GraphPayload

## Why

Graph, tree, source glyphs, and file details all refer to the same declarations. Separate models or selections would make them disagree, especially during multi-selection and cross-view reveal.

## Decision

> [!IMPORTANT]
> **Use `GraphPayload` IDs and locations across generated views; Playground owns cross-view selection and navigation.**

- **Feature imports.** Each production feature has a secondary entrypoint.
  Consumers **SHOULD** import the feature they use. The root entrypoint
  re-exports the feature APIs for existing consumers.
- **🔗 Shared identity:** [`Playground`](../playground/playground.tsx) passes the graph and selected node IDs to [`CodegenaGraphView`](../../graph-ui/src/lib/codegena-graph-view/) and [`GeneratedFilesList`](../generated-files-list/generated-files-list.tsx).
  - Both report graph IDs, not labels or list positions.
- **📍 Source navigation:** The tree starts collapsed and sorts files and declarations by filename and declaration name by default. Its list-only header control can switch to source-location order.
  - OpenAPI directories appear as nested tree branches above their files. Expanding a directory does not select a file or declaration. JSON Schema lists keep their former flat shape.
  - A file's source position is its earliest declaration; files without declarations follow located files. Equal positions use names for stable ordering.
  - Selecting a file expands it and reveals its first declaration in the active sort order in the schema editor.
  - Selecting a declaration navigates to `sourceLocation` (`fileName`, `line`, `col`).
  - Explicitly selecting a declaration also selects its generated-code line in the matching file card. Selecting a file sets its generated editor to line 1.
  - A source-line glyph reveals its declaration in the active generated view and scrolls details to its file. File cards do not flash during reveal; warning rows retain their warning-colored highlight.
  - A generated-code glyph reveals its declaration in the source editor, explicitly selects and centers the graph declaration, and implicitly selects its containing file, including when the file has other declarations. Playground keeps effective and explicit IDs separate for this handoff, and the external selection does not report another selection change to Playground.
  - Graph reveal opens collapsed ancestor directories before centering the selected declaration.
- **🧭 Selection and scope:** Graph/list switches **MUST** preserve selected IDs.
  - The list sort mode stays with Playground's header preferences; an older saved layout without that field starts in filename order.
  - The file list and graph use the same selection rules from `graph-core`.
    Graph rendering and layout stay in `graph-ui`.
  - Details sorts files alphabetically and may show selected or all files.
  - Selection changes preserve the chosen Show all or Show selected scope. In Show all, selecting a file scrolls to its card.
  - In Show all, a file card's icon and title select and reveal the file in the active graph or tree; Shift adds it to the selection. They are static in Show selected.
  - Selecting a directory in Show all scrolls to its first direct child file in alphabetical order.
- **⚡ Navigation state:** Shared selection and tree expansion are direct state; file and warning focus identify the current scroll target.
  - Repeating an action can focus the same target without passing numeric request counters through the component tree.
  - The local warnings shortcut calls the virtualizer's indexed scroll directly.
- **🪟 Mounted view state:** Graph and tree **MUST** stay mounted when switching modes. The inactive view **MUST** leave the focus path without collapsing its layout box, preserving tree expansion/scroll and graph pan/zoom. This state lasts only for the mounted Playground, not in browser storage.
  - Generated output owns graph directory expansion when it needs one Collapse all action across graph and tree; standalone graph views keep local expansion state.
- **📜 Virtual file details:** [`@tanstack/react-virtual`](../generated-file-details/) renders nearby file cards, a warnings heading, and warning cards in one indexed list while product UI owns the scroll container and markup.
  - Stable row IDs and measured rows support indexed file and warning reveal. File anchors support prepends, streaming, and scroll snapshots.
  - The default uses element scrolling; a caller can use window scrolling.

Generating `GraphPayload`, laying out the graph, and interpreting TypeScript AST remain outside Playground.

## Trade-offs

- **✅ Good:** Graph, tree, details, and source agree on identity and provenance; expensive generated editors mount only near the viewport.
- **⚠️ Cost:** Views translate local interactions to graph IDs. Hidden mounted views consume resources, and virtual scrolling needs stable IDs and measured rows.
- **⚠️ Upstream dependency:** Missing source locations or changed node identity must be repaired in the payload producer, then reflected across consumers.

## Alternatives

- **Separate view models:** Adds synchronization and duplicated selection state.
- **Navigate from generated text:** A generated line is not a JSON Schema location.
- **Unmount inactive views:** Saves inactive rendering but requires separate expansion, scroll, and viewport snapshots.

## Verification

- [ ] Graph and tree select the same ID and source position; mode switches retain selection, tree state, and graph viewport.
- [ ] File and source-glyph reveals open the expected declaration and details card, even offscreen.
- [ ] Virtual file stories cover nearby rendering, prepends, and restored position; related Nx and browser checks pass.

The [graph-payload decision](../../../adr/004-use-framework-neutral-graph-payload.md) owns the upstream model.
