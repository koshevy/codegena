import { createTestingLogger, type Logger } from '@codegena/oas3-core/logger';
import { extractTransitiveNodesFromSchema } from '@codegena/oas3-core/transitive-parser';
import colors from 'ansi-colors';
import trim from 'lodash/trim';
import { join } from 'node:path';

import {
  getAnotherByTransitiveNodeObjectIfMock,
} from '../__mocks__';
import { visitorStructure } from './visitor-structure';
import { resetIdentifiers } from '../../misc-utils';

function getFixturePath(fileName: string): string {
  return join(__dirname, '../__fixtures__', fileName);
}

describe.each([
  false,
  true,
])('visitor-structure when isInline=%s', (isInline) => {
  async function renderSchemaByFileName(
    fixtureFilePath: string,
    suggestedName: string,
    shouldRenderInline: boolean,
  ): Promise<string | undefined> {
    const transitiveNodes = extractTransitiveNodesFromSchema({
      logger,
      srcFilePath: getFixturePath(fixtureFilePath),
    });
    const [mainNode] = transitiveNodes;

    const result = visitorStructure({
      getAnotherByTransitiveNode: getAnotherByTransitiveNodeObjectIfMock,
      logger,
      suggestedName,
      transitiveNode: {
        ...mainNode,
        isInline: shouldRenderInline,
      },
    });

    return result?.toString();
  }

  let logger: Logger | undefined;
  let logsCollection: string[];

  beforeEach(() => {
    resetIdentifiers();
    logsCollection = [];
    logger = createTestingLogger(logsCollection);
  });

  it('should create type alias for Record<string, unknown> when empty', async () => {
    const renderedType = await renderSchemaByFileName(
      'object-properties-empty.jsonc',
      'NamedRecordUnknownType',
      isInline,
    );

    let expectedResult = 'type NamedRecordUnknownType = Record<string, unknown>;';

    if (isInline) {
      expectedResult = trim(expectedResult, ';');
      expectedResult = expectedResult.replace(/^type \w+ = /, '');
    }

    expect(renderedType).toBe(expectedResult);

    const warningText = colors.stripColor(logsCollection.join('\n'))
      .replaceAll(/ +$/gm, '');

    expect(warningText).toContain([
      'Unable to correctly parse object at root schema',
      'Used Record<string, unknown> as a fallback.',
      'Encountered at:',
      `${getFixturePath('object-properties-empty.jsonc')}:1:1`,
      '> 1 | {',
      '    | ^',
      '  2 |   "$id": "empty-business-payload",',
    ].join('\n'));
  });

  it('should create type when patterns are used', async () => {
    const renderedType = await renderSchemaByFileName(
      'object-pattern-properties.jsonc',
      'ObjectType',
      isInline,
    );

    /* eslint-disable max-len */
    const namedResult = `type ObjectType = Record<\`GROUP_CORE_\${string}\`, Record<string, unknown>> & Record<\`GROUP_EXTENSION_\${string}\`, Record<\`EXTENSION_PROPERTY_\${string}\`, Record<\`NESTED_PROPERTY_\${string}\`, unknown>>>;`;
    const expectedResult = isInline
      ? namedResult.slice('type ObjectType = '.length, -1)
      : namedResult;
    /* eslint-enable max-len */

    expect(renderedType).toBe(expectedResult);
  });

  it('should create interface when object has properties', async () => {
    const renderedType = await renderSchemaByFileName(
      'object-properties-nested.jsonc',
      'ObjectInterface',
      isInline,
    );

    const namedResult = `interface ObjectInterface {
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
}`;

    const expectedResult = isInline
      ? namedResult.slice('interface ObjectInterface '.length)
      : namedResult;

    expect(renderedType).toBe(expectedResult);
  });

  it('should create intersection type with patterns and properties', async () => {
    const renderedType = await renderSchemaByFileName(
      'object-mixed-complex.jsonc',
      'ObjectIntersectionType',
      isInline,
    );

    /* eslint-disable max-len */
    const namedResult = `type ObjectIntersectionType = Record<\`X_\${string}\`, unknown> & {
    dictionary: {
        meta: Record<\`PROPERTY_\${string}\`, {
            description?: unknown;
            rules?: unknown;
        }> & Record<\`PRESET_\${string}\`, {
            associatedActions?: unknown;
            associatedProperties?: unknown;
            description?: unknown;
            initialValue?: unknown;
        }> & Record<\`ACTION_\${string}\`, {
            associatedProperties?: unknown;
            arguments?: Record<\`REF_\${string}\`, {
                $ref: unknown;
                allowRecursive?: unknown;
                defaultValue?: unknown;
            }> & Record<\`VAL_\${string}\`, unknown>;
            storedFn?: unknown;
            trigger?: unknown;
        }>;
        data?: Record<\`\${"PROPERTY" | "PRESET" | "ACTION"}_\${string}_\${"ARGUMENT" | "RESULT" | "VALUE"}\`, {
            currentValue: unknown;
            changedAt: unknown;
            previousValue?: unknown;
        }>;
    };
};`;

    const expectedResult = isInline
      ? namedResult.slice('type ObjectIntersectionType = '.length, -1)
      : namedResult;
    /* eslint-enable max-len */

    expect(renderedType).toBe(expectedResult);
  });
});
