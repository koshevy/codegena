---
status: proposed
date: 2026-10-14
decision-makers: Codegena project maintainers
---

# Audit generation with topology-based use cases

## Why

A large fixture can reveal a regression without explaining its cause. A focused visitor test can pass while realistic composition fails. Counting fixtures does not show which behavior has an assertion.

## Decision

> [!IMPORTANT]
> **Use [`USECASES.md`](../USECASES.md) as a coverage map organized by how schema parts interact, not by fixture filename.**

- **🧭 One reusable invariant per row:** Each coverage row **MUST** state the invariant, option profile, and coverage status. It **MUST** link existing fixtures, tests, and the primary visitor; a planned gap **MAY** name assets still to be added. Schemas that prove the same behavior **MUST** share a row.
- **🔎 Status follows assertions:** `covered`, `partial`, `gap`, and `investigate` describe what tests establish, not merely whether a fixture exists.
- **🧪 Focused tests:** Visitor specs cover a node kind, option boundary, negative case, or diagnostic, with complete output assertions where practical.
- **📄 Full-output tests:** Public generator fixtures catch interactions among visitors, names, comments, and dependencies. [CLI integration tests](../cli/index.spec.ts) cover the entrypoint adapter separately, without a table row for each CLI command.

A golden output protects its rendered text but may still need a focused assertion to explain one semantic rule. Behavior changes **MUST** update the catalog through the [maintenance workflow](../SKILLS.md#maintain-use-cases-table).

## Trade-offs

- **✅ Good:** Reviewers can find a schema interaction, its fixture, and its asserted output without searching every snapshot.
- **⚠️ Cost:** Behavior changes require table updates and honest coverage labels.

## Alternative

- **Catalog by fixture:** Easy to list files, but hides shared invariants and unasserted cases.

## Verification

- [ ] A changed case points to the right fixture location, visitor, test, option profile, and expected log or declaration.
- [ ] Focused [visitor tests](../src/visitors/) and [public generator tests](../src/json-schema-to-typescript.spec.ts) pass through Nx.

The [visitor decision](002-render-transitive-nodes-through-ordered-typescript-visitors.md) defines the behaviors being audited.
