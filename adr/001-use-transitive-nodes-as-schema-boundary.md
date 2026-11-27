---
status: proposed
date: 2026-10-13
decision-makers: Codegena project maintainers
---

# Use transitive nodes as the schema interpretation boundary

## Why

JSON Schema mixes types, references, composition, and annotations. If each language renderer interprets those keywords, recursion and fallback rules will drift. The parser must also retain source locations for diagnostics.

## Decision

> [!IMPORTANT]
> **OAS3 Core interprets schemas; language visitors render the resulting `TransitiveNode` graph.**

- **🧩 OAS3 Core owns meaning:** Ordered [schema convertors](../packages/oas3-core/transitive-parser/extract-transitive-nodes-from-schema.ts) recognize keywords, resolve references, recurse, cache, and choose fallbacks.
- **🔗 Nodes carry context:** A [transitive node](../packages/oas3-core/transitive-node/transitive-node.ts) holds its inferred kind, nested or referred nodes, source value, annotations, and relevant options.
- **🎨 Visitors own syntax:** [`UltimateParserVisitor`](../packages/oas3-core/ultimate-parser/ultimate-parser-visitor.ts) consumes those nodes. A TypeScript visitor **MUST NOT** reinterpret raw schema keywords to decide the node's type.
- **📍 Provenance stays in memory:** Transitive nodes can contain cycles and source objects. Producers **MUST** project source locations rather than serialize the node graph for downstream views.
- **🖥️ Views consume the projection:** A UI **MUST** use generated results or graph data for declaration semantics. It **MAY** read the original JSONC for source editing, navigation, and diagnostics.

This boundary does not promise to encode every validation constraint in TypeScript or make transitive nodes directly serializable.

## Trade-offs

- **✅ Good:** Schema semantics are implemented once and can serve multiple renderers.
- **✅ Good:** Recursive relationships and source locations remain available during rendering.
- **⚠️ Cost:** A node-contract change can affect OAS3 Core, OAS3 Visitor TypeScript, and graph derivation. Convertor order also matters when wrappers reprocess a schema.

## Alternatives

- **Render from raw schemas:** Simpler for one keyword, but spreads reference and composition rules across visitors.
- **Separate model per language:** Allows local optimization, but makes semantics and diagnostics diverge.

## Where to look

The [convertor base](../packages/oas3-core/transitive-parser/schema-convertor.ts) controls recursive processing. [OAS3 Visitor TypeScript](../packages/oas3-visitor-typescript/src/typescript-parser-visitor.ts) implements the rendering side. The [package-boundary decision](002-keep-package-dependencies-one-directional.md) defines their dependency direction.

## Verification

- [ ] OAS3 Core tests cover inferred nodes, recursion, and fallbacks; visitor tests cover the resulting declaration.
- [ ] Contract changes pass the affected OAS3 Core, OAS3 Visitor TypeScript, and graph package Nx checks.
