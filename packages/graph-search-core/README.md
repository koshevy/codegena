# Graph Search Core

`@codegena/graph-search-core` indexes a generated `GraphPayload` and its source
specification. It returns ordered suggestions for files, directories,
declarations, warnings, and source text. It does not render UI or navigate
between Playground panels.

## Entry points

- `@codegena/graph-search-core`: suggestion contract, MiniSearch engine,
  visit history, specification identity, and the HTTP search client.
- `@codegena/graph-search-core/react`: `useGraphPayloadMiniSearch`, which
  memoizes a local index, and `useGraphSearchClient`, which owns an HTTP
  client and its fallback state for immutable graph and options values.
  `useGraphSearch` composes identity, visit history, and a search source;
  `useGraphSearchSource` can also be used with existing history.
- `@codegena/graph-search-core/api`: search handler registered through PWA.
  It owns search sessions; PWA owns worker installation and communication.

## Use a local index

```ts
import {
  GraphPayloadMiniSearch,
  VisitHistory,
} from '@codegena/graph-search-core';

const history = new VisitHistory(graph, ownerSpecId);
history.start();

const search = new GraphPayloadMiniSearch(graph, history, {
  sourceSpecification: { fileName: 'schema.jsonc', text: sourceText },
});

const { suggestions, isTruncated } = search.getSearchSuggestions('ApiRequest');
```

Call `search.dispose()` and `history.dispose()` when the host no longer uses
them. Start browser history after the owner mounts; it then persists in
IndexedDB. The [`GraphSuggestion` contract](src/lib/graph-suggestion.ts) has one
kind per UI item.

## Use background search through PWA

The application serves PWA's two worker scripts and bundles
`@codegena/graph-search-core/api` as `/graph-search-api.js`. Playground's
[Storybook setup](../playground-ui/.storybook/browser-services-plugin.ts) is a
working example using Vite and workspace sources. After changing a service
module, close its old tabs so the browser releases the previous companion and
its cached imports.

```ts
import {
  GraphSearchClient,
  graphSearchApiPath,
} from '@codegena/graph-search-core';
import {
  initializeServiceWorker,
  registerServiceWorkerRoute,
} from '@codegena/pwa/service-worker-client';

// Once at application startup.
await initializeServiceWorker('build-2026-11-12-01');
await registerServiceWorkerRoute({
  routeBaseUrl: graphSearchApiPath,
  moduleUrl: '/graph-search-api.js',
  httpMethod: 'POST',
});

// One client per graph and specification.
const search = new GraphSearchClient(graph, ownerSpecId, {
  sourceSpecification: { fileName: 'schema.jsonc', text: sourceText },
});

const result = await search.getSearchSuggestions('ApiRequest');
await search.dispose();
```

Queries initialize the session automatically. `initialize()` can prepare it
before the first query. Dispose the client when its graph is replaced or its
owner unmounts. A host can fall back to `GraphPayloadMiniSearch` if the API is
unavailable, as Playground does.

## Explore and verify

The [feature specification](FEATURE_SPEC.md) explains ranking, history, and
execution through PWA. The [local ADR](adr/README.md) records the ownership decision.

- `npm exec -- nx run @codegena/graph-search-core:test`
- `npm exec -- nx run @codegena/graph-search-core:lint`
- `npm exec -- nx run @codegena/graph-search-core:build`
- `npm exec -- nx run playground-ui-e2e:e2e` for composed browser search
