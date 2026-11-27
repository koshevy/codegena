import type {
  GraphPayload,
  GraphPayloadLog,
  GraphNodeContextActions,
} from '@codegena/graph-core';
import type { GeneratedFileSortMode } from '@codegena/playground-ui/preferences';
import type { MouseEvent } from 'react';

export interface GeneratedFilesListProps {
  contextMenuNodeId?: string;
  defaultSelectedNodeIds?: string[];
  expandedFileIds?: string[];
  graph: GraphPayload;
  implicitSelectedNodeIds?: string[];
  isActive?: boolean;
  onSelectChange?: (
    selectedNodeIds: string[],
    selectedNodeId?: string,
    isShiftSelection?: boolean,
    explicitSelectionCount?: number,
    explicitSelectedNodeIds?: string[],
  ) => void;
  onNodeContextMenu?: (
    event: MouseEvent,
    nodeId: string,
    actions: GraphNodeContextActions,
  ) => void;
  onExpandedFileIdsChange?: (ids: string[]) => void;
  onWarningClick?: (log: GraphPayloadLog) => void;
  sortMode?: GeneratedFileSortMode;
  title?: string;
}
