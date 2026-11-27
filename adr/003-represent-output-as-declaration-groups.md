---
status: proposed
date: 2026-10-13
decision-makers: Codegena project maintainers
---

# Represent generated output as dependency-aware declaration groups

## Why

A declaration may reference another declaration, while a helper may have to share its file. A single output string cannot distinguish these relationships. Earlier separate-file output lost imports or duplicated grouped declarations.

## Decision

> [!IMPORTANT]
> **Record declaration dependencies and required co-location separately, then assemble files from those relationships.**

- **🧩 Declaration result:** [`UltimateParserVisitorResult`](../packages/oas3-core/ultimate-parser/ultimate-parser-visitor.ts) carries the finalized `identifierName`, AST, text renderer, source node, `dependencies`, and `shouldBeGroupedWith`.
- **🔎 Stable lookup:** Each result captures its own `keySnippet` before formatting. It identifies that declaration in the generated file, including when a group contains several declarations.
- **🔗 Two relations:** `dependencies` means one declaration uses another. Items in `shouldBeGroupedWith` **MUST** share a file; that relation **MUST NOT** generate an import between them.
- **📄 File group:** `UltimateParserVisitorResultGroup` carries its final filename, declarations, source file, text, and related groups. Overlapping groups are merged without emitting a declaration twice.
- **⏳ Text rendering:** Both declaration and group `toString()` methods return `Promise<string>`. Consumers await the final text; the AST and dependency graph remain available synchronously.
- **🛣️ Import paths:** In separate-file mode, [OAS3 Visitor TypeScript](../packages/oas3-visitor-typescript/src/typescript-parser-visitor.ts) **MUST** import dependencies outside the group and apply `transformFilePath` before calculating relative paths. Single-file mode emits all declarations in `types.ts`.
- **📂 OpenAPI paths:** In OpenAPI separate-file output, operation reachability
  determines where referenced JSON Schema declarations belong. Directory
  placement and redundant-folder removal happen after grouping and before path
  transformation, so every import uses the final file locations.

[`UltimateParser`](../packages/oas3-core/ultimate-parser/ultimate-parser.ts) orchestrates traversal and grouping; the language visitor owns import syntax. Imports are not inferred by searching generated text, and a dependency need not become a separate file.

## Trade-offs

- **✅ Good:** Both output modes share one declaration graph and stable names.
- **✅ Good:** Graph derivation can use relationships without parsing TypeScript source.
- **⚠️ Cost:** Deferred recursive dependencies must resolve before imports and groups are finalized. Filename changes affect imports and graph edges. Text consumers must await formatting.

## Alternatives

- **One output string:** Easy to emit, but loses reliable separate-file metadata.
- **Parse names from rendered text:** Fragile with aliases, inline types, and comments.

## Where to look

- **Implementation:** [Group planning](../packages/oas3-visitor-typescript/src/misc-utils/plan-separated-groups.ts), [import construction](../packages/oas3-visitor-typescript/src/ast-utils/create-import-declarations.ts), and the [public generator](../packages/oas3-visitor-typescript/src/json-schema-to-typescript.ts) assemble output.
- **Related decisions:** [OAS3 Core orchestration](../packages/oas3-core/adr/006-orchestrate-transitive-node-rendering-through-ultimate-parser.md) owns traversal; [graph payload](004-use-framework-neutral-graph-payload.md) consumes groups.

## Verification

- [ ] Grouped helpers appear once with their owner; external dependencies use paths relative to transformed filenames.
- [ ] Recursive references keep their final declaration name in both output modes; OAS3 Core and OAS3 Visitor TypeScript Nx tests pass after contract changes.
