# Package publication E2E

Run the suite with Docker Compose and access to npmjs.

```sh
npm exec -- nx run cli-e2e:e2e
```

Nx builds the packages and Playground's specifications. Jest bumps the built
package manifests to an E2E prerelease, then starts Compose
with a fresh Verdaccio registry on a private network. The workspace
container publishes OAS3 Core, the TypeScript visitor, Playground UI, and
their workspace dependencies under the `e2e` tag. Verdaccio 7 accepts anonymous publishes for
`@codegena/*` on the private network and proxies other packages to npmjs.
Nx loads the Docker settings from `.env.local`. For direct Compose commands,
use `docker compose --env-file .env.local` from this project directory.

The Windows smoke test is opt-in. It uses the same Verdaccio registry and
requires Docker support for `linux/amd64`.

```sh
npm exec -- nx run cli-e2e:e2e --dontSkipTestsForWindows=true --testNamePattern=PUB-02
```

## Cases

- **PUB-01** runs each import form against GitHub REST, 1Password Connect,
  and Petstore. The [consumer templates](docker-files/consumers) follow the
  same order as the tests.

  1. Root module namespace import.
  2. Root default import of the document namespace.
  3. Subpath default import rejected.
  4. Named imports from a subpath barrel and an individual declaration file.
  5. Named import with an alias from the root.
  6. Types re-exported through the root document's `Lib` namespace.

  The published CLI converts each specification once. TypeScript 5.9.3,
  6.0.3, and 7.0.2 check every form. Supported imports accept valid mock
  data and reject invalid assignments. The 1Password subpath case checks
  the vault list response with implicit and explicit JSON media types.

- **PUB-02** runs Windows Node.js under Wine, converts 1Password Connect with
  the published CLI, and compiles and runs the strict consumer on TypeScript 6.0.3.

Jest removes its containers and registry storage unless you pass
`--skipShootDownVirtualFs=true`. Run
`npm exec -- nx run cli-e2e:docker-compose-build` to build the
images without running the test.
