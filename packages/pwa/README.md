# PWA

`@codegena/pwa` provides a central Service Worker with an HTTP API inside the
browser: a **backend in the frontend**, called through ordinary `fetch`.

- **🔌 Set up once per application.** The library registers the Service Worker,
  waits for page control, and connects its SharedWorker companion.
- **🧩 Add APIs as features load.** Register a URL, HTTP method, and handler
  module. The companion loads and runs that module when its API is called.

## 🚀 Usage

### 1. Initialize the application's workers

Use these supplied scripts as worker build entries and serve their bundles:

- `@codegena/pwa/assets/service-worker.esm.js` → `/service-worker.js`
- `@codegena/pwa/assets/service-worker-companion.esm.js` → `/service-worker-companion.js`

**No application-specific worker source files are needed.** Call this once at
application startup, before loading features that register APIs:

```ts
import { initializeServiceWorker } from '@codegena/pwa/service-worker-client';

await initializeServiceWorker('build-2026-11-12-01');
```

The promise resolves when route registration can begin. There is no worker
handle to store or manage.

**Use the current build ID.** Embed one stable, unique ID in each production
build. In development, create a fresh fake ID on each page load:

```ts
const buildId = `dev-${crypto.randomUUID()}`;

await initializeServiceWorker(buildId);
```

A different ID replaces the previous worker and its companion. Repeating setup
with the same ID keeps that build; registering its identical routes again is safe.

Call `registerServiceWorker(buildId)` to enable file caching before starting a
companion. The worker caches same-origin public scripts, stylesheets, images,
and fonts. A new build clears this scope's earlier file caches. See the
[build identity and caching decision](adr/002-identify-browser-workers-by-application-build.md).

### 2. Register a feature's API when that feature loads

Define the handler with normal `Request`/`Response` logic. This read-only
example returns a visit from the feature's data:

```ts
// features/history/api.ts → /features/history/api.js
import { defineServiceWorkerRoute } from '@codegena/pwa/common';

const visits = [{ declarationId: 'Pet' }];

export default defineServiceWorkerRoute(() => Response.json(visits));
```

After application initialization, the loaded feature registers that module:

```ts
// features/history/index.ts
import { registerServiceWorkerRoute } from '@codegena/pwa/service-worker-client';

await registerServiceWorkerRoute({
  httpMethod: 'GET',
  moduleUrl: '/features/history/api.js',
  routeBaseUrl: '/api/history',
});
```

`moduleUrl` is the URL of the built handler module on the application's origin.
Registration does not load the handler; its first request does.

### 3. Call the virtual API

After registration completes, call it from the page with `fetch`:

```ts
const response = await fetch('/api/history');
const visits: unknown = await response.json();

console.log(visits); // [{ declarationId: 'Pet' }]
```

## Warm bundles from React

Supply the prepared build ID, manifest path, and `canWarmBundles` through
`BundleWarmupContext` from `@codegena/pwa/bundle-warmup-context` at startup.
Set `canWarmBundles` to `false` to register the worker without sending warmup
requests, for example when developing without a generated manifest.
See the [landing bootstrap](../../apps/landing-mf-host/src/bootstrap.tsx).
Use the hook once in a route layout that survives navigation.

```ts
import { useBundleWarmup } from '@codegena/pwa/bundle-warmup';
import type { ReactNode } from 'react';

const warmAfterPaintedGroups = ['navigation'] as const;
const extrasGroups = {
  landingReady: ['landing-extras'],
  playgroundReady: ['playground'],
} as const;

interface ApplicationLayoutProps {
  children: ReactNode;
  currentExtrasTurn?: keyof typeof extrasGroups;
}

function ApplicationLayout({
  children,
  currentExtrasTurn,
}: ApplicationLayoutProps): ReactNode {
  useBundleWarmup({
    warmAfterPaintedGroups,
    extrasGroups,
    currentExtrasTurn,
  });

  return children;
}
```

The result's `hasPainted` flag turns true after one frame with the current
initial group list. A change to that list waits for a fresh frame. The hook
sends each selected extras turn once during the layout's lifetime. Keep group
definitions immutable and reuse them between meaningful changes.

## 📦 Imports

- **`@codegena/pwa/service-worker-client`:** Application initialization and API registration.
- **`@codegena/pwa/common`:** Route definitions and shared contracts.
- **`@codegena/pwa/service-worker`:** Startup functions for custom worker entries.
- **`@codegena/pwa`:** The three worker APIs through one entrypoint.
- **`@codegena/pwa/bundle-warmup`:** React hook for warming named bundle groups.
- **`@codegena/pwa/bundle-warmup-config`** provides types for manifest
  generation and warmup scheduling. [Usage](bundle-warmup-config/README.md)
- **`@codegena/pwa/bundle-warmup-context`:** Build and manifest settings supplied at startup.

## 📚 Architecture and checks

- [Worker responsibilities and routing](adr/001-separate-http-routing-from-module-execution.md#decision)
- [HTTP transport](adr/001-separate-http-routing-from-module-execution.md#request-and-response-transport)
- [Worker lifecycle and failures](adr/001-separate-http-routing-from-module-execution.md#lifecycle-and-failures)
- [Build IDs and replacement](adr/002-identify-browser-workers-by-application-build.md)
- [ADR index](adr/README.md) · [Test cases and check commands](TESTCASES.md)
