import type { GraphPayload } from '@codegena/graph-core';
import type { ReactFlowInstance } from '@xyflow/react';
import {
  type Dispatch,
  type RefObject,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { getAncestorDirectoryIds } from './get-ancestor-directory-ids';

export function useRevealGraphNode(
  {
    defaultSelectedNodeIds,
    expandedDirectoryIds,
    graph,
    isActive,
    pendingRevealedNodeIdRef,
    setExpandedDirectoryIds,
  }: {
    defaultSelectedNodeIds: string[];
    expandedDirectoryIds: ReadonlySet<string>;
    graph: GraphPayload;
    isActive: boolean;
    pendingRevealedNodeIdRef: RefObject<string | null>;
    setExpandedDirectoryIds: Dispatch<SetStateAction<Set<string>>>;
  },
): {
  explicitlySelectedIds: Set<string>;
  handleGraphInit: (instance: ReactFlowInstance) => void;
  recordLocalSelection: (ids: string[]) => void;
  setExplicitlySelectedIds: Dispatch<SetStateAction<Set<string>>>;
} {
  const [explicitlySelectedIds, setExplicitlySelectedIds] = useState<Set<string>>(
    () => new Set(defaultSelectedNodeIds),
  );

  const fitViewNodeRef = useRef<((nodeId: string) => void) | null>(null);
  const pendingLocalSelectionsRef = useRef(new WeakSet<string[]>());
  const previousSelectionRef = useRef(defaultSelectedNodeIds);
  const wasActiveRef = useRef(isActive);

  const recordLocalSelection = useCallback((ids: string[]): void => {
    pendingLocalSelectionsRef.current.add(ids);
  }, []);

  const revealNode = useCallback((nodeId: string): void => {
    if (graph.nodes.every(({ id }) => id !== nodeId)) {
      return;
    }

    const collapsedDirectoryIds = getAncestorDirectoryIds(graph, nodeId)
      .filter((id) => !expandedDirectoryIds.has(id));

    if (collapsedDirectoryIds.length > 0) {
      pendingRevealedNodeIdRef.current = nodeId;
      setExpandedDirectoryIds((current) => new Set([
        ...current,
        ...collapsedDirectoryIds,
      ]));
      return;
    }

    requestAnimationFrame(() => fitViewNodeRef.current?.(nodeId));
  }, [
    expandedDirectoryIds,
    graph,
    pendingRevealedNodeIdRef,
    setExpandedDirectoryIds,
  ]);

  useEffect(() => {
    const previousSelection = previousSelectionRef.current;
    const isSelectionChanged = previousSelection !== defaultSelectedNodeIds;
    const isBecameActive = isActive && !wasActiveRef.current;
    const newlySelectedNodeId = defaultSelectedNodeIds.find((id) => (
      !previousSelection.includes(id)
    ));
    const selectedNodeId = newlySelectedNodeId
      ?? (defaultSelectedNodeIds.length === 1
        ? defaultSelectedNodeIds[0]
        : undefined);

    previousSelectionRef.current = defaultSelectedNodeIds;
    wasActiveRef.current = isActive;

    if (!isActive || (!isSelectionChanged && !isBecameActive)) {
      return;
    }

    // The parent echoes a graph click with the exact array emitted for it.
    const isLocalEcho = pendingLocalSelectionsRef.current.delete(defaultSelectedNodeIds);

    if (isLocalEcho) {
      return;
    }

    setExplicitlySelectedIds(new Set(defaultSelectedNodeIds));

    if (selectedNodeId && isSelectionChanged) {
      revealNode(selectedNodeId);
    }
  }, [
    defaultSelectedNodeIds,
    isActive,
    revealNode,
  ]);

  const handleGraphInit = useCallback((instance: ReactFlowInstance): void => {
    fitViewNodeRef.current = (nodeId) => {
      // todo Need human review to find out the difference
      //      with useFocusGraphNodeAfterLayout and related risks.
      //      Also need to unify max/min view options.
      void instance.fitView({ maxZoom: 0.75, nodes: [{ id: nodeId }] });
    };

    const selectedNodeId = defaultSelectedNodeIds.length === 1
      ? defaultSelectedNodeIds[0]
      : undefined;

    if (selectedNodeId && isActive) {
      revealNode(selectedNodeId);
    }
  }, [
    defaultSelectedNodeIds,
    isActive,
    revealNode,
  ]);

  return {
    explicitlySelectedIds,
    handleGraphInit,
    recordLocalSelection,
    setExplicitlySelectedIds,
  };
}
