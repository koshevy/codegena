---
status: proposed
date: 2026-10-14
decision-makers: Codegena project maintainers
---

# Process schemas through ordered recursive convertors

## Why

One schema can contain a type, reference, literal values, annotations, negation, and composition at the same path. Some wrappers must process that path again, and recursive references need a placeholder before their children finish.

## Decision

> [!IMPORTANT]
> **Run convertors in an ordered, first-result pipeline. A wrapper can revisit its schema with itself skipped, then enrich the nested result.**

- **🥇 Precedence:** [`extract-transitive-nodes-from-schema.ts`](../transitive-parser/extract-transitive-nodes-from-schema.ts) **MUST** order wrappers ahead of the concrete types they decorate. `dependentRequired` precedes structure. The first non-null result **MUST** win.
- **🔁 Controlled recursion:** [`SchemaConvertorAbstract`](../transitive-parser/schema-convertor.ts) supplies `processNestedSchema` with `skipConvertors` and `skipCaching` when a wrapper revisits itself. Inline children remain linked without becoming standalone declarations.
- **🧩 Common constraints:** `schemaMixin` **MUST** be passed into nested variants only when distribution is valid. A concrete convertor **MUST** check the **original** schema type before merging; the original takes precedence. A significant common part stays an explicit `mixin`.
- **🗃️ Generation-scoped state:** The parser caches processed JSONC nodes per run. Stateful convertors clear mutable placeholders through `onTransactionComplete`, preventing stale results on later generations.
- **⚙️ Options:** Convertor-specific behavior enters through `BuiltInMergedOptions`, rather than an untyped side channel.

### Cross-cutting owners

- **📝 Annotations:** [`SchemaConvertorSchemaAnnotation`](../transitive-parser/schema-convertors/schema-convertor-schema-annotation.ts) extracts title, description, `$comment`, and examples once.
- **🔢 Literal range:** [`SchemaConvertorRangeOfValues`](../transitive-parser/schema-convertors/schema-convertor-range-of-values.ts) deduplicates `const`/`enum` values deeply and enriches a nested or `unknown` fallback.
- **🚫 Negation:** [`SchemaConvertorNot`](../transitive-parser/schema-convertors/schema-convertor-not.ts) attaches a usable negative child and ignores an unknown/fallback child with a warning.
- **🔗 Dependencies:** [`SchemaConvertorDependentRequired`](../transitive-parser/schema-convertors/schema-convertor-dependent-required.ts) derives union variants from a structure.

[`Ref`](../transitive-parser/schema-convertors/schema-convertor-ref.ts), [`If`](../transitive-parser/schema-convertors/schema-convertor-if.ts), and [`SomeOf`](../transitive-parser/schema-convertors/schema-convertor-some-of.ts) use recursive placeholders and scoped cleanup. The result remains a linked runtime node graph, not a flattened or freely reorderable conversion list.

## Trade-offs

- **✅ Good:** Each feature has one owner while wrappers cooperate with concrete types.
- **⚠️ Cost:** Order, skip lists, and cache identity affect meaning; adjacent wrapper and repeated-generation cases need tests.

## Alternatives

- **One monolithic keyword switch:** Hides precedence and feature-specific fallbacks.
- **Process-wide cache:** Could reuse nodes from a different source or option set.

## Verification

- [ ] [Parser tests](../transitive-parser/extract-transitive-nodes-from-schema.spec.ts) cover recursion, mixins, wrapper order, fallbacks, and repeated generation.
- [ ] A new convertor returns `null` for unrelated schemas; OAS3 Core Nx checks pass after pipeline changes.

The [keyword decision](003-model-schema-keywords-with-aspects-and-guards.md) governs recognition; the [composition decision](005-compose-and-subtract-transitive-nodes-centrally.md) governs combining results.
