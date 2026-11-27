---
status: proposed
date: 2026-11-12
decision-makers: Codegena project maintainers
---

# Separate HTTP routing from module execution

## Why

Application modules need to attach browser-local HTTP services by URL. A Service
Worker can intercept `fetch`, but it cannot use dynamic `import()`. A SharedWorker
can import modules, but it does not intercept page HTTP requests.

## Decision

> [!IMPORTANT]
> **The Service Worker MUST own Hono routing. Its SharedWorker companion MUST
> only load implementations, call them with plain parameters, and return results.**

- **🌐 Central router:** `@codegena/pwa/service-worker` initializes Hono with
  the official `@hono/service-worker` adapter. Hono's `TrieRouter` accepts
  registrations after the first request has been handled.
- **📦 Shared entrypoint:** `@codegena/pwa/common` **MUST** own the contracts,
  validation, and messaging shared by the worker and browser client.
  Both entrypoints **MUST** import these APIs from `common`, which **MUST NOT**
  depend on either worker entrypoint. The root `@codegena/pwa` re-exports
  the framework-independent runtime entrypoints. React and Rspack integrations
  have dedicated subpaths. Secondary implementations **MUST NOT** import the
  root barrel.
- **🔌 Registration:** `POST /_register` **MUST** validate
  `ServiceWorkerRouteProps` with Zod: `routeBaseUrl`, `moduleUrl`, `httpMethod`.
  It **MUST** attach the exact method and literal pathname through `app.on`.
  It **MUST NOT** invent subtree matching, path traversal, or a parallel router.
- **🎯 Method matching:** Supported methods are GET, POST, PUT, PATCH, DELETE,
  and OPTIONS. HEAD requests **MUST** use the network rather than execute a
  registered GET service through Hono's implicit HEAD fallback.
- **🛡️ Origin boundary:** Registration **MUST** reject foreign origins and
  module URLs. Literal route validation excludes wildcards, route parameters,
  queries, dot segments, encoded separators, and the registration endpoint.
  Registration bodies are limited to 4 KiB. These checks are not an authorization system
  between scripts already trusted by the same application origin.
- **📨 Execution:** A registered Hono handler **MUST** transfer plain request
  parameters and its module URL to the companion, await the reply, and produce
  an HTTP response. Each call uses a separate reply port, so requests do not
  require a custom correlation table.
- **⚙️ Companion:** The companion **MUST NOT** own Hono routing or receive a
  framework context. It validates the module URL, imports its default function,
  calls it with opaque parameters, and returns its result or error. Native
  ESM loading supplies module reuse; no module catalog or loader registry is
  introduced.
- **📦 Feature contract:** `ServiceWorkerRouteHandler` describes plain HTTP
  request/result data for a feature implementation. The central worker adapts
  that implementation to Hono. The handler type and `ServiceWorkerRouterOptions`
  **MUST** belong to `common` and **MUST** be imported as types.
  Feature code **SHOULD** use `defineServiceWorkerRoute` to work with native
  `Request` and `Response` values while the library handles their transport.
- **🪟 Application owner:** The page **MUST** create the SharedWorker and
  transfer its connection port to the active Service Worker. The application
  owns standalone worker builds, URLs, scope, activation, and update policy.
- **🤝 Connection order:** `startServiceWorker` installs the central listener.
  `initializeServiceWorker` registers the central worker, waits for page
  control, then calls `requestServiceWorkerCompanionConnection`.
  The listener **MUST** validate the request, attach the transferred port,
  and confirm attachment before the page starts using its feature routes.
  Request parsing returns data; the listener owns port replacement and replies.
- **🚀 Application setup:** Worker installation, activation waiting, page
  control, and companion connection **MUST** stay inside the reusable
  initializer. Initialization, connection, and route registration commands
  return completion promises; callers do not retain worker handles or echoed
  registration data.
- **📄 Supplied worker entries:** The package provides central and companion
  worker scripts under `assets`. Applications build and serve them as
  `/service-worker.js` and `/service-worker-companion.js`. These scripts
  **MUST NOT** be re-exported by the root barrel:
  importing the library in a page must not start worker listeners. Applications
  **MAY** use the startup functions for custom lifecycle behavior.
- **📝 Shared messages:** Connection and execution messages **MUST** use named
  models and shared Zod schemas from `common/companion` on both sides.
  `exchangeWorkerMessage` only owns a reply channel, transfers, cleanup, and
  timeout; it **MUST NOT** depend on HTTP or the companion's protocol.

## Request and response transport

Feature code defines ordinary Fetch API logic through `defineServiceWorkerRoute`.
The helper accepts a `ServiceWorkerHttpHandler`, reconstructs its native
`Request`, and converts its `Response` to transferable data. Consumers do not
decode body buffers or call conversion helpers themselves.

Native `Request` and `Response` objects cannot cross a MessagePort directly.
The shared models carry body bytes, header pairs, and HTTP metadata instead:

1. **Service Worker → companion:** `mapRequestToServiceWorkerRouteRequest`
   reads the body once and produces the first argument in the opaque
   `CompanionExecutionRequest.params` array.
2. **Feature module:** The function returned by `defineServiceWorkerRoute`
   runs the native HTTP handler and prepares its result with
   `mapResponseToServiceWorkerRouteResponse`.
3. **Companion → Service Worker:** The companion returns that result without
   interpreting HTTP fields. The central worker validates and reconstructs
   the native response, preserving status, headers, and binary bodies.

`exchangeWorkerMessage` reserves the first transferred port for the reply and
waits up to ten seconds. Its caller owns the request and response models;
the generic utility interprets no message fields.

## Route matching and network fallback

- **Exact match:** One registration binds one HTTP method and literal path.
  Trailing slashes remain significant; child paths do not inherit a route.
- **Unmatched requests:** Requests outside registered routes use the network.
  External resources and HEAD requests also use the network, except that
  `/_register` retains its registration validation.
- **Handler responses:** A service's `404` is returned unchanged rather than
  triggering the Service Worker adapter's network fallback.

## Lifecycle and failures

- **Browser requirements:** Service Worker and module SharedWorker support are
  required. Worker scripts and feature modules are served from the app's origin.
- **Supplied central worker:** Installs with `skipWaiting()` and claims its
  clients on activation. The initializer selects the registration's installing,
  waiting, or active worker and awaits both its activation and its control of
  the page before connecting. A previous controller does not satisfy this wait.
  A redundant worker or a ten-second control timeout rejects initialization.
- **Companion ownership:** The creating page's document owns the SharedWorker
  lifetime. Transferring its port to the central worker does not require the
  caller to keep the JavaScript `SharedWorker` handle. This does not make it
  an unattended background service.
- **Duplicate route:** Repeating the same normalized method, path, and module
  URL succeeds without adding another handler. Binding a different module to
  an already registered method/path returns `409`.
- **Build replacement:** The initializer requires an application build ID.
  A changed ID replaces both workers under the existing scope. See
  [build identity](002-identify-browser-workers-by-application-build.md).
- **No companion:** A registered request returns `503`.
- **Execution failure:** An import or implementation failure returns `500`.
- **Transport failure:** The reply wait is bounded; invalid or failed transport
  is returned as an HTTP error instead of an indefinitely pending fetch.
- **Worker restart:** Routes and ports are held by the running Service Worker.
  The application reconnects and registers again after a restart. Persistent
  route storage and automatic reconnection are outside this first contract.
- **No owning page:** A SharedWorker is not guaranteed to survive after its
  owning pages disappear. This design does not provide unattended background
  feature execution.

Applications own their Web App Manifest and HTTPS deployment settings.
This decision does not migrate another library's existing worker implementation.

## Alternatives and trade-offs

- **✅ Hono owns matching:** Literal routes use the adopted router rather than
  a custom prefix-search algorithm.
- **✅ Small companion:** Feature implementations stay independent of Hono.
  The companion needs no service registry, persistent metadata, or HTTP router.
- **⚠️ Two runtimes:** The page establishes the companion connection, and
  request/results cross a structured-clone boundary.
- **⚠️ Explicit lifecycle:** Applications repeat setup after worker restarts.
  Hiding that requirement behind an unrelated cache would obscure ownership.
- **Static catalog:** Works inside a Service Worker but requires a worker
  update to add code. The companion permits native dynamic module imports.
- **SharedWorker alone:** Loads modules but cannot fulfill ordinary intercepted
  HTTP requests, which remain the central Service Worker's responsibility.

## Verification and sources

The [case catalog](../TESTCASES.md) identifies the unit and real-browser checks.
The module is served separately in browser tests; it is not bundled into the
Service Worker or replaced with a fake loader.

- [Hono's Service Worker adapter](https://hono.dev/docs/getting-started/service-worker)
- [Hono routing](https://hono.dev/docs/api/routing)
- [Dynamic import execution contexts](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import#description)
- [SharedWorker](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker)
- [Worker ownership and lifetime](https://html.spec.whatwg.org/multipage/workers.html#the-worker's-lifetime)
- [Service Worker termination and restart](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope)
