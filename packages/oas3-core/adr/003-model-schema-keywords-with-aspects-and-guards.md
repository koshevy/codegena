---
status: proposed
date: 2026-10-14
decision-makers: Codegena project maintainers
---

# Model schema keywords with aspects and guards

## Why

Several convertors may read a keyword, and a keyword can identify a type even without `type`. Private checks against untyped records duplicate validation. The initial `dependentRequired` convertor showed the gap when it had no matching aspect or public guard.

## Decision

> [!IMPORTANT]
> **Give each supported keyword a typed aspect, a place in the schema declaration, and a public guard when runtime recognition is needed.**

- **🧩 Describe:** A supported JSON Schema keyword **MUST** have its shape in `json-schema/aspects/` and be composed into the applicable [`json-schema.ts`](../json-schema/json-schema.ts) types.
- **🔎 Recognize:** When runtime recognition is needed, a public guard **MUST** be added to [`json-schema-type-guards.ts`](../json-schema/json-schema-type-guards.ts). Convertors **MUST** narrow the original input with that guard rather than inventing private record checks.
- **🧭 Infer cautiously:** Compatible keywords or literal values may identify a scalar, array, or object without explicit `type`. An incompatible explicit `type` takes precedence; a type array remains variative.
- **📍 Keep dialect ownership clear:** JSON Schema keywords **MUST** live in `json-schema/aspects/`; OpenAPI-only fields such as singular `example` and `nullable` **MUST** live in `oas3/aspects/`. Concrete OpenAPI objects use their own interfaces and guards rather than a `Has`/`CanHave` aspect for every optional field.
- **⚠️ Keep malformed input visible:** A mixin or cast **MUST NOT** turn a failed guard into a match. The ordered pipeline can warn, continue, or use a documented fallback.

[`HasDependentRequired`](../json-schema/aspects/has-dependent-required.ts), `isHasDependentRequired`, and [`SchemaConvertorDependentRequired`](../transitive-parser/schema-convertors/schema-convertor-dependent-required.ts) now express one keyword shape. This contract does not fully validate every JSON Schema dialect.

The [`oas3` declarations](../oas3/index.ts) keep references separate from concrete parameters, requests, and responses. Their guards check the fields needed to recognize these objects; they are not full OpenAPI document validators.

## Trade-offs

- **✅ Good:** Convertors share typed keyword vocabulary and narrow `unknown` safely.
- **⚠️ Cost:** A new keyword can require an aspect, schema composition, guard, exports, and tests before its convertor.

## Alternative

- **Private `Record<string, unknown>` checks:** Short once, but duplicate recognition and hide which schema types own a keyword.

## Verification

- [ ] [Guard tests](../json-schema/json-schema-type-guards.spec.ts) cover valid, absent, and malformed values; [convertor tests](../transitive-parser/extract-transitive-nodes-from-schema.spec.ts) cover output and warnings.
- [ ] New aspects and guards have public exports; OAS3 Core Nx test, lint, and build pass after a keyword change.

The [schema-type workflow](../SKILLS.md#describe-new-schema-type) gives implementation steps. Full dialect validation and replacing source-aware errors with guard booleans are outside this decision.
