---
status: proposed
date: 2026-11-13
decision-makers: Codegena project maintainers
---

# Pass environment values and services to components explicitly

## Why

A component's typed props and explicit feature contexts should show what can
change its behaviour. Reading an environment value, global setting, or hidden
service adds an input that this contract does not reveal. The component can
then produce a different result, or fail, even when its declared inputs have
not changed.

These undeclared dependencies also make refactoring harder. Moving or reusing
the component carries requirements its types do not describe. Callers cannot
reliably identify or control those requirements, so a change elsewhere can
break the component unexpectedly.

## Decision

> **`environment.ts` prepares application configuration. Startup passes its
> exports to features through explicit props and contexts.**

- **⚙️ Environment:** Application runtime configuration **MUST** be read and
  prepared in `environment.ts`. It **MUST** export ready-to-use values such as
  `appBuildId` and `devModeEnv`.
- **🚀 Startup:** Static imports and re-exports of `environment.ts` **MUST**
  stay in startup. Dynamic imports remain unrestricted.
  `main.ts` and `bootstrap.tsx` **MUST NOT** read `process.env`, DefinePlugin
  globals, or other global configuration directly.
- **🧩 Components:** `App`, child components, and hooks **MUST NOT** statically import
  `environment.ts` or read global configuration. Startup **MUST** supply
  prepared values through named props or explicit feature contexts.
  Build tools may read their own environment separately.
- **🔌 Feature composition:** Service identity, endpoints, and external stores
  **MUST NOT** be hidden globals or import-time singletons. A named provider or
  feature container **MUST** declare these inputs and release unfinished work
  when its inputs change or it unmounts.
- **🧩 Views:** Presentational children **MUST** receive data and actions.
  Using a browser API to perform an explicit action is allowed; it does not
  authorize a view to discover application configuration implicitly.
- **💻 Editor startup:** Hosts **MUST** initialize local Monaco before an editor mounts,
  at bootstrap or through an explicit lazy-route initializer.
  `@codegena/ui-unified/monaco-bootstrap` owns the shared browser setup;
  `monaco-webpack` owns the optional build configuration. The build entrypoint
  **MUST NOT** be imported through the runtime UI barrel.
- **📚 Storybook:** Its `bootstrap` supplies one build identity to its feature
  decorators and stories. Worker identity follows the existing
  [PWA build policy](../packages/pwa/adr/002-identify-browser-workers-by-application-build.md).

## Consequences

- **✅ Visible dependencies:** A caller can determine a view's external
  behavior from its props and named feature providers.
- **✅ Bounded lifetime:** Replacing a feature aborts its pending downloads
  and releases its clients; stale completions cannot replace a newer service.
- **⚠️ Composition work:** Applications and Storybook must supply runtime
  configuration rather than rely on a convenient global default.

## Verification

Check that application environment reads stay in `environment.ts` and only
startup statically imports that module. Bootstrap and components must not read global
configuration directly. Exercise service release during initialization,
replacement after failure, and normal use through the owning application's
browser tests. Editor consumers must load local workers without a CDN request.

See [service-free views](../CODE_STYLE.md#rule-39),
[explicit runtime dependencies](../CODE_STYLE.md#rule-40), and the
[shared UI toolkit](005-standardize-react-ui-toolkit.md).
