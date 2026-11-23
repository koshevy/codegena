# Graph Search UI decisions

Uppercase requirement terms follow the [repository ADR convention](../../../adr/README.md#requirement-language).
These records describe the search UI's boundary with its data source and host.

## Search boundary

- **Suggestions:** The [source and selection decision](001-inject-suggestions-and-delegate-navigation.md)
  keeps query results replaceable and cross-panel navigation in the host.

## Reading order

1. [Inject suggestions and delegate navigation](001-inject-suggestions-and-delegate-navigation.md)
   — understand what this library owns and how Playground integrates it.

## What the tests established

- Storybook states cover the drawer, five suggestion kinds, empty results, and
  long-list scrolling.
- Playground browser tests cover selecting a suggestion in the composed UI.
