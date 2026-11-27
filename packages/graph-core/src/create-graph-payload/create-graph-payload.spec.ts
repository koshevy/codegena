import {
  CollectingLogger,
  type CollectedLog,
} from '@codegena/oas3-core/logger';
import { extractTransitiveNodesFromSchema } from '@codegena/oas3-core/transitive-parser';
import type {
  UltimateParserVisitorResult,
  UltimateParserVisitorResultGroup,
} from '@codegena/oas3-core/ultimate-parser';

import { createGraphPayload } from './index';

interface TestAst {
  nodeType: string;
}

type ResultGroup = UltimateParserVisitorResultGroup<object, TestAst>;

function createGroup(
  name: string,
  sourceText: string,
  outputText: string,
  sourceFileId = `${name.toLowerCase()}.json`,
): ResultGroup {
  const [transitiveNode] = extractTransitiveNodesFromSchema({
    jsoncTextData: sourceText,
    referredWithName: name,
    srcFileId: sourceFileId,
  });

  if (!transitiveNode) {
    throw new Error(`Expected a transitive node for ${name}.`);
  }

  const fileName = `${name.toLowerCase()}.ts`;
  const declarationKind = ['interface', 'namespace', 'type'].find((kind) => (
    outputText.includes(`export ${kind} ${name}`)
  ));
  const item: UltimateParserVisitorResult<TestAst> = {
    ast: { nodeType: name },
    declarationType: outputText.includes('export interface') ? 'Interface' : 'Scalar',
    identifierName: name,
    keySnippet: declarationKind
      ? `export ${declarationKind} ${name}`
      : undefined,
    programmingLanguage: 'TypeScript',
    programmingLanguageVersion: '6.0.3',
    relativeFilePath: fileName,
    toString: async () => outputText,
    transitiveNode,
  };

  return {
    fileName,
    groupedItems: [item],
    sourceFile: {},
    toString: async () => outputText,
  };
}

describe('createGraphPayload', () => {
  it('places directories and omits duplicate namespace references', async () => {
    const root = createGroup(
      'Root',
      JSON.stringify({
        openapi: '3.1.0',
        info: { title: 'Root', version: '1.0.0' },
        paths: {},
      }),
      'export namespace Root {}',
    );
    const secret = createGroup(
      'Secret',
      JSON.stringify({ type: 'object' }),
      'export namespace Secret {}',
    );
    const key = createGroup(
      'Key',
      JSON.stringify({ type: 'string' }),
      'export type Key = string;',
    );

    root.fileName = 'index.ts';
    secret.fileName = 'actions/_common/actions-secret.ts';
    key.fileName = 'actions/_common/actions-public-key.ts';

    const rootItem = root.groupedItems[0];
    const secretItem = secret.groupedItems[0];
    const keyItem = key.groupedItems[0];

    if (!rootItem || !secretItem || !keyItem) {
      throw new Error('Expected declaration items.');
    }

    rootItem.declarationType = 'Namespace';
    secretItem.declarationType = 'Namespace';
    rootItem.dependencies = [secretItem, keyItem];
    root.relatedGroups = [secret, key];

    const payload = await createGraphPayload(root);
    const directoryParents = payload.nodes
      .filter(({ data }) => data.kind === 'directory')
      .map(({ id, parentId }) => [id, parentId]);

    const fileParents = payload.nodes
      .filter(({ data }) => data.kind === 'group')
      .map(({ id, parentId }) => [id, parentId]);

    const edgesByRelation = Map.groupBy(payload.edges, ({ data }) => data.relation);

    expect(directoryParents).toEqual([
      ['.', undefined],
      ['actions', '.'],
      ['actions/_common', 'actions'],
    ]);

    expect(fileParents).toEqual([
      ['index.ts', '.'],
      ['actions/_common/actions-secret.ts', 'actions/_common'],
      ['actions/_common/actions-public-key.ts', 'actions/_common'],
    ]);

    expect(edgesByRelation.get('placement')?.map(({ source, target }) => [
      source,
      target,
    ])).toEqual([
      ['.', 'actions'],
      ['actions', 'actions/_common'],
      ['.', 'index.ts'],
      ['actions/_common', 'actions/_common/actions-secret.ts'],
      ['actions/_common', 'actions/_common/actions-public-key.ts'],
    ]);

    expect(edgesByRelation.get('import')).toHaveLength(2);
    expect(edgesByRelation.get('reference')).toBeUndefined();
  });

  it('keeps declaration references from files with multiple items', async () => {
    const sourceGroup = createGroup(
      'Source',
      JSON.stringify({ type: 'object' }),
      'export namespace Source {}',
    );
    const targetGroup = createGroup(
      'Target',
      JSON.stringify({ type: 'string' }),
      'export type Target = string;',
    );
    const sourceItem = sourceGroup.groupedItems[0];
    const targetItem = targetGroup.groupedItems[0];

    if (!sourceItem || !targetItem) {
      throw new Error('Expected declaration items.');
    }

    sourceItem.declarationType = 'Namespace';
    sourceItem.dependencies = [targetItem];
    sourceGroup.groupedItems.push({
      ...sourceItem,
      dependencies: [],
      identifierName: 'Additional',
    });
    sourceGroup.relatedGroups = [targetGroup];

    const payload = await createGraphPayload(sourceGroup);

    expect(payload.edges.filter(({ data }) => data.relation === 'reference'))
      .toEqual([
        {
          data: { relation: 'reference' },
          id: 'source.ts::Source->target.ts::Target',
          label: 'reference',
          source: 'source.ts::Source',
          target: 'target.ts::Target',
        },
      ]);
  });

  it('keeps JSON Schema files flat when names contain directories', async () => {
    const group = createGroup(
      'Nested',
      JSON.stringify({ type: 'string' }),
      'export type Nested = string;',
    );

    group.fileName = 'nested/nested.ts';

    const payload = await createGraphPayload(group);

    expect(payload.nodes.map(({ data }) => data.kind)).toEqual(['group', 'item']);
    expect(payload.edges).toEqual([]);
  });

  it('locates each declaration after imports and comments', async () => {
    const group = createGroup(
      'Primary',
      JSON.stringify({ type: 'object' }),
      `import type { Secondary } from './secondary';

/** Primary description. */
export interface Primary {
  secondary?: Secondary;
}

  type Secondary = string;`,
    );
    const primary = group.groupedItems[0];

    if (!primary) {
      throw new Error('Expected a primary declaration.');
    }

    const secondary: UltimateParserVisitorResult<TestAst> = {
      ...primary,
      identifierName: 'Secondary',
      keySnippet: 'type Secondary',
      toString: async () => 'type Secondary = string;',
    };

    group.groupedItems.push(secondary);

    const payload = await createGraphPayload(group);
    const locations = payload.nodes.flatMap(({ data }) => (
      data.kind === 'item'
        ? [[data.identifierName, data.line, data.col]]
        : []
    ));

    expect(locations).toEqual([
      ['Primary', 4, 0],
      ['Secondary', 8, 2],
    ]);
  });

  it.each([
    ['missing key snippet', undefined],
    ['unmatched key snippet', 'export type Missing'],
  ])('omits generated location for a %s', async (_, keySnippet) => {
    const group = createGroup(
      'Account',
      JSON.stringify({ type: 'string' }),
      'export type Account = string;',
    );
    const item = group.groupedItems[0];

    if (!item) {
      throw new Error('Expected a declaration item.');
    }

    item.keySnippet = keySnippet;

    const payload = await createGraphPayload(group);
    const itemData = payload.nodes.find(({ data }) => data.kind === 'item')?.data;

    expect(itemData).toBeDefined();
    expect(itemData).not.toHaveProperty('line');
    expect(itemData).not.toHaveProperty('col');
  });

  it('does not locate a declaration inside a longer name or comment', async () => {
    const group = createGroup(
      'FooBar',
      JSON.stringify({ type: 'string' }),
      `/** Example: export type Foo = unknown. */
export type FooBar = string;
export type Foo = number;`,
    );
    const fooBar = group.groupedItems[0];

    if (!fooBar) {
      throw new Error('Expected a declaration item.');
    }

    group.groupedItems.push({
      ...fooBar,
      identifierName: 'Foo',
      keySnippet: 'export type Foo',
      toString: async () => 'export type Foo = number;',
    });

    const payload = await createGraphPayload(group);
    const locations = payload.nodes.flatMap(({ data }) => (
      data.kind === 'item'
        ? [[data.identifierName, data.line, data.col]]
        : []
    ));

    expect(locations).toEqual([
      ['FooBar', 2, 0],
      ['Foo', 3, 0],
    ]);
  });

  it('should convert groups and declarations to related graph nodes', async () => {
    const schema = JSON.stringify({
      $defs: { User: { type: 'string' } },
      properties: { user: { $ref: '#/$defs/User' } },
      type: 'object',
    });

    const rootGroup = createGroup(
      'Account',
      schema,
      `import type { User } from './user';
export interface Account {
  user?: User;
}`,
      'account.json',
    );

    const userGroup = createGroup(
      'User',
      JSON.stringify({ type: 'string' }),
      'export type User = string;',
      'account.json',
    );

    const [account, user] = [
      rootGroup.groupedItems[0],
      userGroup.groupedItems[0],
    ];

    if (!account || !user) {
      throw new Error('Expected declaration items.');
    }

    account.dependencies = [user];
    rootGroup.relatedGroups = [userGroup];

    const warning = {
      error: new TypeError('Invalid reference'),
      jsoncNode: {
        col: schema.indexOf('"$ref"') + 1,
        fileName: 'account.json',
        line: 1,
      },
      level: 'warn',
      message: 'Unable to resolve a nested reference.',
    };

    const payload = await createGraphPayload(rootGroup, [
      warning,
      { level: 'info', message: 'Conversion started.' },
    ]);

    expect(payload.logs).toEqual([
      {
        error: {
          message: 'Invalid reference',
          name: 'TypeError',
          stack: expect.any(String),
        },
        jsoncNode: warning.jsoncNode,
        level: 'warn',
        message: warning.message,
      },
      { level: 'info', message: 'Conversion started.' },
    ]);

    expect(payload.nodes.map((node) => ({
      id: node.id,
      parentId: 'parentId' in node ? node.parentId : undefined,
      kind: node.data.kind,
    }))).toEqual([
      { id: 'account.ts', parentId: undefined, kind: 'group' },
      { id: 'account.ts::Account', parentId: 'account.ts', kind: 'item' },
      { id: 'user.ts', parentId: undefined, kind: 'group' },
      { id: 'user.ts::User', parentId: 'user.ts', kind: 'item' },
    ]);

    expect(payload.edges).toEqual([
      {
        data: { relation: 'import' },
        id: 'account.ts->user.ts',
        label: 'import',
        source: 'account.ts',
        target: 'user.ts',
      },
    ]);

    expect(payload.nodes[0]?.data).toEqual({
      fileName: 'account.ts',
      kind: 'group',
      label: 'account.ts',
      programmingLanguage: 'TypeScript',
      text: await rootGroup.toString(),
    });
    expect(payload.nodes[0]).toMatchObject({ type: 'default' });
    expect(payload.nodes[1]?.data).toEqual({
      ast: account.ast,
      col: 0,
      declarationType: 'Interface',
      identifierName: 'Account',
      kind: 'item',
      label: 'Account',
      line: 2,
      logs: [payload.logs[0]],
      programmingLanguage: 'TypeScript',
      programmingLanguageVersion: '6.0.3',
      relativeFilePath: 'account.ts',
      sourceLocation: { col: 1, fileName: 'account.json', line: 1 },
      text: await account.toString(),
    });
    expect(payload.nodes[1]).toMatchObject({
      extent: 'parent',
      parentId: 'account.ts',
    });
    expect(payload.nodes[3]?.data).toMatchObject({
      declarationType: 'Scalar',
      logs: [],
    });
    expect(payload.nodes.every((node) => !('position' in node))).toBe(true);
    expect(payload.nodes.every((node) => !('style' in node))).toBe(true);

    const itemNode = payload.nodes[1];

    if (!itemNode || itemNode.data.kind !== 'item') {
      throw new Error('Expected a declaration node.');
    }

    expect(itemNode.data.ast).toBe(account.ast);
    expect(itemNode.data.ast.nodeType).toBe('Account');
    expect(itemNode.data).not.toHaveProperty('transitiveNode');
    expect(() => JSON.stringify(payload)).not.toThrow();
    expect(payload.nodes.filter(({ data }) => data.kind === 'item')
      .every(({ data }) => Object.hasOwn(data, 'ast'))).toBe(true);

    const graphCompatible: {
      edges: { id: string; source: string; target: string }[];
      nodes: {
        data: Record<string, unknown>;
        id: string;
      }[];
    } = payload;

    expect(graphCompatible).toBe(payload);
  });

  it('should retain the one-based location of an indented source node', async () => {
    const group = createGroup(
      'Indented',
      '\n  { "type": "string" }',
      'export type Indented = string;',
      'indented.jsonc',
    );

    const item = group.groupedItems[0];

    if (!item) {
      throw new Error('Expected an indented declaration item.');
    }

    const logCollector = new CollectingLogger({
      sourceFileId: 'indented.jsonc',
      sourceText: item.transitiveNode.source.getOriginalFileContent(),
    });

    logCollector.logger.warn(
      { node: item.transitiveNode.source.node },
      'The indented schema needs attention.',
    );

    const payload = await createGraphPayload(group, logCollector.getLogs());
    const itemNode = payload.nodes.find(({ data }) => data.kind === 'item');

    expect(itemNode?.data).toMatchObject({
      logs: [{
        jsoncNode: { col: 3, fileName: 'indented.jsonc', line: 2 },
        level: 'warn',
        message: 'The indented schema needs attention.',
      }],
      sourceLocation: { col: 3, fileName: 'indented.jsonc', line: 2 },
    });
  });

  it('associates located logs without repeatedly reading source text', async () => {
    const group = createGroup(
      'Account',
      JSON.stringify({ type: 'object' }),
      'export interface Account {}',
    );
    const item = group.groupedItems[0];

    if (!item) {
      throw new Error('Expected an account declaration.');
    }

    const source = item.transitiveNode.source;
    const readSource = jest.spyOn(source, 'getOriginalFileContent');
    const logInputs: CollectedLog[] = Array.from({ length: 20 }, (_, index) => ({
      jsoncNode: { col: 1, fileName: 'account.json', line: 1 },
      level: 'warn',
      message: `Warning ${index}`,
      node: source.node,
    }));

    const payload = await createGraphPayload(group, logInputs);

    expect(payload.nodes[1]?.data).toMatchObject({
      logs: logInputs.map(({ message }) => ({ message })),
    });
    expect(readSource).toHaveBeenCalledTimes(1);
  });

  it('should retain a reference without an import relation', async () => {
    const sourceGroup = createGroup(
      'Source',
      JSON.stringify({ type: 'object' }),
      'export interface Source {}',
    );

    const targetGroup = createGroup(
      'Target',
      JSON.stringify({ type: 'string' }),
      'export type Target = string;',
    );
    const source = sourceGroup.groupedItems[0];
    const target = targetGroup.groupedItems[0];

    if (!source || !target) {
      throw new Error('Expected declaration items.');
    }

    source.dependencies = [target];

    const payload = await createGraphPayload([sourceGroup, targetGroup]);

    expect(payload.edges).toEqual([{
      data: { relation: 'reference' },
      id: 'source.ts::Source->target.ts::Target',
      label: 'reference',
      source: 'source.ts::Source',
      target: 'target.ts::Target',
    }]);
  });

  it('should keep duplicate and unnamed declaration IDs unique', async () => {
    const group = createGroup(
      'Container',
      JSON.stringify({ type: 'object' }),
      'export interface Container {}',
    );
    const named = group.groupedItems[0];

    if (!named) {
      throw new Error('Expected a named declaration item.');
    }

    const duplicate: UltimateParserVisitorResult<TestAst> = {
      ...named,
    };

    const unnamed: UltimateParserVisitorResult<TestAst> = {
      ...named,
      identifierName: undefined,
    };

    named.dependencies = [duplicate, unnamed];
    group.groupedItems.push(duplicate, unnamed);

    const payload = await createGraphPayload(group);

    expect(payload.nodes.filter(({ data }) => data.kind === 'item')
      .map(({ id }) => id)).toEqual([
      'container.ts::Container',
      'container.ts::Container#2',
      'container.ts::anonymous-3',
    ]);
    expect(payload.edges.map(({ source, target }) => [source, target]))
      .toEqual([
        ['container.ts::Container', 'container.ts::Container#2'],
        ['container.ts::Container', 'container.ts::anonymous-3'],
      ]);
  });

  it('should preserve circular, grouped, and deferred item relations', async () => {
    const rootGroup = createGroup(
      'Relations',
      JSON.stringify({ type: 'object' }),
      'export interface Relations {}',
    );

    const firstGroup = createGroup(
      'First',
      JSON.stringify({ type: 'object' }),
      'export interface First {}',
    );

    const secondGroup = createGroup(
      'Second',
      JSON.stringify({ type: 'string' }),
      'export type Second = string;',
    );

    const isolatedGroup = createGroup(
      'Isolated',
      JSON.stringify({ type: 'boolean' }),
      'export type Isolated = boolean;',
    );

    const [root, first, second] = [
      rootGroup.groupedItems[0],
      firstGroup.groupedItems[0],
      secondGroup.groupedItems[0],
    ];

    if (!root || !first || !second) {
      throw new Error('Expected grouped declaration items.');
    }

    const inline: UltimateParserVisitorResult<TestAst> = {
      ...root,
      dependencies: [async () => first],
      identifierName: undefined,
    };

    root.dependencies = [inline];
    first.dependencies = [root, second];
    second.dependencies = [first];
    rootGroup.relatedGroups = [firstGroup, isolatedGroup];
    firstGroup.relatedGroups = [rootGroup, rootGroup, firstGroup];
    firstGroup.groupedItems.push(second);

    const payload = await createGraphPayload([
      rootGroup,
      isolatedGroup,
      firstGroup,
    ]);

    expect(payload.nodes.filter(({ data }) => data.kind === 'group')
      .map(({ id }) => id)).toEqual([
      'relations.ts',
      'isolated.ts',
      'first.ts',
    ]);
    expect(payload.nodes.filter(({ data }) => data.kind === 'item')
      .map((node) => [
        node.id,
        'parentId' in node ? node.parentId : undefined,
      ])).toEqual([
      ['relations.ts::Relations', 'relations.ts'],
      ['isolated.ts::Isolated', 'isolated.ts'],
      ['first.ts::First', 'first.ts'],
      ['first.ts::Second', 'first.ts'],
    ]);
    expect(payload.edges.map(({ source, target, data }) => [
      source,
      target,
      data.relation,
    ])).toEqual([
      ['relations.ts', 'first.ts', 'import'],
      ['relations.ts', 'isolated.ts', 'import'],
      ['first.ts', 'relations.ts', 'import'],
      ['relations.ts::Relations', 'first.ts::First', 'reference'],
      ['first.ts::First', 'relations.ts::Relations', 'reference'],
      ['first.ts::First', 'first.ts::Second', 'reference'],
      ['first.ts::Second', 'first.ts::First', 'reference'],
    ]);
  });
});
