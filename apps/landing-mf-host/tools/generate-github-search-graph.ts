import { readFile, writeFile } from 'node:fs/promises';

const fixtureName = 'oas3-api-github-com.json';

async function generateGithubSearchGraph(): Promise<void> {
  const [{ mapGraphPayloadToWorkerPayload }, { convertFixtureToGraph }] = (
    await Promise.all([
      import('@codegena/graph-core'),
      import('@codegena/graph-core/testing-utils'),
    ])
  );

  const sourceSchemaText = await readFile(
    'packages/oas3-visitor-typescript/src/__fixtures__/oas3-api-github-com.json',
    'utf8',
  );
  const { graph } = await convertFixtureToGraph(fixtureName, { sourceSchemaText });
  const serializable = mapGraphPayloadToWorkerPayload(graph);
  const serializedGraph = JSON.stringify(serializable);

  await writeFile(
    'apps/landing-mf-host/src/assets/github-search-graph.json',
    serializedGraph,
  );

  const summary = {
    bytes: Buffer.byteLength(serializedGraph),
    edges: graph.edges.length,
    logs: graph.logs.length,
    nodes: graph.nodes.length,
  };

  process.stdout.write(`${JSON.stringify(summary)}\n`);
}

void generateGithubSearchGraph();
