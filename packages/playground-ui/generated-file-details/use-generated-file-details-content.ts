import type {
  GraphPayload,
  GraphPayloadDirectoryNode,
  GraphPayloadGroupNode,
  GraphPayloadItemNode,
  GraphPayloadLog,
  GraphPayloadNode,
} from '@codegena/graph-core';
import { useMemo } from 'react';

import {
  getGeneratedDeclarationsByFileId,
} from './get-generated-declarations-by-file-id';
import { useFileEditorHeights } from './use-file-editor-heights';
import { useVisibleDirectories } from './use-visible-directories';
import { useVisibleFiles } from './use-visible-files';
import { useUniqueWarningLogs, useWarningLogs } from './warning-logs';

const smoothScrollFileLimit = 15;

interface GeneratedFileDetailsContentOptions {
  explicitSelectedNodeIds: string[];
  focusedWarning?: GraphPayloadLog;
  graph: GraphPayload;
  selectedGeneratedLine?: number;
  selectedNodeIds: string[];
  showAllFiles: boolean;
}

interface GeneratedFileDetailsContent {
  declarationsByFileId: ReadonlyMap<string, GraphPayloadItemNode[]>;
  editorHeights: ReadonlyMap<string, number>;
  hasToShowPlaceholder: boolean;
  hasToShowVirtualList: boolean;
  hasWarnings: boolean;
  scrollBehavior: ScrollBehavior;
  selectedLineByFileId: ReadonlyMap<string, number>;
  selectedFileIds: ReadonlySet<string>;
  uniqueWarningLogs: GraphPayloadLog[];
  visibleDirectories: GraphPayloadDirectoryNode[];
  visibleFiles: GraphPayloadGroupNode[];
}

function mapSelectedNodeToGeneratedLine(
  node: GraphPayloadNode,
  selectedGeneratedLine?: number,
): Array<[string, number]> {
  if (node.data.kind === 'item' && node.parentId) {
    return [[node.parentId, selectedGeneratedLine ?? node.data.line ?? 1]];
  }

  return node.data.kind === 'group' ? [[node.id, 1]] : [];
}

export function useGeneratedFileDetailsContent({
  explicitSelectedNodeIds,
  focusedWarning,
  graph,
  selectedGeneratedLine,
  selectedNodeIds,
  showAllFiles,
}: GeneratedFileDetailsContentOptions): GeneratedFileDetailsContent {
  const {
    selectedFileIds,
    visibleFiles,
    visibleFileIds,
  } = useVisibleFiles(
    graph.nodes,
    selectedNodeIds,
    showAllFiles,
  );

  const editorHeights = useFileEditorHeights(visibleFiles);
  const visibleDirectories = useVisibleDirectories(
    graph.nodes,
    explicitSelectedNodeIds,
    showAllFiles,
  );

  const declarationsByFileId = useMemo(() => (
    getGeneratedDeclarationsByFileId(graph.nodes)
  ), [graph.nodes]);

  const nodesById = useMemo(() => new Map(
    graph.nodes.map((node): [string, GraphPayloadNode] => [node.id, node]),
  ), [graph.nodes]);

  const selectedLineByFileId = useMemo(() => {
    return new Map(explicitSelectedNodeIds
      .map((id) => nodesById.get(id))
      .filter((node): node is GraphPayloadNode => node !== undefined)
      .flatMap((node) => mapSelectedNodeToGeneratedLine(
        node,
        selectedGeneratedLine,
      )));
  }, [
    explicitSelectedNodeIds,
    nodesById,
    selectedGeneratedLine,
  ]);

  const warningLogs = useWarningLogs(
    graph.nodes,
    visibleFileIds,
    graph.logs,
    showAllFiles,
  );

  const uniqueWarningLogs = useUniqueWarningLogs(
    warningLogs,
    focusedWarning,
  );

  const hasWarnings = uniqueWarningLogs.length > 0;
  const hasToShowVirtualList = visibleFiles.length > 0
    || visibleDirectories.length > 0
    || hasWarnings;
  const hasToShowPlaceholder = visibleFiles.length === 0
    && visibleDirectories.length === 0;

  const scrollBehavior: ScrollBehavior = visibleFiles.length <= smoothScrollFileLimit
    ? 'smooth'
    : 'instant';

  return {
    declarationsByFileId,
    editorHeights,
    hasToShowPlaceholder,
    hasToShowVirtualList,
    hasWarnings,
    scrollBehavior,
    selectedLineByFileId,
    selectedFileIds,
    uniqueWarningLogs,
    visibleDirectories,
    visibleFiles,
  };
}
