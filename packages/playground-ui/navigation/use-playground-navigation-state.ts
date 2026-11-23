import type { GraphPayloadLog, GraphPayloadSourceLocation } from '@codegena/graph-core';
import {
  type Dispatch,
  type RefObject,
  type SetStateAction,
  useRef,
  useState,
} from 'react';

export interface PlaygroundNavigationState {
  explicitSelectedNodeIds: string[];
  focusRevision: number;
  focusedFileId: string | undefined;
  focusedWarning: GraphPayloadLog | undefined;
  hasOpenedPanelsOnSelectionRef: RefObject<boolean>;
  highlightFocusedWarning: boolean;
  implicitSelectedNodeIds: string[];
  latestWarningFocusRef: RefObject<GraphPayloadLog | undefined>;
  navigationTarget: GraphPayloadSourceLocation | undefined;
  selectedGeneratedLine: number | undefined;
  selectedNodeIds: string[];
  setExplicitSelectedNodeIds: Dispatch<SetStateAction<string[]>>;
  setFocusedFileId: Dispatch<SetStateAction<string | undefined>>;
  setFocusedWarning: Dispatch<SetStateAction<GraphPayloadLog | undefined>>;
  setFocusRevision: Dispatch<SetStateAction<number>>;
  setHighlightFocusedWarning: Dispatch<SetStateAction<boolean>>;
  setImplicitSelectedNodeIds: Dispatch<SetStateAction<string[]>>;
  setNavigationTarget: Dispatch<SetStateAction<
    GraphPayloadSourceLocation | undefined
  >>;
  setSelectedGeneratedLine: Dispatch<SetStateAction<number | undefined>>;
  setSelectedNodeIds: Dispatch<SetStateAction<string[]>>;
}

export function usePlaygroundNavigationState(
  hasRestoredLayout: boolean,
): PlaygroundNavigationState {
  // Keep effective selection for details separate from explicit/implicit IDs
  // so switching views cannot promote an implicit file.
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [explicitSelectedNodeIds, setExplicitSelectedNodeIds] = useState<string[]>([]);
  const [implicitSelectedNodeIds, setImplicitSelectedNodeIds] = useState<string[]>([]);
  const [navigationTarget, setNavigationTarget] = useState<GraphPayloadSourceLocation>();
  const [selectedGeneratedLine, setSelectedGeneratedLine] = useState<number>();
  const [focusedWarning, setFocusedWarning] = useState<GraphPayloadLog>();
  const [focusedFileId, setFocusedFileId] = useState<string>();
  // Repeated reveals of one target need distinct highlight animation keys.
  const [focusRevision, setFocusRevision] = useState(0);
  const [highlightFocusedWarning, setHighlightFocusedWarning] = useState(false);
  const hasOpenedPanelsOnSelectionRef = useRef(hasRestoredLayout);
  const latestWarningFocusRef = useRef<GraphPayloadLog | undefined>(undefined);

  return {
    explicitSelectedNodeIds,
    focusRevision,
    focusedFileId,
    focusedWarning,
    hasOpenedPanelsOnSelectionRef,
    highlightFocusedWarning,
    implicitSelectedNodeIds,
    latestWarningFocusRef,
    navigationTarget,
    selectedGeneratedLine,
    selectedNodeIds,
    setExplicitSelectedNodeIds,
    setFocusedFileId,
    setFocusedWarning,
    setFocusRevision,
    setHighlightFocusedWarning,
    setImplicitSelectedNodeIds,
    setNavigationTarget,
    setSelectedGeneratedLine,
    setSelectedNodeIds,
  };
}
