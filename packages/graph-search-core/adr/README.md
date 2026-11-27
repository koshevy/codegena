# Graph Search Core decisions

These proposed records define the framework-neutral search boundary. Uppercase
requirement words follow the [repository convention](../../../adr/README.md#requirement-language).

## Reading order

1. [Index graph suggestions and scope visits by specification](001-index-graph-suggestions-and-scope-visits-by-specification.md)
   — search contracts, default results, history, and execution ownership.

2. [Use PWA for background search](002-use-pwa-for-background-search.md)
   — domain HTTP operations, session lifetime, and host initialization.

## What the tests established

- Jest covers suggestion preparation, ordered results, and stable content IDs.
- Playground E2E covers search navigation in a composed browser UI.
