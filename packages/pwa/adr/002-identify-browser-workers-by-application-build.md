---
status: proposed
date: 2026-11-12
decision-makers: Codegena project maintainers
---

# Identify browser workers by application build

## Why

A page reload can reuse a Service Worker with routes already registered.
A companion can also retain imported feature modules from an earlier build.
Updating only the page leaves those runtimes out of sync with its code.

## Decision

- **Application identity:** `initializeServiceWorker(buildId)` **MUST** receive
  a nonempty ID. Production **MUST** embed one stable, unique ID per build.
  Development **MUST** use a fresh `dev-` UUID on each page load.
- **Native replacement:** Both supplied worker URLs **MUST** carry the ID as
  a `buildId` query parameter. The Service Worker scope **MUST** remain the
  same. Registering a changed script URL updates that registration; it does
  not add another scope or require unregistering the previous worker first.
- **Activation:** The supplied worker skips waiting and claims clients.
  Initialization **MUST** await the new worker's control before attaching
  the companion and allowing route registration. Worker update checks
  **MUST** bypass the HTTP cache with `updateViaCache: 'none'`.
- **Concurrent replacement:** Initialization **MUST** verify the selected
  worker belongs to its requested build and send the companion port to that
  specific worker. If another page supersedes it during setup, initialization
  **MUST** reject instead of connecting an old companion to the new worker.
- **Companion identity:** The SharedWorker **MUST** use its versioned script
  URL without a fixed shared name. A new build therefore gets a new runtime
  and ESM module cache. Same-build pages can reuse the same companion.
- **Repeated setup:** Registering the same normalized method, literal path,
  and module URL **MUST** succeed without adding a duplicate Hono handler.
  A different module for that method/path **MUST** still return `409`.
  Registration metadata is local to that router instance; Hono owns routing.
- **Feature modules:** Hosts **SHOULD** use hashed or build-versioned module
  URLs so a new companion cannot receive an old HTTP-cached module.
- **Static files:** The supplied worker caches successful same-origin script,
  stylesheet, font, and image responses explicitly marked public. Requests
  that bypass caches, partial requests, redirects, and private or
  non-cacheable responses use the network. Registered APIs retain their
  existing behavior.
- **Cache ownership:** The cache name includes the worker scope and build ID.
  Before claiming clients, activation clears only the previous file caches
  belonging to that scope. On a miss, the worker revalidates the file against
  the server so a stable URL can load the new build's response.
- **Bundle warming:** An application can send a build manifest path and its
  named groups to the controlling worker. The worker accepts a relative JSON
  path on the same origin and defaults to `bundle-warmup.json`. The message
  and manifest **MUST** match the worker's build ID. The worker downloads
  only listed same-origin scripts and stylesheets at low priority and
  applies the same public-response policy as for ordinary file requests.
  The worker waits for those writes to finish before releasing the message.
- **Client-rendered home.** A manifest can nominate one startup group with
  `clientShellGroup`. The worker keeps its list in the build's file cache.
  On home navigation, the worker sends `X-Codegena-Client-Build` only when
  every listed file is present. The server can use that build ID to choose
  an empty client shell. The worker stores the asset list and responses for
  scripts and stylesheets.
- **Startup:** Applications can call `registerServiceWorker(buildId)` once
  their first route renders. A feature calls `initializeServiceWorker(buildId)`
  when it needs the companion for virtual HTTP routes.
- **React warming:** Startup supplies the build identity, manifest path, and
  warmup setting through `BundleWarmupContext`. One `useBundleWarmup`
  owner per router session starts registration after paint. The application
  selects when each named extras turn is ready. The hook ignores revisited
  turns and shares the registration across requests.

Rspack builds can use `BundleWarmupPlugin` from `@codegena/pwa/rspack` to emit
the warmup manifest from named chunk groups and synchronous federation assets.
The host supplies its values through the shared
[`BundleWarmupConfig` contract](../bundle-warmup-config/README.md). The plugin
validates the worker's manifest contract and emits origin-root URLs.

## Storybook integration

Playground's Vite service plugin embeds `CODEGENA_BUILD_ID` once per production
build. CI may supply that environment variable; otherwise the plugin creates a
UUID for the build. The preview uses a fresh development UUID on each load.
It passes the same ID to PWA and to the search handler's module URL.
The preview starts setup in the background. Stories can render immediately,
and graph search waits for the route registration before connecting.
The Storybook build cache includes that environment variable and its local
configuration files, so an ID or initializer change cannot reuse an older bundle.

## Consequences

- Reloading the same production build can repeat setup without a `409`.
- Reloading development replaces stale routes and imported implementations.
- The Service Worker controls one origin-wide scope. Replacing it also affects
  other open pages in that scope; this does not provide per-tab isolation.
- A suspended Service Worker still loses its in-memory routes and connection.
  The application must repeat setup after a restart, as described in the
  [routing decision](001-separate-http-routing-from-module-execution.md).
- No custom worker registry, local-storage version flag, or uninstall cycle
  is needed. Browser worker identity supplies replacement and sharing.

## Verification and references

The [PWA case catalog](../TESTCASES.md#worker-updates) covers changed builds,
same-build reloads, companion module state, and delayed activation. Playground
also checks real search after a story reload without console errors.

- [Service Worker registration and update options](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register)
- [SharedWorker identity](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker/SharedWorker)
