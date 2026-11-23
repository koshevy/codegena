---
status: proposed
date: 2026-10-13
decision-makers: Codegena project maintainers
---

# Use a framework-neutral graph payload with source provenance

## Why

Generated files import files; declarations reference declarations. Browser views need both relations, generated text, source locations, and logs. Full transitive nodes can be recursive, while React Flow positions would bind the data contract to one layout engine.

## Decision

> [!IMPORTANT]
> **`graph-core` projects `UltimateParserVisitorResultGroup` values into a framework-neutral `GraphPayload`; `graph-ui` owns layout.**

- **📁 Generated paths:** OpenAPI output with nested paths adds a virtual directory at each level, including a root `.`. A file belongs to its containing directory; each grouped result remains a child declaration. Directory nodes contain a path and label but no source schema location. Plain JSON Schema graphs keep their existing file/declaration shape.
- **🔗 Three edge kinds:** Directory containment produces `placement` edges. `relatedGroups` produce `import` edges between files; result dependencies produce `reference` edges between declarations. When each file contains one declaration and an import already connects the files, the duplicate reference edge is omitted, including for namespaces. References remain when an import cannot represent the declaration relationship.
- **📍 Source provenance:** Item data includes rendered text, declaration metadata, `sourceLocation` as `{ fileName, line, col }`, and logs attributed to its source or descendants.
- **🧾 Log ownership:** `createGraphPayload(groups, logs)` accepts the `CollectedLog[]` contract from `oas3-core/logger`. Graph Core serializes those records into payload logs and associates them with declarations; it **MUST NOT** define a second log-input contract.
- **🔎 Generated position:** An item gets its own `line` (one-based) and `col` (zero-based) when its `keySnippet` is found in the completed file text. Both fields are absent when the declaration cannot be found.
- **🎨 View-owned layout:** [`graph-core`](../packages/graph-core/src/create-graph-payload/create-graph-payload.ts) **MUST NOT** supply layout coordinates. [`graph-ui`](../packages/graph-ui/src/lib/codegena-graph-view/flow-elements/create-flow-nodes.ts) adapts and lays out the nodes with [ELK](../packages/graph-ui/adr/001-layout-file-groups-with-elk.md).
- **Shared selection rules.** Graph and list consumers derive selection
  from `GraphPayload` in [`graph-core`](../packages/graph-core/src/selection/).
  Each consumer supplies its selection IDs and owns its state.

An item AST remains generic and available in process; it may not be JSON-serializable. Consumers sending a graph across a worker boundary **MUST** use [`mapGraphPayloadToWorkerPayload`](../packages/graph-core/src/map-graph-payload-to-worker-payload.ts) to replace AST objects before posting it. The graph payload does not own selection state.

The production [`graph-core/conversion`](../packages/graph-core/conversion/index.ts) entrypoint combines the TypeScript visitor, collected logs, and graph projection. Its worker client and handler use source text as input; each browser app owns its worker entry file so Vite and Rspack can bundle it. Fixture fetching stays in `graph-core/testing-utils`.

## Trade-offs

- **✅ Good:** Graph, tree, and details views share file/declaration identity and provenance without depending on React Flow in `graph-core`.
- **⚠️ Cost:** Producers must project source locations and diagnostics correctly; consumers must coordinate changes to identity or edge semantics.

## Alternatives

- **Full transitive nodes in UI data:** Keeps internals and cycles that views do not need.
- **React Flow data from the generator:** Avoids an adapter but fixes the contract to one UI library and layout.

## Where to look

The [node](../packages/graph-core/src/graph-payload-node.ts), [edge](../packages/graph-core/src/graph-payload-edge.ts), and [item-data](../packages/graph-core/src/graph-payload-item-node-data.ts) contracts describe the payload. [Playground decisions](../packages/playground-ui/adr/README.md) describe its consumers.

## Verification

- [ ] Graph-core tests cover IDs, parent links, all edge types, redundant-edge omission, and unchanged JSON Schema graphs.
- [ ] Source locations and logs survive projection; graph-ui renders examples without positions from graph-core.
