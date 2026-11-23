/* eslint-disable max-len -- Exact generated TypeScript output is compared verbatim. */
import { createTestingLogger, type Logger } from '@codegena/oas3-core/logger';

import { resetIdentifiers } from '../../misc-utils';
import type { VisitorFnProps } from '../../typescript-parser-visitor-fn';
import {
  resetUltimateParser,
  setUltimateParserLogger,
} from '../__mocks__';
import { renderSchemaByFileName } from '../testing-utils';
import { visitorSomeOf } from './visitor-some-of';
import {
  getAnotherByTransitiveNodeArrayMock,
  resetArrayUltimateParser,
  setArrayUltimateParserLogger,
} from '../__mocks__/get-another-by-transitive-node-array.mock';

describe('visitor-some-of', () => {
  async function renderSomeOfSchemaByFileName(
    fixtureFilePath: string,
    shouldRenderAllTypes = false,
    options?: VisitorFnProps['options'],
  ): Promise<string | undefined> {
    return renderSchemaByFileName({
      fixtureFilePath,
      isInline: false,
      logger,
      mainVisitor: visitorSomeOf,
      options,
      renderAllTypes: shouldRenderAllTypes,
    });
  }

  async function renderSomeOfArraySchemaByFileName(
    fixtureFilePath: string,
    options?: VisitorFnProps['options'],
  ): Promise<string | undefined> {
    resetArrayUltimateParser();
    setArrayUltimateParserLogger(logger);

    return renderSchemaByFileName({
      fixtureFilePath,
      getAnotherByTransitiveNode: getAnotherByTransitiveNodeArrayMock,
      isInline: false,
      logger,
      mainVisitor: visitorSomeOf,
      options,
    });
  }

  async function renderPayment(
    fixtureFilePath: string,
    shouldRenderAllTypes = false,
  ): Promise<string | undefined> {
    return renderSchemaByFileName({
      fixtureFilePath,
      getAnotherByTransitiveNode: getAnotherByTransitiveNodeArrayMock,
      isInline: false,
      logger,
      mainVisitor: visitorSomeOf,
      renderAllTypes: shouldRenderAllTypes,
    });
  }

  let logger: Logger;
  let logsCollection: string[];

  beforeEach(() => {
    logsCollection = [];
    logger = createTestingLogger(logsCollection);
    resetIdentifiers();
    resetUltimateParser();
    setUltimateParserLogger(logger);
  });

  describe('oneOf', () => {
    it('should treat inline oneOf as anyOf in sameAsAnyOf mode', async () => {
      const renderedResult = await renderSomeOfSchemaByFileName(
        'one-of-object-inline.jsonc',
        false,
        { oneOfMode: 'sameAsAnyOf' },
      );

      expect(renderedResult).toBe(`type OneOfObjectInline = {
    propertyOfInlineType: unknown;
} | {
    anotherPropertyOfInlineType: unknown;
};`);
    });

    it('should keep the current opposition in sameAsAnyOfForRefs mode', async () => {
      const renderedResult = await renderSomeOfSchemaByFileName(
        'one-of-strict-contact.jsonc',
        false,
        { oneOfMode: 'sameAsAnyOfForRefs' },
      );

      expect(renderedResult).toBe(`type OneOfStrictContact = {
    email: unknown;
    phone?: never;
} | {
    phone: unknown;
    email?: never;
};`);
    });

    it('should keep references as union members in sameAsAnyOfForRefs mode', async () => {
      const renderedResult = await renderSomeOfSchemaByFileName(
        'one-of-object-with-refs.jsonc',
        false,
        { oneOfMode: 'sameAsAnyOfForRefs' },
      );

      expect(renderedResult).toBe(
        'type OneOfObjectWithRefs = AnotherType | AnotherElseType;',
      );
    });

    it('should inline referenced variants in completeOpposition mode', async () => {
      const renderedResult = await renderSomeOfSchemaByFileName(
        'one-of-object-with-refs.jsonc',
        false,
        { oneOfMode: 'completeOpposition' },
      );

      expect(renderedResult).toBe(`type OneOfObjectWithRefs = {
    propertyOfAnotherType?: unknown;
    propertyOfAnotherElseType?: never;
} | {
    propertyOfAnotherElseType?: unknown;
    propertyOfAnotherType?: never;
};`);
    });

    it('should subtract shared literal values from referenced variants', async () => {
      const renderedResult = await renderSomeOfArraySchemaByFileName(
        'one-of-overlapping-enum-refs.jsonc',
        { oneOfMode: 'completeOpposition' },
      );

      expect(renderedResult).toBe(
        'type OneOfOverlappingEnumRefs = "draft" | "archived";',
      );
    });

    it('should oppose referenced and inline variants in completeOpposition mode', async () => {
      const renderedResult = await renderSomeOfArraySchemaByFileName(
        'one-of-object-with-inline-and-ref.jsonc',
        { oneOfMode: 'completeOpposition' },
      );

      expect(renderedResult).toBe(`type OneOfObjectWithInlineAndRef = {
    email: string;
    phone?: never;
} | {
    phone: string;
    email?: never;
};`);
    });

    it('should keep a circular reference named and log a warning', async () => {
      const renderedResult = await renderSomeOfArraySchemaByFileName(
        'one-of-object-with-circular-ref.jsonc',
        { oneOfMode: 'completeOpposition' },
      );

      expect(renderedResult).toBe(`type OneOfObjectWithCircularRef = RecursiveContact | {
    phone?: string;
};`);
      expect(logsCollection.join('\n')).toMatch(
        /Cannot inline circular oneOf reference "RecursiveContact"/,
      );
    });

    it('should create a strict union of inline oneOf types without a mixin', async () => {
      const renderedResult = await renderSomeOfSchemaByFileName(
        'one-of-object-inline.jsonc',
      );

      expect(renderedResult).toBe(`type OneOfObjectInline = {
    propertyOfInlineType: unknown;
    anotherPropertyOfInlineType?: never;
} | {
    anotherPropertyOfInlineType: unknown;
    propertyOfInlineType?: never;
};`);
    });

    it('should exclude properties from every other oneOf variant', async () => {
      const renderedResult = await renderSomeOfSchemaByFileName(
        'one-of-strict-contact.jsonc',
      );

      expect(renderedResult).toBe(`type OneOfStrictContact = {
    email: unknown;
    phone?: never;
} | {
    phone: unknown;
    email?: never;
};`);
    });

    it('should create a union of referenced types', async () => {
      const renderedResult = await renderSomeOfSchemaByFileName(
        'one-of-object-with-refs.jsonc',
      );

      expect(renderedResult).toBe(
        'type OneOfObjectWithRefs = AnotherType | AnotherElseType;',
      );
    });

    it('should intersect the mixin with the inline union', async () => {
      const renderedResult = await renderSomeOfSchemaByFileName(
        'one-of-object-with-mixin.jsonc',
      );

      expect(renderedResult).toBe(`type OneOfObjectWithMixin = {
    mixinProp: unknown;
} & ({
    propertyOfInlineType: unknown;
    anotherPropertyOfInlineType?: never;
} | {
    anotherPropertyOfInlineType: unknown;
    propertyOfInlineType?: never;
});`);
    });

    it('should ignore incompatible variants when the union has a mixin', async () => {
      const renderedResult = await renderSomeOfSchemaByFileName(
        'one-of-object-with-mismatched-variant.jsonc',
      );

      expect(renderedResult).toBe(`type OneOfObjectWithMismatchedVariant = {
    mixinProp: unknown;
} & {
    propertyOfInlineType: unknown;
};`);
      expect(logsCollection.join('\n')).toMatch(
        /Ignored incompatible combined-schema variant/,
      );
    });

    it('should detect incompatible variants through references and nested unions', async () => {
      const renderedResult = await renderSomeOfSchemaByFileName(
        'one-of-object-with-wrapped-mismatched-variant.jsonc',
      );

      expect(renderedResult).toBe(`type OneOfObjectWithWrappedMismatchedVariant = {
    mixinProp: unknown;
} & MatchingObject;`);
      expect(logsCollection.join('\n')).toMatch(
        /Ignored incompatible combined-schema variant/,
      );
    });

    it('should resolve a nested oneOf through a mixin reference', async () => {
      const renderedResult = await renderSomeOfSchemaByFileName(
        'one-of-object-with-nested-mixin.jsonc',
        true,
      );

      expect(renderedResult).toBe(`export type OneOfObjectWithNestedMixin = {
    nestedChoice: NestedChoice;
} & ({
    propertyOfInlineType: unknown;
    anotherPropertyOfInlineType?: never;
} | {
    anotherPropertyOfInlineType: unknown;
    propertyOfInlineType?: never;
});

export type NestedChoice = {
    nestedProperty?: unknown;
    anotherNestedProperty?: never;
} | {
    anotherNestedProperty?: unknown;
    nestedProperty?: never;
};`);
    });

    it('should ignore a direct recursive oneOf reference', async () => {
      const renderedResult = await renderSomeOfSchemaByFileName(
        'one-of-recursive-ref.jsonc',
        true,
      );

      expect(renderedResult).toBe(`export type OneOfRecursiveRef = RecursiveChoice;

export type RecursiveChoice = {
    leaf?: unknown;
};`);
    });

    it('should preserve a recursive oneOf reference nested in a property', async () => {
      const renderedResult = await renderSomeOfSchemaByFileName(
        'one-of-recursive-nested-ref.jsonc',
        true,
      );

      expect(renderedResult).toBe(`export type OneOfRecursiveNestedRef = RecursiveChoice;

export type RecursiveChoice = {
    child?: RecursiveChoice;
    leaf?: never;
} | {
    leaf?: unknown;
    child?: never;
};`);
    });
  });

  describe('anyOf', () => {
    it('should ignore oneOfMode for anyOf variants', async () => {
      const expected = await renderSomeOfSchemaByFileName('any-of-contact.jsonc');

      resetIdentifiers();
      resetUltimateParser();

      const renderedResult = await renderSomeOfSchemaByFileName(
        'any-of-contact.jsonc',
        false,
        { oneOfMode: 'completeOpposition' },
      );

      expect(renderedResult).toBe(expected);
    });

    it('should omit fallback and unknown variants beside a concrete array', async () => {
      const renderedResult = await renderSomeOfArraySchemaByFileName(
        'any-of-array-with-fallback.jsonc',
      );

      expect(renderedResult).toBe('type AnyOfArrayWithFallback = string[];');
    });

    it('should retain an array fallback when the other variant is an object', async () => {
      const renderedResult = await renderSomeOfArraySchemaByFileName(
        'any-of-object-and-fallback-array.jsonc',
      );

      expect(renderedResult).toBe(`type AnyOfObjectAndFallbackArray = {
    customerId: string;
} | [
    unknown,
    unknown,
    ...unknown[]
];`);
    });

    it('should preserve overlapping properties for non-exclusive anyOf variants', async () => {
      const renderedResult = await renderSomeOfSchemaByFileName('any-of-contact.jsonc');

      expect(renderedResult).toBe(`type AnyOfContact = {
    email: unknown;
} | {
    phone: unknown;
};`);
    });

    it('should keep one copy of an identical inline variant', async () => {
      const renderedResult = await renderSomeOfSchemaByFileName(
        'any-of-repeated-contact.jsonc',
      );

      expect(renderedResult).toBe(`type AnyOfRepeatedContact = {
    contactId: unknown;
};`);
    });

    it('should inherit only requirements shared by every union member', async () => {
      const renderedResult = await renderSomeOfSchemaByFileName(
        'any-of-inherited-required.jsonc',
      );

      expect(renderedResult).toBe(`type AnyOfInheritedRequired = {
    audit: unknown;
    contactInfo: ContactInfo;
    notes?: unknown;
} & ({
    contactInfo: unknown;
    notes: unknown;
} | {
    contactInfo: unknown;
});`);
    });
  });

  describe('allOf', () => {
    it('should apply array length bounds beside a concrete reference', async () => {
      const renderedResult = await renderSomeOfArraySchemaByFileName(
        'all-of-array-with-fallback.jsonc',
      );

      const expected = `type AllOfArrayWithFallback = [
    string,
    string,
    ...string[]
];`;

      expect(renderedResult).toBe(expected);
    });

    it('should intersect minimum and maximum bounds with referenced array items', async () => {
      const renderedResult = await renderSomeOfArraySchemaByFileName(
        'all-of-fixed-delivery-batch.jsonc',
      );

      const expected = `type AllOfFixedDeliveryBatch = [
    string,
    string
] | [
    string,
    string,
    string
];`;

      expect(renderedResult).toBe(expected);
    });

    it('should intersect allOf variants with the mixin', async () => {
      const renderedResult = await renderSomeOfSchemaByFileName(
        'all-of-object-with-mixin.jsonc',
      );

      expect(renderedResult).toBe(`interface AllOfObjectWithMixin {
    mixinProp: unknown;
    email: unknown;
    phone: unknown;
}`);
    });

    it('should merge inline object variants into one interface', async () => {
      const renderedResult = await renderSomeOfSchemaByFileName(
        'all-of-object-inline.jsonc',
      );

      expect(renderedResult).toBe(`interface AllOfObjectInline {
    email: unknown;
    phone: unknown;
}`);
    });

    it('should narrow a property shared by inline variants', async () => {
      const renderedResult = await renderSomeOfSchemaByFileName(
        'all-of-object-overlapping-properties.jsonc',
      );

      expect(renderedResult).toBe(`interface AllOfObjectOverlappingProperties {
    contactMethod: "email";
    contactAddress?: unknown;
}`);
    });

    it('should merge matching types while keeping a reference separate', async () => {
      const renderedResult = await renderSomeOfSchemaByFileName(
        'all-of-object-with-inline-and-ref.jsonc',
      );

      expect(renderedResult).toBe(`type AllOfObjectWithInlineAndRef = {
    email: unknown;
    phone: unknown;
} & ContactDetails;`);
    });

    it('should render a single reference with the parent name', async () => {
      const renderedResult = await renderSomeOfSchemaByFileName(
        'all-of-object-single-ref.jsonc',
      );

      expect(renderedResult).toBe(
        'type AllOfObjectSingleRef = ContactDetails;',
      );
    });

    it('should keep one copy of a repeated intersection reference', async () => {
      const renderedResult = await renderSomeOfSchemaByFileName(
        'all-of-repeated-ref.jsonc',
      );

      expect(renderedResult).toBe('type AllOfRepeatedRef = ContactDetails;');
    });

    it('should create an interface extending named allOf types', async () => {
      const renderedResult = await renderSomeOfSchemaByFileName(
        'all-of-object-with-named-refs.jsonc',
      );

      expect(renderedResult).toBe(`interface AllOfObjectWithNamedRefs extends ContactDetails, AuditFields {
    contactId: unknown;
}`);
    });

    it.each([
      ['all-of-required-from-ref.jsonc', 'AllOfRequiredFromRef'],
      ['all-of-required-from-wrapped-ref.jsonc', 'AllOfRequiredFromWrappedRef'],
    ])('should apply inherited requirements to mixin properties in %s', async (
      fixture,
      name,
    ) => {
      const renderedResult = await renderSomeOfSchemaByFileName(fixture);

      expect(renderedResult).toBe(`interface ${name} extends Contact {
    contactInfo: ContactInfo;
    notes?: unknown;
}`);
    });

    it('should ignore an allOf variant incompatible with the mixin', async () => {
      const renderedResult = await renderSomeOfSchemaByFileName(
        'all-of-object-with-mismatched-variant.jsonc',
      );

      expect(renderedResult).toBe(`interface AllOfObjectWithMismatchedVariant {
    mixinProp: unknown;
    email: unknown;
}`);
      expect(logsCollection.join('\n')).toMatch(
        /Ignored incompatible combined-schema variant/,
      );
    });
  });

  describe('unsupported schemas', () => {
    it('should ignore a transitive node that is not a union', async () => {
      const renderedResult = await renderSomeOfSchemaByFileName(
        'object-properties-empty.jsonc',
      );

      expect(renderedResult).toBeUndefined();
    });
  });

  describe('dependentRequired', () => {
    beforeEach(() => {
      resetArrayUltimateParser();
      setArrayUltimateParserLogger(logger);
    });

    it.each([false, true])('should render dependency variants (all: %p)', async (allTypes) => {
      expect(await renderPayment('dependent-required-payment.jsonc', allTypes)).toBe(
        `${allTypes ? 'export ' : ''}type DependentRequiredPayment = {
    customerId: string;
    cardToken?: string;
    billingAddress?: string;
    bankAccount?: string;
} | {
    customerId: string;
    cardToken: string;
    billingAddress: string;
    bankAccount?: string;
} | {
    customerId: string;
    cardToken?: string;
    billingAddress: string;
    bankAccount: string;
};`,
      );
      expect(logsCollection).toHaveLength(0);
    });

    it('should render missing properties as required unknowns', async () => {
      expect(await renderPayment('dependent-required-missing.jsonc', true)).toBe(
        `export type DependentRequiredMissing = {
    customerId: string;
} | {
    customerId: string;
    cardToken: unknown;
    billingAddress: unknown;
};`,
      );
      expect(logsCollection.join('\n')).toMatch(/Missing dependentRequired property/);
    });

    it('should render a variant with partially required dependencies', async () => {
      expect(await renderPayment('dependent-required-partial.jsonc', true)).toBe(
        `export type DependentRequiredPartial = {
    customerId: string;
    billingAddress: string;
    cardToken?: string;
    bankAccount?: string;
} | {
    customerId: string;
    billingAddress: string;
    cardToken: string;
    bankAccount: string;
};`,
      );
    });

    it.each([
      [
        'required-key',
        'DependentRequiredRequiredKey',
        'cardToken: string;\n    billingAddress?: string;',
      ],
      [
        'required-values',
        'DependentRequiredRequiredValues',
        'billingAddress: string;\n    cardToken?: string;',
      ],
      [
        'empty-values',
        'DependentRequiredEmptyValues',
        'cardToken?: string;\n    billingAddress?: string;',
      ],
      [
        'empty-record',
        'DependentRequiredEmptyRecord',
        'cardToken?: string;\n    billingAddress?: string;',
      ],
    ])('should keep the original listing for %s', async (suffix, name, properties) => {
      expect(await renderPayment(`dependent-required-${suffix}.jsonc`, true)).toBe(
        `export interface ${name} {
    customerId: string;
    ${properties}
    bankAccount?: string;
}`,
      );
      expect(logsCollection.join('\n')).toMatch(/no applicable dependency variants/);
    });

    it('should render the original structure for an invalid dependency record', async () => {
      expect(await renderPayment('dependent-required-invalid.jsonc', true)).toBe(
        `export interface DependentRequiredInvalid {
    customerId: string;
    cardToken?: string;
    billingAddress?: string;
    bankAccount?: string;
}`,
      );
      expect(logsCollection.join('\n')).toMatch(/expected an object schema/);
    });

    it('should include each referenced type once in the full listing', async () => {
      expect(await renderPayment('dependent-required-refs.jsonc', true)).toBe(
        `export type DependentRequiredRefs = Payment;

export type Payment = {
    customerId: string;
    cardToken?: string;
    billingAddress?: Address;
    bankAccount?: string;
} | {
    customerId: string;
    cardToken: string;
    billingAddress: Address;
    bankAccount?: string;
} | {
    customerId: string;
    cardToken?: string;
    billingAddress: Address;
    bankAccount: string;
};

export interface Address {
    city: string;
}`,
      );
    });

    it('should preserve skipped converters when processing a reference mixin', async () => {
      expect(await renderPayment('dependent-required-ref-mixin.jsonc', true)).toBe(
        `export type DependentRequiredRefMixin = (Customer & {
    cardToken?: string;
    billingAddress?: string;
}) | (Customer & {
    cardToken: string;
    billingAddress: string;
});

export interface Customer {
    customerId: string;
}`,
      );
    });
  });
});
