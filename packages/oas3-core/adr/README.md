# OAS3 Core architecture decisions

Uppercase requirement terms in these records use the [repository ADR index's RFC 2119 convention](../../../adr/README.md#requirement-language). Descriptions of current behavior, alternatives, and trade-offs are not additional requirements.

These records explain decisions behind `@codegena/oas3-core` that survived repeated implementation and test cases. They describe **current behavior and its limits**, not every JSON Schema feature the library might eventually support. Their `proposed` status means they are documented for maintainer review, not that the behavior is merely planned.

## How the decisions are grouped

An ADR records a **decision and its trade-offs**, not one file or API name. This follows the [one-decision-per-record principle](https://adr.github.io/). The OAS3 Core records follow four responsibilities:

- **Source model and lookup:** reconstruct JSONC once, then use `ActiveJsoncTree` for paths and anchors.
- **Schema interpretation:** recognize keywords, run ordered convertors, and compose their transitive nodes.
- **Rendering orchestration:** traverse transitive nodes, contain cycles, and delegate declarations and files to a language visitor.
- **Diagnostics:** turn source offsets into useful errors and send events through an injectable logger.

Build configuration spans several Nx projects, so its [Rollup ADR](../../../adr/006-centralize-rollup-config-and-isolate-cli-resolution.md) belongs in the repository-level index. The shared factory is in `packages/infr-nx/rollup`; `packages/oas3-core/rollup` holds a narrower CLI resolver.

## Reading order

The zero-padded filenames follow this sequence, placing foundational decisions before their downstream uses.

1. [Reconstruct JSONC into source-aware values](001-reconstruct-jsonc-into-source-aware-values.md) — the `ReconstructedJsoncValue` source model.
2. [Preserve JSONC provenance and resolve local anchors](002-preserve-jsonc-provenance-and-resolve-local-anchors.md) — `ActiveJsoncTree` lookup and anchor resolution.
3. [Model schema keywords with aspects and guards](003-model-schema-keywords-with-aspects-and-guards.md) — where keyword types and runtime recognition belong.
4. [Process schemas through ordered recursive convertors](004-process-schemas-through-ordered-recursive-convertors.md) — how wrappers, recursion, mixins, and generation-scoped caches cooperate.
5. [Compose and subtract transitive nodes centrally](005-compose-and-subtract-transitive-nodes-centrally.md) — combining properties, arrays, alternatives, and exclusions.
6. [Orchestrate transitive-node rendering through UltimateParser](006-orchestrate-transitive-node-rendering-through-ultimate-parser.md) — visitor-neutral traversal, recursive results, and output grouping.
7. [Report parser errors with source locations](007-report-parser-errors-with-source-locations.md) — `getLineAndColByContent`, code frames, and `JsonParseError`.
8. [Use structured Pino logging with portable output](008-use-structured-pino-logging-with-portable-output.md) — injectable events and a browser-safe presentation boundary.
9. [Model OpenAPI documents as operation entrypoints](009-model-openapi-documents-as-operation-entrypoints.md) — preserve HTTP paths, requests, responses, media types, and source-aware fallbacks.

The repository-level [transitive-node boundary ADR](../../../adr/001-use-transitive-nodes-as-schema-boundary.md) explains why `oas3-core` produces a language-neutral model at all. These local records explain how `oas3-core` constructs and maintains that model. The [OAS3 Visitor TypeScript visitor ADR](../../oas3-visitor-typescript/adr/002-render-transitive-nodes-through-ordered-typescript-visitors.md) shows how a target-language package implements the `UltimateParser` contract.

## What the tests established

- Schemas without an explicit `type` can still yield a useful node when a recognized keyword identifies the type. The shared guards are the place to make that inference.
- Recursive references and composed schemas need controlled re-entry into the convertor pipeline and state that ends with the generation.
- Generic deep-merging of raw schemas loses requiredness, reference identity, array bounds, and negative constraints. Shared transitive-node operations keep those distinctions visible.
- Recursive rendering needs visitor-scoped traversal state; file grouping and import syntax remain with the target-language visitor.
- Local anchors and useful diagnostics need the original JSONC tree, not only its plain parsed value.
- A parser error can point to a JSONC syntax offset even when the input cannot produce a complete AST node.
- Logging must be capturable in tests and source-aware where the parser has a source node.
- OpenAPI documents need a document node and operation entrypoints; numeric response keys are object keys, and missing media schemas retain an `unknown` fallback.
