---
status: proposed
date: 2026-10-13
decision-makers: Codegena project maintainers
---

# Keep generation and presentation packages in one dependency direction

## Why

Schema parsing, TypeScript generation, graph data, and browser views need to evolve independently. A reverse import from a foundational package into a consumer would make that boundary difficult to maintain.

## Decision

> [!IMPORTANT]
> **Dependencies MUST point from composition toward reusable contracts; a contract package MUST NOT depend on its consumer.**

- **🧩 Interpretation:** [`oas3-core`](../packages/oas3-core/package.json) owns schema meaning and generic visitor/results contracts. [`oas3-visitor-typescript`](../packages/oas3-visitor-typescript/package.json) adds TypeScript rendering and a CLI.
- **🔗 Graph:** [`graph-core`](../packages/graph-core/package.json) derives language-neutral file and declaration relations from result groups. Its main entrypoint does not depend on OAS3 Visitor TypeScript or React.
- **🧪 Fixture integration:** [`graph-core/testing-utils`](../packages/graph-core/testing-utils/index.ts) is an opt-in entrypoint that runs the TypeScript visitor and projects its results with collected logs. It declares the visitor as an optional peer and a development dependency. Production consumers of the main graph contract do not import this fixture entrypoint.
- **🔎 Search:** [`graph-search-core`](../packages/graph-search-core/adr/README.md) indexes graph data and owns suggestion identity and visit history. `graph-search-ui` presents those suggestions; Playground connects selection to its panels and editors.
- **🎨 Presentation:** [`ui-theme`](../packages/ui-theme/package.json) supplies tokens; [`graph-ui`](../packages/graph-ui/package.json) renders the graph; [`playground-ui`](../packages/playground-ui/package.json) composes the views.
- **🔔 Notifications:** [`notification-ui-core`](../packages/notification-ui-core/package.json) defines the React transport contract. [`notification-ui-notistack`](../packages/notification-ui-notistack/package.json) implements it; the playground mounts that adapter at its composition boundary.

A new cross-package contract **MUST** live in the lowest package that can express it without importing a consumer. Siblings **MUST** use public `@codegena/*` entrypoints. This decision describes intended direction; it does not claim every boundary is currently enforced by Nx tags.

## Trade-offs

- **✅ Good:** OAS3 Core remains reusable without TypeScript UI, Monaco, or React dependencies.
- **✅ Good:** Graph data can serve several views without adopting their layout state.
- **⚠️ Cost:** Public exports and contract changes must be coordinated across affected packages. Some integration belongs in the higher-level composition package.

## Alternatives

- **One large package:** Fewer entrypoints, but unclear ownership and a larger dependency surface.
- **Each UI derives its own graph:** Avoids an adapter, but duplicates interpretation and couples views to one generator.

## Verification

Feature-local helpers need not become packages. A new boundary should not be created merely because two files look alike. Review the Nx graph for cycles, use declared dependencies and public exports, and run affected Nx lint and build targets.

The [transitive-node](001-use-transitive-nodes-as-schema-boundary.md), [declaration-group](003-represent-output-as-declaration-groups.md), and [graph-payload](004-use-framework-neutral-graph-payload.md) records describe the data crossing these boundaries.
