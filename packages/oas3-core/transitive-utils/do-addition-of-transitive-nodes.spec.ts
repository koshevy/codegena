import {
  doAdditionOfTransitiveNodes,
} from './do-addition-of-transitive-nodes';
import {
  createArray,
  createBooleanScalar,
  createStringScalar,
  createStructure,
  createUnion,
  createUnknown,
} from './testing-utils';
import type {
  ArrayTransitiveNode,
  StructureTransitiveNode,
} from '../transitive-node';

describe('doAdditionOfTransitiveNodes', () => {
  it('should narrow range values using deep equality', () => {
    const first = {
      ...createUnknown({ enum: [{ state: 'draft' }] }),
      rangeOfValues: [{ state: 'draft' }],
    };

    const second = {
      ...createUnknown({
        enum: [
          { state: 'draft' },
          { state: 'published' },
        ],
      }),
      rangeOfValues: [
        { state: 'draft' },
        { state: 'published' },
      ],
    };

    expect(doAdditionOfTransitiveNodes(first, second)).toMatchObject({
      rangeOfValues: [{ state: 'draft' }],
      type: 'unknown',
    });
  });

  it('should combine structure properties and narrow their range values', () => {
    const first = createStructure({
      onlyFirst: createStringScalar({ type: 'string' }),
      status: {
        ...createUnknown({ enum: ['draft'] }),
        rangeOfValues: ['draft'],
      },
    });

    const second = createStructure({
      onlySecond: createBooleanScalar({ type: 'boolean' }),
      status: {
        ...createUnknown({ enum: ['draft', 'published'] }),
        rangeOfValues: ['draft', 'published'],
      },
    });

    const result = doAdditionOfTransitiveNodes(first, second);

    if (result.type !== 'structure') {
      throw new Error('Expected a structure transitive node.');
    }

    expect(result.properties).toMatchObject({
      onlyFirst: { scalarType: 'string', type: 'scalar' },
      onlySecond: { scalarType: 'boolean', type: 'scalar' },
      status: {
        rangeOfValues: ['draft'],
        type: 'unknown',
      },
    });
  });

  it('should keep distinct structure property patterns', () => {
    const coreValue = createStructure({
      name: createStringScalar({ type: 'string' }),
    });

    const extendedValue = createStructure({
      corePropertyRef: createStringScalar({ type: 'string' }),
    });

    const first: StructureTransitiveNode = {
      ...createStructure({}),
      propertyPatterns: [[/^CORE_PROP_[A-Z0-9_]+$/, coreValue]],
    };

    const second: StructureTransitiveNode = {
      ...createStructure({}),
      propertyPatterns: [[/^EXTENDED_PROP_[A-Z0-9_]+$/, extendedValue]],
    };

    const result = doAdditionOfTransitiveNodes(first, second);

    if (result.type !== 'structure') {
      throw new Error('Expected a structure transitive node.');
    }

    expect(result.propertyPatterns?.map(([pattern]) => pattern.source)).toEqual([
      '^CORE_PROP_[A-Z0-9_]+$',
      '^EXTENDED_PROP_[A-Z0-9_]+$',
    ]);
    expect(result.nestedTransitiveNodes).toEqual([coreValue, extendedValue]);
  });

  it('should merge values of matching structure property patterns', () => {
    const first: StructureTransitiveNode = {
      ...createStructure({}),
      propertyPatterns: [[
        /^ITEM_[A-Z]+$/,
        createStructure({ name: createStringScalar({ type: 'string' }) }),
      ]],
    };

    const second: StructureTransitiveNode = {
      ...createStructure({}),
      propertyPatterns: [[
        /^ITEM_[A-Z]+$/,
        createStructure({ active: createBooleanScalar({ type: 'boolean' }) }),
      ]],
    };

    const result = doAdditionOfTransitiveNodes(first, second);

    if (result.type !== 'structure') {
      throw new Error('Expected a structure transitive node.');
    }

    expect(result.propertyPatterns).toMatchObject([[
      /^ITEM_[A-Z]+$/,
      {
        properties: {
          active: { scalarType: 'boolean' },
          name: { scalarType: 'string' },
        },
        type: 'structure',
      },
    ]]);
  });

  it('should preserve and combine property name patterns', () => {
    const first = {
      ...createStructure({}),
      defaultKeyPattern: /^CORE_[A-Z]+$/,
    };

    const second = {
      ...createStructure({}),
      defaultKeyPattern: /^CORE_PROP_[A-Z]+$/,
    };

    const third = {
      ...createStructure({}),
      defaultKeyPattern: /^CORE_[A-Z]+$/,
    };

    const secondOnly = doAdditionOfTransitiveNodes(
      createStructure({}),
      second,
    );
    const firstPair = doAdditionOfTransitiveNodes(first, second);
    const result = doAdditionOfTransitiveNodes(firstPair, third);

    if (result.type !== 'structure'
      || secondOnly.type !== 'structure'
    ) {
      throw new Error('Expected structure transitive nodes.');
    }

    expect(secondOnly.defaultKeyPattern).toEqual(second.defaultKeyPattern);
    expect(result.defaultKeyPattern).toEqual([
      /^CORE_[A-Z]+$/,
      /^CORE_PROP_[A-Z]+$/,
    ]);
  });

  it('should combine additional property values across structure parts', () => {
    const first: StructureTransitiveNode = {
      ...createStructure({}),
      additionalProperties: createStructure({
        isActivated: createBooleanScalar({ type: 'boolean' }),
      }),
    };

    const second: StructureTransitiveNode = {
      ...createStructure({}),
      additionalProperties: createStructure({
        description: createStringScalar({ type: 'string' }),
        isActivated: {
          ...createUnknown({ required: ['isActivated'] }),
          isRequired: true,
        },
      }),
    };

    const pattern: StructureTransitiveNode = {
      ...createStructure({}),
      propertyPatterns: [[/^CORE_/, createUnknown({})]],
    };
    const firstPair = doAdditionOfTransitiveNodes(first, second);
    const result = doAdditionOfTransitiveNodes(firstPair, pattern);

    if (result.type !== 'structure'
      || !result.additionalProperties
    ) {
      throw new Error('Expected additional property values.');
    }

    expect(result.additionalProperties).toMatchObject({
      properties: {
        description: { scalarType: 'string' },
        isActivated: { isRequired: true, scalarType: 'boolean' },
      },
      type: 'structure',
    });
    expect(result.propertyPatterns).toEqual(pattern.propertyPatterns);
  });

  it('should preserve an explicit additionalProperties false constraint', () => {
    const open: StructureTransitiveNode = {
      ...createStructure({}),
      additionalProperties: createStructure({
        value: createStringScalar({ type: 'string' }),
      }),
    };

    const closed: StructureTransitiveNode = {
      ...createStructure({}),
      additionalProperties: false,
    };

    expect(doAdditionOfTransitiveNodes(open, closed)).toMatchObject({
      additionalProperties: false,
      type: 'structure',
    });
  });

  it('should inherit requiredness while narrowing a shared property', () => {
    const first = createStructure({
      status: {
        ...createUnknown({ enum: ['draft', 'published'] }),
        isRequired: false,
        rangeOfValues: ['draft', 'published'],
      },
    });

    const second = createStructure({
      status: {
        ...createUnknown({ const: 'draft' }),
        isRequired: true,
        rangeOfValues: ['draft'],
      },
    });

    const result = doAdditionOfTransitiveNodes(first, second);

    if (result.type !== 'structure') {
      throw new Error('Expected a structure transitive node.');
    }

    expect(result.properties?.['status']).toMatchObject({
      isRequired: true,
      rangeOfValues: ['draft'],
      type: 'unknown',
    });
  });

  it('should combine distinct property values across multiple structures', () => {
    const required = createStructure({
      type: { ...createUnknown({}), isRequired: true },
      unknownProperty: { ...createUnknown({}), isRequired: true },
    });

    const inherited = createStructure({
      type: {
        ...createUnknown({ enum: ['inherited'] }),
        rangeOfValues: ['inherited'],
      },
    });

    const namedVariants = createStructure({
      type: {
        ...createUnknown({ enum: ['hasOnlyProperties', 'emptyObject'] }),
        rangeOfValues: ['hasOnlyProperties', 'emptyObject'],
      },
    });

    const firstPair = doAdditionOfTransitiveNodes(required, inherited);
    const result = doAdditionOfTransitiveNodes(firstPair, namedVariants);

    if (result.type !== 'structure') {
      throw new Error('Expected a structure transitive node.');
    }

    expect(result.properties?.['type']).toMatchObject({
      combinedValueTuple: [
        'inherited',
        'hasOnlyProperties',
        'emptyObject',
      ],
      isRequired: true,
    });
    expect(result.properties?.['type']?.isNever).toBeFalsy();
    expect(result.properties?.['type']?.rangeOfValues).toBeUndefined();
    expect(result.properties?.['unknownProperty']?.isRequired).toBe(true);
  });

  it('should append distinct values without duplicating combined values', () => {
    const first = createStructure({
      type: {
        ...createUnknown({ enum: ['inherited'] }),
        rangeOfValues: ['inherited'],
      },
    });

    const second = createStructure({
      type: {
        ...createUnknown({ enum: ['hasOnlyProperties'] }),
        rangeOfValues: ['hasOnlyProperties'],
      },
    });

    const third = createStructure({
      type: {
        ...createUnknown({ enum: ['hasOnlyProperties', 'emptyObject'] }),
        rangeOfValues: ['hasOnlyProperties', 'emptyObject'],
      },
    });

    const firstPair = doAdditionOfTransitiveNodes(first, second);
    const result = doAdditionOfTransitiveNodes(firstPair, third);

    if (result.type !== 'structure') {
      throw new Error('Expected a structure transitive node.');
    }

    expect(result.properties?.['type']?.combinedValueTuple).toEqual([
      'inherited',
      'hasOnlyProperties',
      'emptyObject',
    ]);
  });

  it('should combine referenced properties into a union', () => {
    const pattern = createStructure({
      id: createStringScalar({ type: 'string' }),
    });

    const properties = createStructure({
      content: createUnknown({}),
    });

    const firstRef = {
      mixin: null,
      ref: pattern,
      source: createUnknown({ $ref: '#/$defs/Pattern' }).source,
      type: 'reference' as const,
    };

    const secondRef = {
      mixin: null,
      ref: properties,
      source: createUnknown({ $ref: '#/$defs/Properties' }).source,
      type: 'reference' as const,
    };
    const first = createStructure({ payload: firstRef });
    const second = createStructure({ payload: secondRef });
    const result = doAdditionOfTransitiveNodes(first, second);

    if (result.type !== 'structure') {
      throw new Error('Expected a structure transitive node.');
    }

    expect(result.properties?.['payload']).toMatchObject({
      isInline: true,
      referredTransitiveNodes: [firstRef, secondRef],
      type: 'union',
    });
  });

  it('should merge same-type properties and union different types', () => {
    const first = createStructure({
      payload: createStructure({
        id: createStringScalar({ type: 'string' }),
      }),
      value: createStringScalar({ type: 'string' }),
    });

    const second = createStructure({
      payload: createStructure({
        enabled: createBooleanScalar({ type: 'boolean' }),
      }),
      value: createBooleanScalar({ type: 'boolean' }),
    });

    const result = doAdditionOfTransitiveNodes(first, second);

    if (result.type !== 'structure') {
      throw new Error('Expected a structure transitive node.');
    }

    expect(result.properties?.['payload']).toMatchObject({
      properties: {
        enabled: { scalarType: 'boolean' },
        id: { scalarType: 'string' },
      },
      type: 'structure',
    });
    expect(result.properties?.['value']).toMatchObject({
      referredTransitiveNodes: [
        { scalarType: 'string' },
        { scalarType: 'boolean' },
      ],
      type: 'union',
    });
  });

  it('should combine enum and array-valued const items', () => {
    const firstItem = {
      ...createUnknown({
        enum: ['Application', 'Component', 'Extension'],
      }),
      rangeOfValues: ['Application', 'Component', 'Extension'],
    };

    const secondItem: ArrayTransitiveNode = {
      isFallbackType: true,
      rangeOfValues: [['Legacy']],
      source: createUnknown({ const: ['Legacy'] }).source,
      type: 'array',
    };
    const first = createStructure({ tag: createArray(firstItem) });
    const second = createStructure({ tag: createArray(secondItem) });
    const result = doAdditionOfTransitiveNodes(first, second);

    if (result.type !== 'structure') {
      throw new Error('Expected a structure transitive node.');
    }

    expect(result.properties?.['tag']).toMatchObject({
      itemsInCommon: {
        rangeOfValues: [
          'Application',
          'Component',
          'Extension',
          'Legacy',
        ],
      },
      type: 'array',
    });
  });

  it('should union different common item types in matching arrays', () => {
    const first = createArray(createStringScalar({ type: 'string' }));
    const second = createArray(createBooleanScalar({ type: 'boolean' }));

    expect(doAdditionOfTransitiveNodes(first, second)).toMatchObject({
      itemsInCommon: {
        referredTransitiveNodes: [
          { scalarType: 'string' },
          { scalarType: 'boolean' },
        ],
        type: 'union',
      },
      type: 'array',
    });
  });

  it('should merge object array items and inherit required properties', () => {
    const first = createArray(createStructure({
      itemTitle: createStringScalar({ type: 'string' }),
      itemDescription: createStringScalar({ type: 'string' }),
    }));

    const second = createArray(createStructure({
      itemTitle: {
        ...createUnknown({ required: ['itemTitle'] }),
        isRequired: true,
      },
    }));
    const result = doAdditionOfTransitiveNodes(first, second);

    expect(result).toMatchObject({
      itemsInCommon: {
        properties: {
          itemDescription: {
            scalarType: 'string',
          },
          itemTitle: {
            isRequired: true,
            scalarType: 'string',
          },
        },
        type: 'structure',
      },
      type: 'array',
    });

    if (result.type !== 'array'
      || result.itemsInCommon?.type !== 'structure'
    ) {
      throw new Error('Expected an array of structure items.');
    }

    expect(result.itemsInCommon.properties?.['itemDescription']?.isRequired)
      .toBeFalsy();
  });

  it('should merge nested arrays with object items', () => {
    const firstItem = createStructure({
      label: createStringScalar({ type: 'string' }),
    });

    const secondItem = createStructure({
      label: {
        ...createUnknown({ required: ['label'] }),
        isRequired: true,
      },
    });
    const first = createArray(createArray(firstItem));
    const second = createArray(createArray(secondItem));
    const result = doAdditionOfTransitiveNodes(first, second);

    expect(result).toMatchObject({
      itemsInCommon: {
        itemsInCommon: {
          properties: {
            label: { isRequired: true, scalarType: 'string' },
          },
          type: 'structure',
        },
        type: 'array',
      },
      type: 'array',
    });
  });

  it('should merge array bounds, tuple prefixes, and common items', () => {
    const lengthOnly: ArrayTransitiveNode = {
      ...createArray(createUnknown({})),
      isFallbackType: true,
      itemsInCommon: undefined,
      minLength: 2,
      nestedTransitiveNodes: [],
    };

    const commonItems = createArray(createStructure({
      id: createStringScalar({ type: 'string' }),
    }));

    const requiredItems = createArray(createStructure({
      id: {
        ...createUnknown({ required: ['id'] }),
        isRequired: true,
      },
    }));
    const booleanItem = createBooleanScalar({ type: 'boolean' });
    const prefixItems: ArrayTransitiveNode = {
      ...createArray(createUnknown({})),
      itemsInCommon: undefined,
      itemsTuple: [booleanItem, booleanItem],
      nestedTransitiveNodes: [booleanItem, booleanItem],
    };
    const firstPair = doAdditionOfTransitiveNodes(lengthOnly, commonItems);
    const secondPair = doAdditionOfTransitiveNodes(firstPair, requiredItems);
    const result = doAdditionOfTransitiveNodes(secondPair, prefixItems);

    if (result.type !== 'array') {
      throw new Error('Expected an array transitive node.');
    }

    expect(result.minLength).toBe(2);
    expect(result.itemsTuple).toEqual([booleanItem, booleanItem]);
    expect(result.itemsInCommon).toBeUndefined();
    expect(result.restItemsInTuple).toMatchObject({
      properties: {
        id: { isRequired: true, scalarType: 'string' },
      },
      type: 'structure',
    });
    expect(result.nestedTransitiveNodes).toEqual([
      booleanItem,
      booleanItem,
      result.restItemsInTuple,
    ]);
  });

  it('should retain the strongest array bounds and extend short tuples', () => {
    const stringItem = createStringScalar({ type: 'string' });
    const first: ArrayTransitiveNode = {
      ...createArray(stringItem),
      maxLength: 5,
      minLength: 3,
    };

    const second: ArrayTransitiveNode = {
      ...createArray(stringItem),
      itemsInCommon: undefined,
      itemsTuple: [stringItem],
      maxLength: 4,
      minLength: 2,
      nestedTransitiveNodes: [stringItem],
    };
    const result = doAdditionOfTransitiveNodes(first, second);

    if (result.type !== 'array') {
      throw new Error('Expected an array transitive node.');
    }

    expect(result.minLength).toBe(3);
    expect(result.maxLength).toBe(4);
    expect(result.itemsTuple).toEqual([stringItem, stringItem, stringItem]);
    expect(result.restItemsInTuple).toEqual(stringItem);
    expect(result.isNever).toBeFalsy();
  });

  it('should replace minimum-length placeholders with later array items', () => {
    const booleanItem = createBooleanScalar({ type: 'boolean' });
    const stringItem = createStringScalar({ type: 'string' });
    const prefixItems: ArrayTransitiveNode = {
      ...createArray(createUnknown({})),
      itemsInCommon: undefined,
      itemsTuple: [booleanItem],
      nestedTransitiveNodes: [booleanItem],
    };

    const lengthOnly: ArrayTransitiveNode = {
      ...createArray(createUnknown({})),
      isFallbackType: true,
      itemsInCommon: undefined,
      minLength: 2,
      nestedTransitiveNodes: [],
    };

    const padded = doAdditionOfTransitiveNodes(prefixItems, lengthOnly);

    const result = doAdditionOfTransitiveNodes(
      padded,
      createArray(stringItem),
    );

    expect(result).toMatchObject({
      itemsTuple: [booleanItem, stringItem],
      minLength: 2,
      restItemsInTuple: stringItem,
      type: 'array',
    });
  });

  it('should reject incompatible array length bounds', () => {
    const stringItem = createStringScalar({ type: 'string' });
    const first: ArrayTransitiveNode = {
      ...createArray(stringItem),
      minLength: 5,
    };

    const second: ArrayTransitiveNode = {
      ...createArray(stringItem),
      maxLength: 3,
    };

    expect(doAdditionOfTransitiveNodes(first, second)).toMatchObject({
      isNever: true,
      maxLength: 3,
      minLength: 5,
      type: 'array',
    });
  });

  it('should flatten two property unions and append another type', () => {
    const first = createStructure({
      payload: createUnion([
        createStringScalar({ type: 'string' }),
        createBooleanScalar({ type: 'boolean' }),
      ]),
    });

    const second = createStructure({
      payload: createUnion([createUnknown({})]),
    });

    const third = createStructure({
      payload: createStructure({ id: createUnknown({}) }),
    });

    const firstPair = doAdditionOfTransitiveNodes(first, second);
    const result = doAdditionOfTransitiveNodes(firstPair, third);

    if (result.type !== 'structure') {
      throw new Error('Expected a structure transitive node.');
    }

    expect(result.properties?.['payload']).toMatchObject({
      referredTransitiveNodes: [
        { scalarType: 'string' },
        { scalarType: 'boolean' },
        { type: 'unknown' },
        { type: 'structure' },
      ],
      type: 'union',
    });
  });

  it.each([false, true])(
    'should prefer a concrete property over unknown (reversed: %p)',
    (reversed) => {
      const fallback = createStructure({
        value: {
          ...createUnknown({}),
          isRequired: true,
        },
      });

      const concrete = createStructure({
        value: {
          ...createStringScalar({ type: 'string' }),
          isRequired: false,
        },
      });

      const result = reversed
        ? doAdditionOfTransitiveNodes(concrete, fallback)
        : doAdditionOfTransitiveNodes(fallback, concrete);

      if (result.type !== 'structure') {
        throw new Error('Expected a structure transitive node.');
      }

      expect(result.properties?.['value']).toMatchObject({
        isRequired: true,
        scalarType: 'string',
        type: 'scalar',
      });
    },
  );

  it.each([false, true])(
    'should prefer a non-fallback property of the same type (reversed: %p)',
    (reversed) => {
      const fallback = createStructure({
        value: {
          ...createStringScalar({ type: 'string' }),
          isFallbackType: true,
          isRequired: true,
          rangeOfValues: ['temporary'],
          stringOptions: { pattern: /^temporary$/ },
        },
      });

      const concrete = createStructure({
        value: {
          ...createStringScalar({ type: 'string' }),
          isRequired: false,
          rangeOfValues: ['verified'],
          stringOptions: { pattern: /^verified$/ },
        },
      });

      const result = reversed
        ? doAdditionOfTransitiveNodes(concrete, fallback)
        : doAdditionOfTransitiveNodes(fallback, concrete);

      if (result.type !== 'structure') {
        throw new Error('Expected a structure transitive node.');
      }

      expect(result.properties?.['value']).toMatchObject({
        isRequired: true,
        rangeOfValues: ['verified'],
        scalarType: 'string',
        stringOptions: { pattern: /^verified$/ },
        type: 'scalar',
      });
      expect(result.properties?.['value']?.isFallbackType).toBeFalsy();
      expect(result.properties?.['value']?.isNever).toBeFalsy();
    },
  );

  it('should mark incompatible node types as never', () => {
    const first = createStringScalar({ type: 'string' });
    const second = createBooleanScalar({ type: 'boolean' });
    const result = doAdditionOfTransitiveNodes(first, second);

    expect(result).toMatchObject({
      isNever: true,
      scalarType: 'string',
      type: 'scalar',
    });
  });

  it('should simplify a single compatible union variant', () => {
    const first = createUnion([
      {
        ...createStringScalar({ enum: ['draft'] }),
        rangeOfValues: ['draft'],
      },
    ]);

    const second = createUnion([
      {
        ...createStringScalar({ enum: ['draft', 'published'] }),
        rangeOfValues: ['draft', 'published'],
      },
    ]);

    const result = doAdditionOfTransitiveNodes(first, second);

    expect(result).toMatchObject({
      rangeOfValues: ['draft'],
      scalarType: 'string',
      type: 'scalar',
    });
  });

  it('should flatten two unions and append another node', () => {
    const first = createUnion([
      createStringScalar({ type: 'string' }),
      createBooleanScalar({ type: 'boolean' }),
    ]);
    const second = createUnion([createUnknown({})]);
    const mergedUnions = doAdditionOfTransitiveNodes(first, second);
    const result = doAdditionOfTransitiveNodes(
      mergedUnions,
      createStructure({ id: createUnknown({}) }),
    );

    expect(result).toMatchObject({
      referredTransitiveNodes: [
        { scalarType: 'string' },
        { scalarType: 'boolean' },
        { type: 'unknown' },
        { type: 'structure' },
      ],
      type: 'union',
    });
  });

  it('should append a scalar to an existing union', () => {
    const first = createUnion([{
      ...createStringScalar({ enum: ['draft'] }),
      rangeOfValues: ['draft'],
    }]);

    const second = {
      ...createStringScalar({ enum: ['published'] }),
      rangeOfValues: ['published'],
    };

    expect(doAdditionOfTransitiveNodes(first, second)).toMatchObject({
      referredTransitiveNodes: [
        { rangeOfValues: ['draft'] },
        { rangeOfValues: ['published'] },
      ],
      type: 'union',
    });
  });

  it('should preserve a never node', () => {
    const first = {
      ...createUnknown({ type: 'string' }),
      isNever: true,
    };
    const second = createStringScalar({ type: 'string' });

    expect(doAdditionOfTransitiveNodes(first, second)).toBe(first);
  });
});
