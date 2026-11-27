# Unified UI decisions

These proposed records explain the shared controls and the boundary between
the UI kit and feature packages. Requirement terms follow the
[repository ADR convention](../../../adr/README.md#requirement-language).

## Reading order

1. [Publish reusable UI by purpose](001-publish-reusable-ui-by-purpose.md) —
   move common controls into focused secondary entrypoints while leaving
   graph and Playground behavior with their features.
2. [Keep the UI kit below feature libraries](002-keep-the-ui-kit-below-feature-libraries.md) —
   prevent shared presentation primitives from depending on UI services or views.

The [repository UI toolkit decision](../../../adr/005-standardize-react-ui-toolkit.md)
defines the underlying libraries and theme.

## What the checks established

- Storybook builds the controls in their own light and dark theme states.
- The [UI kit E2E project](../../../apps/ui-unified-e2e/TESTCASES.md) checks
  shared controls; Playground E2E checks their composed workflows.
