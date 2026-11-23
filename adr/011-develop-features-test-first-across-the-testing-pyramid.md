---
status: proposed
date: 2026-10-23
decision-makers: Codegena project maintainers
---

# Develop features test-first across the testing pyramid

## Why

A unit test can prove a parser rule while the UI path to that result remains
broken. A browser test can prove the path, but is slower and less precise for
every schema edge case. We need both kinds of evidence without repeating the
same detailed assertions at every layer.

## Decision

> [!IMPORTANT]
> **New functionality MUST start with a failing test and retain that test as
> regression coverage.** Use the narrowest layer that proves the behavior,
> then add a browser journey when users interact with it through the UI.

- **🔬 Focused behavior:** Small features and edge cases **MUST** have Jest
  tests beside their owner. These carry most detailed cases.
- **🔗 Integration:** Cross-feature tests **SHOULD** prove boundaries that
  focused tests cannot, without copying every edge case.
- **🌐 UI behavior:** New UI-visible functionality **MUST** have a Playwright
  case in the related E2E app. Every fixed UI bug **MUST** first be reproduced
  by a failing Playwright case.
- **🧭 OAS3 Core to UI:** A core feature **MUST** be represented in its related UI
  and covered through that UI's Playwright E2E app. This does not make the
  core library depend on the UI.
- **🔺 Pyramid:** Keep many fast focused tests, fewer integration tests, and
  a smaller set of representative browser journeys. Browser tests prove that
  users can reach and operate the feature; focused tests prove its details.

## Trade-offs

- **✅ Good:** A failing test makes the intended behavior clear before code
  changes and guards it afterward.
- **✅ Good:** Multiple layers expose both local mistakes and broken user
  journeys.
- **⚠️ Cost:** Browser fixtures and E2E projects need maintenance; a feature
  may require both a focused spec and a browser case.

## Where this applies

- The [code style testing rules](../CODE_STYLE.md#testing) define test
  placement and affected-project checks.
- The [Storybook and Playwright decision](008-test-composed-ui-through-storybook-and-playwright.md)
  defines the browser fixture for composed UI.
- [Playground E2E](../apps/playground-ui-e2e/) and its
  [case catalog](../apps/playground-ui-e2e/TESTCASES.md) show the UI layer.

## Verification

- [ ] A new feature has a focused test that failed before implementation.
- [ ] New or fixed UI behavior has a related Playwright case.
- [ ] The tests cover different responsibilities rather than repeating every
  assertion at every layer.
