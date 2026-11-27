import type {
  GraphPayload,
  GraphPayloadEdgeRelation,
  GraphPayloadLog,
} from '@codegena/graph-core';
import type { GeneratedFileSortMode, GeneratedView }
  from '@codegena/playground-ui/preferences';

export interface PlaygroundGeneratedOutputViewProps {
  canCollapseDirectories: boolean;
  canExpandDirectories: boolean;
  directoryCount: number;
  detailsOpen: boolean;
  detailsScope: 'all' | 'selected';
  expandedDirectoryIds: ReadonlySet<string>;
  expandedFileIds: string[];
  fitViewRevision: number;
  generatedView: GeneratedView;
  graph: GraphPayload;
  hasCollapsedFiles: boolean;
  hasExpandedFiles: boolean;
  implicitSelectedNodeIds: string[];
  onCollapseAll: () => void;
  onCollapseAllDirectories: () => void;
  onExpandAll: () => void;
  onExpandAllDirectories: () => void;
  onDeclarationGlyphClick: (nodeId: string, wasExplicitlySelected: boolean) => void;
  onExpandedDirectoryIdsChange: (ids: Set<string>) => void;
  onExpandedFileIdsChange: (ids: string[]) => void;
  onRevealInSpecification: (nodeId: string) => void;
  onSelectChange: (
    ids: string[],
    selectedNodeId?: string,
    isShiftSelection?: boolean,
    explicitSelectionCount?: number,
    explicitSelectedNodeIds?: string[],
  ) => void;
  onShowInDetails: (nodeId: string, scope: 'all' | 'selected') => void;
  onVisibleEdgeRelationsChange: (relations: GraphPayloadEdgeRelation[]) => void;
  onWarningClick: (log: GraphPayloadLog) => void;
  selectedNodeIds: string[];
  sortMode: GeneratedFileSortMode;
  sourceOpen: boolean;
}
