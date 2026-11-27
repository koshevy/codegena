# PWA decisions

These proposed records define the shared browser service infrastructure.
Requirement words follow the [repository convention](../../../adr/README.md#requirement-language).

## Responsibilities

- **HTTP routing:** The central Service Worker owns Hono routes and validation.
- **Execution:** Its SharedWorker companion imports and calls feature modules.
- **Application integration:** The page owns worker installation and connection.

## Reading order

1. [Separate HTTP routing from module execution](001-separate-http-routing-from-module-execution.md)
   — literal route registration, opaque companion calls, and browser lifecycle limits.
2. [Identify browser workers by application build](002-identify-browser-workers-by-application-build.md)
   — stable production IDs, fresh development IDs, and reload-safe registration.

## What the tests established

Jest checks route registration and validation. Headless Playwright checks actual
Service Worker requests delegated to a SharedWorker with native dynamic imports.
This does not establish support for unattended execution without an owning page.
