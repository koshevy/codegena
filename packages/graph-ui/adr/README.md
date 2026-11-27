# Graph UI decisions

Uppercase requirement terms in these records use the [repository ADR index's RFC 2119 convention](../../../adr/README.md#requirement-language). Rationale and trade-offs are descriptive.

These proposed records explain how `graph-ui` turns the framework-neutral
graph payload into a positioned, interactive view.

## Layout and rendering

- **Graph containers:** [ELK layout](001-layout-file-groups-with-elk.md) positions
  directories and variable-height files while declarations remain ordered inside files.
- **Payload boundary:** The [repository graph decision](../../../adr/004-use-framework-neutral-graph-payload.md)
  keeps layout coordinates out of `graph-core`.

## Reading order

1. [Lay out generated file groups with ELK](001-layout-file-groups-with-elk.md)
   — understand the layout input, spacing, and asynchronous render boundary.

## What the tests established

- Graph UI layout tests check import and placement direction, payload immutability,
  child containment, and separation of containers.
- Playground browser tests check graph selection and viewport behavior in the
  composed interface.
