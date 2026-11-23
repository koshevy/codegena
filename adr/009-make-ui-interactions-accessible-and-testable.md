---
status: proposed
date: 2026-10-17
decision-makers: Codegena project maintainers
---

# Make browser interactions accessible and testable

## Why

A graph node can be clickable yet have no accessible name. Several Monaco editors can all announce “Editor content.” These controls are hard to distinguish with a keyboard or assistive technology, and browser tests end up depending on CSS classes instead of user-facing behavior.

## Decision

> [!IMPORTANT]
> **Every interactive control MUST have a meaningful accessible name and keyboard path. Controls with selection, expansion, disabled, or hidden state MUST expose that state.** Browser tests use the same public contract.

- **🏷️ Name the action:** Prefer native controls and accessible MUI components.
  - An icon-only button describes its action, not its icon.
  - Repeated editors identify their source or generated file.
- **⌨️ Preserve keyboard access:** Focusable graph and tree items identify the file or declaration.
  - Actions available through a click or context menu also have a keyboard path and visible focus.
  - Monaco keeps its expected editor shortcuts.
- **👁️ Expose real state:** Selection, expansion, and disabled status **MUST** use appropriate semantics. An inactive view kept mounted to preserve state **MUST** leave the accessibility tree and tab order.
- **🧪 Test what users can find:** Playwright locates actions by role, name, and state.
  - Use structural selectors only for non-semantic details, such as a Monaco model URI or a virtualizer row index.
  - Give a control a label that helps a user distinguish it, not one that only satisfies a test.

A Storybook fixture makes these interactions inspectable in the browser. Appearance alone does not verify its accessibility state.

This decision does not replace specialized editors or graph controls, make private implementation nodes focusable, or require every test to assert the entire accessibility tree.

## Trade-offs

- **✅ Good:** Users and browser tests can identify the same controls and states.
- **✅ Good:** Tests survive layout and CSS changes more readily.
- **⚠️ Cost:** Wrappers around graph nodes, editors, and virtualized views must carry names and state semantics through their rendering layers.

## Alternatives

- **Visible text and CSS selectors:** Ambiguous for repeated widgets and fragile across layout changes.
- **Test IDs on every control:** Useful for automation, but they do not explain the action to a user.
- **Semantic controls:** The selected approach serves both users and tests.

## Where this applies

- **Implementation:** Interactive controls in [graph-ui](../packages/graph-ui/src/lib/) and [playground-ui](../packages/playground-ui/src/lib/) are exercised through [Storybook-backed Playwright cases](../apps/playground-ui-e2e/e2e/).
- **Related decisions:** The [shared UI toolkit](005-standardize-react-ui-toolkit.md) sets the baseline; [composed-browser testing](008-test-composed-ui-through-storybook-and-playwright.md) explains when to automate a journey.

## Verification

- [ ] A new or changed control has an appropriate role, distinct name, and keyboard path.
- [ ] Selected, expanded, disabled, and hidden states are conveyed correctly; inactive views cannot receive focus.
- [ ] Related browser tests use accessible locators for user actions. The relevant Nx E2E, lint, and typecheck checks pass.
