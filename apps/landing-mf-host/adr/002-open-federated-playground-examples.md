---
status: proposed
date: 2026-11-13
decision-makers: Codegena project maintainers
---

# Open Playground examples through Module Federation

## Decision

> **The Unified UI buttons open the independently built Playground in the
> existing overlay. The landing does not duplicate its routes or conversion.**

- **🔘 Selection:** Each example supplies a label and a same-origin specification
  URL. The existing dolly animation completes before the overlay mounts the
  remote application.
- **📦 Loading:** Bootstrap supplies named dynamic imports through explicit
  route-loader inputs. Nx federation configuration owns deployed locations;
  the host no longer constructs or registers remote entries at runtime.
  Follow the [repository federation contract](../../../adr/019-load-federated-apps-through-nx-configuration.md).
- **⚛️ Shared context:** React, its JSX runtimes, and `DevModeEnvContext` are
  singleton dependencies. Embedded views inherit the host's execution flags.
- **🧭 Routing:** The host browser router owns `/playground/:specUrl`.
  The remote supplies conversion and view-loading APIs without creating an
  embedded router. The later [host-routing decision](003-serve-documentation-as-an-independent-route.md)
  replaces the original memory-router approach.
- **🌐 Deployment:** The host build depends on the remote build. It serves
  federation chunks under `/playground-remote/`, specifications under
  `/specifications/`, and conversion worker assets at the host origin. This
  preserves the [PWA same-origin contract](../../../packages/pwa/adr/001-separate-http-routing-from-module-execution.md).
- **☰ Navigation:** The remote receives `onSandwichButtonClick`. Its topbar
  opens the landing's shared overlay menu, with Return to landing first and
  an Examples column instead of Theme. The selected example is disabled.
  The ordinary remote's example bar is omitted when embedded.
- **🎨 Appearance:** Landing passes its mode and change callback through the
  remote App's `appearance` prop. The remote wraps loading and ready routes
  in one [Playground appearance provider](../../../packages/playground-ui/adr/008-share-appearance-and-host-navigation.md).
  A change inside Playground updates landing's saved choice immediately.
- **♻️ Closing:** Return to landing aborts unfinished route loading and
  conversion. Switching examples replaces the route session.
  A module finishing after close must not start a new route.

## Why

An iframe would isolate the app from the host's component composition. Importing
Playground directly would bypass the remote application's routing and service
setup. Its public App module already owns those responsibilities.

The host router exposes the selected specification in its `specUrl` parameter.
Serving worker assets from the host origin keeps
the remote compatible with the existing source and handler validation.

## Costs and limits

- **✅ One implementation:** Standalone and embedded Playground use the same
  routes, generator, search, and cancellation logic.
- **⚠️ Deployment:** The host release includes a matching remote build and its
  worker assets. Updating that remote requires publishing those artifacts too.
- **⚠️ Large example:** The GitHub choice converts the full specification in a
  dedicated worker; it displays the converting placeholder while that runs.

## Verification

- Desktop and iPhone 15 journeys open each example, check its specification
  request and a matching generated declaration in search, and return to landing.
- Closing search with Escape must leave the outer Playground overlay open.
- The same example journeys run against `nx serve landing-mf-host` to catch
  development-only React errors and warnings.
- Unit tests check router disposal, module-load failure, and closing while the
  module is still loading.
- Existing landing screenshots preserve the layout and animation before the
  overlay opens. Image baselines remain subject to human approval.
