import type { SchemaObject } from '@codegena/oas3-core/json-schema';
import {
  createTestingLogger,
  type Logger,
} from '@codegena/oas3-core/logger';
import type {
  ArrayTransitiveNode,
  ConditionalTransitiveNode,
  IntersectionTransitiveNode,
  OpenApiDocumentTransitiveNode,
  ScalarTransitiveNode,
  StructureTransitiveNode,
  RefTransitiveNode,
  TransitiveNode,
  UnionTransitiveNode,
} from '@codegena/oas3-core/transitive-node';
import trim from 'lodash/trim';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  extractTransitiveNodesFromSchema,
} from './extract-transitive-nodes-from-schema';
import {
  SchemaConvertorDependentRequired,
  SchemaConvertorRangeOfValues,
} from './schema-convertors';

const fixturesDir = join(__dirname, '__fixtures__');

function getFixturePath(fixtureFileName: string): string {
  return join(fixturesDir, fixtureFileName);
}

function loadFixtureFile(name: string): string {
  return readFileSync(join(fixturesDir, name), 'utf8');
}

function expectRootObjectToBeCorrect(
  objectTransitiveNode: StructureTransitiveNode,
): void {
  expect(objectTransitiveNode).toBeTruthy();
  expect(objectTransitiveNode.nestedTransitiveNodes ?? []).toEqual(
    Object.values(objectTransitiveNode.properties ?? {}),
  );
  expect(objectTransitiveNode?.source.jsonPath).toEqual([]);
  expect(objectTransitiveNode.type).toBe('structure');
}

function findInLogs(
  logsCollection: string[],
  dynamicRegexString: string,
): string | undefined {
  const pattern = new RegExp(dynamicRegexString, 'i');

  return logsCollection.find((message) => pattern.test(message));
}

function getDocument(nodes: TransitiveNode[]): OpenApiDocumentTransitiveNode {
  const document = nodes.find((node): node is OpenApiDocumentTransitiveNode => (
    node.type === 'openApiDocument'
  ));

  if (!document) {
    throw new Error('OpenAPI document was not converted.');
  }

  return document;
}

describe('extractTransitiveNodesFromSchema with default convertors', () => {
  let logger: Logger;
  let logsCollection: string[];

  beforeEach(() => {
    logsCollection = [];
    logger = createTestingLogger(logsCollection);
  });

  it.each(['$anchor', '$dynamicAnchor'])(
    'should retain an unconstrained %s schema for references',
    (keyword) => {
      const [node] = extractTransitiveNodesFromSchema({
        jsoncTextData: JSON.stringify({
          $defs: { Item: { [keyword]: 'item' } },
          $ref: '#/$defs/Item',
        }),
        srcFileId: 'anchor-only.json',
        logger,
      });

      expect(node).toMatchObject({
        type: 'reference',
        ref: { type: 'unknown' },
      });
      expect(findInLogs(logsCollection, 'Anchor-only schema has no type constraints'))
        .toBeTruthy();
    },
  );

  it('should resolve a dynamic reference to an unconstrained anchor', () => {
    const [node] = extractTransitiveNodesFromSchema({
      jsoncTextData: JSON.stringify({
        $defs: { Item: { $dynamicAnchor: 'item' } },
        $dynamicRef: '#item',
      }),
      srcFileId: 'dynamic-anchor-only.json',
      logger,
    });

    expect(node).toMatchObject({
      type: 'reference',
      ref: { type: 'unknown' },
    });
    expect(findInLogs(logsCollection, 'cannot be resolved')).toBeFalsy();
  });

  it('should preserve the inferred type of an anchored schema', () => {
    const [node] = extractTransitiveNodesFromSchema({
      jsoncTextData: JSON.stringify({
        $dynamicAnchor: 'item',
        type: 'string',
      }),
      srcFileId: 'typed-anchor.json',
      logger,
    });

    expect(node).toMatchObject({
      type: 'scalar',
      scalarType: 'string',
    });
    expect(findInLogs(logsCollection, 'Anchor-only schema')).toBeFalsy();
  });

  it('should reject an invalid anchor name without inventing a type', () => {
    const nodes = extractTransitiveNodesFromSchema({
      jsoncTextData: JSON.stringify({ $dynamicAnchor: '#item' }),
      srcFileId: 'invalid-anchor.json',
      logger,
    });

    expect(nodes).toEqual([]);
  });

  it('should extract object with unknown property types', () => {
    const fixtureFileName = 'object-unknown-properties.json';
    const checkingFixture: SchemaObject = JSON.parse(loadFixtureFile(fixtureFileName));
    const transitiveNodes = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath(fixtureFileName),
      logger,
    }) as [StructureTransitiveNode];

    const [objectTransitiveNode] = transitiveNodes;
    const checkingPropertyNames = Object.keys(checkingFixture.properties ?? {});

    expect(transitiveNodes).toHaveLength(1);
    expect(objectTransitiveNode.annotations?.description).toMatch(/with properties/);
    expect(objectTransitiveNode.annotations?.title).toMatch(/\.json5/);
    expect(objectTransitiveNode).not.toHaveProperty('description');
    expect(objectTransitiveNode).not.toHaveProperty('title');
    expectRootObjectToBeCorrect(objectTransitiveNode);

    checkingPropertyNames.forEach((expectingProperty) => {
      expect(objectTransitiveNode.properties).toHaveProperty(expectingProperty);

      const propertyTransitiveNode = objectTransitiveNode
        .properties?.[expectingProperty];

      expect(propertyTransitiveNode?.nestedBy?.at(0)).toBe(objectTransitiveNode);
      expect(propertyTransitiveNode?.associatedPropertyName).toBe(expectingProperty);
      expect(propertyTransitiveNode?.isInline).toBeTruthy();
      expect(propertyTransitiveNode?.isNullable).toBeFalsy();
      expect(propertyTransitiveNode?.isRequired).toBeFalsy();
      expect(propertyTransitiveNode?.type).toBe('unknown');
      expect(propertyTransitiveNode?.annotations?.title).toBe('Field with unknown type');

      expect(propertyTransitiveNode?.source.jsonPath).toEqual([
        'properties',
        expectingProperty,
      ]);
    });
  });

  it('should warn when annotated properties have no supported schema type', () => {
    const [objectTransitiveNode] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('object-unknown-properties.json'),
      logger,
    }) as [StructureTransitiveNode];

    Object.values(objectTransitiveNode.properties ?? {}).forEach((property) => {
      expect(property.annotations?.title).toBe('Field with unknown type');
    });
    expect(logsCollection.filter((message) => (
      message.includes('annotations were attached to an unknown transitive node')
    ))).toHaveLength(2);
  });

  it('should extract object with unknown property types with required properties', () => {
    const fixtureFileName = 'object-unknown-properties-with-required.json';
    const checkingFixture: SchemaObject = JSON.parse(loadFixtureFile(fixtureFileName));
    const transitiveNodes = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath(fixtureFileName),
      logger,
    }) as [StructureTransitiveNode];

    const [objectTransitiveNode] = transitiveNodes;
    const checkingRequired = checkingFixture.required as string[];

    const requiredPropertyNames = Object.entries(objectTransitiveNode.properties ?? {})
      .filter(([, transitiveNode]) => transitiveNode.isRequired)
      .map(([propertyName]) => propertyName);

    const nonRequiredPropertyNames = Object.entries(
      objectTransitiveNode.properties ?? {},
    )
      .filter(([, transitiveNode]) => !transitiveNode.isRequired)
      .map(([propertyName]) => propertyName);

    expect(requiredPropertyNames).toEqual(checkingRequired);
    expect(nonRequiredPropertyNames.length).toBeTruthy();
  });

  it.each([
    true,
    false,
  ])(
    'should apply enrichPropertiesWithMissedRequired only if %p',
    (useMissedRequired) => {
      const fixtureFileName = 'object-missed-required-properties-only.json';
      const checkingFixture: SchemaObject = JSON.parse(loadFixtureFile(fixtureFileName));
      const [objectTransitiveNode] = extractTransitiveNodesFromSchema({
        srcFilePath: getFixturePath(fixtureFileName),
        mergedConvertorOptions: {
          enrichPropertiesWithMissedRequired: useMissedRequired,
        },
        logger,
      }) as [StructureTransitiveNode];

      const checkingPropertyNames = checkingFixture.required as string[];

      if (useMissedRequired) {
        expect(Object.keys(objectTransitiveNode.properties ?? {})).toEqual(
          checkingPropertyNames,
        );
      }
      else {
        expect(objectTransitiveNode.properties).toBe(undefined);
      }

      expectRootObjectToBeCorrect(objectTransitiveNode);
    },
  );

  it.each([
    true,
    false,
  ])(
    'should apply enrichPropertiesWithMissedRequired with others if %p',
    (useMissedRequired) => {
      const fixtureFileName = 'object-missed-required-properties.json';
      const checkingFixture: SchemaObject = JSON.parse(loadFixtureFile(fixtureFileName));
      const [objectTransitiveNode] = extractTransitiveNodesFromSchema({
        srcFilePath: getFixturePath(fixtureFileName),
        mergedConvertorOptions: {
          enrichPropertiesWithMissedRequired: useMissedRequired,
        },
        logger,
      }) as [StructureTransitiveNode];

      const requiredProperties = checkingFixture.required as string[];
      const nonRequiredProperties = Object.keys(checkingFixture.properties ?? {});
      const resultingProperties = Object.keys(objectTransitiveNode.properties ?? {});

      if (useMissedRequired) {
        expect(resultingProperties).toEqual([
          ...requiredProperties,
          ...nonRequiredProperties,
        ]);
      }
      else {
        expect(resultingProperties).toEqual(nonRequiredProperties);
      }
    },
  );

  it('should warn about ignored properties', () => {
    const transitiveNodes = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('object-ignored-options.json'),
      logger,
    }) as [StructureTransitiveNode];

    const [objectTransitiveNode] = transitiveNodes;

    const maxPropertiesWarn = findInLogs(logsCollection, 'maxProperties');
    const minPropertiesWarn = findInLogs(logsCollection, 'minProperties');

    expect(objectTransitiveNode).toBeTruthy();
    expect(maxPropertiesWarn).toBeTruthy();
    expect(minPropertiesWarn).toBeTruthy();
  });

  it('should process patternProperties', () => {
    const fixtureFileName = 'object-pattern-properties.json';
    const checkingFixture: SchemaObject = JSON.parse(loadFixtureFile(fixtureFileName));
    const transitiveNodes = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath(fixtureFileName),
      logger,
    }) as [StructureTransitiveNode];

    const [objectTransitiveNode] = transitiveNodes;
    const srcPatterns = Object.keys(checkingFixture.patternProperties ?? {})
      .map((pattern) => String(new RegExp(pattern)));

    const resultPatterns = objectTransitiveNode.propertyPatterns
      ?.map(([regex]) => String(regex));

    const resultTransitiveNodes = objectTransitiveNode.propertyPatterns
      ?.map(([, transitiveNode]) => transitiveNode);

    expect(objectTransitiveNode.type).toBe('structure');
    expect(objectTransitiveNode.nestedTransitiveNodes).toEqual(
      resultTransitiveNodes ?? [],
    );
    expect(resultPatterns).toEqual(srcPatterns);

    objectTransitiveNode.propertyPatterns?.forEach((value) => {
      const [pattern, transitiveNode] = value;
      const patternTrimmed = String(pattern).replaceAll('/', '');

      expect(transitiveNode.associatedKeyPattern).toBe(patternTrimmed);
      expect(transitiveNode.associatedKeyPattern).toBe(patternTrimmed);
      expect(transitiveNode.nestedTransitiveNodes).toBeFalsy();
      expect(transitiveNode.nestedBy?.at(0)).toBe(objectTransitiveNode);
      expect(transitiveNode.source.jsonPath).toEqual([
        'patternProperties',
        patternTrimmed,
      ]);
      expect(transitiveNode.annotations?.title).toContain(patternTrimmed);
    });
  });

  it('should ignore wrong patternProperties and log warning', () => {
    const [objectTransitiveNode] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('object-pattern-properties-wrong.json'),
      logger,
    }) as [StructureTransitiveNode];

    expect(objectTransitiveNode.propertyPatterns).toBeFalsy();
    expect(findInLogs(logsCollection, 'wrong format')).toBeTruthy();
  });

  it('should ignore wrong regular expressions in patternProperties', () => {
    const [objectTransitiveNode] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('object-pattern-properties-wrong-regexp.json'),
      logger,
    }) as [StructureTransitiveNode];

    const ignoredWrongPatternWarn = findInLogs(logsCollection,
      'Regular expression.*wrong',
    );

    expect(objectTransitiveNode.propertyPatterns).toBeFalsy();
    expect(ignoredWrongPatternWarn).toBeTruthy();
  });

  it('should ignore vulnerable property patterns and key patterns', () => {
    const [objectTransitiveNode] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('object-unsafe-patterns.json'),
      logger,
    }) as [StructureTransitiveNode];

    expect(objectTransitiveNode.propertyPatterns).toBeFalsy();
    expect(objectTransitiveNode.defaultKeyPattern).toBeFalsy();
    expect(findInLogs(logsCollection, 'wrong or unsafe')).toBeTruthy();
  });

  it('should have unknown additional properties', () => {
    const [objectTransitiveNode] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('object-additional-properties.json'),
      logger,
    }) as [StructureTransitiveNode];

    const additionalProperties = objectTransitiveNode
      .additionalProperties as TransitiveNode;

    expect(additionalProperties).toBeTruthy();
    expect(additionalProperties.type).toBe('unknown');
    expect(additionalProperties.nestedBy).toEqual([objectTransitiveNode]);
  });

  it('should leave additional properties unset when the keyword is absent', () => {
    const [objectTransitiveNode] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('object-unknown-properties.json'),
      logger,
    }) as [StructureTransitiveNode];

    expect(objectTransitiveNode.additionalProperties).toBeUndefined();
  });

  it('should have additionalProperties to be object', () => {
    const transitiveNodes = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('object-additional-properties-object.json'),
      logger,
    }) as StructureTransitiveNode[];

    const [
      mainObjectTransitiveNode,
    ] = transitiveNodes;

    const additionalProperties = mainObjectTransitiveNode
      .additionalProperties as StructureTransitiveNode;

    expect(transitiveNodes).toHaveLength(1);
    expect(
      additionalProperties.source.jsonPath,
    ).toEqual(
      ['additionalProperties'],
    );
    expect(additionalProperties.type).toBe('structure');
    expect(additionalProperties.properties).toBeTruthy();
    expect(additionalProperties.properties?.['nonRequiredProperty']?.annotations?.title)
      .toContain('Non-required property');
  });

  it('should have additionalProperties to be forcedly true from false', () => {
    const [objectTransitiveNode] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath(
        'object-pattern-properties-additional-properties-false.json',
      ),
      logger,
    }) as [StructureTransitiveNode];

    expect(objectTransitiveNode.additionalProperties).toBeTruthy();
  });

  it('should process propertyNames', () => {
    const [objectTransitiveNode] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath(
        'object-property-names.json',
      ),
      logger,
    }) as [StructureTransitiveNode];

    expect(objectTransitiveNode.additionalProperties).toBeTruthy();
    expect(objectTransitiveNode.defaultKeyPattern).toBeInstanceOf(RegExp);
  });

  it('should ignore wrong process propertyNames and log warning', () => {
    const [objectTransitiveNode] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath(
        'object-property-names-wrong.json',
      ),
      logger,
    }) as [StructureTransitiveNode];

    const ignoredWrongPatternWarn = findInLogs(logsCollection,
      'Regular expression.*wrong',
    );

    expect(ignoredWrongPatternWarn).toBeTruthy();
    expect(objectTransitiveNode.additionalProperties).toBeFalsy();
    expect(objectTransitiveNode.defaultKeyPattern).toBeFalsy();
  });

  it('should have nested objects in additionalProperties', () => {
    const fixtureFileName = 'object-nested-in-additional-properties.json';
    const checkingFixture: SchemaObject = JSON.parse(loadFixtureFile(fixtureFileName));
    const [
      mainObjectTransitiveNode,
    ] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath(fixtureFileName),
      logger,
    }) as [StructureTransitiveNode, StructureTransitiveNode];

    const propertyNames = Object.keys(checkingFixture.properties ?? {});
    const additionalProperties = mainObjectTransitiveNode
      .additionalProperties as StructureTransitiveNode;

    expect(additionalProperties.type).toBe('structure');
    propertyNames.forEach((propertyName) => {
      expect(additionalProperties.properties).toHaveProperty(propertyName);
    });
  });

  it('should have nested objects in properties', () => {
    const fixtureFileName = 'object-nested-in-pattern-properties.json';
    const checkingFixture: SchemaObject = JSON.parse(loadFixtureFile(fixtureFileName));
    const [mainObjectTransitiveNode] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath(fixtureFileName),
      logger,
    }) as StructureTransitiveNode[];

    const patternPropertiesEntries = Object.entries(
      checkingFixture.patternProperties ?? {},
    );

    expect(patternPropertiesEntries).toHaveLength(2);

    patternPropertiesEntries.forEach(([pattern, schema], index) => {
      const typesByPattern = mainObjectTransitiveNode.propertyPatterns?.at(index);

      if (!typesByPattern) {
        throw new Error('Expected result in propertyPatterns by index');
      }

      const [parsedPattern, transitiveNode] = typesByPattern;
      const nestedProperties = Object.keys(schema.properties ?? {});

      expect(trim(String(parsedPattern), '/')).toBe(pattern);
      expect(transitiveNode.type).toBe('structure');

      nestedProperties.forEach((nestedProperty) => {
        expect((transitiveNode as StructureTransitiveNode).properties)
          .toHaveProperty(nestedProperty);
      });
    });
  });

  it('should resolve object type by $ref', () => {
    const [
      mainTransitiveNode,
      referredTypeTransitiveNode,
    ] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('ref-resolve-object.json'),
      logger,
    }) as [RefTransitiveNode, StructureTransitiveNode];

    expect(mainTransitiveNode.type).toBe('reference');
    expect(mainTransitiveNode.suggestedName).toBe('RefResolveObject');

    expect(mainTransitiveNode.ref).toBeTruthy();
    expect(mainTransitiveNode.ref).toBe(referredTypeTransitiveNode);
    expect(referredTypeTransitiveNode.type).toBe('structure');
    expect(referredTypeTransitiveNode.source.jsonPath).toEqual([
      '$defs',
      'ResolvedObjectTypePartial',
    ]);
  });

  it('should resolve a local reference with a hyphenated component name', () => {
    const [rootNode, componentNode] = extractTransitiveNodesFromSchema({
      jsoncTextData: JSON.stringify({
        $ref: '#/components/schemas/security-advisory-ecosystems',
        components: {
          schemas: {
            'security-advisory-ecosystems': { type: 'string' },
          },
        },
      }),
      srcFileId: 'hyphenated-component.json',
      logger,
    }) as [RefTransitiveNode, ScalarTransitiveNode];

    expect(rootNode.ref).toBe(componentNode);
    expect(componentNode.scalarType).toBe('string');
  });

  it('should resolve a recursive $dynamicRef through its indexed anchor', () => {
    const [rootNode, productNode] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('dynamic-ref-product.jsonc'),
      logger,
    }) as [RefTransitiveNode, StructureTransitiveNode];

    expect(rootNode.type).toBe('reference');
    expect(rootNode.ref).toBe(productNode);
    expect(productNode.source.jsonPath).toEqual(['$defs', 'Product']);
    expect(productNode.properties?.['status'].isRequired).toBe(true);
    expect(productNode.properties?.['status'].rangeOfValues).toEqual([
      'active',
      'discontinued',
    ]);

    const relatedNode = productNode.properties?.['related'] as RefTransitiveNode;

    expect(relatedNode.type).toBe('reference');
    expect(relatedNode.ref).toBe(productNode);
    expect(relatedNode.ref.suggestedName).toBe('Product');
  });

  it('should resolve a $dynamicRef JSON Pointer like a direct reference', () => {
    const [rootNode, productNode] = extractTransitiveNodesFromSchema({
      jsoncTextData: JSON.stringify({
        $dynamicRef: '#/$defs/Product',
        $defs: { Product: { type: 'string' } },
      }),
      srcFileId: 'dynamic-ref-pointer.json',
      logger,
    }) as [RefTransitiveNode, ScalarTransitiveNode];

    expect(rootNode.ref).toBe(productNode);
    expect(productNode.scalarType).toBe('string');
  });

  it('should resolve a $dynamicRef to an indexed static anchor', () => {
    const [rootNode, productNode] = extractTransitiveNodesFromSchema({
      jsoncTextData: JSON.stringify({
        $dynamicRef: '#product',
        $defs: {
          Product: { $anchor: 'product', type: 'boolean' },
        },
      }),
      srcFileId: 'dynamic-ref-static-anchor.json',
      logger,
    }) as [RefTransitiveNode, ScalarTransitiveNode];

    expect(rootNode.ref).toBe(productNode);
    expect(productNode.scalarType).toBe('boolean');
  });

  it('should fall back with a warning for an unresolved dynamic anchor', () => {
    const [rootNode] = extractTransitiveNodesFromSchema({
      jsoncTextData: JSON.stringify({ $dynamicRef: '#missing' }),
      srcFileId: 'dynamic-ref-missing.json',
      logger,
    }) as [RefTransitiveNode];

    expect(rootNode.ref.type).toBe('unknown');
    expect(findInLogs(logsCollection, 'anchor is not indexed')).toBeTruthy();
  });

  it('should warn when an external dynamic anchor cannot be indexed', () => {
    const [rootNode] = extractTransitiveNodesFromSchema({
      jsoncTextData: JSON.stringify({
        $dynamicRef: 'product.json#product',
      }),
      srcFileId: 'dynamic-ref-external-anchor.json',
      logger,
    }) as [RefTransitiveNode];

    expect(rootNode.ref.type).toBe('unknown');
    expect(findInLogs(logsCollection, 'external anchors are not indexed')).toBeTruthy();
  });

  it('should extract condition branches and common object properties', () => {
    const [conditionalTransitiveNode] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('if-object-simple.json'),
      logger,
    }) as [ConditionalTransitiveNode];

    const condition = conditionalTransitiveNode.condition as StructureTransitiveNode;
    const positiveResult = conditionalTransitiveNode
      .positiveResult as StructureTransitiveNode;

    const negativeResult = conditionalTransitiveNode
      .negativeResult as StructureTransitiveNode;
    const mixin = conditionalTransitiveNode.mixin as StructureTransitiveNode;

    expect(conditionalTransitiveNode.type).toBe('conditional');
    expect(condition.type).toBe('structure');
    expect(condition.source.jsonPath).toEqual(['if']);
    expect(condition.properties).toHaveProperty('loginBy');
    expect(positiveResult.type).toBe('structure');
    expect(positiveResult.source.jsonPath).toEqual(['then']);
    expect(positiveResult.properties).toHaveProperty('login');
    expect(negativeResult.type).toBe('structure');
    expect(negativeResult.source.jsonPath).toEqual(['else']);
    expect(negativeResult.properties).toHaveProperty('login');
    expect(mixin.type).toBe('structure');
    expect(mixin.source.jsonPath).toEqual([]);
    expect(mixin.properties).toHaveProperty('login');
    expect(mixin.properties).toHaveProperty('loginBy');
  });

  it('should extract a string scalar pattern and bounds', () => {
    const [transitiveNode] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('scalar-string-pattern.json'),
      logger,
    });

    if (transitiveNode.type !== 'scalar'
      || transitiveNode.scalarType !== 'string'
    ) {
      throw new Error('Expected a string scalar transitive node.');
    }

    const stringTransitiveNode: ScalarTransitiveNode = transitiveNode;

    expect(stringTransitiveNode.stringOptions).toEqual({
      maxLength: 24,
      minLength: 7,
      pattern: /^ORDER_[A-Z]+$/,
    });
    expect(findInLogs(logsCollection, 'minLength')).toBeUndefined();
    expect(findInLogs(logsCollection, 'maxLength')).toBeUndefined();
  });

  it('should extract a string scalar format', () => {
    const [transitiveNode] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('scalar-string-format.json'),
      logger,
    });

    if (transitiveNode.type !== 'scalar'
      || transitiveNode.scalarType !== 'string'
    ) {
      throw new Error('Expected a string scalar transitive node.');
    }

    expect(transitiveNode.stringOptions).toEqual({ format: 'email' });
  });

  it('should fall back to string when its pattern is invalid', () => {
    const [transitiveNode] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('scalar-string-invalid-pattern.json'),
      logger,
    });

    if (transitiveNode.type !== 'scalar'
      || transitiveNode.scalarType !== 'string'
    ) {
      throw new Error('Expected a string scalar transitive node.');
    }

    expect(transitiveNode.stringOptions).toBeUndefined();
    expect(findInLogs(logsCollection, 'Unable.*string pattern')).toBeTruthy();
  });

  it('should fall back to string when its pattern is vulnerable', () => {
    const [transitiveNode] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('scalar-string-unsafe-pattern.json'),
      logger,
    });

    if (transitiveNode.type !== 'scalar'
      || transitiveNode.scalarType !== 'string'
    ) {
      throw new Error('Expected a string scalar transitive node.');
    }

    expect(transitiveNode.stringOptions).toBeUndefined();
    expect(findInLogs(logsCollection, 'Unable.*string pattern')).toBeTruthy();
  });

  it.each([
    {
      fixtureFileName: 'scalar-number-options.json',
      numberOptions: {
        isFloat: true,
        maximum: 9999.99,
        minimum: 0,
        multipleOf: 0.01,
      },
      scalarType: 'number',
    },
    {
      fixtureFileName: 'scalar-integer-options.json',
      numberOptions: {
        exclusiveMaximum: 100,
        exclusiveMinimum: 0,
        isFloat: false,
      },
      scalarType: 'integer',
    },
  ])('should extract $scalarType scalar numeric options', ({
    fixtureFileName,
    numberOptions,
    scalarType,
  }) => {
    const [transitiveNode] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath(fixtureFileName),
      logger,
    });

    if (transitiveNode.type !== 'scalar') {
      throw new Error('Expected a scalar transitive node.');
    }

    expect(transitiveNode.scalarType).toBe(scalarType);
    expect(transitiveNode.numberOptions).toEqual(numberOptions);
    expect(logsCollection).toHaveLength(0);
  });

  it('should extract and deduplicate a schema range of values', () => {
    const [transitiveNode] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('range-values-status.json'),
      logger,
    });

    expect(transitiveNode).toMatchObject({
      rangeOfValues: ['archived', 'draft'],
      scalarType: 'string',
      type: 'scalar',
    });
    expect(logsCollection).toHaveLength(0);
  });

  it('should use an unknown node when range reprocessing returns null', () => {
    const [transitiveNode] = extractTransitiveNodesFromSchema({
      convertors: [SchemaConvertorRangeOfValues],
      srcFilePath: getFixturePath('range-values-unknown.json'),
      logger,
    });

    expect(transitiveNode).toMatchObject({
      rangeOfValues: [
        { kind: 'manual' },
        ['legacy'],
      ],
      type: 'unknown',
    });
  });

  it('should extract a common array item schema', () => {
    const [transitiveNode] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('array-items-common.json'),
      logger,
    }) as [ArrayTransitiveNode];

    expect(transitiveNode.type).toBe('array');
    expect(transitiveNode.itemsInCommon).toMatchObject({
      scalarType: 'string',
      type: 'scalar',
    });
    expect(transitiveNode.nestedTransitiveNodes).toEqual([
      transitiveNode.itemsInCommon,
    ]);
    expect(transitiveNode.isFallbackType).toBeFalsy();
  });

  it('should mark an array with only length constraints as a fallback type', () => {
    const [transitiveNode] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('array-min-items-only.json'),
      logger,
    }) as [ArrayTransitiveNode];

    expect(transitiveNode.type).toBe('array');
    expect(transitiveNode.isFallbackType).toBe(true);
    expect(transitiveNode.itemsInCommon).toBeUndefined();
    expect(transitiveNode.minLength).toBe(2);
  });

  it('should preserve both array length bounds on the transitive node', () => {
    const [transitiveNode] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('array-shipment-length-bounds.json'),
      logger,
    }) as [ArrayTransitiveNode];

    expect(transitiveNode.type).toBe('array');
    expect(transitiveNode.minLength).toBe(3);
    expect(transitiveNode.maxLength).toBe(5);
    expect(transitiveNode.itemsInCommon).toMatchObject({
      scalarType: 'integer',
      type: 'scalar',
    });
  });

  it('should combine common items and unevaluated items into a union', () => {
    const [transitiveNode] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('array-items-and-unevaluated.json'),
      logger,
    }) as [ArrayTransitiveNode];

    if (transitiveNode.itemsInCommon?.type !== 'union') {
      throw new Error('Expected common array items to be a union.');
    }

    expect(transitiveNode.itemsInCommon.referredTransitiveNodes).toMatchObject([
      { scalarType: 'string', type: 'scalar' },
      { scalarType: 'number', type: 'scalar' },
    ]);
  });

  it('should put prefixItems before deprecated tuple items', () => {
    const [transitiveNode] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('array-prefix-and-items.json'),
      logger,
    }) as [ArrayTransitiveNode];

    expect(transitiveNode.itemsTuple).toMatchObject([
      { scalarType: 'string', type: 'scalar' },
      { scalarType: 'number', type: 'scalar' },
      { scalarType: 'boolean', type: 'scalar' },
    ]);
    expect(transitiveNode.restItemsInTuple).toBeUndefined();
  });

  it('should combine tuple rest item schemas into a union', () => {
    const [transitiveNode] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('array-prefix-and-rest.json'),
      logger,
    }) as [ArrayTransitiveNode];

    if (transitiveNode.restItemsInTuple?.type !== 'union') {
      throw new Error('Expected tuple rest items to be a union.');
    }

    expect(transitiveNode.itemsTuple).toMatchObject([
      { scalarType: 'string', type: 'scalar' },
      { scalarType: 'integer', type: 'scalar' },
    ]);
    expect(transitiveNode.restItemsInTuple.referredTransitiveNodes).toMatchObject([
      { scalarType: 'number', type: 'scalar' },
      { scalarType: 'boolean', type: 'scalar' },
    ]);
  });

  it('should use unknown for true unevaluatedItems', () => {
    const [transitiveNode] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('array-unevaluated-true.json'),
      logger,
    }) as [ArrayTransitiveNode];

    expect(transitiveNode.itemsInCommon).toMatchObject({
      type: 'unknown',
    });
    expect(transitiveNode.isFallbackType).toBe(true);
  });

  it('should clear the array conversion cache after each generation', () => {
    const firstResult = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('array-items-common.json'),
      logger,
    });

    const secondResult = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('array-items-common.json'),
      logger,
    });

    expect(secondResult[0]).not.toBe(firstResult[0]);
  });

  it.each([
    ['scalar-boolean.json', 'boolean'],
    ['scalar-null.json', 'null'],
  ])('should extract a %s scalar', (fixtureFileName, scalarType) => {
    const [transitiveNode] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath(fixtureFileName),
      logger,
    });

    expect(transitiveNode).toMatchObject({
      scalarType,
      type: 'scalar',
    });
    expect(logsCollection).toHaveLength(0);
  });

  it('should use schema guards to infer scalar and array types', () => {
    const [unionTransitiveNode] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('one-of-inferred-schema-types.json'),
      logger,
    }) as [UnionTransitiveNode];
    const variants = unionTransitiveNode.referredTransitiveNodes ?? [];

    expect(variants.map((variant) => variant.type)).toEqual([
      'scalar',
      'scalar',
      'scalar',
      'scalar',
      'scalar',
      'array',
    ]);
    expect(variants.slice(0, 5).map((variant) => (
      variant.type === 'scalar' ? variant.scalarType : undefined
    ))).toEqual([
      'boolean',
      'integer',
      'number',
      'null',
      'string',
    ]);
    expect(variants[5]).toMatchObject({
      itemsInCommon: {
        scalarType: 'string',
        type: 'scalar',
      },
      type: 'array',
    });
  });

  it('should extract every type of a variative schema into a union', () => {
    const [unionTransitiveNode] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('variative-nullable-email.json'),
      logger,
    }) as [UnionTransitiveNode];

    expect(unionTransitiveNode).toMatchObject({
      isVariativeSchema: true,
      mixin: null,
      type: 'union',
    });
    expect(unionTransitiveNode.referredTransitiveNodes).toMatchObject([
      {
        scalarType: 'null',
        type: 'scalar',
      },
      {
        scalarType: 'string',
        type: 'scalar',
      },
    ]);
  });

  it('should delegate variative schemas to every supported convertor', () => {
    const [unionTransitiveNode] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('variative-all-supported-types.json'),
      logger,
    }) as [UnionTransitiveNode];

    const referredTransitiveNodes = unionTransitiveNode.referredTransitiveNodes
      ?? [];

    expect(referredTransitiveNodes.map((transitiveNode) => (
      transitiveNode.type === 'scalar'
        ? `${transitiveNode.type}:${transitiveNode.scalarType}`
        : transitiveNode.type
    ))).toEqual([
      'array',
      'scalar:boolean',
      'scalar:number',
      'scalar:null',
      'scalar:string',
      'structure',
    ]);
  });

  it('should extract exclusive oneOf variants and common object properties', () => {
    const [unionTransitiveNode] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('one-of-object-with-mixin.json'),
      logger,
    }) as [UnionTransitiveNode];

    const mixin = unionTransitiveNode.mixin as StructureTransitiveNode;
    const variants = unionTransitiveNode
      .referredTransitiveNodes as StructureTransitiveNode[];

    expect(unionTransitiveNode.type).toBe('union');
    expect(unionTransitiveNode.isExclusive).toBe(true);
    expect(variants).toHaveLength(2);
    expect(variants[0].source.jsonPath).toEqual(['oneOf', '0']);
    expect(variants[0].properties).toHaveProperty('propertyOfInlineType');
    expect(variants[1].source.jsonPath).toEqual(['oneOf', '1']);
    expect(variants[1].properties).toHaveProperty('anotherPropertyOfInlineType');
    expect(mixin.source.jsonPath).toEqual([]);
    expect(mixin.properties).toHaveProperty('mixinProp');
  });

  it('should extract non-exclusive anyOf variants and common object properties', () => {
    const [unionTransitiveNode] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('any-of-object-with-mixin.json'),
      logger,
    }) as [UnionTransitiveNode];

    const mixin = unionTransitiveNode.mixin as StructureTransitiveNode;
    const variants = unionTransitiveNode
      .referredTransitiveNodes as StructureTransitiveNode[];

    expect(unionTransitiveNode.type).toBe('union');
    expect(unionTransitiveNode.isExclusive).toBeUndefined();
    expect(variants).toHaveLength(2);
    expect(variants[0].source.jsonPath).toEqual(['anyOf', '0']);
    expect(variants[0].properties).toHaveProperty('email');
    expect(variants[1].source.jsonPath).toEqual(['anyOf', '1']);
    expect(variants[1].properties).toHaveProperty('phone');
    expect(mixin.source.jsonPath).toEqual([]);
    expect(mixin.properties).toHaveProperty('mixinProp');
  });

  it('should apply a required-only object schema to each oneOf variant', () => {
    const [unionTransitiveNode] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('one-of-delivery-destination.json'),
      logger,
    }) as [UnionTransitiveNode];

    expect(unionTransitiveNode.mixin).toBeNull();
    expect(unionTransitiveNode.referredTransitiveNodes).toMatchObject([
      {
        properties: {
          kind: { isRequired: true },
          destination: { isRequired: true },
        },
        type: 'structure',
      },
      {
        properties: {
          kind: { isRequired: true },
          destination: { isRequired: true },
        },
        type: 'structure',
      },
    ]);
  });

  it('should merge non-significant string constraints into oneOf variants', () => {
    const [unionTransitiveNode] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('one-of-prefixed-code.json'),
      logger,
    }) as [UnionTransitiveNode];

    expect(unionTransitiveNode.mixin).toBeNull();
    expect(unionTransitiveNode.referredTransitiveNodes).toMatchObject([
      {
        scalarType: 'string',
        stringOptions: { minLength: 5, pattern: /^ADM/ },
        type: 'scalar',
      },
      {
        scalarType: 'string',
        stringOptions: { minLength: 3, pattern: /^USR/ },
        type: 'scalar',
      },
    ]);
  });

  it('should apply a length-only array schema to anyOf item variants', () => {
    const [unionTransitiveNode] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('any-of-collection-items.json'),
      logger,
    }) as [UnionTransitiveNode];

    expect(unionTransitiveNode.mixin).toBeNull();
    expect(unionTransitiveNode.referredTransitiveNodes).toMatchObject([
      {
        itemsInCommon: { scalarType: 'string', type: 'scalar' },
        type: 'array',
      },
      {
        itemsInCommon: { scalarType: 'number', type: 'scalar' },
        type: 'array',
      },
    ]);
  });

  it('should extract allOf variants and common object properties', () => {
    const [intersectionTransitiveNode] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('all-of-object-with-mixin.json'),
      logger,
    }) as [IntersectionTransitiveNode];

    const mixin = intersectionTransitiveNode.mixin as StructureTransitiveNode;
    const variants = intersectionTransitiveNode
      .referredTransitiveNodes as StructureTransitiveNode[];

    expect(intersectionTransitiveNode.type).toBe('intersection');
    expect(variants).toHaveLength(2);
    expect(variants[0].source.jsonPath).toEqual(['allOf', '0']);
    expect(variants[0].properties).toHaveProperty('email');
    expect(variants[1].source.jsonPath).toEqual(['allOf', '1']);
    expect(variants[1].properties).toHaveProperty('phone');
    expect(mixin.source.jsonPath).toEqual([]);
    expect(mixin.properties).toHaveProperty('mixinProp');
  });

  it('should fall back to unknown for an unsupported oneOf variant', () => {
    const [unionTransitiveNode] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('one-of-object-with-invalid-variant.json'),
      logger,
    }) as [UnionTransitiveNode];

    const variants = unionTransitiveNode.referredTransitiveNodes ?? [];

    expect(variants[0].type).toBe('structure');
    expect(variants[1].type).toBe('unknown');
    expect(findInLogs(logsCollection, 'oneOf.1')).toBeTruthy();
  });

  it('should clear oneOf conversion cache after each generation', async () => {
    const firstResult = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('one-of-object-with-mixin.json'),
      logger,
    });

    await Promise.resolve();

    const secondResult = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('one-of-object-with-mixin.json'),
      logger,
    });

    expect(secondResult[0]).not.toBe(firstResult[0]);
  });

  it.each([
    'ref-required-through-empty-bases.json',
    'ref-required-recursive-base.json',
  ])('should retain inherited required property types in %s', (fixtureFileName) => {
    const [mainTransitiveNode] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath(fixtureFileName),
      logger,
    }) as [RefTransitiveNode];

    const mixin = mainTransitiveNode.mixin as StructureTransitiveNode;
    const meta = mixin.properties?.['meta'] as RefTransitiveNode;

    expect(meta.type).toBe('reference');
    expect(meta.ref.suggestedName).toBe('Meta');
    expect(meta.isRequired).toBe(true);
    expect(meta.source.jsonPath).toEqual(['$defs', 'Base', 'properties', 'meta']);
    expect(mixin.properties?.['missing'].type).toBe('unknown');
    expect(mixin.properties?.['missing'].isRequired).toBe(true);
  });

  it('should preserve the nearest inherited property and its required flag', () => {
    const [mainTransitiveNode] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('ref-required-through-empty-bases.json'),
      logger,
    }) as [RefTransitiveNode];

    const mixin = mainTransitiveNode.mixin as StructureTransitiveNode;
    const overridden = mixin.properties?.['overridden'] as RefTransitiveNode;
    const derived = mainTransitiveNode.ref as RefTransitiveNode;
    const derivedMixin = derived.mixin as StructureTransitiveNode;

    expect(overridden.ref.suggestedName).toBe('DerivedValue');
    expect(overridden.isRequired).toBe(true);
    expect(derivedMixin.properties?.['overridden'].isRequired).toBe(false);
  });

  describe('nested schema references', () => {
    it('should preserve references and mixins excluded from standalone results', () => {
      const transitiveNodes = extractTransitiveNodesFromSchema({
        logger,
        srcFilePath: getFixturePath(
          'object-nested-refs.json',
        ),
      });
      const [rootNode] = transitiveNodes as [StructureTransitiveNode];
      const baseNode = transitiveNodes.find(({ suggestedName }) => (
        suggestedName === 'Base'
      ));

      const patternNode = rootNode.propertyPatterns?.[0][1] as RefTransitiveNode;
      const additionalNode = rootNode.additionalProperties as RefTransitiveNode;

      expect(baseNode).toMatchObject({
        type: 'structure',
        properties: { meta: { type: 'unknown' } },
      });
      expect(patternNode).toMatchObject({
        type: 'reference',
        isInline: true,
        isExcludedFromResult: true,
        mixin: {
          type: 'structure',
          properties: { payload: { type: 'unknown' } },
          referredTransitiveNodes: [baseNode],
        },
      });
      expect(patternNode.ref).toBe(baseNode);
      expect(additionalNode).toMatchObject({
        type: 'reference',
        isInline: true,
        isExcludedFromResult: true,
        mixin: null,
      });
      expect(additionalNode.ref).toBe(baseNode);
      expect(transitiveNodes).toEqual([rootNode, baseNode]);
    });
  });
});

describe('OpenAPI 3 transitive nodes', () => {
  let logger: Logger;
  let logsCollection: string[];

  beforeEach(() => {
    logsCollection = [];
    logger = createTestingLogger(logsCollection);
  });

  function extractFixture(name: string): TransitiveNode[] {
    return extractTransitiveNodesFromSchema({
      jsoncTextData: loadFixtureFile(name),
      logger,
      srcFileId: name,
    });
  }

  it('creates named entrypoints and nested content from 1Password Connect', () => {
    const nodes = extractFixture('oas3-onepassword-connect.json');
    const document = getDocument(nodes);
    const createItem = document.entrypoints.find((entrypoint) => (
      entrypoint.suggestedName === 'ItemsCreateNewItem'
    ));

    expect(document.suggestedName).toBe('Api1PasswordConnect');
    expect(document.entrypoints).toHaveLength(15);
    expect(document.nestedTransitiveNodes).toEqual(document.entrypoints);
    expect(createItem).toMatchObject({
      method: 'post',
      operationId: 'Items_createNewItem',
      breadcrumbs: ['Items', 'createNewItem'],
      originalTags: ['Items'],
      path: '/vaults/{vaultUuid}/items',
      tags: ['Items'],
      pathParameters: {
        properties: { vaultUuid: { isRequired: true, type: 'scalar' } },
      },
      request: {
        content: {
          subTypes: { 'application/json': { type: 'reference' } },
        },
      },
      response: {
        content: {
          subTypes: { 200: {
            subTypes: { 'application/json': { type: 'reference' } },
          } },
        },
      },
    });

    expect(createItem?.response?.content?.subTypes['200']?.suggestedName)
      .toBeUndefined();
    expect(createItem?.response?.content?.subTypes['200']
      ?.subTypes['application/json']?.suggestedName).toBeUndefined();
    expect(createItem?.request?.content?.nestedTransitiveNodes).toHaveLength(1);
  });

  it('uses the source filename when an OpenAPI document has no title', () => {
    const nodes = extractTransitiveNodesFromSchema({
      jsoncTextData: JSON.stringify({
        openapi: '3.0.3',
        info: { version: '1.0.0' },
        paths: {
          '/ping': {
            get: {
              operationId: 'getPing',
              responses: { 200: { description: 'OK' } },
            },
          },
        },
      }),
      logger,
      srcFileId: 'oas3-title-absent.json',
    });

    const document = getDocument(nodes);

    expect(document.suggestedName).toBe('Oas3TitleAbsent');
    expect(document.entrypoints).toHaveLength(1);
  });

  it('uses stable method-and-path names when operationId is missing', () => {
    const nodes = extractFixture('oas3-storefront.json');
    const document = getDocument(nodes);
    const product = document.entrypoints.find((entrypoint) => (
      entrypoint.path === '/products/{id}'
    ));

    expect(document.suggestedName).toBe('ECommerceApi');
    expect(document.entrypoints).toHaveLength(11);
    expect(product?.suggestedName).toBe('GetProductsId');
    expect(product?.operationId).toBeUndefined();
    expect(product?.pathParameters?.properties?.['id']).toMatchObject({
      isRequired: true,
    });
    expect(findInLogs(logsCollection, 'has no operationId')).toBeTruthy();
  });

  it('converts OpenAPI 3.2 QUERY operations', () => {
    const schema = {
      openapi: '3.2.0',
      info: { title: 'Search API', version: '1.0.0' },
      paths: {
        '/search': {
          query: {
            operationId: 'searchItems',
            responses: { 200: { description: 'Search results' } },
          },
        },
      },
    };

    const nodes = extractTransitiveNodesFromSchema({
      jsoncTextData: JSON.stringify(schema),
      logger,
      srcFileId: 'search-api.json',
    });

    expect(getDocument(nodes).entrypoints).toMatchObject([{
      method: 'query',
      path: '/search',
      suggestedName: 'SearchItems',
    }]);
  });

  it('converts OpenAPI 3.2 additional operations', () => {
    const schema = {
      openapi: '3.2.0',
      info: { title: 'Document API', version: '1.0.0' },
      paths: {
        '/documents/{id}': {
          parameters: [{
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          }],
          get: {
            operationId: 'getDocument',
            responses: { 200: { description: 'Document' } },
          },
          additionalOperations: {
            LINK: {
              operationId: 'linkDocuments',
              requestBody: {
                content: {
                  'application/json': {
                    schema: { type: 'object' },
                  },
                },
              },
              responses: { 204: { description: 'Linked' } },
            },
          },
        },
      },
    };

    const nodes = extractTransitiveNodesFromSchema({
      jsoncTextData: JSON.stringify(schema),
      logger,
      srcFileId: 'document-api.json',
    });

    expect(getDocument(nodes).entrypoints).toMatchObject([
      { method: 'get', suggestedName: 'GetDocument' },
      {
        method: 'LINK',
        path: '/documents/{id}',
        suggestedName: 'LinkDocuments',
        pathParameters: {
          properties: { id: { isRequired: true, type: 'scalar' } },
        },
        request: {
          content: {
            subTypes: { 'application/json': { type: 'structure' } },
          },
        },
      },
    ]);
  });

  it('keeps operation ID breadcrumbs separate from source tags', () => {
    const fixture = JSON.parse(loadFixtureFile('oas3-storefront.json'));
    const operation = fixture.paths['/products'].get;

    operation.operationId = 'catalog/products/list-products';
    operation.tags = ['Storefront'];
    operation.summary = 'List products';
    operation.title = 'Lower-priority title';

    const nodes = extractTransitiveNodesFromSchema({
      jsoncTextData: JSON.stringify(fixture),
      logger,
      srcFileId: 'storefront-with-operation-id.json',
    });

    const entrypoint = getDocument(nodes).entrypoints.find((node) => (
      node.path === '/products'
    ));

    expect(entrypoint).toMatchObject({
      suggestedName: 'CatalogProductsListProducts',
      breadcrumbs: ['catalog', 'products', 'list-products'],
      tags: ['Storefront'],
      originalTags: ['Storefront'],
      annotations: { title: 'List products' },
      response: {
        breadcrumbs: ['catalog', 'products', 'list-products'],
        tags: ['Storefront'],
      },
    });
  });

  it('splits operation ID punctuation according to case and adjacent digits', () => {
    const operationIds = [
      ['/hyphen', 'actions/delete-artifact'],
      ['/underscore', 'actions.delete_request'],
      ['/uppercase', 'admin/Remove-Artifact'],
      ['/digit', 'actions/delete2-artifact'],
      ['/digit-prefix', 'actions/2alpha-artifact'],
      ['/separated-digit', 'actions/2-delete_artifact'],
      ['/punctuation', 'actions:delete_artifact.final'],
    ] as const;

    const schema = {
      openapi: '3.1.0',
      info: { title: 'Operation IDs', version: '1.0.0' },
      paths: Object.fromEntries(operationIds.map(([path, operationId]) => (
        [path, {
          get: {
            operationId,
            responses: { 200: { description: 'OK' } },
          },
        }]
      ))),
    };

    const nodes = extractTransitiveNodesFromSchema({
      jsoncTextData: JSON.stringify(schema),
      logger,
      srcFileId: 'operation-id-separators.json',
    });

    expect(getDocument(nodes).entrypoints.map(({ breadcrumbs }) => breadcrumbs))
      .toEqual([
        ['actions', 'delete-artifact'],
        ['actions', 'delete_request'],
        ['admin', 'Remove', 'Artifact'],
        ['actions', 'delete2', 'artifact'],
        ['actions', '2alpha', 'artifact'],
        ['actions', '2-delete_artifact'],
        ['actions', 'delete_artifact', 'final'],
      ]);
  });

  it('keeps slash-delimited operation domains distinct in names', () => {
    const schema = {
      openapi: '3.1.0',
      info: { title: 'Operations API', version: '1.0.0' },
      paths: {
        '/products': {
          get: {
            operationId: 'products/list',
            responses: { 200: { description: 'Products' } },
          },
        },
        '/users': {
          get: {
            operationId: 'users/list',
            responses: { 200: { description: 'Users' } },
          },
        },
      },
    };

    const nodes = extractTransitiveNodesFromSchema({
      jsoncTextData: JSON.stringify(schema),
      logger,
      srcFileId: 'operations-api.json',
    });
    const entrypoints = getDocument(nodes).entrypoints;

    expect(entrypoints.map(({ suggestedName }) => suggestedName))
      .toEqual(['ProductsList', 'UsersList']);
    expect(entrypoints.map(({ tags }) => tags))
      .toEqual([[], []]);
    expect(entrypoints.map(({ breadcrumbs }) => breadcrumbs))
      .toEqual([['products', 'list'], ['users', 'list']]);
  });

  it('keeps response headers by status and merges request headers', () => {
    const schema = {
      openapi: '3.1.0',
      info: { title: 'Header API', version: '1.0.0' },
      paths: {
        '/items': {
          get: {
            operationId: 'getItems',
            parameters: [{
              in: 'header',
              name: 'X-Trace',
              schema: { type: 'string' },
            }],
            responses: {
              200: {
                description: 'OK',
                headers: {
                  'X-Limit': { schema: { type: 'integer' } },
                },
              },
              429: {
                description: 'Rate limited',
                headers: {
                  'X-Limit': { schema: { type: 'string' } },
                  'Retry-After': { schema: { type: 'integer' } },
                },
              },
              503: {
                description: 'Unavailable',
                headers: {
                  'X-Limit': { schema: { type: 'string' } },
                },
              },
              default: {
                description: 'Unexpected error',
                headers: {
                  'X-Fallback': { schema: { type: 'boolean' } },
                },
              },
            },
          },
        },
      },
    };

    const nodes = extractTransitiveNodesFromSchema({
      jsoncTextData: JSON.stringify(schema),
      logger,
      srcFileId: 'headers.json',
    });
    const [entrypoint] = getDocument(nodes).entrypoints;

    expect(entrypoint.request?.headers?.properties?.['X-Trace']).toMatchObject({
      type: 'scalar',
    });
    expect(entrypoint.response?.headers?.['200']?.properties?.['X-Limit'])
      .toMatchObject({ type: 'scalar', scalarType: 'integer' });
    expect(entrypoint.response?.headers?.['429']?.properties?.['X-Limit'])
      .toMatchObject({ type: 'scalar', scalarType: 'string' });
    expect(entrypoint.response?.headers?.['429']?.properties?.['Retry-After'])
      .toMatchObject({ type: 'scalar' });
    expect(entrypoint.response?.headers?.['200']?.properties?.['Retry-After'])
      .toBeUndefined();
    expect(entrypoint.response?.headers?.['503']?.properties?.['X-Limit'])
      .toMatchObject({ type: 'scalar', scalarType: 'string' });
    expect(entrypoint.response?.headers?.['default']?.properties?.['X-Fallback'])
      .toMatchObject({ type: 'scalar', scalarType: 'boolean' });
    expect(entrypoint.response?.headerRecord).toMatchObject({
      statuses: ['200', '429', '503', 'default'],
      suggestedName: 'ResponseHeadersGetItems',
      type: 'responseHeadersRecord',
    });
    expect(entrypoint.response?.headerRecord?.nestedTransitiveNodes)
      .toHaveLength(4);
    expect(entrypoint.response?.nestedTransitiveNodes).toHaveLength(1);
  });

  it('logs and skips malformed OpenAPI response headers', () => {
    const schema = {
      openapi: '3.1.0',
      info: { title: 'Headers API', version: '1.0.0' },
      paths: {
        '/items': {
          get: {
            operationId: 'getItems',
            responses: {
              200: { description: 'OK', headers: 'invalid' },
            },
          },
        },
      },
    };

    const nodes = extractTransitiveNodesFromSchema({
      jsoncTextData: JSON.stringify(schema),
      logger,
      srcFileId: 'malformed-response-headers.json',
    });
    const [entrypoint] = getDocument(nodes).entrypoints;

    expect(entrypoint.response?.headers).toBeUndefined();

    const warning = findInLogs(logsCollection, 'Skipped malformed OpenAPI headers map.');

    expect(warning).toBeTruthy();
  });

  it.each(['3.0.3', '3.1.0'])(
    'merges direct request headers with header parameters in OpenAPI %s',
    (version) => {
      const schema = {
        openapi: version,
        info: { title: 'Headers API', version: '1.0.0' },
        paths: {
          '/items': {
            post: {
              operationId: 'createItem',
              parameters: [{
                in: 'header',
                name: 'X-Trace',
                schema: { type: 'string' },
              }],
              requestBody: {
                content: { 'application/json': { schema: { type: 'object' } } },
                headers: { 'X-Client': { schema: { type: 'integer' } } },
              },
              responses: { 204: { description: 'Created' } },
            },
          },
        },
      };

      const nodes = extractTransitiveNodesFromSchema({
        jsoncTextData: JSON.stringify(schema),
        logger,
        srcFileId: `request-headers-${version}.json`,
      });
      const [entrypoint] = getDocument(nodes).entrypoints;

      expect(entrypoint.request?.headers?.properties).toMatchObject({
        'X-Trace': { type: 'scalar' },
        'X-Client': { type: 'scalar' },
      });
    },
  );

  it('keeps a usable fallback for content without a schema', () => {
    const schema = {
      openapi: '3.1.0',
      info: { title: 'Content API', version: '1.0.0' },
      paths: {
        '/items': {
          get: {
            operationId: 'listItems',
            responses: {
              200: {
                description: 'OK',
                content: { 'application/json': {} },
              },
            },
          },
        },
      },
    };

    const nodes = extractTransitiveNodesFromSchema({
      jsoncTextData: JSON.stringify(schema),
      logger,
      srcFileId: 'content-without-schema.json',
    });
    const [entrypoint] = getDocument(nodes).entrypoints;

    expect(entrypoint.response?.content?.subTypes['200']
      ?.subTypes['application/json']).toMatchObject({ type: 'unknown' });
    expect(findInLogs(logsCollection, 'has no schema; used unknown')).toBeTruthy();
  });

  it('resolves local parameter, request, and response references', () => {
    const schema = {
      openapi: '3.1.0',
      info: { title: 'Items API', version: '1.0.0' },
      components: {
        parameters: {
          ItemId: {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        },
        requestBodies: {
          ItemInput: {
            content: { 'application/json': { schema: { type: 'string' } } },
          },
        },
        responses: {
          Created: {
            description: 'Created',
            content: { 'application/json': { schema: { type: 'string' } } },
          },
        },
      },
      paths: {
        '/items/{id}': {
          parameters: [{ $ref: '#/components/parameters/ItemId' }],
          post: {
            operationId: 'createItem',
            requestBody: { $ref: '#/components/requestBodies/ItemInput' },
            responses: {
              201: { $ref: '#/components/responses/Created' },
            },
          },
        },
      },
    };

    const nodes = extractTransitiveNodesFromSchema({
      jsoncTextData: JSON.stringify(schema),
      logger,
      srcFileId: 'local-openapi-references.json',
    });
    const [entrypoint] = getDocument(nodes).entrypoints;

    expect(entrypoint.pathParameters?.properties?.['id']).toMatchObject({
      isRequired: true,
      type: 'scalar',
    });
    expect(entrypoint.request?.content?.subTypes['application/json'])
      .toMatchObject({ type: 'scalar' });
    expect(entrypoint.response?.content?.subTypes['201']
      ?.subTypes['application/json']).toMatchObject({ type: 'scalar' });
  });

  it('retains an entrypoint when an external response is unsupported', () => {
    const schema = {
      openapi: '3.1.0',
      info: { title: 'External API', version: '1.0.0' },
      paths: {
        '/items': {
          get: {
            operationId: 'listItems',
            responses: { 200: { $ref: 'other.json#/responses/Items' } },
          },
        },
      },
    };

    const nodes = extractTransitiveNodesFromSchema({
      jsoncTextData: JSON.stringify(schema),
      logger,
      srcFileId: 'external-openapi-reference.json',
    });
    const [entrypoint] = getDocument(nodes).entrypoints;

    expect(entrypoint.response).toMatchObject({ type: 'responseRecord' });
    expect(entrypoint.response?.content).toBeUndefined();
    expect(findInLogs(logsCollection, 'unsupported OpenAPI response')).toBeTruthy();
  });

  it('skips invalid operations and reports their path', () => {
    const schema = {
      openapi: '3.1.0',
      info: { title: 'Invalid API', version: '1.0.0' },
      paths: {
        '/broken': {
          get: { responses: { 200: { content: {} } } },
        },
      },
    };

    const nodes = extractTransitiveNodesFromSchema({
      jsoncTextData: JSON.stringify(schema),
      logger,
      srcFileId: 'invalid-operation.json',
    });

    expect(getDocument(nodes).entrypoints).toEqual([]);
    expect(findInLogs(logsCollection, 'Skipped OpenAPI path')).toBeTruthy();
  });
});

describe('dependentRequired schema conversion', () => {
  let logger: Logger;
  let logsCollection: string[];

  beforeEach(() => {
    logsCollection = [];
    logger = createTestingLogger(logsCollection);
  });

  function extractPayment(overrides: Record<string, unknown> = {}): TransitiveNode[] {
    const schema: SchemaObject = JSON.parse(loadFixtureFile(
      'dependent-required-payment.json',
    ));

    return extractTransitiveNodesFromSchema({
      jsoncTextData: JSON.stringify({ ...schema, ...overrides }),
      srcFileId: 'dependent-required-payment.json',
      logger,
    });
  }

  it('should create independent dependency variants before structure conversion', () => {
    const [node] = extractPayment();

    expect(node).toMatchObject({ type: 'union', mixin: null });

    if (node.type !== 'union') {
      throw new Error('Expected a dependentRequired union');
    }

    const variants = node.referredTransitiveNodes ?? [];

    expect(variants).toHaveLength(3);
    expect(node.isExclusive).toBeUndefined();
    expect(variants).toMatchObject([
      {
        type: 'structure',
        additionalProperties: false,
        properties: {
          customerId: { isRequired: true, scalarType: 'string' },
          cardToken: { isRequired: false, scalarType: 'string' },
          billingAddress: { isRequired: false, scalarType: 'string' },
          bankAccount: { isRequired: false, scalarType: 'string' },
        },
      },
      {
        type: 'structure',
        additionalProperties: false,
        properties: {
          customerId: { isRequired: true, scalarType: 'string' },
          cardToken: { isRequired: true, scalarType: 'string' },
          billingAddress: { isRequired: true, scalarType: 'string' },
          bankAccount: { isRequired: false, scalarType: 'string' },
        },
      },
      {
        type: 'structure',
        properties: {
          customerId: { isRequired: true },
          cardToken: { isRequired: false },
          billingAddress: { isRequired: true },
          bankAccount: { isRequired: true },
        },
      },
    ]);

    variants.forEach((variant) => {
      expect(variant.isInline).toBe(true);
      expect(variant.isExcludedFromResult).toBe(true);
      expect(variant.referredBy?.[0]).toBe(node);

      if (variant.type !== 'structure') {
        throw new Error('Expected a structure variant');
      }

      const properties = Object.values(variant.properties ?? {});

      expect(variant.nestedTransitiveNodes).toEqual(properties);
      properties.forEach((property) => {
        expect(property.nestedBy?.[0]).toBe(variant);
      });
    });
    expect(logsCollection).toHaveLength(0);
  });

  it('should add missing trigger and dependent properties as required unknowns', () => {
    const [node] = extractPayment({ properties: {} });

    expect(node).toMatchObject({
      type: 'union',
      referredTransitiveNodes: [
        {
          properties: {
            customerId: { type: 'unknown', isRequired: true },
          },
        },
        {
          properties: {
            cardToken: { type: 'unknown', isRequired: true },
            billingAddress: { type: 'unknown', isRequired: true },
          },
        },
        {
          properties: {
            bankAccount: { type: 'unknown', isRequired: true },
            billingAddress: { type: 'unknown', isRequired: true },
          },
        },
      ],
    });
    expect(findInLogs(
      logsCollection,
      'Missing dependentRequired property "cardToken"',
    )).toBeTruthy();
    expect(findInLogs(
      logsCollection,
      'Missing dependentRequired property "billingAddress"',
    ))
      .toBeTruthy();
  });

  it.each([
    ['required trigger', ['cardToken'], { cardToken: ['billingAddress'] }],
    ['required dependencies', ['billingAddress'], { cardToken: ['billingAddress'] }],
    ['empty dependency list', [], { cardToken: [] }],
    ['empty record', [], {}],
  ])('should keep the original structure for %s', (_, required, dependentRequired) => {
    const [node] = extractPayment({ required, dependentRequired });

    expect(node.type).toBe('structure');
    expect(node.isExcludedFromResult).toBeUndefined();
    expect(node.isInline).toBeUndefined();
    expect(findInLogs(logsCollection, 'no applicable dependency variants')).toBeTruthy();
  });

  it('should keep applicable pairs when another trigger is already required', () => {
    const [node] = extractPayment({ required: ['customerId', 'cardToken'] });

    expect(node).toMatchObject({
      type: 'union',
      referredTransitiveNodes: [{
        properties: {
          cardToken: { isRequired: true },
          billingAddress: { isRequired: false },
          bankAccount: { isRequired: false },
        },
      }, {
        properties: {
          cardToken: { isRequired: true },
          billingAddress: { isRequired: true },
          bankAccount: { isRequired: true },
        },
      }],
    });
  });

  it('should create a variant when only some dependencies are already required', () => {
    const [node] = extractPayment({
      required: ['customerId', 'billingAddress'],
      dependentRequired: { cardToken: ['billingAddress', 'bankAccount', 'bankAccount'] },
    });

    expect(node).toMatchObject({
      type: 'union',
      referredTransitiveNodes: [{
        properties: {
          customerId: { isRequired: true },
          cardToken: { isRequired: false },
          billingAddress: { isRequired: true },
          bankAccount: { isRequired: false },
        },
      }, {
        properties: {
          cardToken: { isRequired: true },
          billingAddress: { isRequired: true },
          bankAccount: { isRequired: true },
        },
      }],
    });
  });

  it.each([
    null,
    false,
    42,
    'cardToken',
    [],
    { cardToken: 'billingAddress' },
    { cardToken: [42] },
    { cardToken: ['billingAddress', null] },
    { cardToken: ['billingAddress'], bankAccount: false },
  ])('should warn and ignore malformed dependentRequired %p', (dependentRequired) => {
    const [node] = extractPayment({ dependentRequired });

    expect(node).toMatchObject({
      type: 'structure',
      properties: { cardToken: { isRequired: false } },
    });
    expect(findInLogs(
      logsCollection,
      'expected an object schema and a record of string arrays',
    ))
      .toBeTruthy();
  });

  it('should ignore schemas without dependentRequired without warning', () => {
    const [node] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('scalar-string-pattern.json'),
      convertors: [SchemaConvertorDependentRequired],
      logger,
    });

    expect(node).toBeUndefined();
    expect(findInLogs(logsCollection, 'dependentRequired')).toBeUndefined();
  });

  it('should warn and reject dependentRequired on a non-object schema', () => {
    const nodes = extractTransitiveNodesFromSchema({
      jsoncTextData: JSON.stringify({
        type: 'boolean',
        dependentRequired: { cardToken: ['billingAddress'] },
      }),
      srcFileId: 'dependent-required-invalid-type.json',
      convertors: [SchemaConvertorDependentRequired],
      logger,
    });

    expect(nodes).toEqual([]);
    expect(findInLogs(logsCollection, 'expected an object schema')).toBeTruthy();
  });

  it('should warn when nested conversion cannot produce a structure', () => {
    const nodes = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('dependent-required-payment.json'),
      convertors: [SchemaConvertorDependentRequired],
      logger,
    });

    expect(nodes).toEqual([]);
    expect(findInLogs(
      logsCollection,
      'nested conversion did not produce a structure',
    )).toBeTruthy();
  });

  it('should not reuse dependency variants across generations of the same source', () => {
    const [first] = extractPayment();
    const [second] = extractPayment({ dependentRequired: {} });

    expect(first.type).toBe('union');
    expect(second.type).toBe('structure');
    expect(second).not.toBe(first);
  });
});

describe('schema annotation conversion', () => {
  let logger: Logger;
  let logsCollection: string[];

  beforeEach(() => {
    logsCollection = [];
    logger = createTestingLogger(logsCollection);
  });

  it('should collect all supported annotations on an object and its property', () => {
    const [node] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('annotated-customer.json'),
      logger,
    });

    expect(node).toMatchObject({
      type: 'structure',
      suggestedName: 'CustomerRecord',
      annotations: {
        comment: 'Internal customer record used for account reconciliation.',
        default: { customerId: 'guest' },
        deprecated: false,
        description: 'Contact details for an account holder.',
        examples: [{ customerId: 'customer-42' }],
        readOnly: true,
        title: 'Customer record',
        writeOnly: false,
      },
      properties: {
        customerId: {
          type: 'scalar',
          annotations: {
            default: 'guest',
            description: 'Stable account identifier.',
            examples: ['customer-42'],
            readOnly: true,
            title: 'Customer identifier',
          },
        },
      },
    });
    expect(node).not.toHaveProperty('description');
    expect(node).not.toHaveProperty('title');
    expect(node.annotations).not.toHaveProperty('$comment');
    expect(logsCollection).toHaveLength(0);
  });

  it.each([
    ['string', { type: 'string' }, 'scalar'],
    ['number', { type: 'number' }, 'scalar'],
    ['boolean', { type: 'boolean' }, 'scalar'],
    ['null', { type: 'null' }, 'scalar'],
    ['array', { type: 'array', items: { type: 'string' } }, 'array'],
    ['object', { type: 'object', properties: { name: { type: 'string' } } }, 'structure'],
  ])('should annotate a %s schema without changing its node type', (
    _, schema, expectedType,
  ) => {
    const [node] = extractTransitiveNodesFromSchema({
      jsoncTextData: JSON.stringify({
        ...schema,
        title: 'Annotated value',
        default: null,
        examples: [],
      }),
      srcFileId: 'annotated-value.json',
      logger,
    });

    expect(node.type).toBe(expectedType);
    expect(node.annotations).toEqual({
      default: null,
      examples: [],
      title: 'Annotated value',
    });
  });

  it('should annotate a combined schema and its nested variant independently', () => {
    const [node] = extractTransitiveNodesFromSchema({
      jsoncTextData: JSON.stringify({
        title: 'Contact channel',
        oneOf: [
          { type: 'string', description: 'Email address' },
          { type: 'number', description: 'Numeric extension' },
        ],
      }),
      srcFileId: 'annotated-choice.json',
      logger,
    });

    expect(node).toMatchObject({
      type: 'union',
      annotations: { title: 'Contact channel' },
      referredTransitiveNodes: [
        { annotations: { description: 'Email address' }, scalarType: 'string' },
        { annotations: { description: 'Numeric extension' }, scalarType: 'number' },
      ],
    });
  });

  it('should annotate a reference and its target independently', () => {
    const [node] = extractTransitiveNodesFromSchema({
      jsoncTextData: JSON.stringify({
        $defs: {
          Contact: { type: 'object', title: 'Contact details' },
        },
        $ref: '#/$defs/Contact',
        description: 'Reference to contact details.',
      }),
      srcFileId: 'annotated-reference.json',
      logger,
    });

    expect(node).toMatchObject({
      type: 'reference',
      annotations: { description: 'Reference to contact details.' },
      ref: { annotations: { title: 'Contact details' } },
    });
  });

  it('should annotate an unknown node when no type convertor accepts the schema', () => {
    const [node] = extractTransitiveNodesFromSchema({
      jsoncTextData: JSON.stringify({ title: 'Unspecified account detail' }),
      srcFileId: 'annotated-unknown.json',
      logger,
    });

    expect(node).toMatchObject({
      type: 'unknown',
      annotations: { title: 'Unspecified account detail' },
    });
    expect(findInLogs(
      logsCollection,
      'annotations were attached to an unknown transitive node',
    ))
      .toBeTruthy();
  });

  it('should ignore invalid annotation values and retain valid ones', () => {
    const [node] = extractTransitiveNodesFromSchema({
      jsoncTextData: JSON.stringify({
        type: 'string',
        title: 42,
        description: false,
        deprecated: 'yes',
        readOnly: 1,
        examples: 'example',
        writeOnly: true,
      }),
      srcFileId: 'invalid-annotations.json',
      logger,
    });

    expect(node.annotations).toEqual({ writeOnly: true });
    expect(logsCollection.filter((message) => (
      message.includes('Ignored invalid schema annotation')
    ))).toHaveLength(5);
  });

  it('should leave unannotated schemas without an annotations field', () => {
    const [node] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('scalar-string-pattern.json'),
      logger,
    });

    expect(node.annotations).toBeUndefined();
  });

  it('should attach a parsed negative schema to the original node', () => {
    const [node] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('not-string-enum.json'),
      logger,
    });

    expect(node).toMatchObject({
      type: 'scalar',
      scalarType: 'string',
      rangeOfValues: ['active', 'disabled'],
      not: [{ rangeOfValues: ['disabled'] }],
    });
  });

  it('should ignore a fallback negative schema', () => {
    const [node] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('not-fallback-child.json'),
      logger,
    });

    expect(node).toMatchObject({
      type: 'scalar',
      scalarType: 'string',
    });
    expect(node.not).toBeUndefined();
    expect(node.isExcludedFromResult).toBeUndefined();
    expect(findInLogs(logsCollection, 'Ignored not: nested conversion')).toBeTruthy();
  });

  it('should ignore an unknown negative schema', () => {
    const [node] = extractTransitiveNodesFromSchema({
      jsoncTextData: JSON.stringify({ type: 'string', not: {} }),
      srcFileId: 'not-unknown-child.json',
      logger,
    });

    expect(node.type).toBe('scalar');
    expect(node.not).toBeUndefined();
    expect(findInLogs(logsCollection, 'Ignored not: nested conversion')).toBeTruthy();
  });

  it('should warn about a malformed negative schema', () => {
    const [node] = extractTransitiveNodesFromSchema({
      jsoncTextData: JSON.stringify({ type: 'string', not: 7 }),
      srcFileId: 'not-invalid-child.json',
      logger,
    });

    expect(node.type).toBe('scalar');
    expect(node.not).toBeUndefined();
    expect(findInLogs(logsCollection, 'Ignored not: expected')).toBeTruthy();
  });

  it('should move allOf negative parts onto the intersection', () => {
    const [node] = extractTransitiveNodesFromSchema({
      srcFilePath: getFixturePath('not-all-of.json'),
      logger,
    });

    if (node.type !== 'intersection') {
      throw new Error('Expected an intersection transitive node.');
    }

    expect(node.referredTransitiveNodes).toHaveLength(1);
    expect(node.not).toMatchObject([
      { rangeOfValues: ['disabled'] },
    ]);
  });
});
