---
status: proposed
date: 2026-10-14
decision-makers: Codegena project maintainers
---

# Reconstruct JSONC into source-aware values

## Why

Convertors need ordinary values for keyword checks and the original JSONC syntax for references, errors, and navigation. Parsing directly to a JavaScript object loses the position and identity of nested values.

## Decision

> [!IMPORTANT]
> **Parse JSONC into an AST, then reconstruct values that retain their source.**

- **🧩 Ready-to-use data:** [`reconstructJsonc`](../transitive-parser/reconstruct-jsonc-value/reconstruct-jsonc.ts) recursively builds a `ReconstructedJsoncValue` for scalars, objects, and arrays. Objects expose reconstructed `properties`; arrays expose `items`.
- **📍 Exact provenance:** Each reconstructed value **MUST** retain its syntax `node`, `jsonPath`, and `sourceFileId`. `getOriginalFileContent()` retrieves source text without copying it to every child.
- **🗂️ Root-only index:** The flattened `jsonEntries` list stays at the root to avoid repeating it throughout the tree.
- **🔗 Parser contract:** Each [`TransitiveNode.source`](../transitive-node/transitive-node.ts) **MUST** retain the reconstructed value in memory. Consumers **MUST NOT** treat it as a serializable API payload.

[`ActiveJsoncTree`](../transitive-parser/active-jsonc-tree/active-jsonc-tree.ts) builds lookup and anchor resolution on this model.

**Known debt:** Two structurally similar `ReconstructedJsoncValue` declarations remain, in [reconstruction](../transitive-parser/reconstruct-jsonc-value/reconstructed-jsonc-value.ts) and [transitive-node](../transitive-node/reconstructed-jsonc-value.ts). They are not separate models to extend.

## Trade-offs

- **✅ Good:** Interpretation and diagnostics share source identity without later text searches.
- **⚠️ Cost:** The in-memory tree is richer than parsed JSON. Serializable consumers must project the location data they need.

## Alternative

- **Parse plain values, then search source text:** Repeated keys and nested arrays make reverse lookup ambiguous.

## Verification

- [ ] [Reconstruction tests](../transitive-parser/reconstruct-jsonc-value/reconstruct-jsonc.spec.ts) preserve values, child identity, paths, and root indexing; OAS3 Core tree tests still pass.

The [source-tree decision](002-preserve-jsonc-provenance-and-resolve-local-anchors.md) describes lookup; the [diagnostics decision](007-report-parser-errors-with-source-locations.md) describes error locations.
