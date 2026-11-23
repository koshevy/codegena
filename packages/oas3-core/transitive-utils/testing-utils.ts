import { parseTree } from 'jsonc-parser';

import type {
  ArrayTransitiveNode,
  BooleanScalarTransitiveNode,
  StringScalarTransitiveNode,
  StructureTransitiveNode,
  TransitiveNode,
  UnionTransitiveNode,
  UnknownTransitiveNode,
} from '../transitive-node';
import type {
  ReconstructedObjectJsoncValue,
  ReconstructedScalarJsoncValue,
} from '../transitive-node/reconstructed-jsonc-value';

function createSource<TValue>(
  value: TValue,
): ReconstructedScalarJsoncValue<TValue> {
  const originalFileContent = JSON.stringify(value);
  const node = parseTree(originalFileContent);

  if (!node) {
    throw new Error('Expected a JSONC AST node.');
  }

  return {
    getOriginalFileContent: () => originalFileContent,
    jsonPath: [],
    node,
    sourceFileId: 'transitive-utils.spec.ts',
    value,
  };
}

function createObjectSource(
  value: Record<string, unknown>,
): ReconstructedObjectJsoncValue {
  return {
    ...createSource(value),
    properties: {},
  };
}

export function createBooleanScalar(
  schema: unknown,
): BooleanScalarTransitiveNode {
  return {
    scalarType: 'boolean',
    source: createSource(schema),
    type: 'scalar',
  };
}

export function createStringScalar(
  schema: unknown,
): StringScalarTransitiveNode {
  return {
    scalarType: 'string',
    source: createSource(schema),
    type: 'scalar',
  };
}

export function createArray(
  itemsInCommon: TransitiveNode,
): ArrayTransitiveNode {
  return {
    itemsInCommon,
    nestedTransitiveNodes: [itemsInCommon],
    source: createSource({
      items: itemsInCommon.source.value,
      type: 'array',
    }),
    type: 'array',
  };
}

export function createStructure(
  properties: Record<string, TransitiveNode>,
): StructureTransitiveNode {
  return {
    nestedTransitiveNodes: Object.values(properties),
    properties,
    source: createObjectSource({
      properties: Object.fromEntries(
        Object.entries(properties).map(([name, node]) => [
          name,
          node.source.value,
        ]),
      ),
      type: 'object',
    }),
    type: 'structure',
  };
}

export function createUnion(
  referredTransitiveNodes: TransitiveNode[],
): UnionTransitiveNode {
  return {
    mixin: null,
    referredTransitiveNodes,
    source: createObjectSource({
      oneOf: referredTransitiveNodes.map((node) => node.source.value),
    }),
    type: 'union',
  };
}

export function createUnknown(schema: unknown): UnknownTransitiveNode {
  return {
    source: createSource(schema),
    type: 'unknown',
  };
}
