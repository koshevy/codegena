# Docusaurus route-loader compatibility

The documentation's Nx build and serve targets apply these patches through
the workspace's `apply-dependency-patches` target. The target fails if a patch
no longer applies. Review the patches when upgrading Docusaurus.

## `react-loadable` 6.0.0

Docusaurus uses the `@docusaurus/react-loadable` fork through this package alias.
Its `UNSAFE_componentWillMount` starts subscriptions and timers before React
commits the component. Embedding documentation in the development host exposes
this lifecycle warning under Strict Mode.

The patch starts loading subscriptions in `componentDidMount`, after setting
the mounted flag. It also refreshes state if a pending module finished before
mounting, and observes a failed download even when React abandons the render.
`preload()` still rejects and the error view still receives that error.
Module reporting stays available during server rendering, where
Docusaurus collects the scripts required by each page.

The landing's documentation loader tests cover preloading, failed abandoned
renders, and server-side module collection. Both compiler caches include the
patch as a build dependency so applying it invalidates old chunks.

Strict Mode and browser diagnostic checks stay enabled. Verify with:

```sh
npm exec -- nx run landing-mf-host-e2e:e2e:development --skipNxCache --retries=0
npm exec -- nx run documentation-mf-remote-e2e:e2e --skipNxCache
```

## `@docusaurus/theme-classic` 3.10.2

Repeated route lifecycle notifications can schedule several delayed progress
starts during a development render. A stale timer can start the bar after the
article has finished loading, leaving it on screen indefinitely.

The patch cancels a previous pending start before scheduling another and also
cancels the pending start when navigation completes. The real loading indicator
and its delay remain enabled. The landing's article-navigation browser case
advances browser time after opening the article to catch a late progress start.
