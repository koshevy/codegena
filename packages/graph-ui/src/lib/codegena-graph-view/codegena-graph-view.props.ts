import type {
  GraphPayload,
  GraphPayloadEdgeRelation,
  GraphPayloadLog,
} from '@codegena/graph-core';

import type {
  GraphNodeContextMenuHandler,
  GraphPaneContextMenuHandler,
} from './graph-interactions';
import type {
  GraphSelectionChangeHandler,
} from './graph-selection';

export interface CodegenaGraphViewProps {
  defaultSelectedNodeIds?: string[];
  embedded?: boolean;
  expandedDirectoryIds?: ReadonlySet<string>;
  fitViewRevision?: number;
  graph: GraphPayload;
  height?: number | string;
  /**
   * Additional nodes to display as implicitly selected beside explicit selections.
   */
  implicitSelectedNodeIds?: string[];
  isActive?: boolean;
  onDeclarationGlyphClick?: (nodeId: string, wasExplicitlySelected: boolean) => void;
  onSelectChange?: GraphSelectionChangeHandler;
  onExpandedDirectoryIdsChange?: (ids: Set<string>) => void;
  /**
   * Reports relation types of edges currently rendered in the graph.
   */
  onVisibleEdgeRelationsChange?: (relations: GraphPayloadEdgeRelation[]) => void;
  onNodeContextMenu?: GraphNodeContextMenuHandler;
  onPaneContextMenu?: GraphPaneContextMenuHandler;
  onWarningClick?: (log: GraphPayloadLog) => void;
  title?: string;
}
