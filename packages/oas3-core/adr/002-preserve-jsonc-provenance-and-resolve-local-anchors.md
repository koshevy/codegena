---
status: proposed
date: 2026-10-14
decision-makers: Codegena project maintainers
---

# Preserve JSONC provenance and resolve local anchors

## Why

Convertors need one source-aware lookup interface. References must reach the right schema while retaining a location for warnings and generated declarations. `$dynamicAnchor` declarations were previously omitted until local anchors were indexed for reference conversion.

## Decision

> [!IMPORTANT]
> **`ActiveJsoncTree` owns source lookup and local anchor indexing; converted nodes retain the originating reconstructed value.**

- **🌳 One parsed tree:** [`ActiveJsoncTree`](../transitive-parser/active-jsonc-tree/active-jsonc-tree.ts) accepts a path or loaded text/source ID.
  - It parses JSONC, reconstructs values once, and exposes data, syntax nodes, paths, and source identity.
  - Its [file reader](../transitive-parser/active-jsonc-tree/file-reading-adapter.ts) handles path input. The default reads synchronously through Node.js 22+; callers in other runtimes can supply an adapter without changing the options contract.
  - Invalid syntax raises `JsonParseError` before conversion.
  - Optional `getDataAs` lookups return `undefined` without constructing a parse error for a missing path.
- **⚓ Local anchors:** Valid `$anchor` and `$dynamicAnchor` names **MUST** be indexed before convertors run. `getAllAnchors` and `getAnchor` expose them. Data inside `const`, `default`, `enum`, or `examples` **MUST NOT** be treated as an anchor; malformed names produce a warning.
- **🔗 Reference conversion:** [`SchemaConvertorRef`](../transitive-parser/schema-convertors/schema-convertor-ref.ts) uses nested conversion for `$ref` and supported `$dynamicRef` forms.
  - Local dynamic anchors use `getAnchor`; JSON Pointer forms use the pointer path.
  - An optional resolver handles external files.
  - Unresolved anchors **MUST** warn and yield a usable fallback, not a fabricated target.
- **📍 Provenance:** Every converted node keeps `source`. UI or graph consumers project a small location value instead of serializing the potentially recursive node graph.

**Supported boundary:** local static/dynamic anchors, local paths, JSON Pointer-style `$dynamicRef`, recursive references, and optional external-file resolution. This is **not** full dynamic-scope rebinding across nested resources or external anchor indexing. Dotted property-name handling during anchor indexing is outside this contract.

## Trade-offs

- **✅ Good:** A declaration or diagnostic can trace back to the source schema without reparsing text.
- **⚠️ Cost:** Source-aware nodes are richer and may be recursive; transport-friendly views need an explicit projection.

## Alternative

- **Resolve from plain values and search text later:** Repeated keys and nested references make source mapping unreliable.

## Verification

[Tree tests](../transitive-parser/active-jsonc-tree/active-jsonc-tree.spec.ts) cover anchor lookup and malformed names. [Parser tests](../transitive-parser/extract-transitive-nodes-from-schema.spec.ts) cover recursive and unresolved references; [reconstruction tests](../transitive-parser/reconstruct-jsonc-value/reconstruct-jsonc.spec.ts) protect provenance.

- [ ] Local and recursive references retain source locations; malformed or unresolved targets have the documented warning/fallback.
- [ ] OAS3 Core tree, reconstruction, parser, and relevant Nx checks pass after a lookup change.

The [reconstruction decision](001-reconstruct-jsonc-into-source-aware-values.md) defines the values held by this tree; the [graph-payload decision](../../../adr/004-use-framework-neutral-graph-payload.md) defines their downstream projection.
