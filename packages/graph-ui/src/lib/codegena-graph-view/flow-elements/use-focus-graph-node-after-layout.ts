import type { Node, ReactFlowInstance } from '@xyflow/react';
import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
} from 'react';

const centerAnimationDuration = 350;

/**
 * Focuses a revealed declaration or toggled directory after ELK finishes layout.
 */
interface FocusGraphNodeAfterLayoutOptions {
  fitViewRevision: number;
  fitViewAfterBulkChangeRef: RefObject<boolean>;
  isActive: boolean;
  isCurrentLayoutReady: boolean;
  nodes: Node[];
  onGraphInit: (instance: ReactFlowInstance) => void;
  pendingRevealedNodeIdRef: RefObject<string | null>;
  toggledDirectoryIdRef: RefObject<string | null>;
}

export function useFocusGraphNodeAfterLayout({
  fitViewRevision,
  fitViewAfterBulkChangeRef,
  isActive,
  isCurrentLayoutReady,
  nodes,
  onGraphInit,
  pendingRevealedNodeIdRef,
  toggledDirectoryIdRef,
}: FocusGraphNodeAfterLayoutOptions): (instance: ReactFlowInstance) => void {
  const instanceRef = useRef<ReactFlowInstance | null>(null);

  const handleInit = useCallback((instance: ReactFlowInstance): void => {
    instanceRef.current = instance;
    onGraphInit(instance);
  }, [
    onGraphInit,
  ]);

  useEffect(() => {
    const instance = instanceRef.current;

    if (!isActive || !isCurrentLayoutReady || !instance) {
      return;
    }

    if (fitViewAfterBulkChangeRef.current) {
      fitViewAfterBulkChangeRef.current = false;
      pendingRevealedNodeIdRef.current = null;
      toggledDirectoryIdRef.current = null;
      void instance.fitView({
        duration: centerAnimationDuration,
        maxZoom: 1,
        padding: 0.18,
      });
      return;
    }

    const revealedNodeId = pendingRevealedNodeIdRef.current;

    if (revealedNodeId && nodes.some(({ id }) => id === revealedNodeId)) {
      pendingRevealedNodeIdRef.current = null;
      toggledDirectoryIdRef.current = null;
      // todo Need human review to find out the difference
      //      with useRevealGraphNode and related risks.
      //      Also need to unify max/min view options.
      void instance.fitView({
        duration: centerAnimationDuration,
        maxZoom: 0.75,
        nodes: [{ id: revealedNodeId }],
      });
      return;
    }

    const toggledDirectoryId = toggledDirectoryIdRef.current;

    if (!toggledDirectoryId) {
      return;
    }

    const directory = nodes.find(({ id }) => id === toggledDirectoryId);

    if (!directory) {
      return;
    }

    toggledDirectoryIdRef.current = null;

    const centerX = directory.position.x + Number(directory.style?.width) / 2;
    const centerY = directory.position.y + Number(directory.style?.height) / 2;

    void instance.setCenter(centerX, centerY, {
      duration: centerAnimationDuration,
      zoom: instance.getZoom(),
    });
  }, [
    fitViewRevision,
    fitViewAfterBulkChangeRef,
    isActive,
    isCurrentLayoutReady,
    nodes,
    pendingRevealedNodeIdRef,
    toggledDirectoryIdRef,
  ]);

  return handleInit;
}
