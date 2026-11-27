import {
  Schema,
  SchemaArray,
  SchemaBoolean,
  SchemaInteger,
  SchemaNull,
  SchemaNumber,
  SchemaObject,
  SchemaStrict,
  SchemaString,
} from './json-schema';

describe('JSON Schema definitions', () => {
  describe('SchemaArray use cases', () => {
    it('should pass schema with type="array"', () => {
      const schema: SchemaArray = {
        type: 'array',
      };

      expect(schema.type).toEqual('array');
    });

    it('should pass examples with arrays of strings', () => {
      const schema: SchemaArray<string> = {
        examples: [[
          'apple',
          'banana',
          'grapefruit',
        ]],
      };

      expect(schema.examples).toBeTruthy();
    });

    it('should pass default value with array of strings', () => {
      const schema: SchemaArray<string> = {
        default: [
          'apple',
          'banana',
          'grapefruit',
        ],
      };

      expect(schema.default).toBeTruthy();
    });

    it('should pass items with nested array schema', () => {
      const schema: SchemaArray<never[], SchemaArray> = {
        items: {
          type: 'array',
          minItems: 0,
          maxItems: 1,
          examples: [[]],
        },
      };

      expect(schema.items).toBeTruthy();
    });

    it('should pass items with tuple', () => {
      const schema: SchemaArray<string[], SchemaArray> = {
        items: [
          {
            type: 'array',
            minItems: 1,
            maxItems: 10,
            examples: [['apple', 'banana', 'orange']],
          },
          {
            type: 'array',
            minItems: 1,
            maxItems: 10,
            examples: [['apple', 'banana', 'orange']],
          },
        ],
      };

      expect(schema.items).toBeTruthy();
    });

    it('should pass `allOf` with different parts of rules', () => {
      const schema: SchemaArray<string> = {
        allOf: [
          { minItems: 0, items: { type: 'string' } },
          { maxItems: 1 },
        ],
      };

      expect(schema.allOf).toBeTruthy();
    });

    it('should pass typed enum and const in different parts of `oneOf`', () => {
      const schema: SchemaArray<string> = {
        oneOf: [
          { minItems: 0, items: { type: 'string' } },
          { maxItems: 1 },
          {
            enum: [
              ['tuple', 'value'],
              ['another', 'tuple'],
            ],
          },
          {
            const: ['const', 'tuple', 'value'],
          },
        ],
      };

      expect(schema.oneOf).toBeTruthy();
    });

    it('should pass `allOf` with different parts of rules and nested `allOf`', () => {
      const schema: SchemaArray<string> = {
        allOf: [
          { minItems: 0, items: [] },
          { maxItems: 1 },
          {
            // second level of allOf looses certain type of scheme knowlege
            allOf: [
              {
                enum: [
                  ['tuple', 'value'],
                  ['another', 'tuple'],
                ],
              },
              {
                examples: [[]],
              },
            ],
          },
        ],
      };

      expect(schema.allOf).toBeTruthy();
    });

    it('should pass schema with full-filled array-specified properties', () => {
      const schema: SchemaArray<string> = {
        additionalItems: false,
        items: {
          type: 'string',
          minLength: 1,
        },
        minItems: 0,
        maxItems: 1,
        type: 'array',
        uniqueItems: true,
      };

      expect([
        schema.additionalItems,
        schema.items,
        schema.minItems,
        schema.maxItems,
        schema.type,
        schema.uniqueItems,
      ]).not.toContain(undefined);
    });
  });

  describe('SchemaBoolean use cases', () => {
    it('should pass schema with type="boolean"', () => {
      const schema: SchemaBoolean = {
        type: 'boolean',
      };

      expect(schema.type).toEqual('boolean');
    });

    it('should pass examples', () => {
      const schema: SchemaBoolean = {
        examples: [true],
      };

      expect(schema.examples).toBeTruthy();
    });

    it('should pass default value', () => {
      const schema: SchemaBoolean = {
        default: false,
      };

      expect(schema.default).toBe(false);
    });

    it('should pass typed const value', () => {
      const schema: SchemaBoolean = {
        const: true,
      };

      expect(schema.const).toBeTruthy();
    });

    it('should pass `oneOf` with different parts of rules', () => {
      const schema: SchemaBoolean = {
        oneOf: [
          {
            enum: [true, false],
          },
          {
            const: false,
          },
        ],
      };

      expect(schema.oneOf).toBeTruthy();
    });
  });

  describe('SchemaInteger use cases', () => {
    it('should pass schema with type="integer"', () => {
      const schema: SchemaInteger = {
        type: 'integer',
      };

      expect(schema.type).toEqual('integer');
    });

    it('should pass schema with min and max', () => {
      const schema: SchemaInteger = {
        minimum: 0,
        maximum: 1,
      };

      expect([
        schema.minimum,
        schema.maximum,
      ]).not.toContain(undefined);
    });

    it(
      'should pass schema with exclusiveMinimum and exclusiveMaximum',
      () => {
        const schema: SchemaInteger = {
          exclusiveMinimum: 0,
          exclusiveMaximum: 1,
        };

        expect([
          schema.exclusiveMinimum,
          schema.exclusiveMaximum,
        ]).not.toContain(undefined);
      },
    );

    it('should pass schema with multipleOf', () => {
      const schema: SchemaInteger = {
        multipleOf: 10,
      };

      expect(schema.multipleOf).toBeTruthy();
    });

    it('should pass schema with `oneOf`', () => {
      const schema: SchemaInteger = {
        oneOf: [
          {
            exclusiveMinimum: 0,
            exclusiveMaximum: 10,
          },
          {
            minimum: 1,
            maximum: 9,
          },
        ],
      };

      expect([
        schema.oneOf,
        schema.oneOf?.[0],
        schema.oneOf?.[1],
      ]).not.toContain(undefined);
    });
  });

  describe('SchemaNull use cases', () => {
    it('should pass schema with type="null"', () => {
      const schema: SchemaNull = {
        type: 'null',
      };

      expect(schema.type).toEqual('null');
    });

    it('should pass typed examples', () => {
      const schema: SchemaNull = {
        type: 'null',
        examples: [null],
      };

      expect([schema.type, schema.examples]).toEqual(['null', [null]]);
    });

    it('should pass typed default', () => {
      const schema: SchemaNull = {
        type: 'null',
        default: null,
      };

      expect([schema.type, schema.default]).toEqual(['null', null]);
    });

    it('should pass `oneOf` with different parts of rules', () => {
      const schema: SchemaNull = {
        type: 'null',
        oneOf: [
          { const: null },
          { default: null },
          { examples: [null] },
        ],
      };

      expect([schema.type, schema.oneOf]).toEqual([
        'null',
        [
          { const: null },
          { default: null },
          { examples: [null] },
        ],
      ]);
    });

    it('should pass schema with full-filled array-specified properties', () => {
      const schema: SchemaNull = {
        default: null,
        examples: [null],
        type: 'null',
      };

      expect([
        schema.default,
        schema.examples,
        schema.type,
      ]).not.toContain(undefined);
    });
  });

  describe('SchemaNumber use cases', () => {
    it('should pass schema with type="number"', () => {
      const schema: SchemaNumber = {
        type: 'number',
      };

      expect(schema.type).toEqual('number');
    });

    it('should pass schema with min and max', () => {
      const schema: SchemaNumber = {
        minimum: 0,
        maximum: 1,
      };

      expect([
        schema.minimum,
        schema.maximum,
      ]).not.toContain(undefined);
    });

    it(
      'should pass schema with exclusiveMinimum and exclusiveMaximum',
      () => {
        const schema: SchemaNumber = {
          exclusiveMinimum: 0,
          exclusiveMaximum: 1,
        };

        expect([
          schema.exclusiveMinimum,
          schema.exclusiveMaximum,
        ]).not.toContain(undefined);
      },
    );

    it('should pass schema with multipleOf', () => {
      const schema: SchemaNumber = {
        multipleOf: 10,
      };

      expect(schema.multipleOf).toBeTruthy();
    });

    it('should pass schema with `oneOf`', () => {
      const schema: SchemaNumber = {
        oneOf: [
          {
            exclusiveMinimum: 0,
            exclusiveMaximum: 10,
          },
          {
            minimum: 1,
            maximum: 9,
          },
        ],
      };

      expect([
        schema.oneOf,
        schema.oneOf?.[0],
        schema.oneOf?.[1],
      ]).not.toContain(undefined);
    });
  });

  describe('SchemaString use cases', () => {
    it('should pass schema with `oneOf`', () => {
      const schema: SchemaString = {
        oneOf: [
          {
            pattern: '.*',
          },
          {
            minLength: 2,
            maxLength: 32,
          },
          {
            contentMediaType: 'application/json',
            contentEncoding: 'deflate',
          },
          {
            format: 'date-time',
          },
        ],
      };

      expect(schema.oneOf).toBeTruthy();
    });
  });

  describe('SchemaObject use cases', () => {
    it('should pass schema with type="object"', () => {
      const schema: SchemaObject = {
        type: 'object',
      };

      expect(schema.type).toEqual('object');
    });

    it('should pass schema with properties', () => {
      const schema: SchemaObject<'fruit' | 'weight'> = {
        properties: {
          fruit: {
            type: 'string',
            description: 'Fruit on scale',
          },
          weight: {
            type: 'number',
            description: 'Weight of fruit',
          },
        },
      };

      expect([
        schema.properties?.fruit,
        schema.properties?.weight,
      ]).not.toContain(undefined);
    });

    it('should pass schema with additional properties', () => {
      const schema: SchemaObject = {
        additionalProperties: {
          type: 'string',
        },
      };

      expect(schema.additionalProperties).toBeTruthy();
    });

    it('should pass schema with min and max', () => {
      const schema: SchemaObject = {
        minProperties: 1,
        maxProperties: 10,
      };

      expect([
        schema.minProperties,
        schema.maxProperties,
      ]).not.toContain(undefined);
    });

    it('should pass schema with property names', () => {
      const schema: SchemaObject = {
        propertyNames: {
          pattern: '(banana|ananas)',
        },
      };

      expect(
        schema.propertyNames?.pattern,
      ).toBeTruthy();
    });

    it('should pass `allOf` with different parts of rules', () => {
      const schema: SchemaObject<'fruit' | 'weight'> = {
        allOf: [
          {
            properties: {
              fruit: {
                type: 'string',
                description: 'Fruit on scale',
              },
              weight: {
                type: 'number',
                description: 'Weight of fruit',
              },
            },
          },
          {
            additionalProperties: {
              type: 'string',
            },
          },
          {
            propertyNames: {
              pattern: '^(color|volume)$',
            },
          },
          {
            required: [
              'fruit',
              'weight',
            ],
          },
          {
            dependentRequired: {
              fruit: ['weight'],
              weight: ['fruit'],
            },
          },
          {
            minProperties: 1,
            maxProperties: 10,
          },
        ],
      };

      expect(schema.allOf).toBeTruthy();
    });

    it('should pass schema with dependentRequired', () => {
      const schema: SchemaObject<'fruit' | 'weight'> = {
        dependentRequired: {
          fruit: ['weight'],
          weight: ['fruit'],
        },
      };

      expect([
        schema.dependentRequired?.['weight'],
        schema.dependentRequired?.['fruit'],
      ]).toEqual([['fruit'], ['weight']]);
    });
  });

  describe('SchemaStrict definition use cases', () => {
    it('anyOf with string-specified properties', () => {
      const schema: SchemaStrict = {
        anyOf: [
          {
            pattern: String.raw`^CODE:\d{8}$`,
          },
          {
            pattern: String.raw`^\w+$`,
            minLength: 3,
          },
        ],
      };

      expect([
        schema?.anyOf?.[0].pattern,
        schema?.anyOf?.[1].minLength,
        schema?.anyOf?.[1].minLength,
      ]).not.toContain(undefined);
    });

    it('anyOf with numeric-specified properties', () => {
      const schema: SchemaStrict = {
        anyOf: [
          {
            minimum: 1,
            maximum: 999,
          },
          {
            exclusiveMinimum: 0,
            exclusiveMaximum: 1000,
          },
        ],
      };

      expect(schema.anyOf).toBeTruthy();
    });

    it('oneOf with boolean-specified properties', () => {
      const schema: SchemaStrict = {
        oneOf: [
          {
            const: true,
          },
          {
            default: false,
          },
        ],
      };

      expect(schema.oneOf).toBeTruthy();
    });
  });

  describe('Schema use cases', () => {
    it('reads combined subschemas through literal keys', () => {
      const schema: Schema = {
        oneOf: [
          { type: 'string' },
          { type: 'integer' },
          { type: 'boolean' },
        ],
      };

      const allSubschemas = [
        ...(schema.anyOf ?? []),
        ...(schema.oneOf ?? []),
        ...(schema.allOf ?? []),
      ];

      expect(allSubschemas).toEqual([
        { type: 'string' },
        { type: 'integer' },
        { type: 'boolean' },
      ]);
    });

    it('reads combined subschemas through typed dynamic keys', () => {
      const schema: Schema = {
        oneOf: [
          { type: 'string' },
          { type: 'integer' },
          { type: 'boolean' },
        ],
      };

      const keys = ['anyOf', 'oneOf', 'allOf'] as const;
      const allSubschemas = keys.flatMap((key) => schema[key] ?? []);

      expect(allSubschemas).toEqual([
        { type: 'string' },
        { type: 'integer' },
        { type: 'boolean' },
      ]);
    });
  });
});
