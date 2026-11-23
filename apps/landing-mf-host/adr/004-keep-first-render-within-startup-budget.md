---
status: proposed
date: 2026-11-19
decision-makers: Codegena project maintainers
---

# Keep the landing first render within 1 MB

## Decision

- **First view.** The production home route **MUST** render its welcome view
  and navigation within 1,000,000 bytes of uncompressed responses on a cold
  load. The HTML loading line follows the device color scheme and shows a
  message after 1.5 seconds. Once the welcome view mounts, a themed line
  remains visible until the lower landing content is ready. A warning
  appears if that wait lasts two seconds and disappears with the line.
- **Startup stylesheet.** The HTML stylesheet link and its preload use
  the same content-hashed reset URL. A new reset therefore gets a new URL
  while the font paths in its CSS still resolve alongside it.
- **Separate imports.** The welcome section imports its progress indicator
  through a dedicated entrypoint. The scroll-stage shader and minimal editor
  belong to the lower sections. Playground loads the additional editor features.
- **Background work.** Start the lower section shell, prompt, custom scrollbar,
  and worker caching after the first view has had a frame to paint. Keep the
  CSS glow visible while the optional WebGL halo waits for the shell and an
  idle browser callback. Ask the worker to warm the navigation overlay first.
  Once the shell is ready, request the search preview and Playground entry
  through the `landingCompletelyLoaded` turn. The application layout
  owns that turn across navigation. Startup reads the groups from
  `bundle-warmup-config.json` in `environment.ts` and passes them to the
  layout through the router.
- **Prepare code slides together.** Render every slide's highlighted code with
  its carousel and keep inactive slides inert. Reserve space for the tallest
  caption so changing examples leaves the editor in place. The mobile drawer
  keeps the same editor instance. Load the blob renderer near the viewport
  and load Glitch and Nebula as their chapters approach.
- **Warmup manifest.** The production build passes
  [its group configuration](../bundle-warmup/bundle-warmup-config.json) to
  `@codegena/pwa/rspack`, which maps groups to emitted JavaScript and CSS.
  The Playground group
  includes its remote entry and the synchronous assets of its `App` expose.
  Serve those files with a header such as `Cache-Control: public, max-age=3600`
  so the worker can reuse them. The Nx static preview sends non-cacheable
  headers, so the browser test supplies the public header for its cache check.
  The worker revalidates the manifest and checks its build ID before fetching
  files. Features can still load on demand if warming fails.
- **Search demo.** The search service and graph load when the drawer first
  asks for suggestions. The landing route owns the search source so
  scrolling between sections can reuse its index.
- **Nebula.** The scroll-stage blob supplies its own shader definition so
  it can render without downloading the built-in registry.
- **Return to landing.** Once the lower sections have loaded in the current
  router session, render them immediately on return so scroll restoration
  has the full document height.

## Why

The progress indicator is a count and a scroll cue. Importing it through an
entrypoint shared with shader effects can make the renderer download those
effects before showing the hero. Separating the imports keeps the effects
available to the sections that use them.

## Verification

The [landing startup cases](../../landing-mf-host-e2e/src/preloading.spec.ts)
check the byte budget and restoration to deferred content.
The [bundle warmup case](../../landing-mf-host-e2e/src/bundle-warmup.spec.ts)
checks download order and opens the navigation overlay from the worker cache.
