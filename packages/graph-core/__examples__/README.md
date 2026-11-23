# Graph examples

Each TypeScript module exports a `graph` (also its default export) generated
from a JSON Schema fixture in
[`oas3-visitor-typescript`](../../oas3-visitor-typescript/src/__fixtures__). The
examples call [`convertFixtureToGraph`](../testing-utils/index.ts) directly, so
they use the current visitor, graph converter, and collected diagnostics.

The graphs contain generated-file containers, declaration child nodes, and
`import` and `reference` edges. Declaration nodes retain their TypeScript AST,
JSONC source location, rendered text, and conversion logs.

Bundle and run an example from the repository root. This reads TypeScript
sources directly and does not require built library files:

```bash
npm exec -- esbuild packages/graph-core/__examples__/json-schema-from-internet-geometry.ts \
  --bundle --platform=node --format=esm --tsconfig=tsconfig.base.json \
  --external:pino --external:jsonc-parser --external:recheck --external:typescript \
  --outfile=tmp/graph-example.mjs
node --input-type=module -e "import { graph } from './tmp/graph-example.mjs'; console.log(graph.nodes, graph.edges)"
```

The examples use `separateFiles` to show sub-flows and cross-file imports.
`core-vocabulary-meta-schema.ts` uses `singleFile` because that schema currently
cannot be rendered in separate-files mode.

| Example | Source fixture |
| --- | --- |
| [comprehensive.ts](comprehensive.ts) | [comprehensive.jsonc](../../oas3-visitor-typescript/src/__fixtures__/comprehensive.jsonc) |
| [core-vocabulary-meta-schema.ts](core-vocabulary-meta-schema.ts) | [core-vocabulary-meta-schema.jsonc](../../oas3-visitor-typescript/src/__fixtures__/core-vocabulary-meta-schema.jsonc) |
| [json-schema-from-internet-avro-schema.ts](json-schema-from-internet-avro-schema.ts) | [json-schema-from-internet-avro-schema.jsonc](../../oas3-visitor-typescript/src/__fixtures__/json-schema-from-internet-avro-schema.jsonc) |
| [json-schema-from-internet-geometry.ts](json-schema-from-internet-geometry.ts) | [json-schema-from-internet-geometry.jsonc](../../oas3-visitor-typescript/src/__fixtures__/json-schema-from-internet-geometry.jsonc) |
| [json-schema-from-internet-jsonrpc-request-2.0.ts](json-schema-from-internet-jsonrpc-request-2.0.ts) | [json-schema-from-internet-jsonrpc-request-2.0.jsonc](../../oas3-visitor-typescript/src/__fixtures__/json-schema-from-internet-jsonrpc-request-2.0.jsonc) |
