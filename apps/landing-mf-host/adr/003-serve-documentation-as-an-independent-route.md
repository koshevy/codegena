---
status: proposed
date: 2026-11-16
decision-makers: Codegena project maintainers
---

# Route landing and federated applications through one host session

## Decision

> **One host browser data router MUST own `/`, `/docs/*`, and
> `/playground/:specUrl`. Changing between these views MUST NOT reload the page.**

- **🧭 Explicit URLs:** `/` shows landing. `/docs/*` shows documentation.
  `/playground` redirects to the 1Password example; `/playground/:specUrl`
  accepts a URL-encoded same-origin specification URL. Each example has a
  bookmarkable path and can be reloaded directly.
- **📦 Lazy views:** Route loaders download federation modules only when
  needed. Landing renders the header and hero first. A deferred bundle owns
  the feature sections, footer, and illustration editor setup. The host
  warms navigation overlays as soon as their base views mount. Landing
  warms the Playground UI after the landing features are ready. Example
  selection owns conversion and editor
  initialization. The docs route loads separately and preloads
  the requested article before mounting. In-app navigation keeps the shared
  converting placeholder for pending specifications.
- **⏳ First paint:** Host HTML links to the shared UI theme reset so the
  background and loading line can render before scripts. The first committed
  route or route error removes the startup class. The router still owns
  pending states for later navigation.
- **💾 Files:** Startup registers the build-specific PWA worker after the first
  route commits. Ordinary browsing can use the file cache before a feature
  needs to connect a companion. See the
  [worker build contract](../../../packages/pwa/adr/002-identify-browser-workers-by-application-build.md).
- **🔗 Shared runtime:** The host shares React, React DOM, their JSX runtimes,
  and Emotion with the remotes. Build tools and other transitive dependencies
  **MUST NOT** become federation providers merely because Nx discovers them
  in the project graph.
- **🎮 Playground:** The host calls the remote's `createSpecificationLoader`
  and `loadPlaygroundView`. The host request signal owns cancellation;
  leaving a route aborts unfinished conversion. The remote MUST NOT create
  another router for these embedded sessions.
- **📚 Articles:** Docusaurus retains its private Router 5 context under
  `/docs`. A history adapter forwards navigation to the host and mirrors its
  current location. It MUST NOT install a second browser-history owner.
  The host keeps Router 7, including its DOM subpath, outside federation
  sharing; the two incompatible router APIs remain private.
- **🎨 Appearance:** The host supplies its theme choice and change handler to
  both remotes. Docusaurus synchronizes its own theme provider with that
  choice, including when its standalone HTML initializer has not run.
- **🔗 Menus:** Header, overlays, and footer use router-aware links for host
  paths. Example selection updates `specUrl`. Returning to landing restores
  its saved scroll position rather than creating a separate page session.
  Article fragment links also use host navigation so they retain the current
  article and participate in browser history and menu blockers. Root-relative
  bundle URLs avoid a document-wide base URL that would redirect fragments.
- **🌐 Hosting:** The host release includes both remotes' matching assets.
  Development and preview servers MUST return host HTML for page URLs.
- **🎨 Loaded styles:** Documentation CSS activates only while its wrapper is
  mounted. Leaving docs MUST NOT restyle the landing page or Playground.
  Bootstrap supplies `DevModeEnvContext` for the session, so route changes
  cannot change its testing mode during unmount. See the shared
  [execution-mode contract](../../../adr/018-share-execution-mode-through-context.md).

## Why

A page reload discards application state and repeats initialization. Separate
Playground memory routers also conceal the selected specification from the
address bar. Host-owned routes provide normal URLs and one navigation lifetime
without forcing Docusaurus's Router 5 into the host's Router 7 share scope.

## Costs and limits

- **✅ One session:** Navigation retains the host theme and browser history.
  Conversion still runs through PWA and app-owned workers.
- **⚠️ Two router versions:** Docusaurus needs its Router 5 context, but all
  embedded navigation goes through the host. The adapter must preserve URL
  resolution, state, Back/Forward, and cancellation.
- **⚠️ Deployment:** A host release includes matching remote assets. Static
  hosting needs an HTML fallback for direct article and specification links.

## Verification

- Desktop and iPhone 15 journeys open and reload articles and specifications,
  switch examples, navigate Back/Forward, and return to landing without a reload.
- Header checks compare height, background, and shadow with landing, and verify
  the selected article group, theme control, and GitHub icon link.
- Browser tests cover delayed downloads, conversion cancellation, navigation
  progress cleanup, and console diagnostics.
- Unit tests cover abandoned module loading, request-signal forwarding, failed
  downloads, and reuse of the remote's conversion loader.

See the [documentation decision](../../documentation-mf-remote/adr/001-expose-docusaurus-through-rspack-federation.md)
and [Playground decision](../../playground-mf-remote/adr/001-load-and-cancel-specifications-through-the-virtual-api.md)
for the remotes' responsibilities.
