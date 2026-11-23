# PWA test cases

**Status:** ✅ Covered · 🟡 Partial · ⬜ Planned
**Priority:** 🔴 P0 — core contract · 🟡 P1 — failure or lifecycle case · 🟢 P2 — refinement

These tests belong to `@codegena/pwa`. Browser cases use real headless Chromium
Service Workers, SharedWorkers, and separately served JavaScript modules.
They do not require or modify the landing application.

## Router validation

Source: [create-service-worker-router.spec.ts](service-worker/routing/create-service-worker-router.spec.ts).

- **PWA-01 — Register a literal route after the router starts.**
  **Status:** ✅ Covered. **Priority:** 🔴 P0.
  Call `/_register`, then register a service. Its exact method and pathname
  become available; a missing companion returns `503`.
- **PWA-02 — Keep path and method matching exact.**
  **Status:** ✅ Covered. **Priority:** 🔴 P0.
  A trailing slash remains significant. Child paths and other methods use
  the network. Another supported method may register on the same path;
  repeating an identical normalized registration succeeds without adding a
  handler. A different module for that method/path returns `409`.
  HEAD uses the network.
- **PWA-03 — Reject invalid registration requests.**
  **Status:** ✅ Covered. **Priority:** 🔴 P0.
  Reject foreign callers and module origins, nonliteral paths, dot segments,
  reserved paths, unsupported methods, unknown fields, and non-object data.
  Malformed JSON returns `400`, unsupported media types `415`, and oversized
  bodies `413`.
- **PWA-04 — Defer module loading to execution.**
  **Status:** ✅ Covered. **Priority:** 🟡 P1.
  Registration accepts a valid same-origin module URL without importing it
  in the Service Worker.

## Browser request flow

Source: [service-worker.spec.ts](e2e/service-worker.spec.ts).

- **PWA-05 — Fetch a dynamically loaded service.**
  **Status:** ✅ Covered. **Priority:** 🔴 P0.
  Initialize the supplied worker entries with the application helper, register
  a feature route, and fetch it without retaining a worker handle. The separate
  module uses native Request/Response logic. Unrelated resources use the network.
  Client mocks exercise root re-exports; routes use the `common` entrypoint.
  Fetch remains available after garbage collection of page-side worker handles.
- **PWA-06 — Reconnect after a Service Worker restart.**
  **Status:** ✅ Covered. **Priority:** 🟡 P1.
  Stop the worker, reconnect the companion, register again, and fetch the
  service successfully.
- **PWA-07 — Preserve a service's error response.**
  **Status:** ✅ Covered. **Priority:** 🟡 P1.
  A service's `404` response reaches the caller without falling through to
  the network.
- **PWA-08 — Keep concurrent requests separate.**
  **Status:** ✅ Covered. **Priority:** 🔴 P0.
  Send twelve distinct requests concurrently. Each receives its own body
  and identifier from the SharedWorker. Nonmatching paths and methods use
  the network.
- **PWA-09 — Preserve binary output.**
  **Status:** ✅ Covered. **Priority:** 🔴 P0.
  Verify the returned bytes, content type, and `206` status across both workers.
- **PWA-10 — Execute opaque parameters.**
  **Status:** ✅ Covered. **Priority:** 🔴 P0.
  Send two numbers directly to a separately loaded companion implementation.
  It returns their sum without receiving an HTTP or Hono context.
- **PWA-11 — Return execution failures to the caller.**
  **Status:** ✅ Covered. **Priority:** 🟡 P1.
  Request a service whose implementation throws. The companion's message
  listener returns the error, and the HTTP caller receives `500` with its message.

## Companion execution

Source: [handle-companion-request.spec.ts](service-worker/companion/handle-companion-request.spec.ts).

- **PWA-12 — Return values without owning reply ports.**
  **Status:** ✅ Covered. **Priority:** 🔴 P0.
  Pass plain request data to the handler and await its result. Foreign module
  URLs are rejected before loading; execution errors reject the returned promise.
  The worker initializer owns message sending and port cleanup.

## Companion connection

Source: [read-companion-connection-request.spec.ts](service-worker/read-companion-connection-request.spec.ts).

- **PWA-13 — Validate a connection request and return its ports.**
  **Status:** ✅ Covered. **Priority:** 🔴 P0.
  A valid request returns the reply and companion ports to the Service Worker
  listener. Unrelated messages, unknown fields, and missing ports are ignored.
  The listener owns connection replacement and the shared confirmation response.

## Feature HTTP handlers

Source: [define-service-worker-route.spec.ts](common/route-execution/define-service-worker-route.spec.ts).

- **PWA-14 — Define native HTTP logic without transport conversions.**
  **Status:** ✅ Covered. **Priority:** 🔴 P0.
  A feature receives a native Request with its URL, method, headers, and body.
  Its Response preserves status, headers, and binary bytes; thrown errors
  propagate to the companion listener.

## Worker updates

- **File cache:** Load a public script twice in the same build and receive the
  cached response. Activate a new build, retain an unrelated cache, and fetch
  a fresh script at the same URL.

Sources: [service-worker.spec.ts](e2e/service-worker.spec.ts) and
[initialize-service-worker.spec.ts](service-worker-client/initialize-service-worker.spec.ts).

- **PWA-15 — Await the replacement worker before adding APIs.**
  **Status:** ✅ Covered. **Priority:** 🔴 P0.
  Serve an updated worker with a delayed installation. Initialize while the
  previous version still controls the page, then register and fetch a feature
  route. The companion and route must belong to the new controlling worker.
  The focused unit case holds the previous controller in place and verifies
  that companion connection waits for the replacement's controller event.
- **PWA-16 — Replace both runtimes when the build ID changes.**
  **Status:** ✅ Covered. **Priority:** 🔴 P0.
  Two calls with one build ID retain companion module state. Initialize a
  different build and confirm the new controller serves the API with fresh
  module state. Only one Service Worker scope remains registered.
  Unit cases reject a different build in the live registration and a controller
  replaced during connection; the companion request targets the selected worker.
- **PWA-17 — Repeat setup and reload the same build.**
  **Status:** ✅ Covered. **Priority:** 🔴 P0.
  Initialize and register twice, reload, then repeat setup. The API works
  without page errors, console warnings, or duplicate-registration errors.
  Empty build IDs are rejected by the initializer's unit tests.

## Bundle warmup

Source: [use-bundle-warmup.spec.ts](bundle-warmup/use-bundle-warmup.spec.ts).

- **PWA-18 — Warm after paint and consume each extras turn once.** Mount with
  a delayed worker. Select two turns and revisit the first. The first groups
  precede both extras turns even when equal props are recreated.
- **PWA-19 — Release the warmup owner.** Unmount before the client module
  loads or while the worker activates. The old owner starts no registration
  after its module loads and sends no pending messages after activation.
- **PWA-20 — Wait for a fresh paint on return.** Change the first-paint
  groups and return before the next frame. The paint gate stays closed.
- **PWA-21 — Split oversized warmup requests.** Nine groups are sent in two
  worker messages in the order supplied.

## Run

```sh
npm exec -- nx run @codegena/pwa:test
npm exec -- nx run @codegena/pwa:e2e
```

Browser support requires module SharedWorkers and Service Workers. These checks
do not establish unattended execution after all owning pages close.
