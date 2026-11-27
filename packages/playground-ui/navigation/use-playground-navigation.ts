import type {
  GraphPayload,
  GraphPayloadLog,
  GraphPayloadNode,
  GraphPayloadSourceLocation,
} from '@codegena/graph-core';
import type { GeneratedFileSortMode } from '@codegena/playground-ui/preferences';

import { useNavigateToSource } from './use-navigate-to-source';
import { usePlaygroundNavigationState } from './use-playground-navigation-state';
import { useRevealNode } from './use-reveal-node';
import { useRevealWarning } from './use-reveal-warning';
import { useSelectChange } from './use-select-change';
import { useShowWarnings } from './use-show-warnings';

interface PlaygroundNavigation {
  explicitSelectedNodeIds: string[];
  focusRevision: number;
  focusedWarning?: GraphPayloadLog;
  focusedFileId?: string;
  handleNavigateToSource: (
    location: GraphPayloadSourceLocation,
    generatedDeclarationId?: string,
    generatedLine?: number,
  ) => void;
  handleRevealNode: (nodeId: string) => void;
  handleRevealWarning: (log: GraphPayloadLog) => void;
  handleSelectChange: (
    ids: string[],
    selectedNodeId?: string,
    shouldRevealFile?: boolean,
    explicitIds?: string[],
  ) => void;
  handleShowWarnings: (log: GraphPayloadLog) => void;
  highlightFocusedWarning: boolean;
  implicitSelectedNodeIds: string[];
  navigationTarget?: GraphPayloadSourceLocation;
  selectedGeneratedLine?: number;
  selectedNodeIds: string[];
}

interface PlaygroundNavigationOptions {
  graph: GraphPayload;
  hasRestoredLayout: boolean;
  onLogVisited: (log: GraphPayloadLog) => void;
  onNodeVisited: (node: GraphPayloadNode) => void;
  showBothPanels: () => void;
  showDetailsPanel: () => void;
  showSourcePanel: () => void;
  sortMode: GeneratedFileSortMode;
  sourceOpen: boolean;
}

export function usePlaygroundNavigation({
  graph,
  hasRestoredLayout,
  onLogVisited,
  onNodeVisited,
  showBothPanels,
  showDetailsPanel,
  showSourcePanel,
  sortMode,
  sourceOpen,
}: PlaygroundNavigationOptions): PlaygroundNavigation {
  const state = usePlaygroundNavigationState(hasRestoredLayout);

  const handleNavigateToSource = useNavigateToSource({
    graph,
    isSourceOpen: sourceOpen,
    onNodeVisited,
    showSourcePanel,
    state,
  });

  const handleSelectChange = useSelectChange({
    graph,
    onNodeVisited,
    showBothPanels,
    sortMode,
    state,
  });

  const handleRevealNode = useRevealNode({
    graph,
    onNodeVisited,
    showDetailsPanel,
    state,
  });

  const handleShowWarnings = useShowWarnings(
    onLogVisited,
    showDetailsPanel,
    state,
  );

  const handleRevealWarning = useRevealWarning(
    graph,
    handleRevealNode,
    handleShowWarnings,
  );

  return {
    explicitSelectedNodeIds: state.explicitSelectedNodeIds,
    focusRevision: state.focusRevision,
    focusedWarning: state.focusedWarning,
    focusedFileId: state.focusedFileId,
    handleNavigateToSource,
    handleRevealNode,
    handleRevealWarning,
    handleSelectChange,
    handleShowWarnings,
    highlightFocusedWarning: state.highlightFocusedWarning,
    implicitSelectedNodeIds: state.implicitSelectedNodeIds,
    navigationTarget: state.navigationTarget,
    selectedGeneratedLine: state.selectedGeneratedLine,
    selectedNodeIds: state.selectedNodeIds,
  };
}
