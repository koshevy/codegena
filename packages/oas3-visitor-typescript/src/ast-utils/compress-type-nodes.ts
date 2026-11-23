import { uniqWith } from 'lodash';
import {
  factory,
  isArrayTypeNode,
  isIdentifier,
  isParenthesizedTypeNode,
  isPropertySignature,
  isStringLiteral,
  isTypeLiteralNode,
  isTypeReferenceNode,
  isUnionTypeNode,
  SyntaxKind,
  type ArrayTypeNode,
  type PropertySignature,
  type TypeLiteralNode,
  type TypeNode,
  type TypeReferenceNode,
} from 'typescript';

import { areTypesSimplyEqual } from './are-types-simply-equal';

type RecordTypeNode = TypeReferenceNode & {
  typeArguments: NonNullable<TypeReferenceNode['typeArguments']>;
};

function flattenUnionTypes(typeNodes: TypeNode[]): TypeNode[] {
  const flattened: TypeNode[] = [];

  for (const typeNode of typeNodes) {
    if (isUnionTypeNode(typeNode)) {
      flattened.push(...flattenUnionTypes([...typeNode.types]));
    }
    else if (isParenthesizedTypeNode(typeNode)) {
      flattened.push(...flattenUnionTypes([typeNode.type]));
    }
    else {
      flattened.push(typeNode);
    }
  }

  return flattened;
}

function isRecordTypeNode(typeNode: TypeNode): typeNode is RecordTypeNode {
  return isTypeReferenceNode(typeNode)
    && isIdentifier(typeNode.typeName)
    && typeNode.typeName.text === 'Record'
    && typeNode.typeArguments?.length === 2;
}

function createUnionIfNeeded(typeNodes: TypeNode[]): TypeNode {
  const compressed = compressTypeNodes(typeNodes);

  return compressed.length === 1
    ? compressed[0]
    : factory.createUnionTypeNode(compressed);
}

function mergeRecords(
  first: RecordTypeNode,
  second: RecordTypeNode,
): RecordTypeNode | undefined {
  const [firstKey, firstValue] = first.typeArguments;
  const [secondKey, secondValue] = second.typeArguments;
  const haveEqualKeys = areTypesSimplyEqual(firstKey, secondKey);
  const haveEqualValues = areTypesSimplyEqual(firstValue, secondValue);

  if (!haveEqualKeys && !haveEqualValues) {
    return undefined;
  }

  return factory.createTypeReferenceNode('Record', [
    haveEqualKeys
      ? firstKey
      : createUnionIfNeeded([firstKey, secondKey]),
    haveEqualValues
      ? firstValue
      : createUnionIfNeeded([firstValue, secondValue]),
  ]) as RecordTypeNode;
}

function getPropertyName(property: PropertySignature): string | undefined {
  if (isIdentifier(property.name) || isStringLiteral(property.name)) {
    return property.name.text;
  }

  return undefined;
}

function isReadonlyProperty(property: PropertySignature): boolean {
  return property.modifiers?.some(
    ({ kind }) => kind === SyntaxKind.ReadonlyKeyword,
  ) ?? false;
}

function arePropertiesEqual(
  first: PropertySignature,
  second: PropertySignature,
): boolean {
  if (getPropertyName(first) !== getPropertyName(second)
    || !!first.questionToken !== !!second.questionToken
    || isReadonlyProperty(first) !== isReadonlyProperty(second)
  ) {
    return false;
  }

  if (!first.type || !second.type) {
    return first.type === second.type;
  }

  return areTypesSimplyEqual(first.type, second.type);
}

function isObjectSubset(
  possibleSubset: TypeLiteralNode,
  possibleSuperset: TypeLiteralNode,
): boolean {
  const subsetProperties = possibleSubset.members.filter(isPropertySignature);
  const supersetProperties = possibleSuperset.members.filter(
    isPropertySignature,
  );

  if (subsetProperties.length !== possibleSubset.members.length
    || supersetProperties.length !== possibleSuperset.members.length
  ) {
    return false;
  }

  return subsetProperties.every((subsetProperty) => (
    supersetProperties.some((supersetProperty) => (
      arePropertiesEqual(subsetProperty, supersetProperty)
    ))
  ));
}

function addRecord(result: TypeNode[], record: RecordTypeNode): void {
  let mergedRecord = record;

  for (let index = 0; index < result.length;) {
    const existing = result[index];

    if (isRecordTypeNode(existing)) {
      const merged = mergeRecords(existing, mergedRecord);

      if (merged) {
        mergedRecord = merged;
        result.splice(index, 1);
        index = 0;
        continue;
      }
    }

    index += 1;
  }

  result.push(mergedRecord);
}

function addArray(result: TypeNode[], array: ArrayTypeNode): TypeNode[] {
  const existingIndex = result.findIndex((item) => isArrayTypeNode(item));

  if (existingIndex === -1) {
    return [...result, array];
  }

  const existing = result[existingIndex];

  if (isArrayTypeNode(existing)) {
    return result.with(
      existingIndex,
      factory.createArrayTypeNode(
        createUnionIfNeeded([existing.elementType, array.elementType]),
      ),
    );
  }

  return result;
}

function addObject(result: TypeNode[], object: TypeLiteralNode): void {
  for (let index = 0; index < result.length; index += 1) {
    const existing = result[index];

    if (!isTypeLiteralNode(existing)) {
      continue;
    }

    if (isObjectSubset(object, existing)) {
      return;
    }

    if (isObjectSubset(existing, object)) {
      result[index] = object;
      return;
    }
  }

  result.push(object);
}

function isSpecialType(typeNode: TypeNode): boolean {
  return isArrayTypeNode(typeNode)
    || isTypeLiteralNode(typeNode)
    || isRecordTypeNode(typeNode);
}

function areOtherTypesEqual(first: TypeNode, second: TypeNode): boolean {
  return !isSpecialType(first)
    && !isSpecialType(second)
    && areTypesSimplyEqual(first, second);
}

export function compressTypeNodes(typeNodes: TypeNode[]): TypeNode[] {
  let result: TypeNode[] = [];
  const flattened = flattenUnionTypes(typeNodes);

  for (const typeNode of flattened) {
    if (isRecordTypeNode(typeNode)) {
      addRecord(result, typeNode);
    }
    else if (isArrayTypeNode(typeNode)) {
      result = addArray(result, typeNode);
    }
    else if (isTypeLiteralNode(typeNode)) {
      addObject(result, typeNode);
    }
    else {
      result.push(typeNode);
    }
  }

  return uniqWith(result, areOtherTypesEqual);
}
