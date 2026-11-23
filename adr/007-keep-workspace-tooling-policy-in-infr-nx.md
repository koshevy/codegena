---
status: proposed
date: 2026-10-15
decision-makers: Codegena project maintainers
---

# Keep workspace tooling policy in Codegena NX Plugin

## Why

Libraries import Codegena NX Plugin as `@codegena/infr-nx` in configuration files.
It owns shared development and packaging policy, including executors used by
projects that run a local Docker Compose stack.

## Decision

> [!IMPORTANT]
> **Use `@codegena/infr-nx` for workspace-wide lint, build, and compiler conventions. Keep consumer-specific behavior in its owning package.**

- **🧹 Lint:** The root [ESLint config](../eslint.config.mjs) imports the [base flat config](../packages/infr-nx/eslint-config/root.config.mjs).
  - Libraries apply [`typecheckedForProject`](../packages/infr-nx/eslint-config/typechecked-for-project.mjs) with their own path.
  - Type-checked rules target TypeScript files. Codegena NX Plugin also applies core JavaScript rules to its `.mjs`, `.cjs`, and `.js` tooling files.
  - Shared rules include TypeScript, React, JSON, imports, tests, stories, formatting, [security checks](012-check-source-security-in-shared-eslint-policy.md), and [Nx tag constraints](../packages/infr-nx/eslint-config/large-rules/global-nx-tags.mjs).
  - The [Unicorn code-standard rules](../packages/infr-nx/eslint-config/rule-sets/code-standard-rules.mjs) apply to JavaScript and TypeScript. They are an explicit selection, not Unicorn's recommended preset; deliberate warning exceptions remain visible in the central config. The root and published tooling package both declare the plugin.
  - [CSS rules](../packages/infr-nx/eslint-config/rule-sets/css-rules.mjs) use ESLint's official CSS language plugin for `.css` files. UI libraries also run Stylelint with the standard config and `postcss-styled-syntax` inside their existing Nx `lint` target, so MUI/Emotion template strings are checked without a separate target.
  - ESLint 10 uses the official `@eslint/compat` wrapper around Nx's React presets. The three upstream plugins with stale ESLint peer ranges are repaired narrowly in the root `packageExtensions`; npm 12 records those repairs in the lockfile. New React Hooks compiler checks are kept separate from this compatibility update.
  - `codegena/environment-boundary` enforces startup-only static environment
    imports and confines runtime environment/custom global reads to
    `environment.ts`. Built-ins, dynamic imports, and build configuration
    remain allowed. Its regression cases run with
    `nx run @codegena/infr-nx:test-environment-boundary`.
  - The tags describe a boundary vocabulary; not every project necessarily carries every tag.
- **📦 Builds:** The [Rollup factory](../packages/infr-nx/rollup/create-unified-rollup-config.cjs) discovers first-level entrypoints, emits ESM/CJS, copies assets, and writes exports.
  - Consumers supply options.
  - The [Rollup decision](006-centralize-rollup-config-and-isolate-cli-resolution.md) covers the CLI exception.
- **🐳 Docker Compose** runs from the owning project directory via the
  [shared executors](../packages/infr-nx/README.md#local-docker-compose).
  Projects define their Compose files and declare artifact build dependencies
  in Nx. Compose targets disable Nx caching because they change Docker state.
- **🧾 Compiler types:** The root [TypeScript config](../tsconfig.base.json) includes the package's [raw stylesheet declarations](../packages/infr-nx/typings/cssraw.d.ts) for multiple projects.
- **🧭 TypeScript synchronization:** The sync generator in
  [`nx.json`](../nx.json) uses `tsconfig.lib.json` for runtime dependency
  references. It continues managing root and project solution references.
  - Browser applications use source aliases and explicit `tsc --noEmit`
    checks. Their app configs **MUST NOT** acquire composite-build references
    while the referenced libraries do not support composite builds.
  - A future migration to composite application builds **MUST** update the
    generator's runtime config names and the referenced libraries together.
  - Playwright source checks do not emit declarations. The
    [landing E2E target](../apps/landing-mf-host-e2e/project.json) explicitly
    checks its E2E config instead of using the inferred declaration-build task.

Projects select the executors in their target configurations. Nx discovers
them through the package's [executor registry](../packages/infr-nx/docker-compose/executors.json).

Configuration imports are build-time imports, not runtime dependencies for generated libraries. The [module-boundary rule](../packages/infr-nx/eslint-config/large-rules/enforce-module-boundaries.config.mjs) permits them.
Consumer library tsconfigs use `nx.sync.ignoredDependencies` for this tooling-only edge, so Nx does not turn it into a TypeScript project reference.

## Ownership

- **🧭 Shared rule:** A workspace-wide convention **MUST** change the central config; a project-specific exception **SHOULD** use a narrow local override.
- **📦 Published config:** Codegena NX Plugin **MUST** declare the ESLint packages its published flat config loads, including plugins loaded indirectly by Nx's presets. Its build **MUST** copy nested rule sets and exceptions referenced by that config.
- **🔧 Reproducible install:** Contributors **MUST** use the npm version declared in the root package manifest. A normal `npm ci` **MUST** reproduce the compatibility repairs without globally disabling peer checks.
- **🎨 CSS templates:** Styles written in MUI/Emotion template strings **SHOULD** use theme values for colors. Stylelint checks the embedded CSS; the shared ESLint rule warns when `styled` uses an object instead of a string template.
- **🔌 Local build choice:** A consumer can add externals or assets. [Playground UI](../packages/playground-ui/rollup.config.cjs) does so; [OAS3 Visitor TypeScript](../packages/oas3-visitor-typescript/rollup.config.cjs) wraps its CLI build. OAS3 Core retains knowledge of its built entrypoints.
- **⚙️ Bootstrap:** The package can use its own source-level helpers before its distribution bundle exists. Those helpers **MUST** remain loadable during configuration evaluation.

## Trade-offs

- **✅ Good:** Shared changes have one implementation and local exceptions remain visible.
- **⚠️ Cost:** A central config edit can affect every consumer; review resolved Nx targets and affected checks.
- **⚠️ Cost:** The ESLint 10 bridge depends on npm 12 and an upstream compatibility wrapper until the React and import plugins publish native support. Remove each peer repair when its upstream package declares ESLint 10 support.

## Alternatives

- **Copy configs into each library:** Obscures which rules are universal.
- **Put one CLI resolver into the default factory:** Makes an exception every package's policy.

## Verification

- [ ] Affected Nx lint/build targets pass; generated entrypoints, assets, and exports match the intended change.
- [ ] Project-specific choices stay local, and the compiler resolves shared stylesheet declarations.
