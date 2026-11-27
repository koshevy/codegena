/* eslint-disable max-len -- Raw TypeScript printer output is asserted verbatim. */
import { createTestingLogger, type Logger } from '@codegena/oas3-core/logger';

import {
  resetUltimateParser,
  setUltimateParserLogger,
} from '../__mocks__';
import { visitorRef } from './visitor-ref';
import { resetIdentifiers } from '../../misc-utils';
import { renderSchemaByFileName } from '../testing-utils';

const testState: {
  logger?: Logger;
  logsCollection: string[];
} = {
  logsCollection: [],
};

async function renderRefSchemaByFileName(
  fixtureFilePath: string,
  suggestedName?: string,
  isInline = false,
  shouldRenderAllTypes = false,
): Promise<string | undefined> {
  return renderSchemaByFileName({
    fixtureFilePath,
    isInline,
    logger: testState.logger,
    mainVisitor: visitorRef,
    renderAllTypes: shouldRenderAllTypes,
    suggestedName,
  });
}

function resetTestcase(): void {
  resetUltimateParser();
  resetIdentifiers();
  testState.logsCollection = [];
  testState.logger = createTestingLogger(testState.logsCollection);
  setUltimateParserLogger(testState.logger);
}

describe('visitor-ref default behavior', () => {
  beforeEach(() => {
    resetTestcase();
  });

  it('should resolve object with default name inferred from file name', async () => {
    const renderedType = await renderRefSchemaByFileName(
      'ref-object-to-object-with-properties-simple.json',
    );

    expect(renderedType).toContain(
      'interface RefObjectToObjectWithPropertiesSimple',
    );
  });
});

describe('visitor-ref dynamic anchors', () => {
  beforeEach(() => {
    resetTestcase();
  });

  it('should render an indexed dynamic anchor and its recursive reference', async () => {
    const renderedType = await renderRefSchemaByFileName(
      'dynamic-ref-product.jsonc',
      'ProductCatalog',
      false,
      true,
    );

    expect(renderedType).toBe(`export type ProductCatalog = Product;

export interface Product {
    status: "active" | "discontinued";
    related?: Product;
}`);
  });

  it('should retain a named declaration for an unconstrained dynamic anchor', async () => {
    const renderedType = await renderRefSchemaByFileName(
      'dynamic-ref-anchor-only.jsonc',
      'DynamicAnchorCatalog',
      false,
      true,
    );

    expect(renderedType).toBe(`export type DynamicAnchorCatalog = Payload;

export type Payload = unknown;`);
    expect(testState.logsCollection.some((message) => (
      message.includes('Anchor-only schema has no type constraints')
    ))).toBe(true);
  });

  it('should render a dynamic reference inline as its target name', async () => {
    const renderedType = await renderRefSchemaByFileName(
      'dynamic-ref-product.jsonc',
      'ProductCatalog',
      true,
    );

    expect(renderedType).toBe('Product');
  });
});

describe.each([
  false,
  true,
])('visitor-ref for objects when isInline=%s', (isInline) => {
  beforeEach(() => {
    resetTestcase();
  });

  it('should resolve ref from nope to object with properties', async () => {
    const suggestedName = 'TypeAliasingAnotherOne';
    const renderedType = await renderRefSchemaByFileName(
      'ref-nope-to-object-with-properties-simple.json',
      suggestedName,
      isInline,
    );

    if (isInline) {
      expect(renderedType).toBe(
        'FirstLevelDepthObjectType',
      );
    }
    else {
      expect(renderedType).toBe(
        `type ${suggestedName} = FirstLevelDepthObjectType;`,
      );
    }
  });

  it('should resolve ref from nope to object with pattern', async () => {
    const suggestedName = 'TypeAliasingAnotherOne';
    const renderedType = await renderRefSchemaByFileName(
      'ref-nope-to-object-with-pattern-simple.json',
      suggestedName,
      isInline,
    );

    if (isInline) {
      expect(renderedType).toBe(
        'FirstLevelDepthObjectTypeWitPatterns',
      );
    }
    else {
      expect(renderedType).toBe(
        `type ${suggestedName} = FirstLevelDepthObjectTypeWitPatterns;`,
      );
    }
  });

  it('should resolve simple ref from object to object', async () => {
    const suggestedName = 'InterfaceExtendingAnotherOne';
    const renderedType = await renderRefSchemaByFileName(
      'ref-object-to-object-with-properties-simple.json',
      suggestedName,
      isInline,
    );

    if (!isInline) {
      expect(renderedType).toBe(`export interface InterfaceExtendingAnotherOne extends FirstLevelDepthObjectType {
    mixinProperty: unknown;
}`);
    }
    else {
      expect(renderedType).toBe(
        `FirstLevelDepthObjectType & {
    mixinProperty: unknown;
}`,
      );
    }
  });

  it('should resolve simple ref from object to unknown', async () => {
    const suggestedName = 'InterfaceExtendingUnknown';
    const renderedType = await renderRefSchemaByFileName(
      'ref-object-with-properties-to-unknown.json',
      suggestedName,
      isInline,
    );

    if (isInline) {
      expect(renderedType).toBe(`Record<string, unknown> & {
    mixinProperty: unknown;
}`);
    }
    else {
      expect(renderedType).toBe(
        `export interface InterfaceExtendingUnknown extends Record<string, unknown> {
    mixinProperty: unknown;
}`,
      );
    }
  });

  it('should resolve ref object with patterns to another object', async () => {
    const suggestedName = 'ComplexObjectTypeIntersectionExtendingAnotherOne';
    const renderedType = await renderRefSchemaByFileName(
      'ref-object-with-patterns-to-object.json',
      suggestedName,
      isInline,
    );

    const expectedFullStatement = isInline
      ? `(Record<\`\${"LEFT" | "RIGHT"}_\${string}\`, unknown> & Record<\`EXT_\${string}\`, {
    catalog?: unknown;
}>) & FirstLevelDepthObjectType`
      : `export type ComplexObjectTypeIntersectionExtendingAnotherOne = (Record<\`\${"LEFT" | "RIGHT"}_\${string}\`, unknown> & Record<\`EXT_\${string}\`, {
    catalog?: unknown;
}>) & FirstLevelDepthObjectType;`;

    expect(renderedType).toBe(expectedFullStatement);
  });

  it('should resolve ref object with patterns to unknown', async () => {
    const suggestedName = 'ObjectTypeReferringAnotherOne';
    const renderedType = await renderRefSchemaByFileName(
      'ref-object-with-patterns-to-unknown.json',
      suggestedName,
      isInline,
    );

    const expectedFullStatement = isInline
      ? `Record<\`\${"l" | "r" | "c"}_\${string}\`, unknown> & Record<string, unknown>`
      : `export type ObjectTypeReferringAnotherOne = Record<\`\${"l" | "r" | "c"}_\${string}\`, unknown> & Record<string, unknown>;`;

    expect(renderedType).toBe(expectedFullStatement);
  });

  it('should resolve ref object with patterns and properties', async () => {
    const suggestedName = 'ObjectTypeReferringAnotherOne';
    const renderedType = await renderRefSchemaByFileName(
      'ref-object-with-patterns-and-properties.json',
      suggestedName,
      isInline,
    );

    const expectedFullStatement = isInline
      ? `(Record<\`\${"LEFT" | "RIGHT"}_\${string}\`, unknown> & Record<\`EXT_\${string}\`, {
    catalog?: unknown;
}>) & FirstLevelDepthObjectType & {
    fixedRequiredProperty: unknown;
    fixedOptionalProperty?: unknown;
}`
      : `export type ObjectTypeReferringAnotherOne = (Record<\`\${"LEFT" | "RIGHT"}_\${string}\`, unknown> & Record<\`EXT_\${string}\`, {
    catalog?: unknown;
}>) & FirstLevelDepthObjectType & {
    fixedRequiredProperty: unknown;
    fixedOptionalProperty?: unknown;
};`;

    expect(renderedType).toBe(expectedFullStatement);
  });

  it('should resolve ref with recursive self-reference', async () => {
    const suggestedName = 'ObjectTypeReferringRecursiveType';
    const renderedType = await renderRefSchemaByFileName(
      'ref-object-with-recursive-ref.json',
      suggestedName,
      isInline,
      true,
    );

    if (isInline) {
      expect(renderedType).toBe(`FirstLevelDepthRecursiveType & {
    mixinProperty: unknown;
}

{
    id?: unknown;
    ancestor?: FirstLevelDepthRecursiveType;
    descendant?: FirstLevelDepthRecursiveType;
}`);
    }
    else {
      expect(renderedType).toBe(
        `export interface ObjectTypeReferringRecursiveType extends FirstLevelDepthRecursiveType {
    mixinProperty: unknown;
}

export interface FirstLevelDepthRecursiveType {
    id?: unknown;
    ancestor?: FirstLevelDepthRecursiveType;
    descendant?: FirstLevelDepthRecursiveType;
}`,
      );
    }
  });
});

describe('visitor-ref object\'s inheritance', () => {
  beforeEach(() => {
    resetTestcase();
  });

  it('should merge list of required properties for derived interfaces', async () => {
    const renderedType = await renderRefSchemaByFileName(
      'ref-object-merge-required.json',
      'DerivedInterface',
      undefined,
      true,
    );

    expect(renderedType).toBe(
      `export interface DerivedInterface extends PartiallyRequiredBaseInterface {
    requiredInDerived: AnotherSimpleObjectType;
    shouldBeRequiredInDerivedInterface: SimpleObjectType;
}

export type AnotherSimpleObjectType = Record<string, unknown>;

export interface PartiallyRequiredBaseInterface {
    requiredInBaseInterface: SimpleObjectType;
    shouldNotBeRequired?: SimpleObjectType;
    shouldBeRequiredInDerivedInterface?: SimpleObjectType;
}

export type SimpleObjectType = Record<string, unknown>;`,
    );
  });

  it('should merge list of required properties for deeply derived interfaces', async () => {
    const renderedType = await renderRefSchemaByFileName(
      'ref-object-merge-required-deep.json',
      undefined,
      undefined,
      true,
    );

    expect(renderedType).toBe(
      `export interface RefObjectMergeRequiredDeep extends PartiallyRequiredBaseInterface {
    requiredInDerived: AnotherSimpleObjectType;
    shouldBeRequiredInDerivedInterface: SimpleObjectType;
    shouldBeRequiredInDerivedInterfaceFromDeep: ThirdSimpleObjectType;
}

export type AnotherSimpleObjectType = Record<string, unknown>;

export interface PartiallyRequiredBaseInterface extends PartiallyRequiredBaseInterfaceDeep {
    requiredInBaseInterface: SimpleObjectType;
    shouldNotBeRequired?: SimpleObjectType;
    shouldBeRequiredInDerivedInterface?: SimpleObjectType;
}

export type SimpleObjectType = Record<string, unknown>;

export interface PartiallyRequiredBaseInterfaceDeep {
    shouldBeRequiredInDerivedInterfaceFromDeep?: ThirdSimpleObjectType;
}

export type ThirdSimpleObjectType = Record<string, unknown>;`,
    );
  });

  it('should preserve deep inheritance for required and pattern properties', async () => {
    const renderedType = await renderRefSchemaByFileName(
      'ref-object-complex.json',
      undefined,
      undefined,
      true,
    );

    expect(renderedType).toBe(
      `export interface RefObjectComplex extends ComplexRefTypeWithPatternAndProperties {
    dictionary: SimplePatternType;
    id: unknown;
    meta: SimplePropertyType;
    unknownRequiredType: unknown;
    dictionaryOverrides?: SimplePatternType;
}

export interface ComplexRefTypeWithPatternAndProperties extends DeepComplexRefTypeWithPatternAndProperties {
    id?: unknown;
    dictionary?: SimplePatternType;
}

export type SimplePatternType = Record<\`SIMPLE_PROP_\${string}\`, HasMetaDeepType>;

export type DeepComplexRefTypeWithPatternAndProperties = Record<\`OPTION_\${string}\`, HasMetaDeepType & {
    optionId?: unknown;
    payload?: unknown;
}> & HasMetaDeepType;

export interface HasMetaDeepType {
    meta?: SimplePropertyType;
}

export interface SimplePropertyType {
    dictionaryId?: unknown;
    meta?: Record<\`DICTIONARY_\${string}\`, unknown>;
}`,
    );
  });
});
