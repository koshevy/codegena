import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  isAnchorName,
  isHasAnchor,
  isHasDependentRequired,
  isHasDynamicAnchor,
  isHasDynamicRef,
  isHasNot,
  isNotSgnificantSchema,
  isSchema,
  isSchemaArray,
  isSchemaBoolean,
  isSchemaInteger,
  isSchemaNull,
  isSchemaNumber,
  isSchemaObject,
  isSchemaString,
} from './json-schema-type-guards';

const fixturesDir = join(__dirname, '__fixtures__', 'is-boolean-schema');

function loadFixture(name: string): unknown {
  return JSON.parse(
    readFileSync(join(fixturesDir, name), 'utf8'),
  );
}

describe('json-schema-type-guards', () => {
  describe('schema anchors', () => {
    it.each([
      ['item', true],
      ['item.name-2', true],
      ['#item', false],
      ['2item', false],
      ['', false],
      [42, false],
    ])('should classify anchor name %p as %p', (name, expected) => {
      expect(isAnchorName(name)).toBe(expected);
    });

    it.each([
      [{ $anchor: 'item' }, true, false],
      [{ $dynamicAnchor: 'item' }, false, true],
      [{ $dynamicAnchor: '#item' }, false, false],
      [{ $anchor: 42 }, false, false],
      [{ type: 'string' }, false, false],
      [null, false, false],
    ])('should classify %p as static %p and dynamic %p', (
      schema,
      staticExpected,
      dynamicExpected,
    ) => {
      expect(isHasAnchor(schema)).toBe(staticExpected);
      expect(isHasDynamicAnchor(schema)).toBe(dynamicExpected);
    });

    it('should recognize anchor-only schemas', () => {
      expect(isSchema({ $anchor: 'item' })).toBe(true);
      expect(isSchema({ $dynamicAnchor: 'item' })).toBe(true);
      expect(isSchema({ $dynamicAnchor: '#item' })).toBe(false);
    });
  });

  describe('isHasDynamicRef', () => {
    it.each([
      [{ $dynamicRef: '#item' }, true],
      [{ $dynamicRef: '#/$defs/Item' }, true],
      [{ $dynamicRef: 42 }, false],
      [{ $ref: '#item' }, false],
      [null, false],
    ])('should classify %p as %p', (schema, expected) => {
      expect(isHasDynamicRef(schema)).toBe(expected);
    });

    it('should recognize a dynamic reference as a schema', () => {
      expect(isSchema({ $dynamicRef: '#item' })).toBe(true);
    });
  });

  describe('isHasNot', () => {
    it.each([
      [{ not: { type: 'string' } }, true],
      [{ not: false }, true],
      [{ not: true }, true],
      [{ not: null }, false],
      [{ not: [] }, false],
      [{ not: 'string' }, false],
      [{ type: 'string' }, false],
      [null, false],
    ])('should classify %p as %p', (schema, expected) => {
      expect(isHasNot(schema)).toBe(expected);
    });
  });

  describe('isNotSgnificantSchema', () => {
    it.each([
      [{ type: 'object', required: ['id'] }, true],
      [{ type: 'object', not: { type: 'string' } }, false],
      [{ type: 'object', properties: {} }, false],
      [{ type: 'object', patternProperties: {} }, false],
      [{ type: 'object', propertyNames: {} }, false],
      [{ type: 'object', additionalProperties: false }, false],
      [{ type: 'object', unevaluatedProperties: false }, false],
      [{ type: 'string', minLength: 3 }, true],
      [{ type: 'string', pattern: '^A' }, false],
      [{ type: 'string', format: 'email' }, false],
      [{ type: 'array', minItems: 2 }, true],
      [{ type: 'array', items: {} }, false],
      [{ type: 'array', prefixItems: [] }, false],
      [{ type: 'array', additionalItems: false }, false],
      [{ type: 'array', unevaluatedItems: false }, false],
      [{ type: 'object', const: {} }, false],
      [{ type: 'string', enum: ['A'] }, false],
      [{ type: 'array', const: [] }, false],
      [{ type: 'number' }, false],
    ])('should classify schema %p as %p', (schema, expected) => {
      expect(isNotSgnificantSchema(schema)).toBe(expected);
    });
  });

  describe('isBooleanSchema', () => {
    describe('when schema explicitly declares boolean type', () => {
      it('should accept a plain type="boolean" schema', () => {
        expect(isSchemaBoolean(loadFixture('type-boolean.json'))).toBe(true);
      });

      it('should accept boolean schema with descriptive metadata', () => {
        expect(
          isSchemaBoolean(loadFixture('type-boolean-with-metadata.json')),
        ).toBe(true);
      });
    });

    describe('when schema narrows values to booleans via const', () => {
      it('should accept a const=true schema', () => {
        expect(isSchemaBoolean(loadFixture('const-true.json'))).toBe(true);
      });

      it('should accept a const=false schema', () => {
        expect(isSchemaBoolean(loadFixture('const-false.json'))).toBe(true);
      });
    });

    describe('when schema narrows values to booleans via enum', () => {
      it('should accept an enum limited to true and false', () => {
        expect(
          isSchemaBoolean(loadFixture('enum-boolean-values.json')),
        ).toBe(true);
      });

      it('should accept an enum with a single boolean member', () => {
        expect(
          isSchemaBoolean(loadFixture('enum-single-true.json')),
        ).toBe(true);
      });
    });

    describe('when boolean intent is expressed via combined variants', () => {
      it('should accept oneOf where every variant is a boolean const', () => {
        expect(
          isSchemaBoolean(loadFixture('oneOf-boolean-consts.json')),
        ).toBe(true);
      });

      it('should accept anyOf where every variant is boolean enum or const', () => {
        expect(
          isSchemaBoolean(loadFixture('anyOf-boolean-enum-and-const.json')),
        ).toBe(true);
      });

      it('should accept allOf with a single boolean type fragment', () => {
        expect(
          isSchemaBoolean(loadFixture('allOf-type-boolean-only.json')),
        ).toBe(true);
      });

      it('should accept allOf where each fragment is boolean on its own', () => {
        expect(
          isSchemaBoolean(loadFixture('allOf-boolean-enum-fragments.json')),
        ).toBe(true);
      });
    });

    describe('when schema is not dedicated to boolean', () => {
      it('should reject non-object values', () => {
        expect(isSchemaBoolean(null)).toBe(false);
        expect(isSchemaBoolean(undefined)).toBe(false);
        expect(isSchemaBoolean(true)).toBe(false);
        expect(isSchemaBoolean('boolean')).toBe(false);
      });

      it('should reject a string-typed schema', () => {
        expect(isSchemaBoolean(loadFixture('type-string.json'))).toBe(false);
      });

      it('should reject a string const schema', () => {
        expect(isSchemaBoolean(loadFixture('const-string.json'))).toBe(false);
      });

      it('should reject an enum with mixed JavaScript types', () => {
        expect(
          isSchemaBoolean(loadFixture('enum-mixed-types.json')),
        ).toBe(false);
      });

      it('should reject an empty object without boolean markers', () => {
        expect(isSchemaBoolean(loadFixture('empty-object.json'))).toBe(false);
      });

      it('should reject oneOf that mixes boolean with another type', () => {
        expect(
          isSchemaBoolean(loadFixture('oneOf-mixed-types.json')),
        ).toBe(false);
      });

      it('should accept anyOf when all parts are boolean but leaks markers', () => {
        expect(
          isSchemaBoolean(loadFixture('anyOf-non-boolean-default-only.json')),
        ).toBe(true);
      });

      it('should accept allOf when all parts are boolean but leaks markers', () => {
        expect(
          isSchemaBoolean(
            loadFixture('allOf-boolean-with-metadata-fragment.json'),
          ),
        ).toBe(true);
      });
    });
  });

  describe('the remaining concrete schema type guards', () => {
    const typeGuardCases = [
      {
        expectedValue: ['email'],
        guard: isSchemaArray,
        markerSchema: { minItems: 1 },
        name: 'array',
      },
      {
        expectedValue: 12,
        guard: isSchemaInteger,
        markerSchema: { multipleOf: 1 },
        name: 'integer',
      },
      {
        expectedValue: null,
        guard: isSchemaNull,
        markerSchema: { const: null },
        name: 'null',
      },
      {
        expectedValue: 12.5,
        guard: isSchemaNumber,
        markerSchema: { maximum: 99 },
        name: 'number',
      },
      {
        expectedValue: 'email@example.com',
        guard: isSchemaString,
        markerSchema: { format: 'email' },
        name: 'string',
      },
    ];

    it.each(typeGuardCases)(
      'should identify an explicit $name schema',
      ({ guard, name }) => {
        expect(guard({ type: name })).toBe(true);
      },
    );

    it.each(typeGuardCases)(
      'should infer a $name schema from literal values and examples',
      ({ expectedValue, guard }) => {
        expect(guard({ const: expectedValue })).toBe(true);
        expect(guard({ enum: [expectedValue] })).toBe(true);
        expect(guard({ default: expectedValue })).toBe(true);
        expect(guard({ example: expectedValue })).toBe(true);
        expect(guard({ examples: [expectedValue] })).toBe(true);
        expect(guard({ examples: [] })).toBe(false);
      },
    );

    it.each(typeGuardCases)(
      'should infer a $name schema from its type-specific keywords',
      ({ guard, markerSchema }) => {
        expect(guard(markerSchema)).toBe(true);
      },
    );

    it.each(typeGuardCases)(
      'should identify $name in a variative schema',
      ({ guard, name }) => {
        expect(guard({ type: ['boolean', name] })).toBe(true);
        expect(guard({ type: ['boolean'] })).toBe(false);
      },
    );

    it.each(typeGuardCases)(
      'should reject non-matching values for $name',
      ({ guard }) => {
        expect(guard({ const: { unsupported: true } })).toBe(false);
        expect(guard({ enum: [] })).toBe(false);
      },
    );
  });

  describe('isSchemaObject', () => {
    it('should accept an explicit object schema and object keywords', () => {
      expect(isSchemaObject({ type: 'object' })).toBe(true);
      expect(isSchemaObject({ properties: {} })).toBe(true);
      expect(isSchemaObject({ required: ['type'] })).toBe(true);
      expect(isSchemaObject({ dependentRequired: { cardToken: ['billingAddress'] } }))
        .toBe(true);
    });

    it('should reject a non-object schema', () => {
      expect(isSchemaObject({ type: 'string' })).toBe(false);
      expect(isSchemaObject({ type: 'string', required: ['type'] })).toBe(false);
      expect(isSchemaObject({ type: 'string', dependentRequired: {} })).toBe(false);
      expect(isSchemaObject({ required: ['type', 1] })).toBe(false);
    });
  });

  describe('isHasDependentRequired', () => {
    it('should accept a record of string arrays, including empty dependencies', () => {
      expect(isHasDependentRequired({
        dependentRequired: { cardToken: ['billingAddress'], account: [] },
      })).toBe(true);
      expect(isHasDependentRequired({ dependentRequired: {} })).toBe(true);
    });

    it('should reject a missing or malformed dependentRequired value', () => {
      expect(isHasDependentRequired({ type: 'object' })).toBe(false);
      expect(isHasDependentRequired(null)).toBe(false);
      expect(isHasDependentRequired({ dependentRequired: null })).toBe(false);
      expect(isHasDependentRequired({ dependentRequired: [] })).toBe(false);
      expect(isHasDependentRequired({
        dependentRequired: { cardToken: 'billingAddress' },
      })).toBe(false);
      expect(isHasDependentRequired({ dependentRequired: { cardToken: [42] } }))
        .toBe(false);
    });
  });

  it('should recognize schemas for every declared concrete schema type', () => {
    expect(isSchema({ type: 'array' })).toBe(true);
    expect(isSchema({ type: 'boolean' })).toBe(true);
    expect(isSchema({ type: 'integer' })).toBe(true);
    expect(isSchema({ type: 'null' })).toBe(true);
    expect(isSchema({ type: 'number' })).toBe(true);
    expect(isSchema({ type: 'object' })).toBe(true);
    expect(isSchema({ type: 'string' })).toBe(true);
  });
});
