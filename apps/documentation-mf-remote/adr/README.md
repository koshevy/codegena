# Documentation remote decisions

These proposed records explain documentation rendering and embedding.
Requirement words follow the [repository convention](../../../adr/README.md#requirement-language).

## Reading order

1. [Expose Docusaurus through Rspack federation](001-expose-docusaurus-through-rspack-federation.md)
   — use the actual Docusaurus app, isolate its router, and reuse Codegena UI.

The [shared UI decision](../../../adr/005-standardize-react-ui-toolkit.md)
defines the underlying theme and controls. The
[dependency decision](../../../adr/016-declare-dependencies-in-consuming-projects.md)
allows a private dependency when another application needs an incompatible major.

## Verification

The [browser catalog](../../documentation-mf-remote-e2e/TESTCASES.md) records
navigation, appearance, local editor loading, and federation coverage.
