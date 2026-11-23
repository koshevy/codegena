# OAS3 Visitor TypeScript architecture decisions

Uppercase requirement terms in these records use the [repository ADR index's RFC 2119 convention](../../../adr/README.md#requirement-language). Rationale, examples, and trade-offs do not add requirements.

These records explain the decisions behind `@codegena/oas3-visitor-typescript` that are visible in the current implementation and its tests. Their `proposed` status means **documented for maintainer review**, not merely planned behavior. Each record states a decision, its evidence, its limits, and the trade-offs a future change must consider.

## How the decisions are grouped

- **Entry points:** the npm API owns conversion; the CLI adapts it to commands and file writing.
- **Interpretation to syntax:** OAS3 Core supplies transitive nodes and traversal; TypeScript visitors select representation, construct AST, and finish declarations.
- **Assurance:** focused visitor tests and full-output fixtures are traced through a topology-based case catalog.

## Reading order

The zero-padded filenames follow this sequence from the public entry points to their tested output.

1. [Expose one generator through an npm API and a CLI](001-expose-one-generator-through-an-npm-api-and-cli.md) — keep conversion shared while the CLI owns command parsing and file writing.
2. [Render transitive nodes through ordered TypeScript visitors](002-render-transitive-nodes-through-ordered-typescript-visitors.md) — turn OAS3 Core's language-neutral nodes into declarations.
3. [Make approximation and fidelity modes explicit](003-make-typescript-approximation-modes-explicit.md) — choose representations or visible fallbacks for constraints TypeScript cannot express directly.
4. [Construct AST and enrich declarations at print time](004-construct-typescript-ast-and-enrich-at-print-time.md) — apply formatting and documentation at the final declaration boundary.
5. [Audit generation with topology-based use cases](005-audit-generation-with-topology-based-use-cases.md) — link tested behaviors to fixtures and expected output.
6. [Render OpenAPI types with scoped files and a root namespace](006-render-openapi-operations-as-namespaces-and-conditional-types.md) — keep named type imports and media or status selection available across generated files.
7. [Run the conversion API in Node and browser](007-run-the-conversion-api-in-node-and-browser.md) — let OAS3 Core own file reading while generation uses portable paths, diagnostics, and formatting.

The repository-level [transitive-node boundary](../../../adr/001-use-transitive-nodes-as-schema-boundary.md) and [declaration-group decision](../../../adr/003-represent-output-as-declaration-groups.md) govern shared contracts. OAS3 Core's [UltimateParser decision](../../oas3-core/adr/006-orchestrate-transitive-node-rendering-through-ultimate-parser.md) explains the traversal that OAS3 Visitor TypeScript implements through its TypeScript visitor. Shared Rollup settings and the CLI bundle exception are recorded in the [Rollup ADR](../../../adr/006-centralize-rollup-config-and-isolate-cli-resolution.md).

## What the tests established

- A CLI conversion must produce the same text as the npm API for the same schema and output mode.
- Visitor order matters when a node has a wrapper such as `not`, a literal range, or a conditional; dependencies from a visitor that returns `null` must not leak into the selected result.
- A named reference can remain an importable declaration; an inline type is part of its owner and must not receive a top-level export or hoisted comment.
- `oneOf` fidelity, conditional representation, and bounded array tuples have explicit visitor options and regression tests.
- Full fixture output catches interactions across visitors; focused tests identify which behavior changed.
- OpenAPI visitor tests compile separate generated files with named type
  re-exports, root namespace aliases, conditional bodies, and per-status headers.
