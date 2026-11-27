# Repository architecture decisions

These proposed records document decisions that govern more than one Nx project. They describe the current implementation and the rationale that emerged as schema parsing, TypeScript generation, graph data, and the UI were separated. They are drafts for maintainer review, not claims of a separate approval event.

## Requirement language

Uppercase **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** have the meanings defined by [RFC 2119](https://datatracker.ietf.org/doc/html/rfc2119):

- **MUST / MUST NOT:** a contract or prohibition needed to preserve the decision.
- **SHOULD / SHOULD NOT:** a recommendation that permits a justified exception.
- **MAY:** a genuine option.

These terms apply to the proposed decision, not its rationale, examples, or trade-offs. A `proposed` status still means the record awaits maintainer review.

## How the decisions are grouped

- **Interpretation and ownership:** establish the transitive-node boundary and keep dependencies between packages one-directional.
- **Generated output:** group rendered declarations and project their relations into a framework-neutral graph.
- **Delivery and workspace tooling:** standardize the browser UI toolkit, accessible and responsive interactions, and test-first development across the testing pyramid; share library build configuration; and centralize lint, security checks, and compiler conventions without broadening runtime dependencies.

## Reading order

The zero-padded filenames follow this sequence across repository-level decisions.

1. [Use transitive nodes as the schema interpretation boundary](001-use-transitive-nodes-as-schema-boundary.md) — keep JSON Schema interpretation in `oas3-core` and pass a language-neutral model to renderers.
2. [Keep generation and presentation packages in one dependency direction](002-keep-package-dependencies-one-directional.md) — separate schema semantics, output rendering, graph derivation, and UI composition.
3. [Represent generated output as dependency-aware declaration groups](003-represent-output-as-declaration-groups.md) — distinguish referenced declarations from items that must share a file, then render single or separate files.
4. [Use a framework-neutral graph payload with source provenance](004-use-framework-neutral-graph-payload.md) — derive file and declaration nodes, relations, locations, and logs without depending on React Flow.
5. [Standardize React UI on a shared toolkit](005-standardize-react-ui-toolkit.md) — use React, MUI, the Codegena theme, Monaco, Lucide, feature-owned state, and service-free presentational components across browser UI.
6. [Centralize Rollup config and isolate CLI resolution](006-centralize-rollup-config-and-isolate-cli-resolution.md) — share Nx library packaging rules while keeping the OAS3 Core-to-OAS3 Visitor TypeScript CLI resolver narrowly scoped.
7. [Keep workspace tooling policy in Codegena NX Plugin](007-keep-workspace-tooling-policy-in-infr-nx.md) — classify shared lint, package-build, and compiler-declaration uses and keep consumer-specific exceptions local.
8. [Test composed browser UI through Storybook and Playwright](008-test-composed-ui-through-storybook-and-playwright.md) — reuse themed stories as fixtures for cross-view browser regressions in related Nx E2E projects.
9. [Make browser interactions accessible and testable](009-make-ui-interactions-accessible-and-testable.md) — expose meaningful roles, names, keyboard behavior, and states so users and browser tests follow the same UI contract.
10. [Defer coupled UI work after interactions](010-defer-coupled-ui-work-after-interactions.md) — let button, menu, and list events finish before substantial downstream updates in other views.
11. [Develop features test-first across the testing pyramid](011-develop-features-test-first-across-the-testing-pyramid.md) — pair focused Jest cases with Playwright journeys for UI-visible behavior and regressions.
12. [Check source security in the shared ESLint policy](012-check-source-security-in-shared-eslint-policy.md) — apply strict browser, secure-coding, and JWT checks from the common configuration.
13. [Use MUI tooltips for hover titles](013-use-mui-tooltips-for-hover-titles.md) — make React hover explanations themed and inspectable while keeping accessible names on controls.
14. [Seed generated Storybook data](014-seed-generated-story-data.md) — use realistic generated text without changing story content between reloads.
15. [Pass environment values and services to components explicitly](015-compose-browser-runtime-explicitly.md) — prepare configuration in `environment.ts`, pass it from startup, and keep service lifetimes with their features.
16. [Declare dependencies in consuming projects](016-declare-dependencies-in-consuming-projects.md) — give applications, libraries, and E2E projects explicit manifests and keep runtime packages out of development-only declarations.
17. [Check dependencies with Codegena Audit CI](017-check-dependencies-with-audit-ci.md) — require a successful dependency audit after each feature, reject new vulnerable dependencies, and limit exceptions for existing unpatchable packages to 14 days.

18. [Share execution mode through an explicit React context](018-share-execution-mode-through-context.md) — supply development and testing flags from startup and preserve them across federated views.
19. [Load federated apps through Nx configuration](019-load-federated-apps-through-nx-configuration.md) — use named remote imports, explicit deployment locations, and compatible singleton providers.
20. [Manage Docker stacks through Nx](020-manage-docker-stacks-through-nx.md) — keep Docker files with their projects, select environment profiles through Nx configurations, and declare build and runtime task dependencies.

The [OAS3 Core ADRs](../packages/oas3-core/adr/README.md) cover JSONC reconstruction, source lookup, schema interpretation, `UltimateParser`, diagnostics, and logging. The [OAS3 Visitor TypeScript ADRs](../packages/oas3-visitor-typescript/adr/README.md) cover the npm API and CLI, TypeScript visitors, output policy, and generator coverage. The [Graph Search Core ADRs](../packages/graph-search-core/adr/README.md) cover search ranking and visit history; the [Graph UI ADRs](../packages/graph-ui/adr/README.md) cover view-owned layout. The [Unified UI ADRs](../packages/ui-unified/adr/README.md) explain the shared-control boundary and entrypoints. The [Notification UI Core ADRs](../packages/notification-ui-core/adr/README.md) define replaceable delivery through React context; the [Notistack adapter ADRs](../packages/notification-ui-notistack/adr/README.md) describe local message presentation and overflow grouping. The [Playground UI ADRs](../packages/playground-ui/adr/README.md) cover interaction and component decisions specific to that package. Read the relevant root and local records before changing their contracts.

## What the tests established

- OAS3 Core and OAS3 Visitor TypeScript tests exercise schema interpretation and rendering as separate steps, including recursive references and grouped output.
- Graph-core tests exercise the projection from generated groups into serializable file and declaration relations.
- UI decisions have Storybook examples and package-specific ADRs. The Playground's related E2E project tests composed browser workflows; stories alone do not establish automated coverage or replace visual review.
