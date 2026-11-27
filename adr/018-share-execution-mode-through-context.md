---
status: proposed
date: 2026-11-18
decision-makers: Codegena project maintainers
---

# Share execution mode through an explicit React context

## Decision

> **React features read development and testing flags from
> `DevModeEnvContext`, owned by `@codegena/util-dev-mode`.**

- **🏷️ Contract:** `DevModeEnv` has two independent boolean fields:
  `isDevMode` and `isTestingMode`. Testing a production bundle does not make
  it a development build.
- **⚙️ Environment:** Each standalone app MUST prepare and export `devModeEnv`
  from `environment.ts`. Production MUST set `isDevMode: false`.
  A test setup enabling deterministic behavior MUST set `isTestingMode: true`.
  The environment module reads `?testingMode=true` to enable predictable tests,
  including visual checks.
- **🚀 Startup:** Only startup MAY statically import `environment.ts`. It MUST pass
  the prepared flags through props or supply them to `DevModeEnvContext`.
  Bootstrap, components, and hooks MUST NOT infer
  execution flags from environment globals or URLs. Components and hooks
  MUST NOT statically import `environment.ts`.
  Dynamic imports remain unrestricted.
- **🧩 Default:** The context defaults to
  `{ isDevMode: true, isTestingMode: false }`. This supports isolated components;
  it does not replace explicit production or testing setup.
- **🔗 Federation:** Hosts and remotes MUST share this package as a singleton.
  Embedded views MUST inherit the host's flags. A remote's standalone startup
  supplies its own flags without overriding an embedded session.
- **🧪 Visual tests:** Decorative animation MAY stop in testing mode.
  Reduced-motion preferences remain a separate accessibility input. Interactive
  browser tests SHOULD leave testing mode off when animation is under test.

## Why

A local name such as “static visual mode” hides that the value selects test
behavior. One typed contract makes execution conditions visible and lets
shared UI use them without importing an application's private context.

## Consequences

- **✅ Shared meaning:** All consumers use the same two flags and defaults.
- **⚠️ Explicit setup:** Standalone apps and test harnesses must provide their
  intended values. The context does not discover its environment.
- **🔒 Scope:** These flags control UI behavior, not authorization or security.

## Verification

Unit tests cover the default and production/development testing combinations.
Landing screenshot tests preserve deterministic visuals, while GPU tests retain
live shaders. Federated navigation must preserve the host provider.

See [explicit runtime inputs](015-compose-browser-runtime-explicitly.md),
[Module Federation](019-load-federated-apps-through-nx-configuration.md), and the
[library](../packages/util-dev-mode/README.md).
