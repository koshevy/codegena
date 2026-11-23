---
status: proposed
date: 2026-10-18
decision-makers: Codegena project maintainers
---

# Classify browser tests by schema scenario and workflow

## Why

JSON Schema and OAS3 graphs exercise different output shapes. Keeping their journeys in one spec hid which source model a failure involved. A single large spec also makes the responsible workflow hard to find, while a catalogue updated only after tests are written hides missing coverage.

## Decision

> [!IMPORTANT]
> **Classify each case by its source schema scenario, then by the user workflow and observable result. Record it in [`TESTCASES.md`](../TESTCASES.md) before writing its test, then update its status after verification.**

- **🗂️ Scenario first:** Tests using JSON Schema story graphs **MUST** live in [`e2e/json-schema/`](../e2e/json-schema/); tests using OAS3 story graphs **MUST** live in [`e2e/oas3/`](../e2e/oas3/). A focused mock belongs to the scenario it represents. The same workflow name **MAY** occur in both directories.
- **🧭 Workflow within the scenario:** Specs group source editing, generated views, file details, warnings, theme, and layout by their primary observable outcome. A context-menu case belongs with the behavior its action changes. A journey crossing workflows **MUST NOT** be duplicated merely because it crosses views.
- **🧪 Story first, journey second:** Reuse a representative Playground Storybook iframe as the starting state. Place helpers beside the specs that use them; share a helper between scenarios only when both need it. Browser assertions verify user-visible state; a narrow probe is appropriate when that state cannot establish an editor or virtualizer invariant.
- **📋 Before implementation:** A new case **MUST** be recorded in the catalogue with a distinct ID, expected outcome, priority, and `Planned` status before its test is written. For a reported bug, its Playwright case **MUST** reproduce the failure before the UI is fixed.
- **✅ After verification:** A row **MUST** become `Implemented` only when an automated assertion covers its stated outcome and the related Nx E2E target passes. Use `Partially implemented` with the covered portion named when a broader case still has gaps. Keep the section's spec link, case description, and priority current when scope changes.
- **🔀 Reclassify when needed:** A new case **MUST NOT** be forced into an ill-fitting scenario or workflow. Add a matching directory or spec when a new scenario or outcome requires one. Move related cases when their current grouping obscures ownership, updating IDs, links, and test placement together.

Priorities in the catalogue distinguish reported or critical regressions (`P0`), normal cross-view behavior (`P1`), and broader or negative paths (`P2`). Vary mode, scope, selection, and theme only when the variation changes the expected result.

## Trade-offs

- **✅ Good:** A case identifies both the source model and workflow that produced the failure; the catalogue shows implemented and missing coverage.
- **✅ Good:** Reclassification can follow the product workflow as it evolves without retaining a misleading folder structure.
- **⚠️ Cost:** Each new or moved test requires a catalogue edit. Partial cases need honest descriptions so their status does not overstate coverage.

## Alternatives

- **One large Playground spec:** Easy to start, difficult to navigate as scenarios and workflows grow.
- **Workflow-only directories:** Put OAS3 and JSON Schema graph cases in the same generated-view spec, concealing the source model involved in a failure.
- **Specs by component or control type:** Separate actions from their outcomes and encourage duplicate setup.
- **Catalogue after implementation only:** Records successes but conceals planned and incomplete coverage.

## Where to look

[`TESTCASES.md`](../TESTCASES.md) is the coverage index; [`e2e/json-schema/`](../e2e/json-schema/) and [`e2e/oas3/`](../e2e/oas3/) contain scenario-owned workflow specs. [`playwright.config.mts`](../playwright.config.mts) discovers both directories, starts Storybook for normal runs, and records screenshots, video, and retry traces. The [repository testing ADR](../../../adr/008-test-composed-ui-through-storybook-and-playwright.md) defines when Storybook-backed Playwright tests are appropriate.

## Verification

- [ ] Every new or moved E2E test has a case under the correct scenario and workflow, with status and priority matching its actual coverage.
- [ ] Each catalogue section links to its owning spec; reclassified IDs and links have no stale references.
- [ ] A fixed UI bug fails before the fix and passes afterward in its Storybook-backed workflow test.
- [ ] `npm exec -- nx lint playground-ui-e2e`, `npm exec -- nx typecheck playground-ui-e2e`, and the relevant Nx E2E target pass after test changes.
