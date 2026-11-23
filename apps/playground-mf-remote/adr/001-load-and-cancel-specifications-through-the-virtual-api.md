---
status: proposed
date: 2026-11-13
decision-makers: Codegena project maintainers
---

# Load and cancel specifications through the virtual API

## Decision

> **The remote reuses Playground. A data-route loader owns each specification
> request; leaving that route stops its unfinished conversion.**

- **🧭 Routes:** `/playground/:specUrl` accepts one URL-encoded specification
  URL. React Router **MUST** lazy-load the Playground route and pass its
  request signal to conversion. Initial loading and subsequent navigation
  **MUST** show `@codegena/playground-ui/converting-placeholder`.
  A federation host uses `createSpecificationLoader` and the lazily loaded
  `PlaygroundView` inside its own data router. The host owns route parameters
  and cancellation; the embedded view does not create a nested router.
- **🛡️ Sources:** Both the client and virtual API **MUST** validate the source
  URL against the application origin. The API fetch **MUST** reject redirects
  so a same-origin URL cannot redirect to a foreign specification.
- **🌐 Virtual API:** The app registers POST, GET, and DELETE for the literal
  `/api/specification` path through PWA. POST starts a job, GET reads its
  status/result, and DELETE cancels it. These short requests avoid holding
  PWA's ten-second reply channel open during generation.
- **⚙️ Dedicated execution:** The app **MUST** own a dedicated Worker for each
  conversion. A SharedWorker cannot create that Worker. The API sends source
  text to it through a same-origin BroadcastChannel named by the job's UUID.
  The worker runs the real generator and serializes its graph off the page.
- **♻️ Cancellation:** Navigation **MUST** terminate the app-owned Worker
  immediately. The client then cancels the API job after its start is
  acknowledged, avoiding DELETE-before-POST ordering. API cancellation aborts
  the source fetch and closes its channel. Unread jobs expire after five
  minutes to release work abandoned by closed pages.
- **📦 Bundles:** Conversion is a standalone module-worker build, separate
  from the page's federation and hot-reload runtime. Worker package resolution
  **MUST** include the `worker` condition; a DOM-specific browser export is
  not sufficient. Monaco uses the shared bootstrap and Webpack entrypoints.
- **✅ Data boundary:** The route validates the completed HTTP response once
  before passing its graph and source text to Playground.

## Appearance and embedding

`App` **MUST** wrap router initialization, conversion placeholders, and ready
routes in one `PlaygroundAppearanceProvider`. An embedding host **MAY** supply
`appearance` and `onSandwichButtonClick` explicitly. The provider reports theme
edits to the host; embedded routes omit the standalone example navigation bar.
Standalone use retains an application-owned saved choice. See the
[appearance decision](../../../../packages/playground-ui/adr/008-share-appearance-and-host-navigation.md).

## Costs and limits

- **✅ Responsive page:** Conversion and search do not run in the page's
  interaction loop. The remote does not duplicate Playground's implementation.
- **⚠️ Transport:** Source text and serialized results cross worker channels.
  Status polling is limited to five requests per second and stops on abort.
- **⚠️ Lifetime:** A page owns conversion workers and the PWA companion's
  lifetime. This does not provide unattended background conversion.
- **🛡️ Trust:** Channel UUIDs isolate concurrent jobs; they are not an
  authorization boundary against other scripts trusted by the same origin.

## Verification

Focused tests check cancellation before the start response, job cleanup, origin
validation, and worker-channel results. Browser tests run real conversion and
PWA search in desktop Chrome and an iPhone 15 viewport, including a route change
while conversion is pending. Existing image baselines remain unchanged.
