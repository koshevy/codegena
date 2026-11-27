---
status: proposed
date: 2026-10-19
decision-makers: Codegena project maintainers
---

# Lay out generated file groups with ELK

## Why

Generated files have different heights, and import edges form connected and
disconnected regions. The previous layout adapter needed a second pass to
separate containers that its centering step placed too close together.

## Decision

> [!IMPORTANT]
> **Use ELK's layered layout for file containers. Keep declaration placement
> deterministic within each file and keep coordinates out of `GraphPayload`.**

- **📁 Files:** ELK **MUST** receive each container's measured width and height and the
  `import` edges. Its left-to-right ranks reflect import direction. Use ELK's
  `SIMPLE` node-placement strategy so a file that fans out to many branches
  stays near the vertical center of its generated files.
- **🗂️ Directories:** OpenAPI directories join the file layout through
  `placement` edges. Their expansion changes the ELK layout.
  - **Visibility:** The virtual root stays open; other directories start
    collapsed. Expanding one reveals its direct children while deeper
    directories stay collapsed. Collapsing it also clears the expansion state
    of its descendants.
  - **Selection:** A directory card can be selected. Its separate expand button
    changes visibility without changing selection.
  - **State ownership:** An embedding view **MAY** control expanded directory
    IDs to coordinate graph and list actions. A standalone graph owns them
    locally.
  - **Order:** Directory graphs send alphabetically ordered directories, then
    files, to ELK and preserve that order as directories open. File-only graphs
    keep ELK's crossing-minimizing order.
  - **Ranks:** Directory graphs use source-based longest-path layering. A root
    file connected to deeper imports stays beside its first-level siblings in
    the tested OpenAPI topology.
  - **Compatibility:** JSON Schema graphs keep their file-only layout.
- **🎯 Viewport:** After a directory's new layout arrives, animate the viewport
  to that directory without changing the current zoom.
  After bulk expansion or collapse, fit the completed graph into the viewport.
  Individual directory toggles keep their local centering.
  Revealing a declaration inside collapsed directories **MUST** open each
  ancestor before focusing the declaration in the completed layout.
- **📏 Clearance:** Reserve a small margin around each file in ELK's input
  dimensions. React Flow renders the actual dimensions, leaving room between
  neighboring containers without a second position-correction pass.
- **🧩 Declarations:** Child nodes **MUST** stay in source order inside the file. The
  `reference` edges remain visible but **MUST NOT** reorder those declarations.
- **⏳ Async boundary:** A completed layout **MUST** apply only to the graph that
  requested it. Mount React Flow once positions are ready so its initial
  `fitView` measures the final layout; selection changes do not rerun ELK.
  The graph renderer owns ELK. The file list and graph share selection rules
  through `@codegena/graph-core`.

## Trade-offs

- **✅ Good:** ELK handles variable-size, disconnected, and cyclic file graphs
  while the payload remains usable by non-React consumers.
- **⚠️ Cost:** Initial rendering waits for layout. The bundled ELK algorithm
  runs in the browser; a worker is an option if measured graph sizes later
  justify the extra build and lifecycle complexity.

## Alternatives

- **Keep `react-flow-auto-layout`:** Retains the spacing correction pass and
  its sensitivity to differing file heights.
- **Lay out every declaration with ELK:** Adds work but does not improve the
  required source-order stack inside each file.

## Where to look

[Flow node creation](../src/lib/codegena-graph-view/flow-elements/create-flow-nodes.ts)
measures file containers;
[ELK layout](../src/lib/codegena-graph-view/flow-elements/layout-graph-containers.ts)
positions them; [the hook](../src/lib/codegena-graph-view/flow-elements/use-flow-nodes.ts)
owns the asynchronous result.

## Verification

- [ ] Graph UI tests pass for import direction, non-overlap, and unchanged
  payload nodes.
- [ ] Graph UI builds and lints; composed Playground graph interactions pass
  their browser tests.
