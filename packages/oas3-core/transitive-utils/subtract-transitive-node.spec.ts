import { subtractTransitiveNode } from './subtract-transitive-node';
import {
  createBooleanScalar,
  createStringScalar,
  createStructure,
  createUnion,
  createUnknown,
} from './testing-utils';
import type {
  IntersectionTransitiveNode,
  RefTransitiveNode,
  StructureTransitiveNode,
} from '../transitive-node';

describe('subtractTransitiveNode', () => {
  it('should leave a circular reference intact when it cannot be unwrapped', () => {
    const placeholder = createUnknown({ $ref: '#' });
    const reference: RefTransitiveNode = {
      mixin: null,
      ref: placeholder,
      source: placeholder.source,
      type: 'reference',
    };

    reference.ref = reference;

    expect(subtractTransitiveNode(reference, createStringScalar({
      type: 'string',
    }))).toBe(reference);
  });

  it('should keep a variative union and record its excluded type', () => {
    const first = {
      ...createUnion([
        createStringScalar({ type: 'string' }),
        createBooleanScalar({ type: 'boolean' }),
      ]),
      isVariativeSchema: true,
    };
    const excluded = createBooleanScalar({ type: 'boolean' });
    const result = subtractTransitiveNode(first, excluded);

    expect(result).toMatchObject({
      type: 'union',
      isVariativeSchema: true,
      not: [excluded],
    });
    expect(first.not).toBeUndefined();
  });

  it('should mark missing and semantically equal structure properties as never', () => {
    const first = createStructure({
      onlyFirst: createUnknown({ type: 'boolean' }),
      profile: createStructure({
        keep: createUnknown({ type: 'number' }),
        remove: createUnknown({ type: 'string' }),
      }),
      shared: createUnknown({ type: 'string' }),
    });

    const second = createStructure({
      onlySecond: createUnknown({ type: 'null' }),
      profile: createStructure({
        remove: createUnknown({ type: 'string' }),
      }),
      shared: createUnknown({ type: 'string' }),
    });

    const result = subtractTransitiveNode(first, second, {
      markUnmatchedPropertiesAsNever: true,
    });

    if (result.type !== 'structure') {
      throw new Error('Expected a structure transitive node.');
    }

    expect(Object.keys(result.properties ?? {})).toEqual([
      'onlyFirst',
      'profile',
      'shared',
    ]);
    expect(result.properties?.['onlyFirst']).toEqual(
      expect.objectContaining({
        isNever: true,
        type: 'unknown',
      }),
    );
    expect(result.properties?.['profile']).toMatchObject({
      properties: {
        keep: {
          isNever: true,
          type: 'unknown',
        },
        remove: {
          isNever: true,
          type: 'unknown',
        },
      },
      type: 'structure',
    });
    expect(result.properties?.['shared']).toEqual(
      expect.objectContaining({
        isNever: true,
        type: 'unknown',
      }),
    );
    expect(Object.keys(first.properties ?? {})).toEqual([
      'onlyFirst',
      'profile',
      'shared',
    ]);
  });

  it('should preserve properties absent from the excluded structure', () => {
    const id = createStringScalar({ type: 'string' });
    const unprotectedProp = createStringScalar({ type: 'string' });
    const first = createStructure({ id, unprotectedProp });
    const second = createStructure({
      unprotectedProp: createStringScalar({ type: 'string' }),
    });

    const result = subtractTransitiveNode(first, second);

    if (result.type !== 'structure') {
      throw new Error('Expected a structure transitive node.');
    }

    expect(result.properties?.['id']).toBe(id);
    expect(result.properties?.['unprotectedProp']).toMatchObject({
      isNever: true,
      type: 'unknown',
    });
  });

  it('should exclude a property required by a negated schema', () => {
    const id = createStringScalar({ type: 'string' });
    const unprotectedProp = createStringScalar({ type: 'string' });
    const nonRequiredUnprotectedProp = createStringScalar({ type: 'string' });
    const first = createStructure({
      id,
      nonRequiredUnprotectedProp,
      unprotectedProp,
    });

    const firstExcluded = createStructure({
      unprotectedProp: createStringScalar({ type: 'string' }),
    });

    const secondExcluded = createStructure({
      nonRequiredUnprotectedProp: {
        ...createUnknown({ required: ['nonRequiredUnprotectedProp'] }),
        isRequired: true,
      },
    });

    const firstSubtraction = subtractTransitiveNode(first, firstExcluded);
    const result = subtractTransitiveNode(firstSubtraction, secondExcluded);

    if (result.type !== 'structure') {
      throw new Error('Expected a structure transitive node.');
    }

    expect(result.properties?.['id']).toBe(id);
    expect(result.properties?.['unprotectedProp']?.isNever).toBe(true);
    expect(result.properties?.['nonRequiredUnprotectedProp']).toMatchObject({
      isNever: true,
      type: 'unknown',
    });
  });

  it('should apply excluded additional properties to an intersection', () => {
    const values = createStructure({
      isActivated: createBooleanScalar({ type: 'boolean' }),
    });

    const first: StructureTransitiveNode = {
      ...createStructure({}),
      additionalProperties: values,
    };

    const second: StructureTransitiveNode = {
      ...createStructure({}),
      additionalProperties: createStructure({
        description: createStringScalar({ type: 'string' }),
      }),
    };

    const intersection: IntersectionTransitiveNode = {
      mixin: null,
      referredTransitiveNodes: [first, second],
      source: first.source,
      type: 'intersection',
    };

    const requiredExclusion: StructureTransitiveNode = {
      ...createStructure({}),
      additionalProperties: createStructure({
        forbiddenProperty: {
          ...createUnknown({ required: ['forbiddenProperty'] }),
          isRequired: true,
        },
      }),
    };

    const propertyExclusion: StructureTransitiveNode = {
      ...createStructure({}),
      additionalProperties: createStructure({
        anotherForbiddenProperty: createUnknown({}),
      }),
    };

    const firstSubtraction = subtractTransitiveNode(
      intersection,
      requiredExclusion,
    );

    const result = subtractTransitiveNode(
      firstSubtraction,
      propertyExclusion,
    );

    if (result.type !== 'intersection') {
      throw new Error('Expected an intersection transitive node.');
    }

    expect(result.referredTransitiveNodes).toMatchObject([
      {
        additionalProperties: {
          properties: {
            anotherForbiddenProperty: { isNever: true },
            forbiddenProperty: { isNever: true },
            isActivated: { scalarType: 'boolean' },
          },
        },
      },
      {
        additionalProperties: {
          properties: {
            anotherForbiddenProperty: { isNever: true },
            description: { scalarType: 'string' },
            forbiddenProperty: { isNever: true },
          },
        },
      },
    ]);
  });

  it('should preserve a property outside a restricted exclusion', () => {
    const property = createStringScalar({ type: 'string' });
    const first = createStructure({ property });
    const second = createStructure({
      property: {
        ...createUnknown({ const: 'restricted' }),
        isRequired: true,
        rangeOfValues: ['restricted'],
      },
    });

    const result = subtractTransitiveNode(first, second);

    if (result.type !== 'structure') {
      throw new Error('Expected a structure transitive node.');
    }

    expect(result.properties?.['property']).toBe(property);
  });

  it('should recursively subtract properties with different types', () => {
    const profile = createStructure({
      nested: createUnknown({ type: 'string' }),
    });
    const first = createStructure({ profile });
    const second = createStructure({
      profile: createUnknown({ type: 'object' }),
    });

    const result = subtractTransitiveNode(first, second);

    if (result.type !== 'structure') {
      throw new Error('Expected a structure transitive node.');
    }

    expect(result.properties?.['profile']).toBe(profile);
  });

  it('should remove union variants with matching schemas', () => {
    const commonVariant = createUnknown({ type: 'string' });
    const firstOnlyVariant = createUnknown({ type: 'number' });
    const secondOnlyVariant = createUnknown({ type: 'boolean' });
    const first = createUnion([
      commonVariant,
      firstOnlyVariant,
    ]);

    const second = createUnion([
      createUnknown({ type: 'string' }),
      secondOnlyVariant,
    ]);

    const result = subtractTransitiveNode(first, second);

    if (result.type !== 'union') {
      throw new Error('Expected a union transitive node.');
    }

    expect(result.referredTransitiveNodes).toEqual([firstOnlyVariant]);
    expect(first.referredTransitiveNodes).toEqual([
      commonVariant,
      firstOnlyVariant,
    ]);
  });

  it('should subtract matching values from a node range', () => {
    const first = {
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

    const second = {
      ...createUnknown({ enum: [{ state: 'draft' }] }),
      rangeOfValues: [{ state: 'draft' }],
    };

    expect(subtractTransitiveNode(first, second)).toMatchObject({
      rangeOfValues: [{ state: 'published' }],
      type: 'unknown',
    });
  });

  it('should remove a union variant only when the subtrahend covers it', () => {
    const matchingVariant = {
      ...createUnknown({ enum: ['draft', 'published'] }),
      rangeOfValues: ['draft', 'published'],
    };
    const firstOnlyVariant = createUnknown({ type: 'number' });
    const first = createUnion([
      matchingVariant,
      firstOnlyVariant,
    ]);

    const second = createUnion([
      {
        ...createUnknown({ enum: ['draft', 'published'] }),
        rangeOfValues: ['draft', 'published'],
      },
    ]);

    const result = subtractTransitiveNode(first, second);

    if (result.type !== 'union') {
      throw new Error('Expected a union transitive node.');
    }

    expect(result.referredTransitiveNodes).toEqual([firstOnlyVariant]);
  });

  it('should deeply subtract significant union variant differences', () => {
    const first = createUnion([
      createStructure({
        status: {
          ...createUnknown({ enum: ['draft', 'published'] }),
          rangeOfValues: ['draft', 'published'],
        },
      }),
    ]);

    const second = createUnion([
      createStructure({
        status: {
          ...createUnknown({ enum: ['draft'] }),
          rangeOfValues: ['draft'],
        },
      }),
    ]);

    const result = subtractTransitiveNode(first, second);

    if (result.type !== 'union') {
      throw new Error('Expected a union transitive node.');
    }

    expect(result.referredTransitiveNodes).toMatchObject([
      {
        properties: {
          status: {
            rangeOfValues: ['published'],
            type: 'unknown',
          },
        },
        type: 'structure',
      },
    ]);
  });

  it('should ignore non-significant metadata differences between union variants', () => {
    const first = createUnion([
      createStringScalar({ type: 'string' }),
    ]);

    const second = createUnion([
      createStringScalar({
        annotations: { description: 'Human-readable content.' },
        type: 'string',
      }),
    ]);

    const result = subtractTransitiveNode(first, second);

    if (result.type !== 'union') {
      throw new Error('Expected a union transitive node.');
    }

    expect(result.referredTransitiveNodes).toEqual([]);
  });

  it('should preserve union variants with different scalar types', () => {
    const stringVariant = createStringScalar({ type: 'string' });
    const first = createUnion([stringVariant]);
    const second = createUnion([
      createBooleanScalar({ type: 'boolean' }),
    ]);

    const result = subtractTransitiveNode(first, second);

    if (result.type !== 'union') {
      throw new Error('Expected a union transitive node.');
    }

    expect(result.referredTransitiveNodes).toEqual([stringVariant]);
  });

  it('should return the first node when the node types differ', () => {
    const first = createStructure({
      property: createUnknown({ type: 'string' }),
    });

    const second = createUnion([
      createUnknown({ type: 'string' }),
    ]);

    expect(subtractTransitiveNode(first, second)).toBe(first);
  });
});
