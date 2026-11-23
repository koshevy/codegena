/* eslint-disable max-len -- Exact generated TypeScript output is compared verbatim. */
import { createTestingLogger, type Logger } from '@codegena/oas3-core/logger';
import type {
  ArrayTransitiveNode,
  UnionTransitiveNode,
  UnknownTransitiveNode,
} from '@codegena/oas3-core/transitive-node';
import { extractTransitiveNodesFromSchema } from '@codegena/oas3-core/transitive-parser';
import { join } from 'node:path';

import { visitorVariative } from './visitor-variative';
import { resetIdentifiers } from '../../misc-utils';
import {
  getAnotherByTransitiveNodeArrayMock,
  resetArrayUltimateParser,
  setArrayUltimateParserLogger,
} from '../__mocks__/get-another-by-transitive-node-array.mock';
import { renderSchemaByFileName } from '../testing-utils';

describe('visitor-variative', () => {
  let logger: Logger;

  async function renderVariativeSchemaByFileName(
    fixtureFilePath: string,
  ): Promise<string | undefined> {
    return renderSchemaByFileName({
      fixtureFilePath,
      getAnotherByTransitiveNode: getAnotherByTransitiveNodeArrayMock,
      isInline: false,
      logger,
      mainVisitor: visitorVariative,
    });
  }

  beforeEach(() => {
    logger = createTestingLogger([]);
    resetIdentifiers();
    resetArrayUltimateParser();
    setArrayUltimateParserLogger(logger);
  });

  it('should create a union of every converted variative type', async () => {
    expect(await renderVariativeSchemaByFileName(
      'variative-nullable-email.jsonc',
      // eslint-disable-next-line no-template-curly-in-string
    )).toBe('type VariativeNullableEmail = null | `${string}@${string}`;');
  });

  it('should simplify a single converted variative type', async () => {
    expect(await renderVariativeSchemaByFileName(
      'variative-string-only.jsonc',
    )).toBe('type VariativeStringOnly = string;');
  });

  it('should preserve numeric and patterned string variants', async () => {
    expect(await renderVariativeSchemaByFileName(
      'variative-order-code.jsonc',
      // eslint-disable-next-line no-template-curly-in-string
    )).toBe('type VariativeOrderCode = number | `ORDER_${string}`;');
  });

  it('should preserve array and object variants', async () => {
    expect(await renderVariativeSchemaByFileName(
      'variative-collection.jsonc',
    )).toBe(`type VariativeCollection = string[] | {
    total: number;
};`);
  });

  it('should omit unknown and fallback array variants beside a concrete array', async () => {
    const [sourceNode] = extractTransitiveNodesFromSchema({
      srcFilePath: join(
        __dirname,
        '../__fixtures__/variative-collection.jsonc',
      ),
    });

    if (sourceNode.type !== 'union') {
      throw new Error('Expected a variative union.');
    }

    const variants = sourceNode.referredTransitiveNodes ?? [];
    const concreteArray = variants.find((variant) => variant.type === 'array');

    if (concreteArray?.type !== 'array') {
      throw new Error('Expected a concrete array variant.');
    }

    const fallbackArray: ArrayTransitiveNode = {
      ...concreteArray,
      isFallbackType: true,
      itemsInCommon: undefined,
    };

    const unknown: UnknownTransitiveNode = {
      source: sourceNode.source,
      type: 'unknown',
    };

    const transitiveNode: UnionTransitiveNode = {
      ...sourceNode,
      referredTransitiveNodes: [fallbackArray, unknown, ...variants],
    };

    const result = visitorVariative({
      getAnotherByTransitiveNode: getAnotherByTransitiveNodeArrayMock,
      logger,
      transitiveNode,
    });

    expect(await result?.toString()).toBe(`type VariativeCollection = string[] | {
    total: number;
};`);
  });
});
