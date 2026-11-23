import {
  createSourceFile,
  factory,
  isArrayLiteralExpression,
  isExpressionStatement,
  isNumericLiteral,
  isObjectLiteralExpression,
  isParenthesizedExpression,
  isPrefixUnaryExpression,
  isPropertyAssignment,
  isStringLiteral,
  ScriptKind,
  ScriptTarget,
  SyntaxKind,
  type Expression,
  type ObjectLiteralElementLike,
  type TypeElement,
  type TypeNode,
} from 'typescript';

import { createPropertyName } from './create-property-name';

export function deserializeJsonValueToTypeNode(
  value: unknown,
): TypeNode | null {
  const expression = deserializeJsonValueToExpression(value);

  if (!expression) {
    return null;
  }

  return createJsonExpressionTypeNode(expression);
}

function deserializeJsonValueToExpression(value: unknown): Expression | null {
  const serializedValue = JSON.stringify(value);

  if (serializedValue === undefined) {
    return null;
  }

  const sourceFile = createSourceFile(
    'json-value.ts',
    `(${serializedValue});`,
    ScriptTarget.Latest,
    true,
    ScriptKind.TS,
  );

  const [statement] = sourceFile.statements;

  if (
    !statement
    || !isExpressionStatement(statement)
    || !isParenthesizedExpression(statement.expression)
  ) {
    return null;
  }

  return statement.expression.expression;
}

function createJsonExpressionTypeNode(expression: Expression): TypeNode | null {
  if (isStringLiteral(expression)) {
    return factory.createLiteralTypeNode(
      factory.createStringLiteral(expression.text),
    );
  }

  if (isNumericLiteral(expression)) {
    return factory.createLiteralTypeNode(
      factory.createNumericLiteral(expression.text),
    );
  }

  if (expression.kind === SyntaxKind.TrueKeyword) {
    return factory.createLiteralTypeNode(factory.createTrue());
  }

  if (expression.kind === SyntaxKind.FalseKeyword) {
    return factory.createLiteralTypeNode(factory.createFalse());
  }

  if (expression.kind === SyntaxKind.NullKeyword) {
    return factory.createLiteralTypeNode(factory.createNull());
  }

  if (isPrefixUnaryExpression(expression)) {
    return createPrefixUnaryExpressionTypeNode(expression);
  }

  if (isArrayLiteralExpression(expression)) {
    return createArrayLiteralTypeNode(expression);
  }

  if (isObjectLiteralExpression(expression)) {
    return createObjectLiteralTypeNode(expression);
  }

  return null;
}

function createPrefixUnaryExpressionTypeNode(
  expression: Expression,
): TypeNode | null {
  if (
    !isPrefixUnaryExpression(expression)
    || expression.operator !== SyntaxKind.MinusToken
    || !isNumericLiteral(expression.operand)
  ) {
    return null;
  }

  return factory.createLiteralTypeNode(
    factory.createPrefixUnaryExpression(
      SyntaxKind.MinusToken,
      factory.createNumericLiteral(expression.operand.text),
    ),
  );
}

function createArrayLiteralTypeNode(
  expression: Expression,
): TypeNode | null {
  if (!isArrayLiteralExpression(expression)) {
    return null;
  }

  const elementTypes: TypeNode[] = [];

  for (const element of expression.elements) {
    const elementType = createJsonExpressionTypeNode(element);

    if (!elementType) {
      return null;
    }

    elementTypes.push(elementType);
  }

  return factory.createTupleTypeNode(elementTypes);
}

function createObjectLiteralTypeNode(
  expression: Expression,
): TypeNode | null {
  if (!isObjectLiteralExpression(expression)) {
    return null;
  }

  const propertySignatures: TypeElement[] = [];

  for (const property of expression.properties) {
    const propertySignature = createPropertySignature(property);

    if (!propertySignature) {
      return null;
    }

    propertySignatures.push(propertySignature);
  }

  return factory.createTypeLiteralNode(propertySignatures);
}

function createPropertySignature(
  property: ObjectLiteralElementLike,
): TypeElement | null {
  if (
    !isPropertyAssignment(property)
    || (!isStringLiteral(property.name) && !isNumericLiteral(property.name))
  ) {
    return null;
  }

  const propertyType = createJsonExpressionTypeNode(property.initializer);

  if (!propertyType) {
    return null;
  }

  return factory.createPropertySignature(
    undefined,
    createPropertyName(property.name.text),
    undefined,
    propertyType,
  );
}
