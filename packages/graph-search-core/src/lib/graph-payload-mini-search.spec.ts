import type { GraphPayload } from '@codegena/graph-core';

import { createDeterministicSpecId } from './create-deterministic-spec-id';
import { GraphPayloadMiniSearch } from './graph-payload-mini-search';
import { VisitHistory } from './visit-history';
import { searchGraph as graph } from '../../__mocks__/search-graph';

describe('GraphPayloadMiniSearch', () => {
  it('indexes all five suggestion kinds and removes warning source excerpts', () => {
    const history = new VisitHistory(graph, 'spec-test');
    const search = new GraphPayloadMiniSearch(graph, history, {
      sourceSpecification: {
        fileName: 'sample.jsonc',
        text: '{ "activity": "ApiRequest" }',
      },
    });

    const results = search.getSearchSuggestions('activity').suggestions;

    expect(results.map(({ kind }) => kind)).toEqual([
      'directory',
      'file',
      'declaration',
      'warning',
      'spec-snippet',
    ]);
    expect(search.getSearchSuggestions('line:12').suggestions.some(({ kind }) => (
      kind === 'warning'
    ))).toBe(true);
    expect(results.find(({ kind }) => kind === 'warning')?.title).toBe(
      'Activity request could not be parsed',
    );
    expect(results.find(({ kind }) => kind === 'warning')).not.toHaveProperty(
      'snippet',
    );
    expect(results.find(({ kind }) => kind === 'spec-snippet')).toHaveProperty(
      'sourceLocation.line',
      1,
    );

    search.dispose();
    history.dispose();
  });

  it('puts recently visited declarations first for short queries', () => {
    const history = new VisitHistory(graph, 'spec-test');
    const search = new GraphPayloadMiniSearch(graph, history);

    history.onGraphPayloadNodeVisited(graph.nodes[3]);

    expect(search.getSearchSuggestions().suggestions[0]).toMatchObject({
      kind: 'declaration',
      title: 'ApiRequest',
    });
    expect(search.getSearchSuggestions('ap').suggestions[0]?.title).toBe('ApiRequest');
    expect(search.getAutoSuggestion('activ')).toContain('activ');

    search.dispose();
    history.dispose();
  });

  it('does not borrow a later declaration excerpt for a metadata match', () => {
    const nodes = graph.nodes.map((node): GraphPayload['nodes'][number] => {
      if (!('type' in node) || node.type !== 'default') {
        return node;
      }

      return {
        ...node,
        data: {
          ...node.data,
          text: [
            'export interface ApiRequest { activity: string }',
            'export type Later = TypeScript;',
          ].join('\n'),
        },
      };
    });
    const graphWithLaterDeclaration = { ...graph, nodes };
    const history = new VisitHistory(graphWithLaterDeclaration, 'spec-test');
    const search = new GraphPayloadMiniSearch(graphWithLaterDeclaration, history);
    const declaration = search.getSearchSuggestions('TypeScript').suggestions
      .find((item) => item.kind === 'declaration');

    expect(declaration).not.toHaveProperty('snippet');

    search.dispose();
    history.dispose();
  });

  it('limits default results and excludes the generation root directory', () => {
    const history = new VisitHistory(graph, 'spec-test');
    const search = new GraphPayloadMiniSearch(graph, history, {
      defaultSuggestionCount: 2,
    });

    expect(search.getSearchSuggestions().suggestions.map(({ title }) => title)).toEqual([
      './activity',
      'ApiRequest',
    ]);

    search.dispose();
    history.dispose();
  });

  it('records known visits and ignores nodes outside its graph', () => {
    const history = new VisitHistory(graph, 'spec-test');

    history.onGraphPayloadNodeVisited(graph.nodes[3]);
    history.onGraphPayloadNodeVisited({
      ...graph.nodes[3],
      id: 'outside',
    });
    history.onGraphPayloadLogVisited(graph.logs[0]);

    expect(history.getRecentSuggestionIds(3)).toEqual([
      'warning:0',
      'node:activity/api-request.ts::ApiRequest',
    ]);

    history.dispose();
  });

  it('locates source text matches in specification suggestions', () => {
    const history = new VisitHistory(graph, 'spec-test');
    const search = new GraphPayloadMiniSearch(graph, history, {
      sourceSpecification: {
        fileName: 'sample.jsonc',
        text: '{\n  "first": true,\n  "needle": true\n}',
      },
    });
    const specification = search.getSearchSuggestions('needle').suggestions.find(
      ({ kind }) => kind === 'spec-snippet',
    );

    expect(specification?.sourceLocation).toEqual({
      col: 4,
      fileName: 'sample.jsonc',
      line: 3,
    });

    search.dispose();
    history.dispose();
  });

  it('reserves broad results for every matching kind and reports omitted matches', () => {
    const directories: GraphPayload['nodes'] = Array.from({ length: 120 }, (
      _, index,
    ) => ({
      data: {
        kind: 'directory',
        label: `copilot-${index}`,
        relativeDirectoryPath: `./copilot-${index}`,
      },
      id: `directory-${index}`,
      type: 'directory',
    }));
    const files: GraphPayload['nodes'] = Array.from({ length: 40 }, (
      _, index,
    ) => ({
      data: {
        fileName: `copilot-file-${index}.ts`,
        kind: 'group',
        label: `copilot-file-${index}.ts`,
        programmingLanguage: 'TypeScript',
        text: `export interface CopilotFile${index} {}`,
      },
      id: `file-${index}`,
      type: 'default',
    }));
    const declarations: GraphPayload['nodes'] = Array.from({ length: 40 }, (
      _, index,
    ) => ({
      data: {
        ast: {},
        declarationType: 'Interface',
        identifierName: `CopilotDeclaration${index}`,
        kind: 'item',
        label: `CopilotDeclaration${index}`,
        logs: [],
        programmingLanguage: 'TypeScript',
        programmingLanguageVersion: '5',
        relativeFilePath: `copilot-file-${index}.ts`,
        sourceLocation: { col: 1, fileName: 'copilot.json', line: index + 1 },
        text: `export interface CopilotDeclaration${index} {}`,
      },
      extent: 'parent',
      id: `declaration-${index}`,
      parentId: `file-${index}`,
    }));
    const logs: GraphPayload['logs'] = Array.from({ length: 40 }, (
      _, index,
    ) => ({
      level: 'warn',
      message: `Copilot warning ${index}`,
    }));
    const broadGraph: GraphPayload = {
      edges: [],
      logs,
      nodes: [...directories, ...files, ...declarations],
    };
    const history = new VisitHistory(broadGraph, 'spec-copilot');
    const search = new GraphPayloadMiniSearch(broadGraph, history, {
      declarationSuggestionCount: 40,
      defaultSuggestionCount: 200,
      directorySuggestionCount: 120,
      fileSuggestionCount: 40,
      sourceSpecification: {
        fileName: 'copilot.json',
        text: '{ "copilot": true }',
      },
      warningSuggestionCount: 40,
    });

    const broadResult = search.getSearchSuggestions('copilot');
    const counts = Map.groupBy(broadResult.suggestions, ({ kind }) => kind);

    expect(broadResult.isTruncated).toBe(true);
    expect(broadResult.suggestions).toHaveLength(100);
    expect(counts.get('directory')).toBeUndefined();
    expect(counts.get('declaration')).toHaveLength(33);
    expect(counts.get('file')).toHaveLength(33);
    expect(counts.get('warning')).toHaveLength(33);
    expect(counts.get('spec-snippet')).toHaveLength(1);
    expect(search.getSearchSuggestions().suggestions).toHaveLength(100);

    const exactResult = search.getSearchSuggestions('CopilotDeclaration39');

    expect(exactResult.isTruncated).toBe(false);
    expect(exactResult.suggestions).toHaveLength(1);
    expect(exactResult.suggestions[0]?.title).toBe('CopilotDeclaration39');

    search.dispose();
    history.dispose();
  });
});

describe('createDeterministicSpecId', () => {
  it('normalizes object keys and JSONC formatting before hashing', async () => {
    const first = await createDeterministicSpecId({ b: 2, a: 1 });
    const second = await createDeterministicSpecId(
      '{ // same specification\n "a": 1, "b": 2 }',
    );

    expect(first).toBe(second);
    expect(first).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-8[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it('keeps different malformed JSONC sources in separate histories', async () => {
    const first = await createDeterministicSpecId('{ "a": 1, bad }');
    const second = await createDeterministicSpecId('{ "a": 1, different }');

    expect(first).not.toBe(second);
  });
});
