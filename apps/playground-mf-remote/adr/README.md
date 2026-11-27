# Playground remote decisions

These proposed records describe the browser application's routes and services.
Requirement terms follow the [repository convention](../../../adr/README.md).

## Reading order

1. [Load and cancel specifications through the virtual API](001-load-and-cancel-specifications-through-the-virtual-api.md)
   — lazy views, same-origin source loading, and cancellable conversion workers.

The [PWA records](../../../packages/pwa/adr/README.md) own service routing and
worker identity. The [runtime configuration decision](../../../adr/015-compose-browser-runtime-explicitly.md)
owns explicit application inputs.

## Verification

The [case catalog](../../playground-mf-remote-e2e/TESTCASES.md) covers real source conversion, search through
PWA, navigation cancellation, and foreign-origin rejection on desktop and mobile.
