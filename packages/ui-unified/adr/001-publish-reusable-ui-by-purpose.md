---
status: proposed
date: 2026-11-01
decision-makers: Codegena project maintainers
---

# Publish reusable UI by purpose

## Why

UI libraries need shared controls while retaining ownership of their domain
behavior. Duplicating controls lets styling and interactions drift. Putting
feature-specific data into a shared control couples every consumer to that
feature. A lower-level UI kit keeps each reusable control's markup, styles, and
stories together. Consumers supply their own data and actions.

## Decision

> [!IMPORTANT]
> **`@codegena/ui-unified` owns cohesive, domain-neutral controls for use across
> UI libraries. Each feature supplies its own data and actions.**

- **🧩 Focused imports:** Shared controls **MUST** be published through
  purpose-based secondary entrypoints such as `panels`, `menus`, and `code-editor`.
  Consumers **SHOULD** import a focused entrypoint to avoid pulling unrelated
  editor or scrolling code into a bundle.
- **🎨 Theme:** Components **MUST** use `@codegena/ui-theme` through MUI's
  theme API. A shared component receives prepared labels, counts, icons, or
  callbacks; it does not interpret a `GraphPayload` or Playground selection.
- **💻 Monaco:** Editor components and worker setup have separate entrypoints.
  Full-editor hosts **MUST** initialize Monaco before mounting the editor.
  `monaco-bootstrap` owns local runtime setup; the build-only `monaco-webpack`
  entrypoint supplies local JSON and editor worker options for Rspack and
  Webpack. Generated TypeScript uses only the syntax tokenizer. The build
  **MUST NOT** include Monaco's TypeScript compiler and language-service worker.
  Vite 8 hosts **MUST** merge `monaco-vite` into their configuration before using
  `monaco-workers`. This binds Monaco's environment lookup to the local
  `monaco-environment` module through Vite's public Oxc transform API, without a
  browser-global assignment.
- **📄 Editor modes:** `code-editor` exposes `CodeEditor` and `GeneratedCodeEditor`.
  The default `full` mode loads Monaco and registers its contributions before
  mounting. `minimal` uses TanStack Highlight and native text editing or
  selection. Apps that only use minimal mode import `code-editor-minimal` so
  static builds and server renders have no dependency on Monaco. Both
  implementations use the same palette roles and typography, with layouts
  sized for the same code and gutter.
- **📍 Domain boundary:** The UI kit maps declaration kinds to icons, but does
  not derive them from a graph or schema. The generic severity card stays in
  the UI kit; Playground UI owns warning content and actions. Graph selection
  stays with Graph UI.
- **🪧 Branding:** `branding` owns the wordmark, contact presentation, and
  shared footer. Consumers supply links, their router's link component, and
  optional footer content. Application navigation stays with the application.
- **📚 Stories:** Shared controls **MUST** show their meaningful display states
  in co-located stories. Composed browser paths stay in the consumer's E2E
  project; isolated shared interactions belong to `ui-unified-e2e`.

## Trade-offs

- **✅ Good:** One set of visual defaults serves both editor modes. Secondary
  imports make the dependency visible and keep large editor code optional.
- **⚠️ Cost:** Moving a control across the boundary requires updating package
  manifests and tests, and its props must remain free of feature-specific data.

## Where to look

The [entrypoint guide](../README.md) lists the public modules. The
[panel controls](../panels/) and [code editors](../code-editor/) show the two
ends of the bundle-size range. The [declaration icon](../icons/declaration-type-icon/)
provides a graph-independent glyph. [Playground UI](../../playground-ui/misc-ui/warning-detailed/)
owns warning details.

## Verification

- [ ] The UI kit builds, lints, and publishes its secondary entrypoints.
- [ ] Shared stories build and `ui-unified-e2e` passes.
- [ ] Graph UI and Playground UI build and retain their composed browser paths.
