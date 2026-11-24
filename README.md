# Codegena

This is the monorepo for the `@codegena/` npm scope. It contains publishable
libraries that run in Node.js and browsers, shared UI components, and the
Codegena website and documentation.

Codegena generates programming code from OpenAPI 3 and JSON Schema.

## Contents

- [Get started](#get-started)
- [Work with Nx](#work-with-nx)
- [Run the site locally](#run-the-site-locally)
- [Libraries](#libraries)
- [Contributing](#contributing)

## Get started

Once you have a supported Node.js version and npm 12, the only setup step is
to run this from the repository root. [Version requirements](package.json)

```sh
npm ci
```

Nx applies the workspace's dependency patches before tasks that use them.
Find package-specific details in the individual READMEs listed under
[Libraries](#libraries).

<a id="work-with-nx"></a>

## 🧭 Work with Nx

We use Nx to build and test the apps and libraries in this repository. If
you're new to Nx, read its introduction before working in the monorepo.
[Intro to Nx](https://nx.dev/docs/getting-started/intro)

| Command | What it runs |
| --- | --- |
| `npx nx run-many --target=build` | Builds all apps and libraries with a `build` target. |
| `npx nx run-many --target=e2e` | Runs all standard end-to-end suites across the repo. |
| `npx nx affected --target=test` | Tests projects affected by changes on your branch, including projects that depend on them. |

The full end-to-end run needs Docker Compose and Playwright Chromium. Install
the browser with `npx playwright install chromium` if it is missing. The landing
SSR and Lighthouse checks have their own targets.
[Landing test catalog](apps/landing-mf-host-e2e/TESTCASES.md) ·
[CLI test setup](apps/cli-delivery-e2e/README.md)

<a id="run-the-site-locally"></a>

## 🌐 Run the site locally

```sh
npx nx serve landing-mf-host
```

Open the [landing page](http://localhost:8102/), [Docs](http://localhost:8102/docs/),
or [Playground](http://localhost:8102/playground). To run either app on its own,
see its setup guide. [Documentation](apps/documentation-mf-remote/README.md) ·
[Playground](apps/playground-mf-remote/README.md)

For the server-rendered site at [https://localhost/](https://localhost/), use
the Docker Compose setup. [Landing SSR guide](apps/landing-mf-host-ssr/README.md)

<details>
<summary>Trust Caddy's local certificate on macOS</summary>

With the Docker stack running, open a second terminal at the repository root
and copy and trust its public root certificate.

```sh
caddy_root="$(mktemp -d)/codegena-caddy-root.crt"
docker compose -f apps/landing-mf-host-ssr/docker-compose.yml cp \
  caddy:/data/caddy/pki/authorities/local/root.crt "$caddy_root"
sudo security add-trusted-cert -d -r trustRoot \
  -k /Library/Keychains/System.keychain "$caddy_root"
```

Reopen the browser. The `caddy-data` volume preserves the same certificate
authority across container restarts.

</details>

## Libraries

| Package | Responsibility |
| --- | --- |
| [`@codegena/audit-ci`](packages/audit-ci/README.md) | Check npm dependencies for known vulnerabilities. |
| [`@codegena/graph-core`](packages/graph-core/README.md) | Build a framework-neutral graph of generated files, declarations, and relations. |
| [`@codegena/graph-search-core`](packages/graph-search-core/README.md) | Index graph data, rank search results, and track visits. |
| [`@codegena/graph-search-ui`](packages/graph-search-ui/README.md) | Render the graph search interface and its results. |
| [`@codegena/graph-ui`](packages/graph-ui/README.md) | Render the declaration graph and handle selection and navigation. |
| [`@codegena/infr-nx`](packages/infr-nx/README.md) | Share ESLint policy, Rollup packaging, and Docker Compose targets. |
| [`@codegena/notification-ui-core`](packages/notification-ui-core/README.md) | Define the React notification contract. |
| [`@codegena/notification-ui-notistack`](packages/notification-ui-notistack/README.md) | Present notifications through Notistack. |
| [`@codegena/oas3-core`](packages/oas3-core/README.md) | Parse JSONC and schemas into a source-aware model for visitors. |
| [`@codegena/oas3-visitor-typescript`](packages/oas3-visitor-typescript/README.md) | Generate TypeScript declarations through a JavaScript API or the CLI. |
| [`@codegena/playground-ui`](packages/playground-ui/README.md) | Combine schema editing, generated files, diagnostics, and graph navigation. |
| [`@codegena/pwa`](packages/pwa/README.md) | Provide worker-backed HTTP routes, build-scoped caching, and bundle warmup. |
| [`@codegena/ui-theme`](packages/ui-theme/README.md) | Provide the shared MUI palettes, typography, and startup styles. |
| [`@codegena/ui-unified`](packages/ui-unified/README.md) | Provide shared controls and code editors with full Monaco and minimal TanStack Highlight modes. |
| [`@codegena/util-dev-mode`](packages/util-dev-mode/README.md) | Share development and testing settings through React context. |

For examples, see the [generator use cases](packages/oas3-visitor-typescript/USECASES.md)
and [sample graph payloads](packages/graph-core/__examples__/README.md).

## Contributing

Read the [contribution guide](CONTRIBUTING.md) and [code style](CODE_STYLE.md)
before changing code. Consult the [architecture decisions](adr/README.md) when
changing shared behavior. For AI-assisted work, see [AGENTS.md](AGENTS.md).
