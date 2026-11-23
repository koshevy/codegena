import type { Logger } from '@codegena/oas3-core/logger';
import {
  isHeaderParameter,
  isReferenceObject,
} from '@codegena/oas3-core/oas3';
import type {
  StructureTransitiveNode,
  TransitiveNode,
} from '@codegena/oas3-core/transitive-node';
import isEqual from 'lodash/isEqual';

import { getLocalReferencePath } from './get-local-reference-path';
import type { ActiveJsoncTree } from '../../active-jsonc-tree';
import { isReconstructedObjectJsoncValue } from '../../reconstruct-jsonc-value';

export interface Oas3HeaderStructureProps {
  headersPath: string[];
  jsoncTree: ActiveJsoncTree;
  logger: Logger;
  processSchema: (path: string[]) => TransitiveNode | null;
}

type HeaderProperties = NonNullable<StructureTransitiveNode['properties']>;

/**
 * Converts a Header Object map while preserving each header's JSONC source.
 */
export function createOas3HeaderStructure({
  headersPath,
  jsoncTree,
  logger,
  processSchema,
}: Oas3HeaderStructureProps): StructureTransitiveNode | null {
  const headers = jsoncTree.getData(headersPath);
  const source = jsoncTree.getReconstructedJsonc(headersPath);

  if (typeof headers !== 'object'
    || !headers
    || Array.isArray(headers)
    || !isReconstructedObjectJsoncValue(source)
  ) {
    logger.warn(
      { node: jsoncTree.getNode(headersPath), path: headersPath },
      'Skipped malformed OpenAPI headers map.',
    );

    return null;
  }

  const properties: HeaderProperties = Object.fromEntries(
    Object.entries(headers).flatMap(([name, header]) => {
      const referencePath = isReferenceObject(header)
        ? getLocalReferencePath(header.$ref)
        : null;

      const resolvedHeader = referencePath
        ? jsoncTree.getData(referencePath)
        : header;

      const headerPath = referencePath ?? [...headersPath, name];

      if (!isHeaderParameter(resolvedHeader)) {
        logger.warn(
          {
            node: jsoncTree.getNode([...headersPath, name]),
            path: [...headersPath, name],
          },
          `Skipped unsupported OpenAPI header "${name}".`,
        );

        return [];
      }

      const schemaPath = [...headerPath, 'schema'];
      const node = resolvedHeader.schema === undefined
        ? null
        : processSchema(schemaPath);

      if (!node) {
        logger.warn(
          { node: jsoncTree.getNode(headerPath), path: headerPath },
          `OpenAPI header "${name}" has no supported schema; used unknown.`,
        );
      }

      return [[name, node ?? {
        source: jsoncTree.getReconstructedJsonc(headerPath),
        type: 'unknown',
      }]];
    }),
  );

  return {
    nestedTransitiveNodes: Object.values(properties),
    properties,
    source,
    type: 'structure',
  };
}

/**
 * Merges request header parameters with direct request headers. Conflicting
 * definitions remain alternatives.
 */
export function mergeOas3HeaderStructures(
  structures: StructureTransitiveNode[],
): StructureTransitiveNode | undefined {
  const [first] = structures;

  if (!first) {
    return undefined;
  }

  const properties = structures
    .flatMap((structure) => (
      Object.entries(structure.properties ?? {})
    ))
    .reduce<HeaderProperties>((merged, [name, node]) => {
      const previous = merged[name];

      if (!previous) {
        // False-positive: object created by Object.create(null)
        // eslint-disable-next-line secure-coding/detect-object-injection
        merged[name] = node;

        return merged;
      }

      const variants = previous.type === 'union'
        ? previous.referredTransitiveNodes ?? []
        : [previous];

      const hasMatchingVariant = variants.some((variant) => (
        isEqual(variant.source.value, node.source.value)
      ));

      if (hasMatchingVariant) {
        return merged;
      }

      // False-positive: object created by Object.create(null)
      // eslint-disable-next-line secure-coding/detect-object-injection
      merged[name] = {
        mixin: null,
        referredTransitiveNodes: [...variants, node],
        source: previous.source,
        type: 'union',
      };

      return merged;
    }, Object.create(null));

  return {
    nestedTransitiveNodes: Object.values(properties),
    properties,
    source: first.source,
    type: 'structure',
  };
}
