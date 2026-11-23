---
status: proposed
date: 2026-10-14
decision-makers: Codegena project maintainers
---

# Construct TypeScript AST and enrich declarations at print time

## Why

The generator needs syntax, imports, names, exports, and documentation. Enriching AST during recursive visitation duplicated comments on references and inline types; assembling strings would obscure ownership further.

## Decision

> [!IMPORTANT]
> **Visitors build AST. Document members where they are created; add exports and declaration TSDoc at the output boundary.**

- **🌳 Syntax first:** Visitors return `typescript` nodes. [`TypescriptParserVisitor`](../src/typescript-parser-visitor.ts) reads finalized names and categories from AST, not printed text.
- **🖨️ Individual output:** [`createAstToString`](../src/ast-utils/create-ast-to-string.ts) returns a promise-based text renderer. It **MUST** enrich non-inline declarations before printing. Inline types **MUST NOT** gain a top-level export or comment. Intermediate visitor output is intentionally unformatted.
- **📄 Whole files:** [`createGroupSourceFile`](../src/ast-utils/create-group-source-file.ts) assembles imports and declarations and documents each source node once per file. The source node used for annotations is retained when a visitor renders through a different transitive node.
- **🏷️ Properties:** The [structure visitor](../src/visitors/structure/extract-property-signatures.ts) attaches TSDoc to annotated property signatures, including members of inline object types. Its member comments and final declaration comments use the same [`addTransitiveNodeComment`](../src/misc-utils/add-transitive-node-comment.ts) helper and [`createTsDocComment`](../src/misc-utils/create-ts-doc-comment.ts) formatter.
- **✨ Final formatting:** A complete source file **MUST** go through Prettier 3 with `prettier-plugin-jsdoc` once, after imports and exports have been assembled. Prettier keeps single-specifier imports on one line even beyond `printWidth`; the final renderer wraps those imports and, when needed, moves a long module path below `from`.
- **📝 Annotation boundary:** [`createTsDocComment`](../src/misc-utils/create-ts-doc-comment.ts) builds title, description, deprecation, private remarks, and examples for declarations and properties.
  - Missing annotations may come from inline or anonymous referred nodes in order.
  - A **named** referenced declaration does not donate its documentation.

AST remains available in public result groups. Rendered text is a view of that AST, not a source from which relationships are recovered.

## Trade-offs

- **✅ Good:** Syntax and metadata stay inspectable; comments appear at the declaration they belong to.
- **⚠️ Cost:** Intermediate text and complete files have different layouts. Callers must await the final file renderer for formatted output; tests cover both boundaries.

## Alternatives

- **Enrich during recursive visitation:** Confuses inline uses with declarations.
- **Assemble strings, then parse:** Loses AST ownership and makes imports harder to reason about.

## Verification

- [ ] [Visitor](../src/typescript-parser-visitor.spec.ts) and [comment](../src/misc-utils/create-ts-doc-comment.spec.ts) tests cover inline/named boundaries and inheritance.
- [ ] [Property signatures](../src/visitors/structure/extract-property-signatures.spec.ts) tests cover annotations on interface and inline-object members.
- [ ] [Renderer](../src/ast-utils/create-ast-to-string.spec.ts) tests cover final import width.
- [ ] [Full-output tests](../src/json-schema-to-typescript.spec.ts) verify formatted groups with imports, exports, and source comments.

The [declaration-group decision](../../../adr/003-represent-output-as-declaration-groups.md) owns the shared grouping contract.
