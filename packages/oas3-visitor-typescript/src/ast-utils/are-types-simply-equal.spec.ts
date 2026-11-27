import {
  factory,
  SyntaxKind,
  type TypeNode,
} from 'typescript';

import {
  areNodeArraysEqual,
  areTypesSimplyEqual,
} from './are-types-simply-equal';

const stringType = (): TypeNode => factory.createKeywordTypeNode(
  SyntaxKind.StringKeyword,
);

const numberType = (): TypeNode => factory.createKeywordTypeNode(
  SyntaxKind.NumberKeyword,
);

const literalType = (value: string): TypeNode => factory.createLiteralTypeNode(
  factory.createStringLiteral(value),
);

const referenceType = (name: string, typeArguments?: TypeNode[]): TypeNode => (
  factory.createTypeReferenceNode(name, typeArguments)
);

describe('areNodeArraysEqual', () => {
  it('should identify the same NodeArray instance without comparing items', () => {
    const nodes = factory.createNodeArray([stringType()]);
    const itemComparator = jest.fn(() => false);

    expect(areNodeArraysEqual(nodes, nodes, itemComparator)).toBe(true);
    expect(itemComparator).not.toHaveBeenCalled();
  });

  it('should identify independently created arrays with the same construction', () => {
    const first = factory.createNodeArray([
      literalType('active'),
      referenceType('Promise', [stringType()]),
    ]);

    const second = factory.createNodeArray([
      literalType('active'),
      referenceType('Promise', [stringType()]),
    ]);

    expect(areNodeArraysEqual(first, second)).toBe(true);
  });

  it('should reject arrays with different lengths', () => {
    const first = factory.createNodeArray([stringType()]);
    const second = factory.createNodeArray([stringType(), numberType()]);

    expect(areNodeArraysEqual(first, second)).toBe(false);
  });

  it('should reject arrays whose node order differs', () => {
    const first = factory.createNodeArray([stringType(), numberType()]);
    const second = factory.createNodeArray([numberType(), stringType()]);

    expect(areNodeArraysEqual(first, second)).toBe(false);
  });

  it('should reject an absent array compared with a present array', () => {
    expect(areNodeArraysEqual(undefined, factory.createNodeArray([])))
      .toBe(false);
  });

  it('should identify two absent arrays as equal', () => {
    expect(areNodeArraysEqual(undefined, undefined)).toBe(true);
  });

  it('should stop comparing after the first unequal item', () => {
    const first = factory.createNodeArray([stringType(), numberType()]);
    const second = factory.createNodeArray([numberType(), numberType()]);
    const itemComparator = jest.fn(() => false);

    expect(areNodeArraysEqual(first, second, itemComparator)).toBe(false);
    expect(itemComparator).toHaveBeenCalledTimes(1);
  });
});

describe('areTypesSimplyEqual', () => {
  it('should compare synthesized literal types without source metadata', () => {
    expect(areTypesSimplyEqual(literalType('active'), literalType('active')))
      .toBe(true);
    expect(areTypesSimplyEqual(literalType('active'), literalType('paused')))
      .toBe(false);
  });

  it('should compare signed numeric literal types structurally', () => {
    const createSignedLiteral = (operator: SyntaxKind.MinusToken): TypeNode => (
      factory.createLiteralTypeNode(
        factory.createPrefixUnaryExpression(
          operator,
          factory.createNumericLiteral('404'),
        ),
      )
    );

    expect(areTypesSimplyEqual(
      createSignedLiteral(SyntaxKind.MinusToken),
      createSignedLiteral(SyntaxKind.MinusToken),
    )).toBe(true);

    const unsignedLiteral = factory.createNumericLiteral('404');
    const unsignedType = factory.createLiteralTypeNode(unsignedLiteral);

    expect(areTypesSimplyEqual(
      createSignedLiteral(SyntaxKind.MinusToken),
      unsignedType,
    )).toBe(false);
  });

  it('should compare synthesized generic and qualified type references', () => {
    const first = factory.createTypeReferenceNode(
      factory.createQualifiedName(
        factory.createIdentifier('Billing'),
        factory.createIdentifier('Invoice'),
      ),
      [referenceType('Money', [stringType()])],
    );

    const same = factory.createTypeReferenceNode(
      factory.createQualifiedName(
        factory.createIdentifier('Billing'),
        factory.createIdentifier('Invoice'),
      ),
      [referenceType('Money', [stringType()])],
    );

    const different = factory.createTypeReferenceNode(
      factory.createQualifiedName(
        factory.createIdentifier('Shipping'),
        factory.createIdentifier('Invoice'),
      ),
      [referenceType('Money', [stringType()])],
    );

    expect(areTypesSimplyEqual(first, same)).toBe(true);
    expect(areTypesSimplyEqual(first, different)).toBe(false);
  });

  it('should compare nested union constructions item by item', () => {
    const first = factory.createUnionTypeNode([
      literalType('pending'),
      referenceType('Result', [stringType()]),
    ]);

    const same = factory.createUnionTypeNode([
      literalType('pending'),
      referenceType('Result', [stringType()]),
    ]);

    const reordered = factory.createUnionTypeNode([
      referenceType('Result', [stringType()]),
      literalType('pending'),
    ]);

    expect(areTypesSimplyEqual(first, same)).toBe(true);
    expect(areTypesSimplyEqual(first, reordered)).toBe(false);
  });

  it('should distinguish type references with different type arguments', () => {
    const first = referenceType('ApiResponse', [stringType()]);
    const second = referenceType('ApiResponse', [numberType()]);

    expect(areTypesSimplyEqual(first, second)).toBe(false);
  });
});
