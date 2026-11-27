# Playground UI E2E architecture decisions

Uppercase requirement terms in these records use the [repository ADR index's RFC 2119 convention](../../../adr/README.md#requirement-language). Rationale and trade-offs are descriptive.

These records explain how `playground-ui-e2e` organizes browser regressions and keeps planned coverage visible. Their `proposed` status means the practices are documented for maintainer review; it does not mean the existing tests are only planned.

## How the decisions are grouped

- **Coverage ownership:** classify cases by source schema scenario and then user workflow, place them in the corresponding Playwright spec, and maintain the case catalogue as coverage changes.

The [repository Storybook and Playwright ADR](../../../adr/008-test-composed-ui-through-storybook-and-playwright.md) explains why composed UI needs browser tests. The [accessibility ADR](../../../adr/009-make-ui-interactions-accessible-and-testable.md) governs how those tests locate controls. This directory records how the Playground E2E project organizes its cases.

## Reading order

1. [Classify browser tests by schema scenario and workflow](001-classify-browser-tests-by-scenario-and-workflow.md) — scenario directories, workflow specs, case status, and reclassification.

## What the tests established

- A Storybook iframe supplies the starting state; Playwright tests the interaction journey.
- JSON Schema and OAS3 specs live in separate scenario directories. Within each, workflow specs cover the interactions exercised by those fixtures. [`TESTCASES.md`](../TESTCASES.md) distinguishes automated coverage from planned and partial cases.
