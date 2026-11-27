import type { UltimateParserVisitorResult } from '@codegena/oas3-core/ultimate-parser';

import type { GraphPayloadItemNode } from '../graph-payload-node';
import { createGraphPayloadSourceLocation } from './create-graph-payload-source-location';
import { getGeneratedCodeLocation } from './get-generated-code-location';
import { isGraphPayloadLogWithinSource } from './is-graph-payload-log-within-source';
import type {
  GraphPayloadLogEntry,
} from './map-collected-log-to-graph-payload-log-entry';

interface MapResultItemToGraphNodeProps<TAstObject extends object> {
  groupId: string;
  groupText: string;
  id: string;
  item: UltimateParserVisitorResult<TAstObject>;
  logEntries: GraphPayloadLogEntry[];
}

export async function mapResultItemToGraphNode<TAstObject extends object>({
  groupId,
  groupText,
  id,
  item,
  logEntries,
}: MapResultItemToGraphNodeProps<TAstObject>): Promise<GraphPayloadItemNode<TAstObject>> {
  const text = await item.toString();
  const generatedCodeLocation = getGeneratedCodeLocation(
    groupText,
    item.keySnippet,
  );

  return {
    data: {
      ast: item.ast,
      ...generatedCodeLocation,
      declarationType: item.declarationType ?? 'Alias',
      identifierName: item.identifierName,
      kind: 'item',
      label: item.identifierName ?? item.relativeFilePath,
      logs: logEntries
        .filter((entry) => isGraphPayloadLogWithinSource(
          entry,
          item.transitiveNode.source,
        ))
        .map(({ log }) => log),
      programmingLanguage: item.programmingLanguage,
      programmingLanguageVersion: item.programmingLanguageVersion,
      relativeFilePath: item.relativeFilePath,
      sourceLocation: createGraphPayloadSourceLocation(
        item.transitiveNode.source,
      ),
      text,
    },
    extent: 'parent',
    id,
    parentId: groupId,
  };
}
