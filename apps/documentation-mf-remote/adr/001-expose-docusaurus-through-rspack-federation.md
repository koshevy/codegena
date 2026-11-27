---
status: proposed
date: 2026-11-16
decision-makers: Codegena project maintainers
---

# Expose Docusaurus through Rspack federation

## Decision

> **The documentation remote MUST render Docusaurus itself and expose a React
> wrapper through Module Federation. Docusaurus Faster selects Rspack.**

- **📦 Build:** Docusaurus owns content generation, route aliases, static
  rendering, and its supported Rspack compiler. The local Rspack extension adds
  federation. It MUST NOT switch the application to Webpack.
- **⚛️ Sharing:** React, React DOM, JSX runtimes, and Emotion are
  federation singletons. The standalone entry MUST cross an asynchronous
  bootstrap boundary before using those shared modules.
  The standalone HTML MUST omit the federation container script.
  The container uses an explicit `window` export so Docusaurus's module-mode
  minifier preserves the public entry in production.
  Docusaurus's `common` cache group is disabled because combining shared-module
  consumers with their fallback providers creates an asynchronous loading cycle.
  MUI components and their theme provider stay inside the documentation view;
  sharing MUI subpaths requires matching host configuration.
- **🧭 Router:** The exposed App wraps Docusaurus in its private Router 5
  context and HelmetProvider. Its `basename` defaults to `/`; the landing host
  supplies `/docs` and explicit navigation callbacks and location. A history
  adapter forwards actions to the host and mirrors that location. Only the
  standalone app creates a BrowserRouter. Router 5 MUST remain private;
  sharing it with the workspace's Router 7 would break both APIs.
- **🔌 Initialization:** The host calls `initializeDocumentation(path)` before
  rendering. This prepares Docusaurus's navigation runtime and preloads its
  initial route. Rspack's `ProvidePlugin` replaces Docusaurus Link's
  `window.docusaurus` lookup with an import of its navigation helper. The
  federated wrapper **MUST NOT** write that browser global.
- **🎨 Theme:** Docusaurus owns the selected color mode. The layout adapter
  reads it and supplies the matching `ui-theme` instance to MUI. Infima
  variables derive from that same theme. An embedding host MAY supply an
  explicit appearance value and change handler; those become the shared owner.
  Docusaurus's experimental CSS-layer polyfill is disabled because its added
  ID specificity overrides runtime Emotion styles. Other v4 flags stay enabled.
- **🧱 CSS ownership:** Build-time PostCSS wraps visual styles in native
  `@scope`, activated by the mounted documentation wrapper. The scope uses an
  attribute selector so CSS Modules cannot rename it. Document-root selectors
  become `:scope`, preserving Infima variables and theme selectors. Fonts and
  keyframes remain reusable assets. Unmounting docs deactivates its styles,
  including generic `pre` rules that would otherwise affect other routes.
- **📝 Code:** Markdown code fences use `code-editor-minimal` to render
  highlighted, selectable code in the page HTML. It uses the active theme
  and keeps the same markup on the client.
- **🪧 Branding:** Wordmark, contact block, and footer presentation belong to
  `ui-unified/branding`. Apps supply navigation and optional footer content;
  landing-specific section progress stays in the landing application.
  Header frame, navigation typography, theme selector, and GitHub link also
  come from the shared UI kit. Header appearance includes its shadow.

## Why

A second Markdown renderer would duplicate Docusaurus navigation, content
plugins, and blog behavior. An iframe would prevent normal React composition
in a federation host. The wrapper keeps those responsibilities in Docusaurus
while exposing one mountable application surface.

## Costs and limits

- **⚠️ Framework adapters:** Docusaurus does not publish a standalone mount
  API. The wrapper uses its client App and preload modules. Changes to those
  modules require a compatibility check when updating Docusaurus.
- **⚠️ Route-loader lifecycle:** The project's [dependency patch](../patches/README.md)
  moves `react-loadable` subscriptions into the committed mount lifecycle.
  Server-side module reporting remains available. Embedded documentation
  MUST keep Strict Mode and browser diagnostic checks enabled.
- **⚠️ Compiler version:** Docusaurus Faster owns its supported Rspack 1
  installation. Other apps use Rspack 2; forcing the workspace compiler into
  Docusaurus would bypass its tested build contract.
- **⚠️ Plugin types:** Docusaurus retains Webpack-shaped plugin types even
  in Rspack mode. The extension merges Rspack settings into the supplied
  configuration through the supported lifecycle hook.
- **⚠️ Hosting:** Federation chunks must be served along
  with the remote entry. Documentation content is bundled into that release.
  Cross-origin hosts need access to the remote's fonts and other assets.
  The host MUST provide its React and JSX runtime instances to the remote.
  Browser tests cover a production-built remote in both the production and
  development landing host, as well as matching standalone fixture builds.
- **⚠️ Browser CSS:** Scoped styles require native `@scope` and `:has()` support.
  Browser checks must verify actual layout, as mounted text alone does not
  establish that documentation styles applied.

## Verification

- Build real static pages and the federation entry with Rspack.
- Open every documentation partition and Blog on desktop and iPhone 15.
- Switch themes and load a local, highlighted code example without browser
  warnings, errors, or editor CDN requests.
- Mount the exposed App independently and navigate with browser article URLs.
- Open the landing host's `/docs/core-features` directly and reload it.
- Preserve landing image baselines when extracting shared branding.

## References

- [Docusaurus Faster configuration](https://docusaurus.io/docs/api/docusaurus-config#future)
- [Docusaurus 3.10 release](https://docusaurus.io/blog/releases/3.10)
