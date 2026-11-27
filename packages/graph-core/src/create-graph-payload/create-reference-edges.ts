import type {
  AnotherTransitiveNodeParsingResult,
  UltimateParserVisitorResult,
} from '@codegena/oas3-core/ultimate-parser';

import type { GraphPayloadEdge } from '../graph-payload-edge';

interface CreateReferenceEdgesProps<TAstObject extends object> {
  groupIdsByItemId: Map<string, string>;
  idsByItem: Map<UltimateParserVisitorResult<TAstObject>, string>;
  importEdges: GraphPayloadEdge[];
  itemCountsByGroupId: Map<string, number>;
}

/**
 * Resolve declaration dependencies and omit redundant references between
 * single-declaration files that already have an import edge.
 */
export async function createReferenceEdges<TAstObject extends object>({
  groupIdsByItemId,
  idsByItem,
  importEdges,
  itemCountsByGroupId,
}: CreateReferenceEdgesProps<TAstObject>): Promise<GraphPayloadEdge[]> {
  type Dependency = AnotherTransitiveNodeParsingResult<TAstObject>;

  const importEdgeIds = new Set(importEdges.map(({ id }) => id));
  const referenceEdges = new Map<string, GraphPayloadEdge>();

  async function addDependencyEdges(
    source: string,
    dependency: Dependency,
    visited: Set<Dependency>,
  ): Promise<void> {
    if (visited.has(dependency)) {
      return;
    }

    visited.add(dependency);

    const resolved = typeof dependency === 'function'
      ? await dependency()
      : dependency;
    const target = idsByItem.get(resolved);

    if (target) {
      const sourceGroupId = groupIdsByItemId.get(source);
      const targetGroupId = groupIdsByItemId.get(target);
      const hasSoleItems = sourceGroupId !== undefined
        && targetGroupId !== undefined
        && sourceGroupId !== targetGroupId
        && itemCountsByGroupId.get(sourceGroupId) === 1
        && itemCountsByGroupId.get(targetGroupId) === 1;
      const hasImportEdge = importEdgeIds.has(
        `${sourceGroupId}->${targetGroupId}`,
      );
      const id = `${source}->${target}`;

      if (source !== target
        && !referenceEdges.has(id)
        && (!hasSoleItems || !hasImportEdge)
      ) {
        referenceEdges.set(id, {
          data: { relation: 'reference' },
          id,
          label: 'reference',
          source,
          target,
        });
      }

      return;
    }

    const childDependencies = resolved.dependencies ?? [];

    for (const child of childDependencies) {
      await addDependencyEdges(source, child, visited);
    }
  }

  for (const [item, id] of idsByItem) {
    const visited = new Set<Dependency>();
    const dependencies = item.dependencies ?? [];

    for (const dependency of dependencies) {
      await addDependencyEdges(id, dependency, visited);
    }
  }

  return [...referenceEdges.values()];
}
