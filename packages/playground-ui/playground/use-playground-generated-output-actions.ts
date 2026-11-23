import {
  type GraphPayload,
  type GraphPayloadLog,
  type GraphPayloadSourceLocation,
  getGraphSelectionState,
} from '@codegena/graph-core';
import { useCallback } from 'react';

interface GeneratedOutputActionsOptions {
  graph: GraphPayload;
  onNavigateToSource: (
    location: GraphPayloadSourceLocation,
    declarationId?: string,
  ) => void;
  onSelectChange: (
    ids: string[],
    selectedNodeId?: string,
    shouldRevealFile?: boolean,
    explicitIds?: string[],
  ) => void;
  onShowWarnings: (log: GraphPayloadLog) => void;
  setDetailsScope: (scope: 'all' | 'selected') => void;
  showBothPanels: () => void;
  showDetailsPanel: () => void;
}

export function usePlaygroundGeneratedOutputActions({
  graph,
  onNavigateToSource,
  onSelectChange,
  onShowWarnings,
  setDetailsScope,
  showBothPanels,
  showDetailsPanel,
}: GeneratedOutputActionsOptions): {
  handleGeneratedWarningClick: (log: GraphPayloadLog) => void;
  revealDeclarationFromGlyph: (
    nodeId: string,
    wasExplicitlySelected: boolean,
  ) => void;
  revealDetails: (nodeId: string, scope: 'all' | 'selected') => void;
  revealInSpecification: (nodeId: string) => void;
} {
  const handleGeneratedWarningClick = useCallback((log: GraphPayloadLog): void => {
    setDetailsScope('selected');
    onShowWarnings(log);
  }, [
    onShowWarnings,
    setDetailsScope,
  ]);

  const revealDeclarationFromGlyph = useCallback((
    nodeId: string,
    wasExplicitlySelected: boolean,
  ): void => {
    showBothPanels();

    if (!wasExplicitlySelected) {
      return;
    }

    const node = graph.nodes.find(({ id }) => id === nodeId);

    if (node?.data.kind === 'item') {
      onNavigateToSource(node.data.sourceLocation);
    }
  }, [
    graph.nodes,
    onNavigateToSource,
    showBothPanels,
  ]);

  const revealDetails = useCallback((
    nodeId: string,
    scope: 'all' | 'selected',
  ): void => {
    const activeIds = getGraphSelectionState(
      graph,
      new Set([nodeId]),
    ).activeNodeIds;

    onSelectChange([...activeIds], nodeId, scope === 'all', [nodeId]);
    setDetailsScope(scope);
    showDetailsPanel();
  }, [
    graph,
    onSelectChange,
    setDetailsScope,
    showDetailsPanel,
  ]);

  const revealInSpecification = useCallback((nodeId: string): void => {
    const node = graph.nodes.find(({ id }) => id === nodeId);

    if (node?.data.kind === 'item') {
      onNavigateToSource(node.data.sourceLocation, nodeId);
    }
  }, [
    graph.nodes,
    onNavigateToSource,
  ]);

  return {
    handleGeneratedWarningClick,
    revealDeclarationFromGlyph,
    revealDetails,
    revealInSpecification,
  };
}
