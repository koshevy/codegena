---
status: proposed
date: 2026-11-18
decision-makers: Codegena project maintainers
---

# Load federated apps through Nx configuration

## Decision

> **Hosts declare remotes in Nx Module Federation configuration and load their
> exposed modules with named dynamic imports.**

- **📦 Named imports:** Use `import('playground-mf-remote/App')`, following the
  [Nx example](https://github.com/nrwl/react-module-federation/blob/main/apps/host/src/app/app.tsx).
  The federation plugin owns container loading and share-scope initialization.
  Application code MUST NOT construct remote-entry URLs, register containers,
  or implement its own federation loader.
- **🌐 Deployment:** Remote locations MUST belong to build configuration.
  Use project names for Nx-managed development servers, or name/location pairs
  for deployed assets. Same-origin deployments MAY serve remote directories
  with the host. Asset copying and browser-worker hosting remain build concerns.
- **⏳ Lazy loading:** A component-only remote SHOULD use React `lazy` with a
  loading fallback. A data-router loader MAY import a remote API before loading
  route data. Both MUST keep failure and cancellation behavior visible to the
  route owner. Merely opening landing MUST NOT download unrelated remote apps.
- **🔗 Shared packages:** Explicitly share compatible React runtimes and
  identity-sensitive providers as singletons, including
  `@codegena/util-dev-mode`. Build tools and incidental transitive dependencies
  MUST NOT enter the share scope. Incompatible router versions MUST stay private.
- **🧭 Routing:** The host owns the browser-router session and public routes.
  Remotes expose components and route-data APIs; embedded views MUST NOT start
  a competing browser router. A private compatibility router MAY adapt its
  navigation to the host.
- **🏷️ Remote-owned types:** Workspace aliases in `tsconfig.base.json` MUST
  map exposed module names to the remotes' `src/remote-entry.ts` files. Those
  same files MUST be the federation exposures. Hosts
  import or derive types from those modules; they MUST NOT maintain copies of
  remote props or function signatures. Host type checking MUST NOT require a
  remote build. Federation still resolves runtime imports through its configured
  containers. Remotes generate declaration archives for external consumers;
  local hosts do not download them or use the type-reload WebSocket service.
- **📋 Dependencies:** Hosts MUST declare their remote workspace dependencies.
  Remotes MUST declare their exposures in `module-federation.config.ts` or
  `module-federation.config.js`, consumed by their bundler configuration.
  Nx recognizes these as remote applications without lint allow lists.
  Hosts MUST NOT bypass boundary checks for remote imports.
- **♻️ Releases:** A deployment MUST publish matching host, remote, and worker
  assets. Stable entry files MUST be revalidated on deployment; content-hashed
  chunks MAY be cached immutably.

## Why

Nx already integrates federation with the project graph and bundler. A second
runtime loader duplicates that work and hides deployment URLs in app code.
Named imports preserve ordinary lazy-loading semantics and make dependencies
visible to Nx and reviewers.

## Consequences

- **✅ Smaller app boundary:** Bootstrap chooses route dependencies; federation
  configuration chooses where they are fetched.
- **⚠️ Build responsibility:** Deployment paths, caching, and singleton versions
  must stay consistent across hosts and remotes.
- **⚠️ Alternate bundlers:** A Storybook that imports federated modules needs
  a federation-capable builder. Stories that exercise local views need no
  remote loader.

## Verification

Build host and remotes independently, then test their composition through the
host's E2E project. Check lazy downloads, loading/error states, direct URLs,
Back/Forward, theme sharing, and conversion cancellation in development and
production. Existing image baselines must remain unchanged for structural work.

See [shared execution mode](018-share-execution-mode-through-context.md) and
[landing routing](../apps/landing-mf-host/adr/003-serve-documentation-as-an-independent-route.md).
