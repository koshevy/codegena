---
status: proposed
date: 2026-10-14
decision-makers: Codegena project maintainers
---

# Compose and subtract transitive nodes centrally

## Why

Complex schemas exposed merge failures: required-only fragments erased known types, distinct references became `never`, pattern properties disappeared, array bounds were lost, and negation touched unrelated properties. Renderers need one shared interpretation of these combinations.

## Decision

> [!IMPORTANT]
> **Node addition and subtraction MUST live in OAS3 Core's `transitive-utils`; renderers MUST use their results rather than rebuild schema semantics.**

- **➕ Addition:** [`doAdditionOfTransitiveNodes`](../transitive-utils/do-addition-of-transitive-nodes.ts) merges compatible structures and arrays recursively.
  - Requiredness survives if either property requires it; concrete types outrank `unknown` and `isFallbackType`.
  - Distinct references or differing property types become a union.
  - Incompatible top-level constraints can become `isNever`.
- **🏷️ Object shapes:** Preserve named and pattern properties, property-name constraints, and additional-property schemas. Deeply compared literal values may become `combinedValueTuple` under the generator's property-level policy.
- **📏 Arrays:** Combine common items, tuple prefixes, rest items, and bounds. Use the stronger minimum and maximum constraints; incompatible bounds mark the result `isNever`.
- **🔀 Unions:** Flatten compatible unions, remove semantic duplicates, and simplify a single survivor. [`hasSignificantNodeDifference`](../transitive-utils/has-significant-node-difference.ts) ignores names, annotations, and source locations while terminating on recursive pairs.
- **➖ Subtraction:** [`subtractTransitiveNode`](../transitive-utils/subtract-transitive-node.ts) removes covered variants or values. It **MUST** mark a property `isNever` only when the negative schema constrains it, including a required-only exclusion; unrelated properties **MUST** stay intact.

These are **code-generation policies**, not a proof of JSON Schema satisfiability. Property-level unions and ordered literal tuples preserve useful declarations without claiming exact Boolean validation semantics.

## Trade-offs

- **✅ Good:** Conditional, composition, and exclusion visitors share requiredness, fallback, array, and recursion behavior.
- **⚠️ Cost:** A utility change can alter several declarations, so it needs focused tests and a representative renderer case.

## Alternatives

- **Deep-merge raw schemas:** Loses reference identity, fallback flags, `isNever`, and tuple/rest distinctions.
- **Repair each TypeScript visitor:** Duplicates meaning and ties it to one language.

## Verification

- [ ] [Addition](../transitive-utils/do-addition-of-transitive-nodes.spec.ts) and [subtraction](../transitive-utils/subtract-transitive-node.spec.ts) tests preserve required types, patterns, arrays, and unrelated properties.
- [ ] A representative OAS3 Visitor TypeScript output and affected OAS3 Core/OAS3 Visitor TypeScript Nx checks pass after a semantic change.

The [convertor decision](004-process-schemas-through-ordered-recursive-convertors.md) describes how source parts reach this algebra.
