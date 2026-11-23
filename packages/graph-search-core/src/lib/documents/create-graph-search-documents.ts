import type { GraphPayload, GraphPayloadNode } from '@codegena/graph-core';

import type { GraphSearchDocument } from './graph-search-document';
import type { GraphSearchSourceSpecification } from '../graph-search-source';
import { mapGraphNodeToSearchDocument } from './map-graph-node-to-search-document';
import { mapSpecificationToSearchDocument } from './map-specification-to-search-document';
import { prepareGraphPayloadLog } from './prepare-graph-payload-log';

export function createGraphSearchDocuments(
  graphPayload: GraphPayload,
  childrenByParent: Map<string | undefined, GraphPayloadNode[]>,
  sourceSpecification?: GraphSearchSourceSpecification,
): GraphSearchDocument[] {
  const nodesById = new Map(graphPayload.nodes.map((node) => [
    node.id,
    node,
  ]));

  const nodeDocuments = graphPayload.nodes.map((node) => (
    mapGraphNodeToSearchDocument(
      node,
      childrenByParent.get(node.id) ?? [],
      node.parentId ? nodesById.get(node.parentId) : undefined,
    )
  ));

  const warningDocuments = graphPayload.logs.map((log, index) => (
    prepareGraphPayloadLog(log, index)
  ));

  const specificationDocument = sourceSpecification
    ? [mapSpecificationToSearchDocument(sourceSpecification)]
    : [];

  return [
    ...nodeDocuments,
    ...warningDocuments,
    ...specificationDocument,
  ];
}
