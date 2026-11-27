---
status: proposed
date: 2026-11-12
decision-makers: Codegena project maintainers
---

# Use PWA for background search

## Decision

- **Transport:** `@codegena/pwa` **MUST** own Service Worker installation,
  companion connection, route registration, and message transport. Graph
  Search Core **MUST NOT** maintain a second worker implementation.
- **Domain API:** `@codegena/graph-search-core/api` **MUST** export a PWA route
  handler for search initialization, queries, completion, and disposal.
  It **MUST** validate the request before using graph or query fields.
- **Sessions:** Each `GraphSearchClient` **MUST** own one session ID. The API
  **MUST** keep its index and visit-history subscription separate from other
  sessions, including sessions for the same specification. Disposal **MUST**
  release those subscriptions.
- **Host:** The application **MUST** serve the PWA scripts and a bundled search
  handler module, initialize PWA, and register the search route before use.
  Playground Storybook **MUST** use workspace sources for those bundles.
- **Fallback:** The synchronous engine **MUST** remain usable independently.
  Playground **MUST** switch to it when the HTTP service fails.

## Why

Search owns ranking and history, while PWA owns browser service execution.
One virtual HTTP boundary lets hosts reuse search without reproducing worker
activation, MessagePort exchange, or listener code in each feature.

## Consequences

- The old `./service-worker` entrypoint is removed. Hosts register `./api`
  through PWA and use `GraphSearchClient` for asynchronous queries.
- The graph is sent once per session, without visitor ASTs. JSON validation
  adds one linear pass when the API initializes its index.
- A missing index can be initialized again. If the central worker loses its
  routes or connection, the host must initialize PWA and register routes
  again; Playground can continue with local search meanwhile.
- The optional React entrypoint owns reusable search hooks for identity, visit history,
  HTTP-client lifetime, and local fallback. Playground owns navigation.
- Storybook uses Vite for its service assets. Each development page load
  supplies a fresh PWA build ID and versions the search module URL with it.
  Reloading replaces the previous companion and its imported modules.
  Production uses one stable ID per build, as defined by the
  [PWA build identity decision](../../pwa/adr/002-identify-browser-workers-by-application-build.md).
- Page history and background search share persisted visits through Dexie.
  This change does not move navigation or UI state into the service.

## References

- [PWA routing and module execution](../../pwa/adr/001-separate-http-routing-from-module-execution.md)
- [Search API](../api/handle-graph-search-request.ts)
- [HTTP client](../src/lib/search-api/graph-search-client.ts)
- [Host integration](../../playground-ui/.storybook/preview.ts)
