import type {
  UltimateParserVisitorResult,
  UltimateParserVisitorResultGroup,
} from '@codegena/oas3-core/ultimate-parser';

import type { GraphPayloadEdge } from '../graph-payload-edge';
import type { GraphPayloadNode } from '../graph-payload-node';
import { createGraphPayloadIds } from './create-graph-payload-ids';
import type {
  GraphPayloadLogEntry,
} from './map-collected-log-to-graph-payload-log-entry';
import { mapResultItemToGraphNode } from './map-result-item-to-graph-node';

export interface CollectedGraphPayloadGroups<TAstObject extends object> {
  groupIdsByItemId: Map<string, string>;
  idsByItem: Map<UltimateParserVisitorResult<TAstObject>, string>;
  importEdges: GraphPayloadEdge[];
  itemCountsByGroupId: Map<string, number>;
  nodes: GraphPayloadNode<TAstObject>[];
}

/**
 * Traverse related output groups once and collect file and declaration nodes.
 */
export async function collectGraphPayloadGroups<
  TAstObject extends object,
  TSourceFileObject extends object,
>(
  input: UltimateParserVisitorResultGroup<TSourceFileObject, TAstObject>[],
  logEntries: GraphPayloadLogEntry[],
): Promise<CollectedGraphPayloadGroups<TAstObject>> {
  type ResultGroup = UltimateParserVisitorResultGroup<
    TSourceFileObject,
    TAstObject
  >;

  const pendingGroups = [...input];
  const visitedGroups = new Set<ResultGroup>();
  const { createItemId, getGroupId } = createGraphPayloadIds<
    TAstObject,
    TSourceFileObject
  >();

  const idsByItem = new Map<UltimateParserVisitorResult<TAstObject>, string>();
  const groupIdsByItemId = new Map<string, string>();
  const itemCountsByGroupId = new Map<string, number>();
  const nodes: GraphPayloadNode<TAstObject>[] = [];
  const importEdges = new Map<string, GraphPayloadEdge>();
  let nextGroupIndex = 0;

  while (nextGroupIndex < pendingGroups.length) {
    const group = pendingGroups[nextGroupIndex];

    nextGroupIndex += 1;

    if (visitedGroups.has(group)) {
      continue;
    }

    visitedGroups.add(group);

    const groupId = getGroupId(group);
    const groupText = await group.toString();
    const itemEntries = group.groupedItems.map((item, index) => ({
      id: createItemId(groupId, item.identifierName, index),
      item,
    }));

    itemCountsByGroupId.set(groupId, itemEntries.length);
    nodes.push({
      data: {
        fileName: group.fileName,
        kind: 'group',
        label: group.fileName,
        programmingLanguage: group.groupedItems[0]?.programmingLanguage ?? 'TypeScript',
        text: groupText,
      },
      id: groupId,
      type: 'default',
    });

    const itemNodes = await Promise.all(itemEntries.map(({ id, item }) => (
      mapResultItemToGraphNode({
        groupId,
        groupText,
        id,
        item,
        logEntries,
      })
    )));

    nodes.push(...itemNodes);

    for (const { id, item } of itemEntries) {
      idsByItem.set(item, id);
      groupIdsByItemId.set(id, groupId);
    }

    const relatedGroups = (group.relatedGroups ?? []).filter((relatedGroup) => (
      relatedGroup !== group
    ));

    for (const relatedGroup of relatedGroups) {
      const target = getGroupId(relatedGroup);
      const id = `${groupId}->${target}`;

      if (!importEdges.has(id)) {
        importEdges.set(id, {
          data: { relation: 'import' },
          id,
          label: 'import',
          source: groupId,
          target,
        });
      }
    }

    pendingGroups.push(...relatedGroups);
  }

  return {
    groupIdsByItemId,
    idsByItem,
    importEdges: [...importEdges.values()],
    itemCountsByGroupId,
    nodes,
  };
}
