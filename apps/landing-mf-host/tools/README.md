# GitHub search demo graph

The landing search demo loads `src/assets/github-search-graph.json` only when
opened. This static graph comes from the real GitHub OpenAPI fixture at
`packages/oas3-visitor-typescript/src/__fixtures__/oas3-api-github-com.json`.
It includes generated files, directories, declarations, relationships, and
conversion warnings. Visitor AST objects are removed because search does not
use them.

Regenerate it from the repository root after changing the visitor or graph
converter:

```bash
npm exec -- ts-node --project apps/landing-mf-host/tsconfig.json \
  apps/landing-mf-host/tools/generate-github-search-graph.ts
```
