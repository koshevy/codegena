# Codegena documentation

A Docusaurus site exposed as a React Module Federation remote. It uses
Codegena's light and dark themes, local Monaco code blocks, shared wordmark,
and the same footer component as the landing page.

## Run locally

```bash
npm exec -- nx serve documentation-mf-remote
```

Open `http://127.0.0.1:8103`. Build output goes to
`dist/apps/documentation-mf-remote`:

```bash
npm exec -- nx build documentation-mf-remote
```

Docusaurus Faster selects **Rspack**. The local `rspack.config.mjs` adds
Module Federation and the shared Monaco configuration. Docusaurus calls its
extension hook `configureWebpack` for both bundlers; that name does not select
Webpack.

## Embed the remote

Register `documentation_mf_remote` with your federation host, pointing its
entry at the deployed `remoteEntry.js`. Mount it on `/docs/*` and serve the
host HTML for article URLs. For a request to `/docs/core-features`, load the
module, preload the article without the `/docs` prefix, and pass the basename:

```tsx
const documentation = await loadRemote('documentation_mf_remote/App');
await documentation.initializeDocumentation('/core-features');

const Documentation = documentation.default;

<Documentation basename="/docs" />;
```

`loadRemote` is the host's typed Module Federation loader. Article links
update the URL under the supplied basename.
The default basename `/` supports standalone hosting. For an existing host router,
also pass `navigation` with its current location, action, and navigation/blocking
callbacks.
Article links then use the host's browser session, including Back/Forward.
Pass `appearance` to share the host's theme choice and change handler.
The [landing adapter](../landing-mf-host/src/app/documentation/) shows both props.
React is shared; Docusaurus's Router 5 context remains private because other
applications use Router 7.

The landing host already provides this integration. Run
`npm exec -- nx serve landing-mf-host` and open `http://localhost:8102/docs`.
Its build includes the documentation assets; a second server is not required.

## Edit content

- `docs/*.mdx`: Roadmap and status, Get started, Core features, Extend,
  Contribute, Security, Personal data privacy, FAQ, About, and Contacts.
- The Get started article renders a MUI callout and interactive Docusaurus
  tabs alongside their JSX source examples.
- `blog/*.mdx`: dated posts; `blog/authors.yml` holds author information.
- `sidebars.ts`: documentation order.
- `src/theme/`: Codegena adapters for the navbar, footer, code blocks, and
  Docusaurus theme provider.

The privacy and security pages are a starting point. Deployment-specific
hosting and data-processing details must be reviewed before publication.

## Verify

```bash
npm exec -- nx run documentation-mf-remote:lint
npm exec -- nx run documentation-mf-remote:typecheck
npm exec -- nx run documentation-mf-remote-e2e:e2e
npm exec -- @codegena/audit-ci
```

Browser cases live in the [companion E2E project](../documentation-mf-remote-e2e/TESTCASES.md).
They run headlessly on desktop and iPhone 15 with a separate server port.
The [architecture decision](adr/001-expose-docusaurus-through-rspack-federation.md)
explains the router and build boundaries.

Set `DOCUMENTATION_E2E_SERVER=production` to check the built remote and a
production federation host. Cross-origin deployments must allow font and
other remote-asset requests from their host's origin.
