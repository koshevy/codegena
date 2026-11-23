# Landing host decisions

These proposed records describe how the landing composes shared browser features.
Requirement words follow the [repository convention](../../../adr/README.md#requirement-language).

## Reading order

1. [Bundle browser services and Monaco locally](001-bundle-browser-services-and-monaco-locally.md)
   — background search, worker outputs, and the editor's language boundary.
2. [Open Playground examples through Module Federation](002-open-federated-playground-examples.md)
   — selected specifications, embedded routing, and overlay lifetime.
3. [Serve documentation as an independent federated route](003-serve-documentation-as-an-independent-route.md)
   — browser article URLs under `/docs`, shared navigation, and deployment.
4. [Keep the landing first render within 1 MB](004-keep-first-render-within-startup-budget.md)
   — the cold-load byte budget and when background downloads start.
5. [Render the landing page on the server](005-render-the-landing-shell-on-the-server.md)
   — complete first-response HTML, deferred interactivity, and same-origin assets.

## Verification

The [landing browser catalog](../../landing-mf-host-e2e/TESTCASES.md) covers the
desktop and mobile search demo and generated-code examples. Unit tests cover
failed graph loading and concurrent search queries.
