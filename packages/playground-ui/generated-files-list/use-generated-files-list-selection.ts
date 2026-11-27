import {
  type GraphPayload,
  type GraphPayloadLog,
  getGraphSelectionState,
  type GraphNodeContextActions,
  toggleSelectedNode,
} from '@codegena/graph-core';
import {
  type MouseEvent,
  type RefObject,
  type SetStateAction,
  type SyntheticEvent,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  useState,
} from 'react';

import type { GeneratedFilesListProps } from './generated-files-list.props';
import { useGeneratedFilesListContextActions }
  from './use-generated-files-list-context-actions';
import { useRevealGeneratedFileItem } from './use-reveal-generated-file-item';

interface GeneratedFilesListSelection {
  clearSelection: () => void;
  expandedItems: string[];
  handleItemClick: (event: MouseEvent, itemId: string) => void;
  getContextActions: (nodeId: string) => GraphNodeContextActions;
  handleSelectedItemsChange: (
    event: SyntheticEvent | null,
    ids: string[],
  ) => void;
  handleWarningClick: (nodeId: string, log: GraphPayloadLog) => void;
  rootRef: RefObject<HTMLDivElement | null>;
  selectedNodeIds: Set<string>;
  setExpandedItems: (ids: SetStateAction<string[]>) => void;
}

interface GeneratedFilesListSelectionOptions {
  defaultSelectedNodeIds?: string[];
  expandedFileIds?: string[];
  graph: GraphPayload;
  implicitSelectedNodeIds?: string[];
  isActive: boolean;
  onExpandedFileIdsChange?: GeneratedFilesListProps['onExpandedFileIdsChange'];
  onSelectChange?: GeneratedFilesListProps['onSelectChange'];
  onWarningClick?: GeneratedFilesListProps['onWarningClick'];
}

const emptyImplicitSelectedNodeIds: string[] = [];

export function useGeneratedFilesListSelection({
  defaultSelectedNodeIds = [],
  expandedFileIds,
  graph,
  implicitSelectedNodeIds = emptyImplicitSelectedNodeIds,
  isActive,
  onExpandedFileIdsChange,
  onSelectChange,
  onWarningClick,
}: GeneratedFilesListSelectionOptions): GeneratedFilesListSelection {
  const [explicitSelectedIds, setExplicitSelectedIds] = useState<Set<string>>(
    () => new Set(defaultSelectedNodeIds),
  );

  const [localExpandedItems, setLocalExpandedItems] = useState<string[]>([]);
  const expandedItems = expandedFileIds ?? localExpandedItems;
  const wasActiveRef = useRef(isActive);
  const previousDefaultSelectionRef = useRef(new Set(defaultSelectedNodeIds));
  const locallySelectedNodeIdRef = useRef<string | null>(null);
  const isExpansionControlled = expandedFileIds !== undefined;

  const setExpandedItems = useCallback((update: SetStateAction<string[]>): void => {
    const currentItems = expandedItems;
    const nextItems = typeof update === 'function' ? update(currentItems) : update;

    const isUnchanged = nextItems.length === currentItems.length
      && nextItems.every((id, index) => id === currentItems[index]);

    if (isUnchanged) {
      return;
    }

    if (isExpansionControlled) {
      onExpandedFileIdsChange?.(nextItems);
      return;
    }

    setLocalExpandedItems(nextItems);
    onExpandedFileIdsChange?.(nextItems);
  }, [
    expandedItems,
    isExpansionControlled,
    onExpandedFileIdsChange,
  ]);

  useEffect(() => {
    const nextDefaultSelection = new Set(defaultSelectedNodeIds);
    const previousDefaultSelection = previousDefaultSelectionRef.current;

    const isDefaultSelectionChanged = nextDefaultSelection.size
      !== previousDefaultSelection.size
      || [...nextDefaultSelection].some((id) => !previousDefaultSelection.has(id));
    const shouldResetSelection = !wasActiveRef.current || isDefaultSelectionChanged;

    if (isActive && shouldResetSelection) {
      setExplicitSelectedIds((current) => {
        const isSelectionMatches = current.size === nextDefaultSelection.size
          && [...nextDefaultSelection].every((id) => current.has(id));

        return isSelectionMatches ? current : nextDefaultSelection;
      });
    }

    previousDefaultSelectionRef.current = nextDefaultSelection;
    wasActiveRef.current = isActive;
  }, [
    defaultSelectedNodeIds,
    isActive,
  ]);

  const rootRef = useRevealGeneratedFileItem({
    expandedItems,
    graphNodes: graph.nodes,
    isActive,
    locallySelectedNodeIdRef,
    selectedNodeIds: defaultSelectedNodeIds,
    setExpandedItems,
  });

  const selectedNodeIds = useMemo(
    () => getGraphSelectionState(
      graph,
      explicitSelectedIds,
      implicitSelectedNodeIds,
    ).activeNodeIds,
    [
      graph,
      explicitSelectedIds,
      implicitSelectedNodeIds,
    ],
  );

  const updateSelection = useCallback((
    nextIds: Set<string>,
    selectedNodeId?: string,
    isShiftSelection = false,
  ): void => {
    locallySelectedNodeIdRef.current = selectedNodeId ?? null;
    setExplicitSelectedIds(nextIds);

    if (selectedNodeId && nextIds.has(selectedNodeId)) {
      const selectedNode = graph.nodes.find(({ id }) => id === selectedNodeId);

      if (selectedNode?.data.kind === 'group'
        || selectedNode?.data.kind === 'directory') {
        setExpandedItems((current) => (
          current.includes(selectedNodeId)
            ? current
            : [...current, selectedNodeId]
        ));
      }
    }

    onSelectChange?.(
      [...getGraphSelectionState(graph, nextIds).activeNodeIds],
      selectedNodeId && nextIds.has(selectedNodeId)
        ? selectedNodeId
        : undefined,
      isShiftSelection,
      nextIds.size,
      [...nextIds],
    );
  }, [
    graph,
    onSelectChange,
    setExpandedItems,
  ]);

  const getContextActions = useGeneratedFilesListContextActions({
    expandedItems,
    explicitSelectedIds,
    graph,
    onWarningClick,
    selectedNodeIds,
    setExpandedItems,
    updateSelection,
  });

  const handleItemClick = useCallback((event: MouseEvent, itemId: string): void => {
    const target = event.target;

    if (target instanceof Element && target.closest('.MuiTreeItem-iconContainer')) {
      return;
    }

    (event as MouseEvent & { defaultMuiPrevented?: boolean }).defaultMuiPrevented = true;

    const isDeclarationGlyphClick = target instanceof Element
      && !!target.closest('[data-declaration-type-glyph]');

    const explicitIds = isDeclarationGlyphClick && selectedNodeIds.has(itemId)
      ? new Set([...explicitSelectedIds, itemId])
      : toggleSelectedNode(graph, explicitSelectedIds, itemId, event.shiftKey);

    updateSelection(explicitIds, itemId, event.shiftKey);
  }, [
    explicitSelectedIds,
    graph,
    selectedNodeIds,
    updateSelection,
  ]);

  const handleSelectedItemsChange = useCallback((
    event: SyntheticEvent | null,
    ids: string[],
  ): void => {
    const nativeEvent = event?.nativeEvent;
    const isShiftSelection = nativeEvent !== undefined && 'shiftKey' in nativeEvent
      && nativeEvent.shiftKey === true;
    const isItemToggle = !isShiftSelection
      && nativeEvent instanceof KeyboardEvent
      && (nativeEvent.key === ' ' || nativeEvent.key === 'Enter');

    const target = event?.target;
    const targetElement = target instanceof Element ? target : null;

    if (targetElement?.closest('.MuiTreeItem-iconContainer')) {
      return;
    }

    const targetNodeId = targetElement
      ?.closest<HTMLElement>('[data-node-id]')
      ?.dataset['nodeId'];

    if (isItemToggle && targetNodeId) {
      const nextIds = toggleSelectedNode(
        graph,
        explicitSelectedIds,
        targetNodeId,
        isShiftSelection,
      );

      updateSelection(nextIds, targetNodeId, isShiftSelection);
      return;
    }

    const nextExplicitIds = new Set(ids.filter((id) => (
      explicitSelectedIds.has(id) || !selectedNodeIds.has(id)
    )));

    const selectedNodeId = [...nextExplicitIds].find((id) => (
      !explicitSelectedIds.has(id)
    ));

    updateSelection(nextExplicitIds, selectedNodeId, isShiftSelection);
  }, [
    explicitSelectedIds,
    graph,
    selectedNodeIds,
    updateSelection,
  ]);

  const handleWarningClick = useCallback((
    nodeId: string,
    log: GraphPayloadLog,
  ): void => {
    if (!selectedNodeIds.has(nodeId)) {
      updateSelection(new Set([nodeId]), nodeId);
    }

    onWarningClick?.(log);
  }, [
    onWarningClick,
    selectedNodeIds,
    updateSelection,
  ]);

  const clearSelection = useCallback((): void => {
    if (explicitSelectedIds.size > 0) {
      updateSelection(new Set());
    }
  }, [
    explicitSelectedIds,
    updateSelection,
  ]);

  return {
    clearSelection,
    expandedItems,
    getContextActions,
    handleItemClick,
    handleSelectedItemsChange,
    handleWarningClick,
    rootRef,
    selectedNodeIds,
    setExpandedItems,
  };
}
