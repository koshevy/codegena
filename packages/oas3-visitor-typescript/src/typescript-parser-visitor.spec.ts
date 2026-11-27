/* eslint-disable max-len -- Exact generated TypeScript output is compared verbatim. */
import { createTestingLogger } from '@codegena/oas3-core/logger';
import type {
  RefTransitiveNode,
  TransitiveNode,
} from '@codegena/oas3-core/transitive-node';
import { extractTransitiveNodesFromSchema } from '@codegena/oas3-core/transitive-parser';
import {
  UltimateParser,
  type UltimateParserVisitorResultGroup,
} from '@codegena/oas3-core/ultimate-parser';
import type { Node as TsNode, SourceFile } from 'typescript';

import {
  createAstToString,
  createFallbackType,
  createTypeAliasDeclaration,
} from './ast-utils';
import { jsonSchemaToTypescript } from './json-schema-to-typescript';
import { resetIdentifiers } from './misc-utils';
import { TypescriptParserVisitor } from './typescript-parser-visitor';
import type { VisitorFnProps } from './typescript-parser-visitor-fn';
import type { TypescriptParserVisitorResult } from './typescript-parser-visitor-result';

function createTransitiveNode(schema: Record<string, unknown>): TransitiveNode {
  const [node] = extractTransitiveNodesFromSchema({
    jsoncTextData: JSON.stringify(schema),
    srcFileId: 'documented-type.json',
  });

  if (!node) {
    throw new Error('Expected a transitive node');
  }

  return node;
}

function parseTransitiveNode(
  transitiveNode: TransitiveNode,
  options?: VisitorFnProps['options'],
): TypescriptParserVisitorResult {
  const visitor = new TypescriptParserVisitor(undefined, options);
  const parse = (node: TransitiveNode): TypescriptParserVisitorResult => (
    visitor.renderTransitiveNodeWithoutImports({
      getAnotherByTransitiveNode: parse,
      transitiveNode: node,
    })
  );

  return parse(transitiveNode);
}

async function renderTransitiveNode(
  transitiveNode: TransitiveNode,
  options?: VisitorFnProps['options'],
): Promise<string> {
  return parseTransitiveNode(transitiveNode, options).toString();
}

async function renderSurroundingStatements(
  statements: TsNode[],
  relativeFilePath: string,
): Promise<string> {
  const renderedStatements = await Promise.all(statements.map((ast) => (
    createAstToString(ast, relativeFilePath)()
  )));

  return renderedStatements.join('\n');
}

async function renderSingleGroup(
  visitor: TypescriptParserVisitor,
  result: TypescriptParserVisitorResult,
): Promise<UltimateParserVisitorResultGroup<SourceFile, TsNode>> {
  const [group] = await visitor.groupInSeparatedFiles([result]);

  if (!group) {
    throw new Error('Expected a rendered group.');
  }

  return group;
}

function createRootNode(type: 'string' | 'number'): TransitiveNode {
  const [node] = extractTransitiveNodesFromSchema({
    jsoncTextData: JSON.stringify({
      $defs: { Target: { type } },
      $ref: '#/$defs/Target',
    }),
    srcFileId: 'alias.json',
  });

  if (!node) {
    throw new Error('Expected an alias transitive node.');
  }

  return node;
}

describe('TypescriptParserVisitor.renderTransitiveNodeWithoutImports', () => {
  beforeEach(() => {
    resetIdentifiers();
  });

  it('should export a declaration without adding an empty comment', async () => {
    const node = createTransitiveNode({ type: 'string' });

    node.annotations = {
      comment: '',
      deprecated: false,
      description: '  ',
      examples: [],
      title: '',
    };

    expect(await renderTransitiveNode(node)).toBe('export type DocumentedType = string;');
  });

  it('should record the final identifier name and omit it for inline types', async () => {
    const node = createTransitiveNode({ type: 'string' });
    const visitor = new TypescriptParserVisitor();
    const logger = createTestingLogger([]);
    const render = (
      transitiveNode: TransitiveNode,
    ): TypescriptParserVisitorResult => (
      visitor.renderTransitiveNodeWithoutImports({
        getAnotherByTransitiveNode: () => visitor.createFallbackType(node),
        logger,
        transitiveNode,
      })
    );

    const first = render(node);
    const second = render({ ...node });
    const inline = render({ ...node, isInline: true });

    expect(first.identifierName).toBe('DocumentedType');
    expect(first.declarationType).toBe('Scalar');
    expect(second.identifierName).toBe('DocumentedType1');
    expect(inline.identifierName).toBeUndefined();
    expect(await second.toString()).toBe('export type DocumentedType1 = string;');
  });

  it('should export an interface with a TSDoc comment and JSON examples', async () => {
    const node = createTransitiveNode({
      $comment: 'Used in customer-facing receipts.',
      deprecated: true,
      description: 'Details of a completed order.',
      examples: [{ orderId: 'order-42' }, { orderId: 'order-43' }],
      properties: { orderId: { type: 'string' } },
      title: 'Order receipt',
      type: 'object',
    });

    const result = parseTransitiveNode(node);

    expect(result.declarationType).toBe('Interface');
    expect(await result.toString()).toBe(`/**
 * ## Order receipt
 *
 * Details of a completed order.
 *
 * @deprecated
 *
 * @privateRemarks
 *
 * Used in customer-facing receipts.
 *
 * @example
 * \`\`\`json
 * {
 *   "orderId": "order-42"
 * }
 * \`\`\`
 *
 * @example
 * \`\`\`json
 * {
 *   "orderId": "order-43"
 * }
 * \`\`\`
 */
export interface OrderReceipt {
    orderId?: string;
}`);
  });

  it('should inherit unset annotations from references in their original order', async () => {
    const node = createTransitiveNode({ type: 'string' });
    const first: TransitiveNode = {
      ...node,
      suggestedName: undefined,
      isInline: true,
      annotations: {
        description: 'First description.',
        examples: ['first'],
      },
    };

    const deep: TransitiveNode = {
      ...node,
      suggestedName: undefined,
      isInline: true,
      annotations: {
        comment: 'Deep comment.',
        deprecated: true,
      },
    };

    const second: TransitiveNode = {
      ...node,
      suggestedName: undefined,
      isInline: true,
      annotations: {
        description: 'Second description.',
        examples: ['second'],
        title: 'Second title',
      },
    };

    node.annotations = { title: 'Own title' };
    node.referredTransitiveNodes = [first, second];
    first.referredTransitiveNodes = [deep];
    deep.referredTransitiveNodes = [node];

    expect(await renderTransitiveNode(node)).toBe(`/**
 * ## Own title
 *
 * First description.
 *
 * @deprecated
 *
 * @privateRemarks
 *
 * Deep comment.
 *
 * @example
 * \`\`\`json
 * "first"
 * \`\`\`
 */
export type DocumentedType = string;`);
  });

  it('should leave an inline node undocumented and unexported', async () => {
    const node = createTransitiveNode({
      description: 'A customer-visible label.',
      type: 'string',
    });

    node.isInline = true;

    expect(await renderTransitiveNode(node)).toBe('string');
  });

  it('should not inherit missing documentation from a named reference', async () => {
    const target = createTransitiveNode({
      $comment: 'Internal target comment.',
      deprecated: true,
      description: 'The original customer identifier.',
      examples: ['customer-42'],
      title: 'Original identifier',
      type: 'string',
    });

    const reference: RefTransitiveNode = {
      annotations: { title: 'Public identifier' },
      mixin: null,
      name: 'CustomerId',
      ref: target,
      source: target.source,
      type: 'reference',
    };

    expect(await renderTransitiveNode(reference)).toBe([
      '/**',
      ' * ## Public identifier',
      ' */',
      'export type CustomerId = OriginalIdentifier;',
    ].join('\n'));
  });

  it('should forward oneOfMode from parse options to the some-of visitor', async () => {
    const node = createTransitiveNode({
      oneOf: [
        {
          properties: { email: { type: 'string' } },
          required: ['email'],
        },
        {
          properties: { phone: { type: 'string' } },
          required: ['phone'],
        },
      ],
    });

    expect(await renderTransitiveNode(node, { oneOfMode: 'sameAsAnyOf' })).toBe(
      `export type DocumentedType = {
    email: string;
} | {
    phone: string;
};`,
    );
  });

  it('should collect direct property and array item dependencies', async () => {
    const node = createTransitiveNode({
      properties: {
        title: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
      },
      type: 'object',
    });

    const result = parseTransitiveNode(node);
    const [titleResult, tagsResult] = result.dependencies ?? [];

    if (!titleResult || !tagsResult
      || typeof titleResult === 'function'
      || typeof tagsResult === 'function'
    ) {
      throw new Error('Expected resolved property dependencies.');
    }

    expect(await result.toString()).toBe(`export interface DocumentedType {
    title?: string;
    tags?: string[];
}`);
    expect(result.dependencies).toHaveLength(2);
    expect(titleResult.transitiveNode.source.jsonPath).toEqual(['properties', 'title']);
    expect(tagsResult.transitiveNode.source.jsonPath).toEqual(['properties', 'tags']);
    expect(tagsResult.dependencies).toHaveLength(1);
    expect(result.shouldBeGroupedWith).toEqual([]);
  });

  it('should collect a named reference target as a dependency', async () => {
    const node = createTransitiveNode({
      $defs: {
        Base: {
          properties: { id: { type: 'string' } },
          type: 'object',
        },
      },
      $ref: '#/$defs/Base',
    });

    const result = parseTransitiveNode(node);
    const [baseResult] = result.dependencies ?? [];

    if (!baseResult || typeof baseResult === 'function') {
      throw new Error('Expected a resolved base type.');
    }

    expect(await result.toString()).toBe('export type DocumentedType = Base;');
    expect(result.dependencies).toHaveLength(1);
    expect(baseResult.transitiveNode.source.jsonPath).toEqual(['$defs', 'Base']);
    expect(await baseResult.toString()).toBe(`export interface Base {
    id?: string;
}`);
  });

  it('should discard rejected visitor dependencies and deduplicate selected ones', async () => {
    const node = createTransitiveNode({ type: 'string' });
    const unusedNode = { ...node, suggestedName: 'Unused' };
    const usedNode = { ...node, suggestedName: 'Used' };
    const resultVisitor = new TypescriptParserVisitor();
    const unusedResult = resultVisitor.createFallbackType(unusedNode);
    const usedResult = resultVisitor.createFallbackType(usedNode);
    const ownResult = resultVisitor.createFallbackType(node);

    const visitor = new TypescriptParserVisitor([
      ({ getAnotherByTransitiveNode }) => {
        getAnotherByTransitiveNode(unusedNode);

        return null;
      },
      ({ getAnotherByTransitiveNode }) => {
        getAnotherByTransitiveNode(usedNode);
        getAnotherByTransitiveNode(usedNode);

        return ownResult;
      },
    ]);

    const result = visitor.renderTransitiveNodeWithoutImports({
      getAnotherByTransitiveNode: (nestedNode) => (
        nestedNode === unusedNode ? unusedResult : usedResult
      ),
      transitiveNode: node,
    });

    expect(result.dependencies).toEqual([usedResult]);
    expect(result.shouldBeGroupedWith).toEqual([]);
  });

  it('should preserve child dependencies when a visitor forwards its result', async () => {
    const node = createTransitiveNode({ type: 'string' });
    const resultVisitor = new TypescriptParserVisitor();
    const childResult = resultVisitor.createFallbackType(node);
    const grandchildResult = resultVisitor.createFallbackType({
      ...node,
      suggestedName: 'Grandchild',
    });

    childResult.dependencies = [grandchildResult];

    const visitor = new TypescriptParserVisitor([
      ({ getAnotherByTransitiveNode }) => {
        const forwardedResult = getAnotherByTransitiveNode(node);

        return typeof forwardedResult === 'function' ? null : forwardedResult;
      },
    ]);

    const result = visitor.renderTransitiveNodeWithoutImports({
      getAnotherByTransitiveNode: () => childResult,
      transitiveNode: node,
    });

    expect(result.dependencies).toEqual([grandchildResult]);
  });

  it('should expose the conditional helper as a grouped dependency', async () => {
    const node = createTransitiveNode({
      properties: { mode: { enum: ['fast', 'slow'] } },
      if: { properties: { mode: { const: 'fast' } } },
      then: { properties: { ready: { type: 'boolean' } } },
    });

    const result = parseTransitiveNode(node, {
      useConditionalIfThenElseDeclaration: true,
    });
    const [helper] = result.shouldBeGroupedWith ?? [];

    if (!helper || typeof helper === 'function') {
      throw new Error('Expected a resolved conditional helper.');
    }

    expect(helper.relativeFilePath).toBe('conditional-result-type.ts');
    expect(result.shouldBeGroupedWith).toHaveLength(1);
    expect(result.dependencies).toContain(helper);
  });

  it('should retain deferred dependencies in a recursive reference graph', async () => {
    const groups = await jsonSchemaToTypescript({
      jsoncTextData: JSON.stringify({
        $defs: {
          First: { properties: { second: { $ref: '#/$defs/Second' } } },
          Second: { properties: { first: { $ref: '#/$defs/First' } } },
        },
        $ref: '#/$defs/First',
      }),
      mode: 'singleFile',
      srcFileId: 'recursive-dependencies.json',
    });

    const results = groups.flatMap(({ groupedItems }) => groupedItems);

    const firstResult = results.find((result) => (
      result.transitiveNode.source.jsonPath.join('/') === '$defs/First'
    ));

    const secondResult = results.find((result) => (
      result.transitiveNode.source.jsonPath.join('/') === '$defs/Second'
    ));
    const [deferred] = secondResult?.shouldBeGroupedWith ?? [];

    if (!firstResult || !secondResult || typeof deferred !== 'function') {
      throw new Error('Expected two grouped recursive declarations.');
    }

    const groupedResult = await deferred();

    expect(secondResult.shouldBeGroupedWith).toHaveLength(1);
    expect(groupedResult).toBe(firstResult);
    expect(await groupedResult.toString()).toBe(`export interface First {
    second?: Second;
}`);
    expect(await secondResult.toString()).toBe(`export interface Second {
    first?: First;
}`);
  });
});

describe('TypescriptParserVisitor.renderTransitiveNodeImports', () => {
  beforeEach(() => {
    resetIdentifiers();
  });

  it('should import named dependencies through inline properties', async () => {
    const node = createTransitiveNode({
      $defs: {
        Base: { properties: { id: { type: 'string' } } },
      },
      properties: { base: { $ref: '#/$defs/Base' } },
    });

    const visitor = new TypescriptParserVisitor();
    const parse = (nestedNode: TransitiveNode): TypescriptParserVisitorResult => (
      visitor.renderTransitiveNodeWithoutImports({
        getAnotherByTransitiveNode: parse,
        transitiveNode: nestedNode,
      })
    );

    const result = parse(node);
    const imports = await visitor.renderTransitiveNodeImports(result);

    expect(await result.toString()).toBe(`export interface DocumentedType {
    base?: Base;
}`);
    expect(await renderSurroundingStatements(imports, result.relativeFilePath))
      .toBe(`import type { Base } from "./base";`);
  });

  it('should transform paths, group imports, and omit grouped types', async () => {
    const node = createTransitiveNode({ type: 'string' });
    const visitor = new TypescriptParserVisitor();
    const result = visitor.createFallbackType(node);
    const userResult = visitor.createFallbackType({ ...node, name: 'User' });
    const planResult = visitor.createFallbackType({ ...node, name: 'Plan' });
    const groupedResult = visitor.createFallbackType({ ...node, name: 'Grouped' });
    const localResult = visitor.createFallbackType({ ...node, name: 'Local' });

    expect(userResult.declarationType).toBe('Scalar');

    result.dependencies = [
      userResult,
      planResult,
      userResult,
      groupedResult,
      localResult,
    ];
    result.shouldBeGroupedWith = [groupedResult];

    const transformFilePath = jest.fn((
      fileName: string,
      transitiveNode: TransitiveNode,
    ) => {
      if (transitiveNode.name === 'User' || transitiveNode.name === 'Plan') {
        return '/generated/models/types.ts';
      }

      if (fileName === 'local.ts') {
        return '/generated/api/documented-type.ts';
      }

      return `/generated/api/${fileName}`;
    });

    const visitorWithOptions = new TypescriptParserVisitor(undefined, {
      transformFilePath,
    });

    const imports = await visitorWithOptions.renderTransitiveNodeImports(result);

    expect(await renderSurroundingStatements(imports, result.relativeFilePath))
      .toBe(`import type { User, Plan } from "../models/types";`);
    expect(transformFilePath.mock.calls.map(([fileName]) => fileName)).toEqual([
      'documented-type.ts',
      'user.ts',
      'plan.ts',
      'local.ts',
    ]);
  });

  it('should use a transform passed through parse options', async () => {
    const node = createTransitiveNode({ type: 'string' });
    const dependencyNode = { ...node, name: 'External' };
    const fallbackVisitor = new TypescriptParserVisitor();
    const dependencyResult = fallbackVisitor.createFallbackType(dependencyNode);

    const visitor = new TypescriptParserVisitor([
      ({ getAnotherByTransitiveNode, transitiveNode }) => {
        getAnotherByTransitiveNode(dependencyNode);

        return fallbackVisitor.createFallbackType(transitiveNode);
      },
    ]);

    const result = visitor.renderTransitiveNodeWithoutImports({
      getAnotherByTransitiveNode: () => dependencyResult,
      options: {
        transformFilePath: (fileName, transitiveNode) => (
          transitiveNode.name === 'External'
            ? `/generated/models/${fileName}`
            : `/generated/api/${fileName}`
        ),
      },
      transitiveNode: node,
    });

    const imports = await visitor.renderTransitiveNodeImports(result);

    expect(await renderSurroundingStatements(imports, result.relativeFilePath))
      .toBe(`import type { External } from "../models/external";`);
  });

  it('should import deferred dependencies except grouped declarations', async () => {
    const node = createTransitiveNode({ type: 'string' });
    const visitor = new TypescriptParserVisitor();
    const result = visitor.createFallbackType(node);
    const groupedResult = visitor.createFallbackType({ ...node, name: 'Recursive' });
    const externalResult = visitor.createFallbackType({ ...node, name: 'External' });

    const deferredResult = async (): Promise<TypescriptParserVisitorResult> => (
      groupedResult
    );

    const deferredExternal = async (): Promise<TypescriptParserVisitorResult> => (
      externalResult
    );

    result.dependencies = [deferredResult, deferredExternal];
    result.shouldBeGroupedWith = [deferredResult];

    const imports = await visitor.renderTransitiveNodeImports(result);

    expect(await renderSurroundingStatements(imports, result.relativeFilePath))
      .toBe(`import type { External } from "./external";`);
  });
});

describe('TypescriptParserVisitor.groupInSeparatedFiles', () => {
  beforeEach(() => {
    resetIdentifiers();
  });

  it('should render a single type declaration without a default export', async () => {
    const node = createTransitiveNode({
      description: 'A public identifier.',
      type: 'string',
    });
    const visitor = new TypescriptParserVisitor();
    const result = visitor.renderTransitiveNodeWithoutImports({
      getAnotherByTransitiveNode: () => visitor.createFallbackType(node),
      transitiveNode: node,
    });

    const group = await renderSingleGroup(visitor, result);

    expect(group.sourceFile.fileName).toBe('documented-type.ts');
    expect(group.fileName).toBe('documented-type.ts');
    expect(group.groupedItems).toEqual([result]);
    expect(result.keySnippet).toBe('export type DocumentedType');
    expect(await group.toString()).toBe(`/**
 * A public identifier.
 */
export type DocumentedType = string;`);
  });

  it('should group declarations and import their other dependencies', async () => {
    const node = createTransitiveNode({
      description: 'A generated API type.',
      type: 'string',
    });
    const externalNode = { ...node, name: 'External', annotations: undefined };
    const visitor = new TypescriptParserVisitor(undefined, {
      transformFilePath: (fileName, transitiveNode) => (
        transitiveNode === externalNode
          ? `/generated/models/${fileName}`
          : `/generated/api/${fileName}`
      ),
    });
    const result = visitor.createFallbackType(node);
    const externalResult = visitor.createFallbackType(externalNode);
    const helperAst = createTypeAliasDeclaration('Helper', createFallbackType());

    const helperResult: TypescriptParserVisitorResult = {
      ...result,
      ast: helperAst,
      dependencies: [externalResult],
      relativeFilePath: 'helper.ts',
      toString: createAstToString(helperAst, 'helper.ts'),
    };

    result.dependencies = [helperResult];
    result.shouldBeGroupedWith = [helperResult];

    const group = await renderSingleGroup(visitor, result);

    expect(group.sourceFile.fileName).toBe('/generated/api/documented-type.ts');
    expect(group.fileName).toBe('/generated/api/documented-type.ts');
    expect(group.groupedItems).toEqual([result, helperResult]);
    expect(await group.toString()).toBe(`import type { External } from '../models/external';

/**
 * A generated API type.
 */
export type DocumentedType = unknown;

type Helper = unknown;`);
  });

  it('should emit a conditional helper with its declaration', async () => {
    const node = createTransitiveNode({
      description: 'A login method.',
      properties: { loginBy: { enum: ['phone', 'email'] } },
      if: { properties: { loginBy: { const: 'phone' } } },
      then: { properties: { phone: { type: 'string' } } },
    });

    const visitor = new TypescriptParserVisitor(undefined, {
      useConditionalIfThenElseDeclaration: true,
    });

    const parse = (nestedNode: TransitiveNode): TypescriptParserVisitorResult => (
      visitor.renderTransitiveNodeWithoutImports({
        getAnotherByTransitiveNode: parse,
        transitiveNode: nestedNode,
      })
    );

    const result = parse(node);
    const group = await renderSingleGroup(visitor, result);

    expect(group.groupedItems).toHaveLength(2);
    expect(group.groupedItems.map(({ identifierName }) => identifierName)).toEqual([
      'DocumentedType',
      'ConditionalResultType',
    ]);
    expect(group.groupedItems[1]?.keySnippet).toBe('type ConditionalResultType');
    expect(await group.toString()).toBe(`/**
 * A login method.
 */
export type DocumentedType<
  TPart extends 'base' | 'if' | 'then' | 'result',
  TRealPart extends DocumentedType<'base', TRealPart> = {
    loginBy?: 'phone' | 'email';
  },
> = TPart extends 'base'
  ? {
      loginBy?: 'phone' | 'email';
    }
  : TPart extends 'if'
    ? {
        loginBy?: 'phone';
      }
    : TPart extends 'then'
      ? {
          phone?: string;
        }
      : TPart extends 'result'
        ? ConditionalResultType<
            DocumentedType<'base', TRealPart>,
            TRealPart,
            DocumentedType<'if', TRealPart>,
            DocumentedType<'then', TRealPart>,
            DocumentedType<'base', TRealPart>
          >
        : never;

type ConditionalResultType<
  TBasePart,
  TRealPart extends TBasePart,
  TConditionPart,
  TPositiveCase,
  TNegativeCase,
> = TRealPart & (TRealPart extends TConditionPart ? TPositiveCase : TNegativeCase);`);

    const repeatedGroup = await renderSingleGroup(visitor, result);

    expect(await repeatedGroup.toString()).toBe(await group.toString());
  });

  it('should resolve recursive group links only once', async () => {
    const node = createTransitiveNode({ type: 'string' });
    const visitor = new TypescriptParserVisitor();
    const first = visitor.createFallbackType({ ...node, name: 'First' });
    const second = visitor.createFallbackType({ ...node, name: 'Second' });

    first.shouldBeGroupedWith = [
      async (): Promise<TypescriptParserVisitorResult> => second,
    ];
    second.shouldBeGroupedWith = [
      async (): Promise<TypescriptParserVisitorResult> => first,
    ];
    first.dependencies = [second];
    second.dependencies = [first];

    const group = await renderSingleGroup(visitor, first);

    expect(group.sourceFile.fileName).toBe('first.ts');
    expect(group.groupedItems).toEqual([first, second]);
    expect(await group.toString()).toBe(`export type First = unknown;

export type Second = unknown;`);
  });

  it('should render a shared declaration in one group', async () => {
    const node = createTransitiveNode({ type: 'string' });
    const visitor = new TypescriptParserVisitor();
    const first = visitor.createFallbackType({ ...node, name: 'First' });
    const second = visitor.createFallbackType({ ...node, name: 'Second' });
    const third = visitor.createFallbackType({ ...node, name: 'Third' });
    const sharedAst = createTypeAliasDeclaration('Shared', createFallbackType());

    const shared: TypescriptParserVisitorResult = {
      ...visitor.createFallbackType({ ...node, name: 'Shared' }),
      ast: sharedAst,
      toString: createAstToString(sharedAst, 'shared.ts'),
      transitiveNode: {
        ...node,
        isInline: true,
        suggestedName: undefined,
      },
    };

    first.shouldBeGroupedWith = [shared];
    second.shouldBeGroupedWith = [shared];
    second.dependencies = [first, shared];

    const groups = await visitor.groupInSeparatedFiles([first, second, shared, third]);

    expect(groups).toHaveLength(2);
    expect(groups[0]?.relatedGroups).toEqual([]);
    expect(groups[1]?.relatedGroups).toEqual([]);
    expect(groups[0]?.groupedItems).toEqual([first, shared, second]);
    expect(await groups[0]?.toString()).toBe(`export type First = unknown;

type Shared = unknown;

export type Second = unknown;`);
    expect(groups[1]?.groupedItems).toEqual([third]);
    expect(await groups[1]?.toString()).toBe(`export type Third = unknown;`);
  });

  it('should track external groups through nested dependencies', async () => {
    const node = createTransitiveNode({ type: 'string' });
    const visitor = new TypescriptParserVisitor();
    const first = visitor.createFallbackType({ ...node, name: 'First' });
    const second = visitor.createFallbackType({ ...node, name: 'Second' });
    const inline = visitor.createFallbackType({ ...node, isInline: true });

    inline.dependencies = [async (): Promise<TypescriptParserVisitorResult> => second];
    first.dependencies = [inline, second, second];
    second.dependencies = [first];

    const groups = await visitor.groupInSeparatedFiles([first, second]);

    expect(groups).toHaveLength(2);
    expect(groups[0]?.relatedGroups).toEqual([groups[1]]);
    expect(groups[1]?.relatedGroups).toEqual([groups[0]]);
    expect(await groups[0]?.toString()).toBe(`import type { Second } from './second';

export type First = unknown;`);
    expect(await groups[1]?.toString()).toBe(`import type { First } from './first';

export type Second = unknown;`);
  });
});

describe('TypescriptParserVisitor.groupInSingleFile', () => {
  it('should render separate files through the owning parser', async () => {
    const nodes = extractTransitiveNodesFromSchema({
      jsoncTextData: JSON.stringify({
        $defs: { User: { type: 'string' } },
        properties: { user: { $ref: '#/$defs/User' } },
      }),
      srcFileId: 'account.json',
    });
    const visitor = new TypescriptParserVisitor();
    const parser = new UltimateParser([visitor]);
    const [rootNode] = nodes;

    if (!rootNode) {
      throw new Error('Expected an account transitive node.');
    }

    const groups = await parser.renderAllTransitiveNodesGrouped(visitor, [rootNode]);

    expect(groups).toHaveLength(2);
    expect(groups[0]?.relatedGroups).toEqual([groups[1]]);
    expect(groups[1]?.relatedGroups).toEqual([]);
    expect(await groups[0]?.toString()).toBe(`import type { User } from './user';

export interface Account {
  user?: User;
}`);
    expect(await groups[1]?.toString()).toBe(`export type User = string;`);
  });

  it('should create an empty source file when no nodes are supplied', async () => {
    const visitor = new TypescriptParserVisitor();
    const parser = new UltimateParser([visitor]);
    const group = parser.renderAllTransitiveNodesInSingleFile(visitor, []);

    expect(group.sourceFile.fileName).toBe('types.ts');
    expect(group.fileName).toBe('types.ts');
    expect(group.groupedItems).toEqual([]);
    expect(group.relatedGroups).toEqual([]);
    expect(await group.toString()).toBe('');
  });

  it('should preserve distinct names for the same schema source', async () => {
    const node = createTransitiveNode({ type: 'string' });
    const visitor = new TypescriptParserVisitor();
    const parser = new UltimateParser([visitor]);

    const group = parser.renderAllTransitiveNodesInSingleFile(visitor, [
      node,
      { ...node, suggestedName: 'SecondName' },
    ]);

    expect(group.sourceFile.fileName).toBe('types.ts');
    expect(group.fileName).toBe('types.ts');
    expect(group.groupedItems.map(({ identifierName }) => identifierName)).toEqual([
      'DocumentedType',
      'SecondName',
    ]);
    expect(group.groupedItems.map(({ keySnippet }) => keySnippet)).toEqual([
      'export type DocumentedType',
      'export type SecondName',
    ]);
    expect(await group.toString()).toBe(`export type DocumentedType = string;

export type SecondName = string;`);
  });

  it('should refresh named dependencies between generations', async () => {
    const visitor = new TypescriptParserVisitor();
    const parser = new UltimateParser([visitor]);
    const first = parser.renderAllTransitiveNodesInSingleFile(
      visitor,
      [createRootNode('string')],
    );

    const second = parser.renderAllTransitiveNodesInSingleFile(
      visitor,
      [createRootNode('number')],
    );

    expect(await first.toString()).toBe(`export type Alias = Target;

export type Target = string;`);
    expect(await second.toString()).toBe(`export type Alias = Target;

export type Target = number;`);
  });

  it('should render named dependencies in the same source file', async () => {
    const nodes = extractTransitiveNodesFromSchema({
      jsoncTextData: JSON.stringify({
        $defs: {
          User: {
            description: 'A named user.',
            properties: { id: { type: 'string' } },
            required: ['id'],
          },
        },
        properties: { user: { $ref: '#/$defs/User' } },
        required: ['user'],
      }),
      srcFileId: 'account.json',
    });

    const [rootNode] = nodes;

    if (!rootNode) {
      throw new Error('Expected an account transitive node.');
    }

    const transformFilePath = jest.fn((fileName: string) => `/generated/${fileName}`);
    const visitor = new TypescriptParserVisitor(undefined, { transformFilePath });
    const logger = createTestingLogger([]);
    const renderNode = jest.spyOn(visitor, 'renderTransitiveNodeWithoutImports');
    const parser = new UltimateParser([visitor], logger);

    const group = parser.renderAllTransitiveNodesInSingleFile(
      visitor,
      [rootNode],
    );

    expect(group.sourceFile.fileName).toBe('/generated/types.ts');
    expect(group.fileName).toBe('/generated/types.ts');
    expect(transformFilePath.mock.calls[0]?.[0]).toBe('types.ts');
    expect(group.groupedItems).toHaveLength(2);
    expect(renderNode.mock.calls[0]?.[0].logger).toBe(logger);
    expect(await group.toString()).toBe(`export interface Account {
  user: User;
}

/**
 * A named user.
 */
export interface User {
  id: string;
}`);
  });

  it('should include a grouped helper only once', async () => {
    const node = createTransitiveNode({
      properties: { mode: { enum: ['fast', 'slow'] } },
      if: { properties: { mode: { const: 'fast' } } },
      then: { properties: { ready: { type: 'boolean' } } },
    });

    const visitor = new TypescriptParserVisitor(undefined, {
      useConditionalIfThenElseDeclaration: true,
    });
    const parser = new UltimateParser([visitor]);

    const group = parser.renderAllTransitiveNodesInSingleFile(
      visitor,
      [node, node],
    );

    expect(group.groupedItems).toHaveLength(2);
    expect(await group.toString()).toBe(`export type DocumentedType<
  TPart extends 'base' | 'if' | 'then' | 'result',
  TRealPart extends DocumentedType<'base', TRealPart> = {
    mode?: 'fast' | 'slow';
  },
> = TPart extends 'base'
  ? {
      mode?: 'fast' | 'slow';
    }
  : TPart extends 'if'
    ? {
        mode?: 'fast';
      }
    : TPart extends 'then'
      ? {
          ready?: boolean;
        }
      : TPart extends 'result'
        ? ConditionalResultType<
            DocumentedType<'base', TRealPart>,
            TRealPart,
            DocumentedType<'if', TRealPart>,
            DocumentedType<'then', TRealPart>,
            DocumentedType<'base', TRealPart>
          >
        : never;

type ConditionalResultType<
  TBasePart,
  TRealPart extends TBasePart,
  TConditionPart,
  TPositiveCase,
  TNegativeCase,
> = TRealPart & (TRealPart extends TConditionPart ? TPositiveCase : TNegativeCase);`);
  });

  it('should preserve recursive references and render each declaration once', async () => {
    const nodes = extractTransitiveNodesFromSchema({
      jsoncTextData: JSON.stringify({
        $defs: {
          First: { properties: { second: { $ref: '#/$defs/Second' } } },
          Second: { properties: { first: { $ref: '#/$defs/First' } } },
        },
        $ref: '#/$defs/First',
      }),
      srcFileId: 'recursive-dependencies.json',
    });

    const visitor = new TypescriptParserVisitor();
    const parser = new UltimateParser([visitor]);
    const group = parser.renderAllTransitiveNodesInSingleFile(visitor, nodes);

    expect(group.groupedItems).toHaveLength(3);
    expect(await group.toString()).toBe(`export type RecursiveDependencies = First;

export interface First {
  second?: Second;
}

export interface Second {
  first?: First;
}`);

    const repeatedGroup = parser.renderAllTransitiveNodesInSingleFile(
      visitor,
      nodes,
    );

    expect(await repeatedGroup.toString()).toBe(await group.toString());
  });
});

describe('UltimateParser.resetCaches', () => {
  it('clears instance-owned visitor results without resetting another parser', () => {
    const node = createTransitiveNode({ type: 'string' });
    const visitor = new TypescriptParserVisitor();
    const parser = new UltimateParser([visitor]);
    const otherParser = new UltimateParser([visitor]);
    const first = parser.renderTransitiveNodeWithoutImports(visitor, node);
    const other = otherParser.renderTransitiveNodeWithoutImports(visitor, node);

    expect(parser.renderTransitiveNodeWithoutImports(visitor, node)).toBe(first);

    parser.resetCaches();

    expect(parser.renderTransitiveNodeWithoutImports(visitor, node)).not.toBe(first);
    expect(otherParser.renderTransitiveNodeWithoutImports(visitor, node)).toBe(other);
  });
});
