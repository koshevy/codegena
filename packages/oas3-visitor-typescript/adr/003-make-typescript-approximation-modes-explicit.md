---
status: proposed
date: 2026-10-14
decision-makers: Codegena project maintainers
---

# Make TypeScript approximation and fidelity modes explicit

## Why

JSON Schema can express constraints that TypeScript cannot. Strict `oneOf` may expand references, conditionals have more than one useful representation, and large tuple expansions can be impractical. Those trade-offs should be visible to callers.

## Decision

> [!IMPORTANT]
> **Keep schema meaning in OAS3 Core; choose TypeScript representations through visitor options and log constraints the output cannot carry.**

- **🔀 `oneOfMode`:** [`visitorSomeOf`](../src/visitors/some-of/visitor-some-of.ts) defaults to `sameAsAnyOfForRefs`: inline alternatives oppose each other, named refs stay union members.
  - `sameAsAnyOf` emits a plain union.
  - `completeOpposition` resolves and subtracts refs where safe; circular refs remain named with a warning.
  - Ordinary `anyOf` is unchanged.
- **🧭 Conditionals:** [`visitorIf`](../src/visitors/if/visitor-if.ts) defaults to a union of positive and negative variants using OAS3 Core addition/subtraction. `useConditionalIfThenElseDeclaration: true` emits a selectable generic and co-locates `ConditionalResultType` only when needed.
- **📏 Arrays:** The [tuple helper](../src/visitors/array/create-length-constrained-tuple-type.ts) expands bounds below configurable thresholds: minimum `20`, maximum `10`. `0` disables the respective expansion.
- **⚠️ Unrepresentable constraints:** When a visitor drops a recognized source constraint that TypeScript cannot express, it **MUST** retain a useful type and log the loss.
  - The [string visitor](../src/visitors/string/visitor-string.ts) reports ignored lengths; [built-in formats](../src/ast-utils/create-string-built-in-format-type.ts) use TypeScript-native approximations without promising runtime validation.

Options **MUST** flow through [`typescriptVisitorOptions`](../src/json-schema-to-typescript.ts) without changing the source schema. These projections are **not** a JSON Schema validator.

## Trade-offs

- **✅ Good:** Callers can choose type-checking fidelity without changing parser semantics.
- **⚠️ Cost:** Assignability and output vary by option profile; tests must compare modes against the same schema.

## Alternative

- **One silent rendering policy:** Either expands every schema or drops constraints without telling the caller.

## Verification

- [ ] [Some-of](../src/visitors/some-of/visitor-some-of.spec.ts), [if](../src/visitors/if/visitor-if.spec.ts), [array](../src/visitors/array/visitor-array.spec.ts), and [string](../src/visitors/string/visitor-string.spec.ts) tests cover options, limits, and warnings.
- [ ] The [use-case catalog](../USECASES.md) records affected profiles and invariants.

The [OAS3 Core composition decision](../../oas3-core/adr/005-compose-and-subtract-transitive-nodes-centrally.md) owns the semantic operations beneath these choices.
