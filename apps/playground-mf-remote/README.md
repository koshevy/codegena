# Playground remote

The Module Federation remote runs the shared Codegena Playground for a
same-origin OpenAPI or JSON Schema URL.

```bash
npm exec -- nx serve playground-mf-remote
```

Open `http://localhost:8101/`. The example links load local specifications.
To open another file, encode its URL as the route's `specUrl` segment:

```text
/playground/%2Fspecifications%2Fone-password.json
```

The application shows the converting placeholder while it loads the view and
prepares the graph. Conversion and search use PWA's virtual HTTP services;
leaving a specification cancels its unfinished conversion.

## Federation

`playground_mf_remote/App` exports `App` and `createAppRouter`. The composition
owner creates the router once with its `appBuildId`, passes it to `App`, and
disposes it when the remote is unmounted. Standalone bootstrap owns that setup.
For an embedded view, pass `{ initialEntries: [encodedSpecificationRoute] }` as
the second argument to `createAppRouter`. It uses memory history and leaves the
host's browser URL unchanged. The route remains `/playground/:specUrl`.
Pass `appearance: { mode, onModeChange }` to `App` to share the host's theme.
Loading and ready routes use that same choice. `onSandwichButtonClick` exposes
the host's menu through Playground's topbar and hides the standalone example bar.
The embedding host must serve the compiled browser-service assets from its own
origin; PWA intentionally rejects cross-origin handler URLs.

## Checks

- `npm exec -- nx run playground-mf-remote:build`
- `npm exec -- nx run playground-mf-remote:lint`
- `npm exec -- nx run playground-mf-remote:test`
- `npm exec -- nx run playground-mf-remote-e2e:e2e`

See the [browser cases](../playground-mf-remote-e2e/TESTCASES.md) and [architecture decisions](adr/README.md).
