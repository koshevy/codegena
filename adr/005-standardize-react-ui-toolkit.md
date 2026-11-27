---
status: proposed
date: 2026-10-13
decision-makers: Codegena project maintainers
---

# Standardize React UI on a shared toolkit

## Why

The graph and playground combine editors, trees, notifications, and resizable views. Separate styling and state systems for each feature would make the UI inconsistent and harder to maintain.

## Decision

> [!IMPORTANT]
> **Browser UI MUST use React, MUI, and the shared Codegena theme. Interaction state MUST stay with its owning feature; browser UI MUST NOT add Redux, Zustand, or a comparable global store.**

### Controls and presentation

- **🧩 React and MUI:** React is the browser framework; `@mui/material` supplies general controls. Framework-neutral packages such as OAS3 Core and graph-core stay React-free.
- **🌳 Specialized controls:** Use `@mui/x-tree-view` for nested file/declaration lists and `react-resizable-panels` for resizable regions. The feature still owns sorting, selection, visibility, and navigation.
- **📝 Forms:** `react-hook-form` is the default owner of form values,
  validation, and submission. Use its field, controller, and array APIs for
  dynamic forms; see the [form state](../CODE_STYLE.md#rule-48) and
  [widget metadata](../CODE_STYLE.md#rule-49) rules.
- **📜 Virtual lists:** Long lists and expensive rows such as Monaco-backed file cards **MUST** use `@tanstack/react-virtual`. The product **MUST** retain ownership of markup, scroll surface, stable IDs, and reveal behavior.
- **🖱️ Scrollbars:** Use `overlayscrollbars` on application-owned inner scroll surfaces.
  - Keep `window` as the scroll owner when a page controller uses
    `window.scrollTo`, as Lenis does on the landing page. A document-level
    OverlayScrollbars instance **MAY** use the body itself as its viewport;
    this retains `documentElement` scrolling without creating an inner scroll
    container. Its overlaid track avoids layout shifts when a menu locks scrolling.
  - Scope document scrollbar styles to its own theme class. Inner surfaces and
    editor scrollbars **MUST NOT** inherit document-specific overrides.
  - Keep a viewport observed by a virtualizer stable; let Monaco and React Flow retain their own scrolling.
  - Match square handle size and palette-based normal/hover/active colors across application and Monaco scrollbars.
  - Add a thin translucent track border only to custom scrollbars.
- **🎨 Theme and styles:** `@codegena/ui-theme` owns light/dark tokens. Use MUI `styled` with Emotion and theme values, keeping styles beside their component. Follow local template-string and `// language=postcss` conventions.
- **🔤 Typography and icons:** `@fontsource/jetbrains-mono` supplies the monospace face through `fontFamilies.mono`; `lucide-react` is the default icon set for new general UI. Existing specialized icons need not be replaced solely for consistency.
- **💻 Code editing:** Use `@codegena/ui-unified/code-editor` for the shared
  visual contract. Full mode uses Monaco for editor actions, navigation, and
  glyphs. Minimal mode uses TanStack Highlight for synchronous highlighting and
  native text input. Both modes use tokens from the active MUI theme.
- **🧰 Shared controls:** [`@codegena/ui-unified`](../packages/ui-unified/README.md) owns generic controls and editor infrastructure.
  - Purpose-based entrypoints let consumers load only the controls they need.
  - The library **MUST NOT** depend at runtime on another Codegena UI library.
  - Graph and Playground supply their own data, navigation, and notification behavior.

### Ownership and development

- **🧭 State stays near its owner:** Use component state and focused hooks.
  - Keep state shared across views in their nearest coordinating feature;
    pass its values and actions to presentational children without copying
    that state. Independent features retain their own local state.
  - Encapsulate complex editing behind a typed `value` / `onChange` contract.
    Keep related state, effects, refs, handlers, and cleanup in named hooks
    owned by that feature. See the [state ownership](../CODE_STYLE.md#rule-42),
    [controlled editor](../CODE_STYLE.md#rule-43), and
    [hook extraction](../CODE_STYLE.md#rule-44) rules.
  - A provider owns its shared preferences. Expose the values and their
    update actions through one context hook when callers use them together.
    Persist only the saved data. For a single preference, reuse its type at
    the storage boundary. See [hook result contracts](../CODE_STYLE.md#rule-44).
  - Preferences **SHOULD** persist at the feature boundary when needed; broad React context **MUST NOT** disguise a global UI store.
  - MUI's theme context remains appropriate.
- **🪜 Components depend downward:** Children **MUST NOT** import parent-private styles or behavior. Place shared controls at a neutral level; put derived data and imperative behavior in focused hooks. See the [React rules](../CODE_STYLE.md#react-rules).
- **🔌 Services stay outside views:** A feature container or hook handles subscriptions, transports, and business rules.
  - Presentational components receive prepared props and callbacks; they may own local display state.
  - A self-contained view needs no ceremonial container.
- **🧱 Conditional classes:** Use object-form `clsx` with component-owned base and modifier classes instead of assembling strings in JSX.
- **📚 Storybook:** Keep focused stories beside significant components, using local fixtures.
  - UI Storybooks **MUST** use the shared [`@codegena/ui-theme/storybook`](../packages/ui-theme/storybook/) preview for the theme and page defaults.
  - Local decorators **MUST NOT** copy that setup. They add only feature-specific providers.
  - Dark variants set `parameters: { codegenaTheme: 'dark' }`.
- **🧪 Browser tests:** Follow the [Storybook and Playwright decision](008-test-composed-ui-through-storybook-and-playwright.md) for composed workflows.

### Dependency rule

- **🧩 Shared runtime:** Standardized external packages live in
  [`.unified-ui-packages.json`](../.unified-ui-packages.json) and the root
  [manifest](../package.json). A library using one at runtime declares a
  **major-only peer** such as `"19.x"`; the consumer supplies the instance.
  Applications follow the same peer rule; the root provides concrete versions
  in `dependencies`.
  Runtime UI packages, including MUI and Emotion, **MUST NOT** be placed in
  `devDependencies`; see [dependency ownership](016-declare-dependencies-in-consuming-projects.md).
- **🧪 Development:** A package used only in stories or tests **MUST** be in
  `devDependencies`. Its version **MUST** match the root declaration for shared
  external tools; workspace-only development packages **MUST** use `"*"`.
- **🔗 Exception:** A required incompatible major remains a private runtime
  dependency when it can coexist with the consumer's version. Keep manifests
  and the lockfile aligned; the shared list also informs Rollup externals.

This decision does not mandate React in framework-neutral packages, choose a graph engine, or require an unrelated rewrite of existing components.

## Trade-offs

- **✅ Good:** Components share one visual language, editor behavior, and ownership model without a repository-wide mutable store.
- **⚠️ Cost:** Monaco and specialized controls add bundle weight and require coordinated light/dark theming. Cross-region behavior needs explicit owner hooks and callbacks.
- **⚠️ Compatibility:** A major-only `0.x` peer range can admit minor releases
  with breaking changes; affected builds and integration tests need to catch
  them.
- **🔄 Adoption:** Align an existing feature when it is materially changed; do not force a repository-wide rewrite for this ADR alone.

## Alternatives

- **A toolkit per feature:** Allows local preferences but multiplies themes and accessibility conventions.
- **Use only the minimal editor:** Fits articles and previews. Playground still needs Monaco navigation and glyphs.
- **Redux or Zustand for all UI state:** Adds indirection where a shared React owner already expresses the relationship.

## Where to look

- **Theme and views:** [UI theme](../packages/ui-theme/src/lib/theme/) owns tokens consumed by [graph-ui](../packages/graph-ui/src/lib/codegena-graph-view/) and [playground-ui](../packages/playground-ui/src/lib/).
- **Code surfaces:** The [shared code editor](../packages/ui-unified/code-editor/) owns both implementations; [scrollbar-theme](../packages/ui-unified/scrolling/scrollbar-theme/) maps the palette to scrollbars, including the landing's [window scrollbar](../apps/landing-mf-host/src/app/landing-page/window-scrollbar/window-scrollbar.styles.ts).
- **Service boundary:** The [Notistack decision](../packages/notification-ui-notistack/adr/001-adapt-local-notifications-to-notistack.md) shows the container/view split.

## Verification

- [ ] Standardized dependencies appear in the shared list, root manifest, and consuming projects' peers.
- [ ] Long or expensive lists are virtualized without losing navigation or scroll state; themed stories cover meaningful light/dark states.
- [ ] Changed UI passes its Nx lint, typecheck, build, Storybook, and related browser checks.
