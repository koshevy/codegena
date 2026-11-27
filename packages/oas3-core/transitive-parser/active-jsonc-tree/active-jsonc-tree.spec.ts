import { createTestingLogger } from '@codegena/oas3-core/logger';
import set from 'lodash/set';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ActiveJsoncTree } from './active-jsonc-tree';
import { JsonParseError } from '../json-parse-error';
import { isReconstructedObjectJsoncValue } from '../reconstruct-jsonc-value';

const fixturesDir = join(__dirname, './__fixtures__');

function getReserveMechanicsJson(filePath: string): object {
  const pureJsonText = readFileSync(filePath, 'utf8')
    .replaceAll(/^\/\/[^\n]*\n/g, '');

  return JSON.parse(pureJsonText);
}

describe('ActiveJsoncTree', () => {
  it('should read a source path through a supplied adapter', () => {
    const readFile = jest.fn(() => '{"type":"string"}');
    const jsoncTree = new ActiveJsoncTree(
      { srcFilePath: 'virtual/schema.json' },
      undefined,
      undefined,
      { readFile },
    );

    expect(readFile).toHaveBeenCalledWith('virtual/schema.json');
    expect(jsoncTree.getData()).toEqual({ type: 'string' });
    expect(jsoncTree.getSourceFileId()).toBe('virtual/schema.json');
  });

  it('should successfully create ActiveJsoncTree by filename', () => {
    const srcFilePath = join(fixturesDir, './simple-schema.jsonc');
    const jsoncTree = new ActiveJsoncTree({ srcFilePath });

    if (!isReconstructedObjectJsoncValue(jsoncTree.getReconstructedJsonc())) {
      throw new Error('Expected root node to be object!');
    }

    expect(jsoncTree.getAllJsonPaths()).toMatchSnapshot();
    expect(jsoncTree.getData()).toMatchObject(
      getReserveMechanicsJson(srcFilePath),
    );
    expect(jsoncTree.getErrors()).toEqual([]);
    expect(jsoncTree.getNode()).toMatchSnapshot();
    expect(jsoncTree.getSourceFileId()).toEqual(srcFilePath);
  });

  it('should throw parse error when syntax is wrong', () => {
    expect(() => new ActiveJsoncTree({
      srcFilePath: join(fixturesDir, 'wrong-syntax.jsonc'),
    })).toThrow(JsonParseError);
  });

  it('should correctly access each data element by json path', () => {
    const srcFilePath = join(fixturesDir, './simple-schema.jsonc');
    const jsoncTree = new ActiveJsoncTree({ srcFilePath });
    const checkingReconstructedData = jsoncTree
      .getAllJsonPaths()
      .reduce((result, path) => (
        set(result, path, jsoncTree.getData(path))
      ), {});

    expect(jsoncTree.getData()).toEqual(checkingReconstructedData);
  });

  it('should correctly access each reconstructed jsonc by json path', () => {
    const srcFilePath = join(fixturesDir, './simple-schema.jsonc');
    const jsoncTree = new ActiveJsoncTree({ srcFilePath });
    const accessedReconstructedDataItem = jsoncTree
      .getAllJsonPaths()
      .map((path) => {
        const nestedJsonc = jsoncTree.getReconstructedJsonc(path);

        if (!nestedJsonc) {
          throw new Error(`Can't access reconstructed jsonc at: ${path}!`);
        }

        return nestedJsonc;
      });

    expect(accessedReconstructedDataItem).toBeTruthy();
  });

  it('should return absent optional values without reporting a parse error', () => {
    const logsCollection: string[] = [];
    const jsoncTree = new ActiveJsoncTree({
      jsoncTextData: JSON.stringify({ items: [{ type: 'string' }] }),
      srcFileId: 'optional-values.jsonc',
    }, undefined, createTestingLogger(logsCollection));

    expect(jsoncTree.getDataAs('string', ['items', '0', 'type']))
      .toBe('string');
    expect(jsoncTree.getDataAs('string', ['items', '0', 'format']))
      .toBeUndefined();
    expect(jsoncTree.getDataAs('string', ['items', '1', 'type']))
      .toBeUndefined();
    expect(jsoncTree.getDataAs('string', ['items', '0', 'format'], true))
      .toBeUndefined();
    expect(logsCollection).toHaveLength(1);
    expect(logsCollection[0]).toContain('format');
  });

  describe('anchors', () => {
    it('should list indexed static and dynamic anchors without unrelated keys', () => {
      const srcFilePath = join(fixturesDir, 'anchored-catalog.jsonc');
      const jsoncTree = new ActiveJsoncTree({ srcFilePath });

      expect(jsoncTree.getAllAnchors()).toEqual([
        'archivedProduct',
        'catalog',
        'expandableProduct',
        'product',
      ]);
      expect(jsoncTree.getAnchor('notAnAnchor')).toBeUndefined();
      expect(jsoncTree.getAnchor('exampleOnly')).toBeUndefined();
    });

    it('should retrieve the schema node associated with each anchor', () => {
      const srcFilePath = join(fixturesDir, 'anchored-catalog.jsonc');
      const jsoncTree = new ActiveJsoncTree({ srcFilePath });

      expect(jsoncTree.getAnchor('catalog')).toBe(
        jsoncTree.getReconstructedJsonc(),
      );
      expect(jsoncTree.getAnchor('product')).toBe(
        jsoncTree.getReconstructedJsonc(['$defs', 'Product']),
      );
      expect(jsoncTree.getAnchor('expandableProduct')).toBe(
        jsoncTree.getReconstructedJsonc(['$defs', 'ExpandableProduct']),
      );
      expect(jsoncTree.getAnchor('archivedProduct')).toBe(
        jsoncTree.getReconstructedJsonc([
          'properties',
          'archivedProducts',
          'items',
        ]),
      );
      expect(jsoncTree.getAnchor('missing')).toBeUndefined();
    });

    it('should ignore malformed anchor values and log warnings', () => {
      const logsCollection: string[] = [];
      const jsoncTree = new ActiveJsoncTree({
        jsoncTextData: JSON.stringify({
          $anchor: 42,
          properties: {
            invalid: { $dynamicAnchor: 'bad name', type: 'string' },
            valid: { $anchor: 'valid_name', type: 'string' },
          },
        }),
        srcFileId: 'invalid-anchors.jsonc',
      }, undefined, createTestingLogger(logsCollection));

      const logsText = logsCollection.join('\n');

      expect(jsoncTree.getAllAnchors()).toEqual(['valid_name']);
      expect(jsoncTree.getAnchor('42')).toBeUndefined();
      expect(jsoncTree.getAnchor('bad name')).toBeUndefined();
      expect(logsCollection).toHaveLength(2);
      expect(logsText).toContain('Anchor ignored at $anchor');
      expect(logsText).toContain(
        'Anchor ignored at properties.invalid.$dynamicAnchor',
      );
    });
  });
});
