# OAS3 Core Development Skills

Use these workflows for changes in `packages/oas3-core`. Before starting either
workflow, load the repository-level
[`relevant-changes`](../../.agents/skills/relevant-changes/SKILL.md) skill and
follow its project-specific code, test, fixture, lint, and TypeScript guidance.

## `describe-new-schema-type`

Use this workflow when a JSON Schema or OpenAPI construct is not yet represented
by the library's declarations and type guards.

1. Identify the construct and its validation behaviour in the applicable
   [JSON Schema reference](https://json-schema.org/understanding-json-schema/reference)
   or [OpenAPI specification](https://spec.openapis.org/oas/latest.html).
   Link aspect comments to the relevant section.
2. Choose the owning model before adding fields. JSON Schema keywords belong in
   `packages/oas3-core/json-schema/aspects` and its composed schema declarations.
   OpenAPI-only fields belong in `packages/oas3-core/oas3/aspects` when shared by
   several objects; concrete OpenAPI objects belong in their adjacent
   declarations without unnecessary `Has`/`CanHave` aspects. Reuse existing
   fields and keep value types out of convertors.
3. Compose or update the applicable public declaration in
   `packages/oas3-core/json-schema/json-schema.ts` or `packages/oas3-core/oas3`.
4. Add or update the matching public guard in
   `json-schema/json-schema-type-guards.ts` or `oas3/oas3-type-guards.ts`.
   Check the fields required to recognize the construct and narrow nested
   values before reading them. Reuse existing guards for shared constructs.
5. Test the guard in the corresponding adjacent guard specification. Cover
   valid, absent, malformed, and wrong-kind cases where relevant; keep its
   existing tests passing.
6. Export every new public aspect, declaration, and guard through the nearest
   adjacent `index.ts` files so consumers can import it from the library.

## `add-schema-convertor`

Use this workflow when adding support for a JSON Schema or OpenAPI construct in
the transitive parser.

1. Determine the exact JSON Schema feature and expected generated-node
   behaviour. If the request does not provide enough detail, ask the user for
   the missing schema shape or expected result. Use the [JSON Schema reference](https://json-schema.org/understanding-json-schema/reference)
   to confirm its semantics.
2. Before writing keyword checks, trace each consumed keyword through its
   aspect, composed schema declaration, public type guard, and guard tests.
   Complete `describe-new-schema-type` for any missing link. Use the resulting
   guard in the convertor to narrow input; do not repeat keyword shape checks
   or define a private keyword type guard in the convertor. Distinguish an
   absent optional keyword from a malformed present one when logging fallbacks.
3. Study the existing convertors, then add a focused
   `SchemaConvertorAbstract` implementation in
   `packages/oas3-core/transitive-parser/schema-convertors` using the established
   `schema-convertor-<feature>.ts` naming convention. Export it from the
   adjacent `index.ts`.
4. Evaluate the options type supplied as the
   `SchemaConvertorAbstract<TOptions>` type argument. Define a focused options
   interface that supports the convertor's expected variations without exposing
   unrelated configuration. Include that interface in the
   `BuiltInMergedOptions` intersection when the convertor is built in.
5. Review both `packages/oas3-core/transitive-parser/utils.ts` and
   `packages/oas3-core/transitive-utils` before adding helper
   logic. Reuse the existing owner when its responsibility fits, or extract a
   narrowly useful shared utility when the new behaviour would otherwise be
   duplicated.
6. Consider whether per-generation caching would prevent repeated work or
   recursion. When it would, follow the established `alreadyMetItems` and
   `cachedTransitiveNodes` patterns, ensuring cache keys uniquely identify the
   relevant schema value.
7. If the convertor retains state, implement `registerHook` to clear it after
   each generation. Use the `onTransactionComplete` hook so state cannot leak
   into a later generation and produce stale cache results.
8. Register the convertor in
   `packages/oas3-core/transitive-parser/extract-transitive-nodes-from-schema.ts` in
   its required precedence order. A convertor that calls `processNestedSchema`
   should appear as early as possible so it can own the root schema; use
   `skipConvertors` and `skipCaching` when recursively processing the remaining
   schema would otherwise invoke the same convertor or reuse the wrong result.
9. Handle parsing failures according to the local `JsonParseError` conventions.
   Preserve a usable fallback node wherever conversion can safely continue, and
   log handled errors and fallback paths through the provided logger. When a
   nested helper returns `null`, use the same sentinel for missing input in
   that flow; normalize to `undefined` only when assigning an optional
   transitive-node field.
10. Add cases only to
   `packages/oas3-core/transitive-parser/extract-transitive-nodes-from-schema.spec.ts`.
   Do not create another test file for a convertor. Reuse the closest local
   fixture, or add a realistic fixture beside related parser fixtures when one
   is required.
11. Test the supported path and relevant negative paths. Verify that fallback
   output remains usable and that logging covers handled errors or fallback
   decisions. When caching or hooks are used, also verify that generation state
   is isolated.
