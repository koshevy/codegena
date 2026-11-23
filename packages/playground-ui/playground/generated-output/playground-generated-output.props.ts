import type { GraphPayload, GraphPayloadLog } from '@codegena/graph-core';
import type { GeneratedFileSortMode, GeneratedView }
  from '@codegena/playground-ui/preferences';

export interface PlaygroundGeneratedOutputProps {
  detailsOpen: boolean;
  detailsScope: 'all' | 'selected';
  generatedView: GeneratedView;
  graph: GraphPayload;
  implicitSelectedNodeIds: string[];
  onGeneratedViewChange: (view: GeneratedView) => void;
  onDeclarationGlyphClick: (nodeId: string, wasExplicitlySelected: boolean) => void;
  onRevealInSpecification: (nodeId: string) => void;
  onSelectChange: (
    ids: string[],
    selectedNodeId?: string,
    isShiftSelection?: boolean,
    explicitSelectionCount?: number,
    explicitSelectedNodeIds?: string[],
  ) => void;
  onShowInDetails: (nodeId: string, scope: 'all' | 'selected') => void;
  onShowSource: () => void;
  onSortModeChange: (sortMode: GeneratedFileSortMode) => void;
  onToggleDetails: () => void;
  onWarningClick: (log: GraphPayloadLog) => void;
  selectedNodeIds: string[];
  sortMode: GeneratedFileSortMode;
  sourceOpen: boolean;
}
