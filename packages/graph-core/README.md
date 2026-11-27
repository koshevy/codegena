# @codegena/graph-core

Converts Codegena result groups into connected graph nodes for generated files
and declarations. Each declaration retains its text, JSONC source location,
programming language, declaration category, identifier, and generically typed
AST without a dependency on a specific language's AST package.

The public contract is split by concept: `graph-payload.ts` defines the whole
graph, `graph-payload-node.ts` defines nodes, the adjacent group and item data
files define their contents, and `graph-payload-edge.ts` defines relations.
`create-graph-payload.ts` contains the conversion function; `index.ts` exports
the public API.

The graph represents [React Flow sub-flows](https://reactflow.dev/learn/layouting/sub-flows):
each result group is a parent container, and each grouped result is a child
constrained inside that container. The payload has no positions or dimensions;
the view computes its layout. `import` edges connect containers, while
`reference` edges connect declarations when an import alone does not express
their relationship.
Declaration node IDs use the finalized identifier, such as
`position-array.ts::PositionArray`.

See [the examples](__examples__/README.md) for graph payloads created from five
JSON Schema fixtures in `@codegena/oas3-visitor-typescript`.

## Convert source text in a worker

The optional [`conversion`](conversion/index.ts) entrypoint turns source text
into a graph with the current TypeScript visitor and collected logs. Its
one-shot worker client keeps conversion off the browser's UI thread. The
caller owns the worker entry file so its bundler can emit the worker chunk.
Consumers of this entrypoint need the optional
`@codegena/oas3-visitor-typescript` peer installed.

```ts
// graph-conversion.worker.ts
import { startGraphConversionWorker } from '@codegena/graph-core/conversion';

startGraphConversionWorker();
```

```ts
import { convertSourceToGraphInWorker } from '@codegena/graph-core/conversion';

const worker = new Worker(
  new URL('./graph-conversion.worker.ts', import.meta.url),
  { type: 'module' },
);

const graph = await convertSourceToGraphInWorker({
  sourceFileId,
  sourceText,
  worker,
});
```

The client terminates the worker after conversion. Pass an `AbortSignal` to
stop it earlier. Worker messages keep graph text, locations, edges, and logs;
they replace visitor AST objects, which cannot be cloned between threads.

Storybook loaders and local examples can use the optional
[`@codegena/graph-core/testing-utils`](testing-utils/index.ts) entrypoint to
convert a fixture with the current TypeScript visitor and collected diagnostics.
Browser stories fetch fixture text from `/fixtures`; Node callers pass local
source text. This testing entrypoint requires `@codegena/oas3-visitor-typescript`.
