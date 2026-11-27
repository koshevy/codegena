---
status: proposed
date: 2026-10-14
decision-makers: Codegena project maintainers
---

# Centralize Rollup config and isolate CLI resolution

## Why

Publishable libraries need the same entrypoint discovery, output formats, assets, and exports. OAS3 Visitor TypeScript has one exception: its CLI bundle resolves OAS3 Core secondary entrypoints from built output. Copying whole configurations would let published shapes drift.

## Decision

> [!IMPORTANT]
> **Keep common packaging rules in `@codegena/infr-nx`; keep the CLI resolver narrow and consumer-specific.**

- **📦 Shared factory:** [`createUnifiedRollupConfig`](../packages/infr-nx/rollup/create-unified-rollup-config.cjs) **MUST** own shared secondary-entrypoint, ESM/CJS, asset, and export policy. Each library's small `rollup.config.cjs` supplies its own options.
- **📂 Explicit inputs:** Discovered entrypoints use absolute file paths, so
  names such as `storybook/index.ts` cannot resolve as npm package imports.
  The factory supplies one input map instead of competing `main` and
  `additionalEntryPoints` options.
- **📜 Module formats:** ESM output uses `.esm.js`; CommonJS uses `.cjs` so
  Node can load it inside a `type: module` package. The generated exports map
  **MUST** provide matching `import`, `require`, and `types` paths.
  Nx prepares the ESM package; the shared factory adds the CommonJS output.
  The built manifest includes files relative to the output directory so npm
  can pack that directory directly. The [publication E2E project](../apps/cli-delivery-e2e/README.md)
  installs the published CLI from its own registry before compiling generated code.
- **🗺️ Source maps:** TypeScript emits both JavaScript and declarations, and
  Rollup combines its source maps. A second SWC transformation is unnecessary
  and can break the map between generated JavaScript and source TypeScript.
- **🛠️ Local exception:** [OAS3 Core's CLI resolver](../packages/oas3-core/rollup/resolve-oas3-core-for-cli-plugin.cjs) knows its built entrypoints. The [OAS3 Visitor TypeScript wrapper](../packages/oas3-visitor-typescript/rollup/bundle-cli-dependencies.cjs) opts into it; neither owns the shared factory.
- **🔌 Runtime backends:** The OAS3 Visitor TypeScript CLI bundle keeps `recheck` external. Its
  synchronous backend resolves native packages at runtime; bundling that
  CommonJS loader into the ESM CLI prevents the command from starting.
  OAS3 Visitor TypeScript declares it as a direct runtime dependency because the published
  bundle imports it.
  The formatter resolves its JSDoc plugin from the installed package so
  CLI invocations from an empty consumer directory use the same formatter.
- **🔗 External packages:** The [shared reader](../packages/infr-nx/rollup/get-unified-external-packages.cjs) uses [`.unified-ui-packages.json`](../.unified-ui-packages.json) when a consumer opts in.
  - [Playground UI](../packages/playground-ui/rollup.config.cjs) also supplies local externals and sets `buildLibsFromSource: false`.

The OAS3 Core resolver assumes this workspace's `dist/oas3-core` layout. It is build-time integration, not a general runtime reference resolver.

**Source-only CLIs:** An already executable MJS package such as
`@codegena/audit-ci` **MAY** publish its source, declarations, and executable
without Rollup or compilation. It **MUST** run directly from its published
files. This keeps a zero-dependency CLI usable before workspace libraries are
built; the shared factory continues to own packages that require bundling.

## Trade-offs

- **✅ Good:** Package output follows one policy while a CLI-specific exception remains visible.
- **⚠️ Cost:** Factory changes can affect several libraries and need affected builds.

## Alternatives

- **Copy full configs:** Easy initially, but publishing behavior drifts.
- **Put the common factory in OAS3 Core:** Blurs workspace build policy with OAS3 Core's narrower resolver.

## Where to look

[OAS3 Core](../packages/oas3-core/rollup.config.cjs), [OAS3 Visitor TypeScript](../packages/oas3-visitor-typescript/rollup.config.cjs), and [Graph Core](../packages/graph-core/rollup.config.cjs) call the factory. The [Codegena NX Plugin config](../packages/infr-nx/rollup.config.cjs) packages its own configuration and typings. The [workspace tooling decision](007-keep-workspace-tooling-policy-in-infr-nx.md) gives the wider ownership rule.

## Verification

- [ ] A common packaging change passes affected Nx builds and produces the expected entrypoints and exports.
- [ ] The CLI resolver still matches built OAS3 Core artifacts without altering other libraries' defaults.
- [ ] The built CLI starts and converts a representative OpenAPI fixture in separate-file mode.
