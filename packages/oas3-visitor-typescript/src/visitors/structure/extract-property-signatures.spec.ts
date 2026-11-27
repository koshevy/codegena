import {
  createTestingLogger,
  type Logger,
} from '@codegena/oas3-core/logger';
import type {
  StructureTransitiveNode,
  TransitiveNode,
} from '@codegena/oas3-core/transitive-node';
import { extractTransitiveNodesFromSchema } from '@codegena/oas3-core/transitive-parser';
import colors from 'ansi-colors';
import { join } from 'node:path';
import {
  factory,
  SyntaxKind,
  type DeclarationStatement,
} from 'typescript';

import {
  getAnotherByTransitiveNodeObjectIfMock,
} from '../__mocks__';
import { extractPropertySignatures } from './extract-property-signatures';
import { printDeclarationStatement } from '../../ast-utils';
import type {
  TypescriptParserVisitorResult,
} from '../../typescript-parser-visitor-result';
import { VisitorMicroContext } from '../../visitor-micro-context';

function getFixturePath(fileName: string): string {
  return join(__dirname, '../__fixtures__', fileName);
}

describe('extractPropertySignatures', () => {
  let logger: Logger | undefined;
  let logsCollection: string[];

  function extractStructureFromFixture(
    fixtureFilePath: string,
  ): StructureTransitiveNode {
    const [mainTransitiveNode] = extractTransitiveNodesFromSchema({
      logger,
      srcFilePath: getFixturePath(fixtureFilePath),
    });

    if (mainTransitiveNode.type !== 'structure') {
      throw new Error('Unknown error! Expected structure node!');
    }

    return mainTransitiveNode;
  }

  function getAnotherIncludingNestedProperties(
    transitiveNode: TransitiveNode,
  ): TypescriptParserVisitorResult {
    const result = getAnotherByTransitiveNodeObjectIfMock(transitiveNode);

    if (transitiveNode.type !== 'structure') {
      return result;
    }

    const signatures = extractPropertySignatures({
      getAnotherByTransitiveNode: getAnotherIncludingNestedProperties,
      logger,
      transitiveNode,
    });

    return {
      ...result,
      ast: factory.createTypeLiteralNode(signatures ?? []),
    };
  }

  function createInterfaceDeclaration(
    transitiveNode: StructureTransitiveNode,
    typeName: string,
    getAnotherByTransitiveNode = getAnotherIncludingNestedProperties,
  ): DeclarationStatement {
    const signatures = extractPropertySignatures({
      getAnotherByTransitiveNode,
      logger,
      transitiveNode,
    });

    if (!signatures) {
      throw new Error('Unknown error! Expected property signatures!');
    }

    return factory.createInterfaceDeclaration(
      undefined,
      typeName,
      undefined,
      undefined,
      signatures,
    );
  }

  function extractInterfaceDeclarationFromFixture(
    fixtureFilePath: string,
    typeName: string,
  ): DeclarationStatement {
    return createInterfaceDeclaration(
      extractStructureFromFixture(fixtureFilePath),
      typeName,
    );
  }

  beforeEach(() => {
    logsCollection = [];
    logger = createTestingLogger(logsCollection);
  });

  it('should extract required and optional property signatures', async () => {
    const result = extractInterfaceDeclarationFromFixture(
      'object-properties-simple.jsonc',
      'InterfaceDeclaration',
    );

    expect(await printDeclarationStatement(result)).toBe(`interface InterfaceDeclaration {
    requiredPropertyA: unknown;
    requiredPropertyB: unknown;
    nonRequiredPropertyA?: unknown;
    nonRequiredPropertyB?: unknown;
}`);
  });

  it('should extract never properties as optional signatures', async () => {
    const sourceNode = extractStructureFromFixture(
      'object-properties-simple.jsonc',
    );
    const sourceProperty = sourceNode.properties?.['requiredPropertyA'];

    if (!sourceProperty) {
      throw new Error('Expected a source property.');
    }

    const transitiveNode = {
      ...sourceNode,
      properties: {
        phone: {
          ...sourceProperty,
          annotations: { description: 'Phone is not permitted.' },
          associatedPropertyName: 'phone',
          isNever: true,
          isRequired: true,
        },
      },
    };

    const result = createInterfaceDeclaration(
      transitiveNode,
      'NeverPhone',
    );

    expect(await printDeclarationStatement(result)).toBe(`interface NeverPhone {
    /**
     * Phone is not permitted.
     */
    phone?: never;
}`);
  });

  it('should extract nested property-only objects', async () => {
    const result = extractInterfaceDeclarationFromFixture(
      'object-properties-nested.jsonc',
      'CustomerAccount',
    );

    expect(await printDeclarationStatement(result)).toBe(`interface CustomerAccount {
    /**
     * Stable identifier assigned by the CRM
     */
    customerId: unknown;
    /**
     * Whether product updates may be sent
     */
    marketingConsent?: unknown;
    profile?: {
        displayName: unknown;
        contact?: {
            email: unknown;
            phone?: unknown;
        };
    };
}`);
  });

  it('documents annotated properties in interfaces and nested object types', async () => {
    const result = extractInterfaceDeclarationFromFixture(
      'object-properties-annotations.jsonc',
      'AnnotatedProperties',
    );

    expect(await printDeclarationStatement(result)).toBe(`interface AnnotatedProperties {
    /**
     * ## Shadow depth
     *
     * Corresponds to \`dp\` in the spec.
     *
     * @example
     * \`\`\`json
     * 1
     * \`\`\`
     */
    elevation?: unknown;
    /**
     * If true, rounded corners are disabled.
     *
     * @deprecated
     *
     * @privateRemarks
     *
     * Remove after migration.
     */
    square?: unknown;
    /**
     * Additional options.
     */
    options?: {
        /**
         * Label shown to the user.
         */
        label?: unknown;
    };
    undocumented?: unknown;
}`);
  });

  it('should quote JSON property names that are not TypeScript identifiers', async () => {
    const result = extractInterfaceDeclarationFromFixture(
      'object-properties-special-names.jsonc',
      'DeliveryPreferences',
    );

    expect(await printDeclarationStatement(result)).toBe(`interface DeliveryPreferences {
    "delivery-window": unknown;
    "recipient name"?: unknown;
    default?: unknown;
}`);
  });

  it('should return null when the schema has no declared properties', async () => {
    const transitiveNode = extractStructureFromFixture(
      'object-properties-empty.jsonc',
    );

    expect(extractPropertySignatures({
      getAnotherByTransitiveNode: getAnotherIncludingNestedProperties,
      logger,
      transitiveNode,
    })).toBeNull();
  });

  it('should use unknown and continue when nested extraction fails', async () => {
    const transitiveNode = extractStructureFromFixture(
      'object-properties-simple.jsonc',
    );

    const result = createInterfaceDeclaration(
      transitiveNode,
      'FaultTolerantPayload',
      (propertyTransitiveNode) => {
        if (propertyTransitiveNode.associatedPropertyName === 'requiredPropertyA') {
          throw new Error('Simulated nested visitor failure');
        }

        return {
          ...getAnotherByTransitiveNodeObjectIfMock(propertyTransitiveNode),
          ast: factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
        };
      },
    );

    expect(await printDeclarationStatement(result)).toBe(`interface FaultTolerantPayload {
    requiredPropertyA: unknown;
    requiredPropertyB: string;
    nonRequiredPropertyA?: string;
    nonRequiredPropertyB?: string;
}`);
    expect(logsCollection.join('\n')).toMatch(
      /properties\.requiredPropertyA.*unknown type as a fallback/is,
    );

    const warningText = colors.stripColor(logsCollection.join('\n'))
      .replaceAll(/ +$/gm, '');

    expect(warningText).toContain(
      getFixturePath('object-properties-simple.jsonc'),
    );
    expect(warningText).toContain('> 8 |     "requiredPropertyA": {},');
    expect(warningText).toContain('    |');
  });

  it('should track a named recursive property dependency', async () => {
    const sourceNode = extractStructureFromFixture(
      'object-properties-simple.jsonc',
    );

    const propertyNode = {
      ...sourceNode.properties?.['requiredPropertyA'],
      isInline: false,
      isRequired: true,
      name: 'RecursiveCustomer',
    } as TransitiveNode;

    const transitiveNode = {
      ...sourceNode,
      properties: {
        recursiveCustomer: propertyNode,
      },
    };

    const recursiveResult = (): Promise<TypescriptParserVisitorResult> => Promise.resolve(
      getAnotherByTransitiveNodeObjectIfMock(propertyNode),
    );

    const microContext: VisitorMicroContext = {
      shouldBeGroupedWith: [],
    };

    const signatures = extractPropertySignatures({
      getAnotherByTransitiveNode: () => recursiveResult,
      logger,
      microContext,
      transitiveNode,
    });

    if (!signatures) {
      throw new Error('Expected extracted property signatures!');
    }

    const result = factory.createInterfaceDeclaration(
      undefined,
      'RecursivePayload',
      undefined,
      undefined,
      signatures,
    );

    expect(await printDeclarationStatement(result)).toBe(`interface RecursivePayload {
    recursiveCustomer: RecursiveCustomer;
}`);
    expect(microContext.hasCycleDependencies).toBe(true);
    expect(microContext.shouldBeGroupedWith).toEqual([recursiveResult]);
    expect(logsCollection.join('\n')).toMatch(/Recursive dependency detected/);
  });
});
