---
status: proposed
date: 2026-10-14
decision-makers: Codegena project maintainers
---

# Render transitive nodes through ordered TypeScript visitors

## Why

A node can be a scalar, structure, reference, union, conditional, literal range, or negation. One large switch would mix syntax rules; visitors over raw schema keywords would repeat OAS3 Core's interpretation.

## Decision

> [!IMPORTANT]
> **An ordered, first-result visitor list turns OAS3 Core transitive nodes into TypeScript AST.**

- **🥇 Selection:** [`TypescriptParserVisitor`](../src/typescript-parser-visitor.ts) **MUST** run cross-cutting visitors before broader ones. A visitor **MUST** return `null` for an unrelated node; the first result wins. If none accepts it, the fallback is `unknown` or a named alias.
- **🔁 Children and dependencies:** A visitor requests children through `getAnotherByTransitiveNode`. The dispatcher records dependencies only for the winning visitor, deduplicates them, and retains deferred recursive results.
- **📎 Co-location:** [`VisitorMicroContext`](../src/visitor-micro-context.ts) carries cycle and `shouldBeGroupedWith` information. A helper that must share a file is different from an ordinary dependency that may need an import.
- **🏷️ Final identity:** Results record the finalized name, declaration category, filename, AST, source, text renderer, and relationships. Identifier reservation resets before rendering a group of roots so references do not consume declaration names.

Visitor-specific helpers **SHOULD** stay near their visitor; shared AST construction belongs in [`ast-utils`](../src/ast-utils/) and common rendering logic in [`misc-utils`](../src/misc-utils/). Schema recognition **MUST** stay in OAS3 Core. The `unknown` fallback produces usable output without claiming every source constraint was represented.

## Trade-offs

- **✅ Good:** Focused syntax owners share one dependency and grouping mechanism.
- **⚠️ Cost:** Order and recursive result handling require focused tests whenever visitors change.

## Alternative

- **Render directly from raw schemas:** Repeats OAS3 Core's reference, composition, and fallback rules.

## Verification

- [ ] [Dispatcher](../src/typescript-parser-visitor.spec.ts) and [focused visitor](../src/visitors/) tests cover rejection, ordering, recursion, names, and grouped helpers.
- [ ] The [case catalog](../USECASES.md) reflects a changed behavior; OAS3 Visitor TypeScript Nx checks pass.

The [OAS3 Core convertor](../../oas3-core/adr/004-process-schemas-through-ordered-recursive-convertors.md) and [UltimateParser](../../oas3-core/adr/006-orchestrate-transitive-node-rendering-through-ultimate-parser.md) decisions define the input and traversal.
