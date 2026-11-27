---
status: proposed
date: 2026-11-13
decision-makers: Codegena project maintainers
---

# Bundle browser services and Monaco locally

## Decision

- **🔎 Background search:** The landing **MUST** use `GraphSearchClient` through
  the PWA virtual HTTP API. Index construction, querying, and persisted history
  run in the SharedWorker companion. The landing **MUST NOT** construct a local
  search index as a fallback.
- **🔌 Lazy setup:** Opening search initializes PWA, registers the search module,
  and fetches the prepared GitHub graph. Concurrent queries share that setup
  and one client. Failed setup can be attempted again on a later query.
- **🆔 Build identity:** Production uses one embedded build ID; development uses
  a fresh ID on each page load. The search module URL carries the same ID.
  Worker replacement follows the [PWA contract](../../../../packages/pwa/adr/002-identify-browser-workers-by-application-build.md).
- **📦 Worker bundles:** Rspack **MUST** compile standalone ESM service entries
  without the page's federation or DOM runtime. The page compiler copies their
  completed assets without minifying them again. Storybook serves those same
  outputs and builds them before starting.
- **📝 Local editors:** Landing illustrations use `code-editor-minimal`.
  The Playground remote owns the Monaco configuration and builds its JSON and
  editor workers. The landing host serves those worker files at `/monaco/`
  so the embedded and standalone Playground use the same local worker URLs.

## Why

The GitHub graph contains thousands of declarations. Its index belongs outside
the page's interaction loop. PWA already owns worker connection and HTTP routing;
the landing only supplies bundles and registers the domain service.

The landing can highlight generated code during rendering. Playground takes
on Monaco and its workers when the interactive editor is needed.

## Costs and limits

- The page still downloads, validates, and serializes the graph once. Search
  indexing and visit-history storage run in the companion.
- A failed background service surfaces a search failure; it does not silently
  create an expensive index on the page.
- Storybook uses compiled service assets. Restart it after changing worker code.
- The page owns the companion's lifetime; unattended background execution is
  outside the [PWA routing contract](../../../../packages/pwa/adr/001-separate-http-routing-from-module-execution.md).

## Verification

- Jest checks failed-load recovery and a shared client for concurrent queries.
- Desktop and iPhone 15 journeys open search and find a real GitHub declaration;
  the response must come from the Service Worker.
- Existing generated-code images and browser diagnostics protect editor behavior.
- Embedded Playground loads its local editor and JSON workers from `/monaco/`.
