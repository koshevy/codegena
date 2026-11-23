/* eslint-disable no-template-curly-in-string */
import {
  createTestingLogger,
  type Logger,
} from '@codegena/oas3-core/logger';
import type { StructureTransitiveNode } from '@codegena/oas3-core/transitive-node';
import { extractTransitiveNodesFromSchema } from '@codegena/oas3-core/transitive-parser';
import colors from 'ansi-colors';
import { join } from 'node:path';
import type { TypeNode } from 'typescript';

import {
  getAnotherByTransitiveNodeObjectIfMock,
} from '../__mocks__';
import { extractPropertyPatterns } from './extract-property-patterns';
import { printTypeDeclaration } from '../../ast-utils';

function getFixturePath(fileName: string): string {
  return join(__dirname, '../__fixtures__', fileName);
}

describe('extractPropertyPatterns', () => {
  let logger: Logger | undefined;
  let logsCollection: string[];

  function extractTypeNodesFromFixture(
    fixtureFilePath: string,
    defaultKeyPattern?: StructureTransitiveNode['defaultKeyPattern'],
  ): TypeNode {
    const [mainTransitiveNode] = extractTransitiveNodesFromSchema({
      logger,
      srcFilePath: getFixturePath(fixtureFilePath),
    });

    if (mainTransitiveNode.type !== 'structure') {
      throw new Error('Unknown error! Expected structure node!');
    }

    const typeNode = extractPropertyPatterns({
      getAnotherByTransitiveNode: getAnotherByTransitiveNodeObjectIfMock,
      logger,
      transitiveNode: {
        ...mainTransitiveNode,
        defaultKeyPattern: defaultKeyPattern
          ?? mainTransitiveNode.defaultKeyPattern,
      },
    });

    if (!typeNode) {
      throw new Error('Unknown error! Expected type node!');
    }

    return typeNode;
  }

  beforeEach(() => {
    logsCollection = [];
    logger = createTestingLogger(logsCollection);
  });

  it('should extract record with string keys and unknown values', async () => {
    const typeNode = extractTypeNodesFromFixture(
      'object-additional-properties-unknown.jsonc',
    );

    expect(await printTypeDeclaration('PatternType', typeNode))
      .toBe('type PatternType = Record<string, unknown>;');
  });

  it('should extract record with custom keys and unknown values', async () => {
    const typeNode = extractTypeNodesFromFixture(
      'object-additional-properties-custom-keys.jsonc',
    );

    expect(await printTypeDeclaration('PatternType', typeNode)).toBe(
      // eslint-disable-next-line max-len
      'type PatternType = Record<`${"CPU" | "RAM" | "DISPLAY" | "HDD"}_${string}`, unknown>;',
    );
  });

  it('should intersect combined property name patterns', async () => {
    const typeNode = extractTypeNodesFromFixture(
      'object-additional-properties-unknown.jsonc',
      [/^CORE_[A-Z0-9_]+$/, /^CORE_PROP_[A-Z0-9_]+$/],
    );

    expect(await printTypeDeclaration('PatternType', typeNode)).toBe(
      'type PatternType = Record<`CORE_${string}` & `CORE_PROP_${string}`, unknown>;',
    );
  });

  it('should extract record with custom values', async () => {
    const typeNode = extractTypeNodesFromFixture(
      'object-additional-properties-custom-values.jsonc',
    );

    expect(await printTypeDeclaration('PatternType', typeNode)).toBe(
      // eslint-disable-next-line max-len
      'type PatternType = Record<string, Record<`${"CORE" | "EXTENSION"}_${string}`, unknown>>;',
    );
  });

  it('should locate an additional-properties fallback warning', async () => {
    const fixtureFilePath = getFixturePath(
      'object-additional-properties-custom-values.jsonc',
    );

    const [transitiveNode] = extractTransitiveNodesFromSchema({
      logger,
      srcFilePath: fixtureFilePath,
    });

    if (!transitiveNode || transitiveNode.type !== 'structure') {
      throw new Error('Expected a structure node.');
    }

    const typeNode = extractPropertyPatterns({
      getAnotherByTransitiveNode: () => {
        throw new Error('Simulated nested visitor failure');
      },
      logger,
      transitiveNode,
    });

    if (!typeNode) {
      throw new Error('Expected a fallback type node.');
    }

    const warningText = colors.stripColor(logsCollection.join('\n'))
      .replaceAll(/ +$/gm, '');

    expect(await printTypeDeclaration('PatternType', typeNode)).toBe(
      'type PatternType = Record<string, unknown>;',
    );
    expect(warningText).toContain([
      'Default value of additional properties decided to use unknown.',
      'Encountered at:',
    ].join('\n'));
    expect(warningText).toContain(`${fixtureFilePath}:6:`);
    expect(warningText).toContain('> 6 |   "additionalProperties": {');
  });

  it('should extract record with custom keys and custom values', async () => {
    const typeNode = extractTypeNodesFromFixture(
      'object-additional-properties-custom-keys-and-values.jsonc',
    );

    expect(await printTypeDeclaration('PatternType', typeNode)).toBe(
      // eslint-disable-next-line max-len -- Exact raw TypeScript printer output.
      `type PatternType = Record<\`GROUP_\${string}\`, Record<\`\${"CORE" | "EXTENSION"}_\${string}\`, unknown>>;`,
    );
  });

  it('should extract different key types from patternProperties', async () => {
    const typeNode = extractTypeNodesFromFixture(
      'object-pattern-properties.jsonc',
    );

    /* eslint-disable max-len */
    expect(await printTypeDeclaration('PatternType', typeNode)).toBe(`type PatternType = Record<\`GROUP_CORE_\${string}\`, Record<string, unknown>> & Record<\`GROUP_EXTENSION_\${string}\`, Record<\`EXTENSION_PROPERTY_\${string}\`, Record<\`NESTED_PROPERTY_\${string}\`, unknown>>>;`);
    /* eslint-enable max-len */
  });

  it('should extract non-parseable patterns as string key type', async () => {
    const typeNode = extractTypeNodesFromFixture(
      'object-pattern-properties-non-parseable.jsonc',
    );

    // eslint-disable-next-line max-len
    expect(await printTypeDeclaration('PatternType', typeNode)).toBe(`type PatternType = Record<string, Record<\`INTERNAL_PROP_\${string}\` | \`INTERNAL_DEC_PROP_\${string}\`, unknown>> & Record<\`0x\${string}\`, Record<\`INTERNAL_HEX_PROP_\${string}\`, unknown>>;`);
  });

  it('should deal with non-parseable default key type', async () => {
    const typeNode = extractTypeNodesFromFixture(
      'object-pattern-properties-non-parseable-custom-default-key.jsonc',
    );

    /* eslint-disable max-len */
    expect(await printTypeDeclaration('PatternType', typeNode)).toBe(`type PatternType = Record<\`EXTERNAL_PROP_\${string}\`, unknown | Record<\`INTERNAL_PROP_\${string}\` | \`INTERNAL_DEC_PROP_\${string}\`, unknown>> & Record<\`0x\${string}\`, Record<\`INTERNAL_HEX_PROP_\${string}\`, unknown>>;`);
    /* eslint-enable max-len */
  });

  it('should extract records with custom keys from patternProperties', async () => {
    const typeNode = extractTypeNodesFromFixture(
      'object-pattern-properties-overlapping.jsonc',
    );

    expect(await printTypeDeclaration('PatternType', typeNode)).toBe(
      // eslint-disable-next-line max-len -- Exact raw TypeScript printer output.
      `type PatternType = Record<\`RANGE.\${string}.\${string}\`, unknown | Record<\`SUB_PROPERTY_\${string}\`, unknown>>;`,
    );
  });

  it('should extract Record when additionalProperties is just type=object', async () => {
    const typeNode = extractTypeNodesFromFixture(
      'object-additional-properties-no-nested-patterns.jsonc',
    );

    expect(await printTypeDeclaration('PatternType', typeNode)).toBe(
      'type PatternType = Record<`TOP_LEVEL_PREFIX_${string}`, Record<string, unknown>>;',
    );
  });

  it('should completely check complex case of property patterns', async () => {
    const typeNode = extractTypeNodesFromFixture(
      'object-patterns-complex.jsonc',
    );

    /* eslint-disable max-len */
    expect(await printTypeDeclaration('PatternType', typeNode)).toBe(`type PatternType = Record<\`TOP_LEVEL_PREFIX_\${string}\`, Record<string, unknown>> & Record<\`FIRST_LEVEL_PREFIX_A_\${string}\`, Record<\`SUB_LEVEL_PREFIX_A_\${string}\`, unknown> | unknown> & Record<\`FIRST_LEVEL_PREFIX_B_\${string}\`, Record<\`SUB_LEVEL_B_\${string}\`, unknown> | (Record<\`SUB_LEVEL_B_\${string}\`, Record<string, unknown>> & Record<\`SUB_LEVEL_C_\${string}\`, Record<\`DEEP_LEVEL_C_\${string}\`, unknown>>)>;`);
    /* eslint-enable max-len */
  });
});
