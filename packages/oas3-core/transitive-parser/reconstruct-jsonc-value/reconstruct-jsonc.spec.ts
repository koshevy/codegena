import { parseTree } from 'jsonc-parser';
import uniq from 'lodash/uniq';

import { appendJsonEntries } from './append-json-entries';
import { reconstructJsonc } from './reconstruct-jsonc';
import {
  isReconstructedArrayJsoncValue,
  isReconstructedObjectJsoncValue,
  isReconstructedScalarJsoncValue,
} from './reconstructed-jsonc-value-typeguards';
import {
  getArrayValueFromItems,
  getArrayValueFromNodeChildren,
  loadJsonc,
} from './testing-utils';

describe('reconstructJsonc', () => {
  it('should append a large nested path list without overflowing the stack', () => {
    const entries: string[] = [];
    const nestedEntries = Array.from(
      { length: 150_000 },
      (_, index) => `root.child${index}`,
    );

    expect(() => appendJsonEntries(
      entries,
      'root',
      nestedEntries,
    )).not.toThrow();
    expect(entries).toHaveLength(nestedEntries.length + 1);
    expect(entries[0]).toBe('root');
    expect(entries.at(-1)).toBe(nestedEntries.at(-1));
  });

  describe('Scalar value', () => {
    it.each([
      'boolean',
      'null',
      'number',
      'string',
    ] as const)('should correctly reconstruct %s value', (scalarType) => {
      const fileName = `scalar-${scalarType}.json5`;
      const [fileContent, jsonc] = loadJsonc(fileName);
      const reconstructedValue = reconstructJsonc(
        jsonc,
        fileName,
        () => fileContent,
        [],
      );

      if (!isReconstructedScalarJsoncValue(reconstructedValue)) {
        throw new Error('Expected reconstructed value to be scalar!');
      }

      const expectedTypeOf = scalarType === 'null'
        ? 'object'
        : scalarType;

      expect(typeof reconstructedValue.value).toBe(expectedTypeOf);
      expect(reconstructedValue.jsonPath).toMatchObject([]);
      expect(reconstructedValue.node).toMatchObject({
        type: scalarType,
      });
    });
  });

  describe('Array value', () => {
    it('should correctly reconstruct flat array', () => {
      const fileName = 'array-flat.json5';
      const [fileContent, jsonc] = loadJsonc(fileName);
      const reconstructedValue = reconstructJsonc(
        jsonc,
        fileName,
        () => fileContent,
        [],
      );

      if (!isReconstructedArrayJsoncValue(reconstructedValue)) {
        throw new Error('Expected reconstructed value to be an array!');
      }

      expect(reconstructedValue.node.type).toBe('array');
      expect(Array.isArray(reconstructedValue.value)).toBeTruthy();
      expect(reconstructedValue.value).toBeTruthy();

      const nodesFromItems = reconstructedValue.items.map(
        ({ node }) => node,
      );

      const jsonPathsFromItems = reconstructedValue.items.map(
        ({ jsonPath }) => jsonPath,
      );

      const expectedJsonPaths = reconstructedValue
        .value
        .map((...[, index]) => [String(index)]);

      expect(reconstructedValue.value).toMatchObject(
        getArrayValueFromNodeChildren(reconstructedValue),
      );
      expect(reconstructedValue.value).toMatchObject(
        getArrayValueFromItems(reconstructedValue),
      );
      expect(nodesFromItems).toMatchObject(
        reconstructedValue.node.children ?? [],
      );
      expect(jsonPathsFromItems).toMatchObject(expectedJsonPaths);
    });
  });

  it('should correctly reconstruct nested array', () => {
    const fileName = 'array-nested.json5';
    const [fileContent, jsonc] = loadJsonc('array-nested.json5');
    const reconstructedValue = reconstructJsonc(
      jsonc,
      fileName,
      () => fileContent,
      [],
    );

    if (!isReconstructedArrayJsoncValue(reconstructedValue)) {
      throw new Error('Expected reconstructed value to be a nested array!');
    }

    const nodesTypesFromItems = reconstructedValue
      .items
      .map(({ node }) => node.type);

    expect(uniq(nodesTypesFromItems)).toEqual(['array']);
    expect(reconstructedValue.value).toMatchObject(
      getArrayValueFromNodeChildren(reconstructedValue),
    );
    expect(reconstructedValue.value).toMatchObject(
      getArrayValueFromItems(reconstructedValue),
    );
    expect(reconstructedValue.value).toMatchSnapshot();
    expect(reconstructedValue.jsonEntries).toMatchSnapshot();
  });

  describe('Object value', () => {
    const fileName = 'object-complex.json5';
    const [fileContent, jsonc] = loadJsonc('object-complex.json5');
    const reconstructedValue = reconstructJsonc(
      jsonc,
      fileName,
      () => fileContent,
      [],
    );

    if (!isReconstructedObjectJsoncValue(reconstructedValue)) {
      throw new Error('Expected reconstructed value to be an object!');
    }

    expect(reconstructedValue.value).toMatchSnapshot();
    expect(reconstructedValue.jsonEntries).toMatchSnapshot();

    it('preserves special keys without changing the prototype', () => {
      const content = '{"__proto__":{"polluted":true},"constructor":"value"}';
      const node = parseTree(content);

      if (!node) {
        throw new Error('Expected a JSONC object node.');
      }

      const reconstructed = reconstructJsonc(
        node,
        'special-keys.jsonc',
        () => content,
        [],
      );

      if (!isReconstructedObjectJsoncValue(reconstructed)) {
        throw new Error('Expected a reconstructed object.');
      }

      expect(Object.hasOwn(reconstructed.value, '__proto__')).toBe(true);
      expect(Object.hasOwn(reconstructed.properties, '__proto__')).toBe(true);
      expect(Object.getPrototypeOf(reconstructed.value)).toBe(Object.prototype);
      expect(reconstructed.value['__proto__']).toEqual({ polluted: true });
      expect(reconstructed.value['constructor']).toBe('value');
    });
  });
});
