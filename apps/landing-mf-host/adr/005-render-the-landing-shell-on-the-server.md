---
status: proposed
date: 2026-11-21
decision-makers: Codegena project maintainers
---

# Render the landing page on the server

On a cold visit, the Node host sends the welcome view, all six feature
sections, Ideology, and the footer in the first HTML response. Visitors can
read the feature descriptions and follow links while the browser downloads
JavaScript.

## Decision

- **Render the shared home route.** The landing host builds a React renderer
  alongside its existing Rspack output. The Node app configures it at startup
  with the build ID from the browser's warmup manifest. The renderer matches
  and renders each home request.
- **Hydrate the existing router.** Server and browser share the home route,
  layout, and theme providers. The initial server theme is dark. The browser
  restores the saved appearance after hydration.
- **Mount the client directly when its files are cached.** The build lists
  the entry, bootstrap, landing shell, interactive features, and reset CSS in
  the startup group. The [warmup configuration](../bundle-warmup/bundle-warmup-config.json)
  names it alongside the common groups. The bundle-warmup module prepares
  the SSR list with that group. Bootstrap selects it when hydrating a
  server-rendered landing. The worker warms it after the landing loads.
  When every file is cached, the worker sends its build ID in the next home
  navigation request. The server serves the empty React root for a matching
  build. A missing file or a different build keeps the server-rendered
  response. The live page restores the selected theme and loads Monaco when
  the selected code example approaches the viewport.
- **Enhance the feature story after paint.** The first HTML uses the same
  full-width stage, chapter order, and scroll distance as the live story.
  The interactive stage takes over when the deferred feature shell is ready.
  Its code examples stay readable while the selected editor loads.
  A failed download leaves the server-rendered chapters and links usable.
- **Serve from one origin.** Hono serves the Rspack assets, the Service Worker,
  and the federated bundles. Requests for `/docs` and `/playground` receive
  the browser entry document and use the existing client routes.
  The [local Caddy stack](../../landing-mf-host-ssr/README.md) terminates HTTPS
  and HTTP/3 on port 443. It caches content-hashed files for one year and
  preserves the build-specific HTML response's `no-store` policy.
- **Separate the artifacts.** Deploy `landing-mf-host`, `landing-mf-host-renderer`,
  and `landing-mf-host-ssr` together under the same output directory. Nx builds
  the browser and renderer artifacts as dependencies of the Node app.

## Verification

Run `npm exec -- nx serve landing-mf-host-ssr` to serve the app at
`127.0.0.1:8104`. Run `npm exec -- nx run landing-mf-host-e2e:e2e-ssr` to
verify the full page with JavaScript disabled, keep the feature bundle pending
during hydration, warm-reload into the live application, and open the federated
documentation and Playground.
