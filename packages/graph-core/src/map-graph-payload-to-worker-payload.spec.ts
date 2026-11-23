import type { GraphPayload } from './graph-payload';
import { mapGraphPayloadToWorkerPayload } from './map-graph-payload-to-worker-payload';

describe('mapGraphPayloadToWorkerPayload', () => {
  it('removes an uncloneable visitor AST without changing the source graph', () => {
    const ast = { visit: (): null => null };
    const graph: GraphPayload = {
      edges: [],
      logs: [],
      nodes: [{
        data: {
          ast,
          declarationType: 'Alias',
          identifierName: 'Item',
          kind: 'item',
          label: 'Item',
          logs: [],
          programmingLanguage: 'TypeScript',
          programmingLanguageVersion: '6',
          relativeFilePath: 'item.ts',
          sourceLocation: { col: 1, fileName: 'source.json', line: 1 },
          text: 'export type Item = string;',
        },
        extent: 'parent',
        id: 'item.ts::Item',
        parentId: 'item.ts',
      }],
    };

    expect(() => structuredClone(graph)).toThrow();

    const workerGraph = mapGraphPayloadToWorkerPayload(graph);

    expect(workerGraph).toMatchObject({ nodes: [{ data: { ast: {} } }] });
    expect(() => structuredClone(workerGraph)).not.toThrow();
    expect(graph).toMatchObject({ nodes: [{ data: { ast } }] });
  });
});
