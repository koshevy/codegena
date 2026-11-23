import { createTestingLogger, type Logger } from '@codegena/oas3-core/logger';
import { join } from 'node:path';

import { visitorArray } from './visitor-array';
import { jsonSchemaToTypescript } from '../../json-schema-to-typescript';
import { resetIdentifiers } from '../../misc-utils';
import {
  getAnotherByTransitiveNodeArrayMock,
  resetArrayUltimateParser,
  setArrayUltimateParserLogger,
} from '../__mocks__/get-another-by-transitive-node-array.mock';
import { renderSchemaByFileName } from '../testing-utils';

describe('visitor-array', () => {
  let logger: Logger;

  async function renderArraySchemaByFileName(
    fixtureFilePath: string,
    options?: Parameters<typeof renderSchemaByFileName>[0]['options'],
  ): Promise<string | undefined> {
    return renderSchemaByFileName({
      fixtureFilePath,
      getAnotherByTransitiveNode: getAnotherByTransitiveNodeArrayMock,
      isInline: false,
      logger,
      mainVisitor: visitorArray,
      options,
    });
  }

  beforeEach(() => {
    logger = createTestingLogger([]);
    resetIdentifiers();
    resetArrayUltimateParser();
    setArrayUltimateParserLogger(logger);
  });

  it('should create an array type from a common item schema', async () => {
    expect(await renderArraySchemaByFileName(
      'array-items-common.jsonc',
    )).toBe('type ArrayItemsCommon = string[];');
  });

  it('should create an array of a union for common competing item schemas', async () => {
    expect(await renderArraySchemaByFileName(
      'array-items-and-unevaluated.jsonc',
    )).toBe('type ArrayItemsAndUnevaluated = (string | number)[];');
  });

  it('should create a tuple with prefix items before tuple items', async () => {
    expect(await renderArraySchemaByFileName(
      'array-prefix-and-items.jsonc',
    )).toBe(`type ArrayPrefixAndItems = [
    string,
    number,
    boolean
];`);
  });

  it('should create a tuple with a union rest item type', async () => {
    expect(await renderArraySchemaByFileName(
      'array-prefix-and-rest.jsonc',
    )).toBe(`type ArrayPrefixAndRest = [
    string,
    number,
    ...(number | boolean)[]
];`);
  });

  it('should create an unknown array for true unevaluatedItems', async () => {
    expect(await renderArraySchemaByFileName(
      'array-unevaluated-true.jsonc',
    )).toBe('type ArrayUnevaluatedTrue = unknown[];');
  });

  it('should create a minimum-length tuple with a rest item', async () => {
    expect(await renderArraySchemaByFileName(
      'array-inventory-minimum.jsonc',
    )).toBe(`type ArrayInventoryMinimum = [
    number,
    number,
    number,
    ...number[]
];`);
  });

  it('should include the empty tuple when only a maximum is set', async () => {
    const expected = `type ArrayInventoryMaximum = [
] | [
    number
] | [
    number,
    number
] | [
    number,
    number,
    number
];`;

    expect(await renderArraySchemaByFileName(
      'array-inventory-maximum.jsonc',
    )).toBe(expected);
  });

  it('should create a union of all tuple lengths in a bounded range', async () => {
    expect(await renderArraySchemaByFileName(
      'array-inventory-range.jsonc',
    )).toBe(`type ArrayInventoryRange = [
    number,
    number,
    number
] | [
    number,
    number,
    number,
    number
] | [
    number,
    number,
    number,
    number,
    number
];`);
  });

  it.each([3, 0])(
    'should omit minimum tuples at threshold %i',
    async (minLengthTupleThreshold) => {
      expect(await renderArraySchemaByFileName(
        'array-inventory-minimum.jsonc',
        { minLengthTupleThreshold },
      )).toBe('type ArrayInventoryMinimum = number[];');
    },
  );

  it.each([3, 0])(
    'should omit maximum tuples at threshold %i',
    async (maxLengthTupleThreshold) => {
      expect(await renderArraySchemaByFileName(
        'array-inventory-maximum.jsonc',
        { maxLengthTupleThreshold },
      )).toBe('type ArrayInventoryMaximum = number[];');
    },
  );

  it('should pass tuple thresholds through the public generator options', async () => {
    const [group] = await jsonSchemaToTypescript({
      mode: 'singleFile',
      srcFilePath: join(
        __dirname,
        '../__fixtures__',
        'array-inventory-minimum.jsonc',
      ),
      typescriptVisitorOptions: { minLengthTupleThreshold: 0 },
    });

    if (!group) {
      throw new Error('Expected a generated source file.');
    }

    expect(await group.toString()).toBe(
      'export type ArrayInventoryMinimum = number[];',
    );
  });
});
