---
status: proposed
date: 2026-10-15
decision-makers: Codegena project maintainers
---

# Orchestrate transitive-node rendering through UltimateParser

## Why

A declaration can refer to itself or be reached by several paths. Output may place declarations together or in separate files. If each language visitor independently manages traversal, cycle detection, and grouping, those behaviors can diverge.

## Decision

> [!IMPORTANT]
> **[`UltimateParser`](../ultimate-parser/ultimate-parser.ts) owns language-neutral traversal. An [`UltimateParserVisitor`](../ultimate-parser/ultimate-parser-visitor.ts) owns target-language declarations, imports, fallbacks, and files.**

- **🔁 Shared traversal:** Child rendering returns through `getAnotherByTransitiveNode`. Results are cached per visitor by source, node kind, name, inline status, and optional cache key. A node found during its own construction yields a deferred result rather than infinite recursion.
- **🧹 Scoped state:** Each full render clears that visitor's cache and occurrence markers, calls `prepareToRender` if present, and omits repeated root AST objects. A top-level root cannot remain deferred.
- **📄 Output choice:** `renderAllTransitiveNodesInSingleFile` and `renderAllTransitiveNodesGrouped` **MUST** traverse the same graph, then call the visitor's corresponding grouping method. OAS3 Core **MUST NOT** choose filenames or build target-language imports.
- **🔗 Result contract:** Each result carries identifier, AST, source, dependencies, required co-location, and a `toString(): Promise<string>` renderer. Groups carry final files and declarations with the same asynchronous text contract. A dependency is different from `shouldBeGroupedWith`.

[`TypescriptParserVisitor`](../../oas3-visitor-typescript/src/typescript-parser-visitor.ts) implements this contract in OAS3 Visitor TypeScript. The public [`jsonSchemaToTypescript`](../../oas3-visitor-typescript/src/json-schema-to-typescript.ts) chooses an output mode through `UltimateParser`. OAS3 Core gains no TypeScript dependency.

## Trade-offs

- **✅ Good:** New language visitors reuse cycle handling and traversal without copying graph mechanics.
- **⚠️ Cost:** Cache identity and deferred results need recursive and grouping tests.

## Alternatives

- **Traversal in each visitor:** Repeats graph mechanics and risks divergent output modes.
- **TypeScript imports in OAS3 Core:** Crosses the language-neutral boundary.

## Verification

- [ ] [Visitor tests](../../oas3-visitor-typescript/src/typescript-parser-visitor.spec.ts) cover recursion, dependencies, and co-located helpers; [generator tests](../../oas3-visitor-typescript/src/json-schema-to-typescript.spec.ts) cover both file modes.
- [ ] OAS3 Core remains independent of TypeScript; affected OAS3 Core and OAS3 Visitor TypeScript Nx checks pass.

The [declaration-group decision](../../../adr/003-represent-output-as-declaration-groups.md) defines the output relationship; this record assigns traversal ownership.
