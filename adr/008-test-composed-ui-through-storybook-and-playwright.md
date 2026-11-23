---
status: proposed
date: 2026-10-17
decision-makers: Codegena project maintainers
---

# Test composed browser UI through Storybook and Playwright

## Why

Playground bugs have appeared only after several interactions: mounting a generated editor repainted the source editor; selecting an item jumped a scrolled list to the top; a warning shortcut missed its target while virtualized content settled. A component story shows the starting state, but cannot prove that the whole journey works.

## Decision

> [!IMPORTANT]
> **Composed UI workflows that combine stateful views or browser APIs MUST use Storybook for their starting state and Playwright for the journey.** A display-only story does not, by itself, require a browser test.

- **🧩 Stories provide realistic fixtures:** Keep representative states beside the UI component.
  - Use local fixtures, the shared theme, and required providers.
  - Open the story's iframe in browser tests instead of maintaining a separate demo app.
- **🧪 Browser tests follow user workflows:** Place them in a related Nx E2E project.
  - A browser regression test for a reported bug **MUST** reproduce the failure, assert the observable result, and remain after the fix.
  - Group specs by workflow. Test a context-menu action alongside the behavior it changes.
- **🔗 Nx records the relationship:** Connect the E2E project to its UI library through an import or `implicitDependencies`. If the E2E project is missing, add it through the workspace generator workflow.
- **🎯 Assertions stay focused:** Prefer accessible locators and condition-based waits.
  - Use a narrow test-only probe only for an invariant that cannot be observed reliably, such as editor instance identity.
  - Capture screenshots, video, or traces on failure.

Unit tests still cover isolated logic; stories still support visual review. Neither replaces a browser test for interactions among editors, virtualizers, views, panels, and notifications.

The [test-first decision](011-develop-features-test-first-across-the-testing-pyramid.md)
requires Playwright coverage for new UI behavior, including behavior in an
otherwise self-contained component. A display-only state does not need a
separate browser assertion merely because it has a story.

## Trade-offs

- **✅ Good:** Tests run in the composed browser state that exposed the bug, while the same story remains useful for manual review.
- **✅ Good:** Nx dependency edges show which E2E suite belongs to a changed library.
- **⚠️ Cost:** Browser startup, stable fixtures, and scroll synchronization need maintenance. Rare lifecycle bugs may need a small test seam.

## Alternatives

- **Stories and manual review:** Helpful for appearance, but they cannot repeat a multi-step regression automatically.
- **Isolated component tests:** Precise for local behavior, but they miss interactions across mounted views.
- **A separate demo app:** It would duplicate states already maintained in Storybook.

## Where this applies

- **Fixture and tests:** The Playground's [composed story](../packages/playground-ui/playground/playground.stories.tsx) feeds its [Playwright project](../apps/playground-ui-e2e/). The [case catalogue](../apps/playground-ui-e2e/TESTCASES.md) separates implemented tests from plans.
- **Behavioral context:** Local decisions describe [view coordination](../packages/playground-ui/adr/002-coordinate-views-through-graph-payload.md), [Monaco](../packages/playground-ui/adr/003-use-themed-monaco-editors.md), and [diagnostics](../packages/playground-ui/adr/004-route-diagnostics-through-graph-payload.md).

## Verification

- [ ] A fixed composed-UI bug has a Storybook-backed browser regression in the relevant workflow spec.
- [ ] The E2E project is connected to the UI library in the Nx graph; its catalogue reports coverage accurately.
- [ ] Assertions wait for observable conditions, and the relevant Nx E2E, lint, and typecheck checks pass.

The [shared UI toolkit decision](005-standardize-react-ui-toolkit.md) describes Storybook's role in component development. This record defines when those stories become browser-test fixtures.
