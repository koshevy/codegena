import type {
  GraphPayloadGroupNode,
  GraphPayloadNode,
} from '@codegena/graph-core';
import {
  type Dispatch,
  type RefObject,
  type SetStateAction,
  useEffect,
  useRef,
} from 'react';

interface RevealGeneratedFileItemOptions {
  expandedItems: string[];
  graphNodes: GraphPayloadNode[];
  isActive: boolean;
  locallySelectedNodeIdRef: RefObject<string | null>;
  selectedNodeIds: string[];
  setExpandedItems: Dispatch<SetStateAction<string[]>>;
}

function getExpandableParentIds(
  nodes: GraphPayloadNode[],
  selectedNodeId: string,
): string[] {
  const selectedNode = nodes.find(({ id }) => id === selectedNodeId);

  if (selectedNode?.data.kind === 'directory') {
    if (selectedNode.id === '.') {
      return [];
    }

    const parents = selectedNode.id.split('/');

    return parents.map((_, index) => parents.slice(0, index + 1).join('/'));
  }

  const groupId = selectedNode?.data.kind === 'item'
    ? selectedNode.parentId
    : selectedNodeId;

  const group = nodes.find((node): node is GraphPayloadGroupNode => (
    node.data.kind === 'group' && node.id === groupId
  ));

  if (!group) {
    return [];
  }

  const directoryParts = group.data.fileName.split('/').slice(0, -1);
  const directories = directoryParts.map((_, index) => (
    directoryParts.slice(0, index + 1).join('/')
  ));

  return [...directories, group.id];
}

export function useRevealGeneratedFileItem({
  expandedItems,
  graphNodes,
  isActive,
  locallySelectedNodeIdRef,
  selectedNodeIds,
  setExpandedItems,
}: RevealGeneratedFileItemOptions): RefObject<HTMLDivElement | null> {
  const rootRef = useRef<HTMLDivElement>(null);
  const pendingRevealIdRef = useRef<string | null>(null);
  const previousSelectedNodeIdsRef = useRef(selectedNodeIds);

  useEffect(() => {
    const previousSelectedNodeIds = previousSelectedNodeIdsRef.current;
    const newlySelectedNodeId = selectedNodeIds.find((id) => (
      !previousSelectedNodeIds.includes(id)
    ));

    const selectedNodeId = newlySelectedNodeId
      ?? (selectedNodeIds.length === 1 ? selectedNodeIds[0] : null);

    previousSelectedNodeIdsRef.current = selectedNodeIds;

    const isLocalSelection = selectedNodeId === locallySelectedNodeIdRef.current;

    pendingRevealIdRef.current = isActive && !isLocalSelection
      ? selectedNodeId
      : null;
    locallySelectedNodeIdRef.current = null;
  }, [
    isActive,
    locallySelectedNodeIdRef,
    selectedNodeIds,
  ]);

  useEffect(() => {
    const selectedNodeId = pendingRevealIdRef.current;

    if (!isActive || !selectedNodeId) {
      return;
    }

    const parents = getExpandableParentIds(graphNodes, selectedNodeId);

    if (parents.length === 0) {
      return;
    }

    setExpandedItems((current) => [
      ...new Set([...current, ...parents]),
    ]);
  }, [
    graphNodes,
    isActive,
    selectedNodeIds,
    setExpandedItems,
  ]);

  useEffect(() => {
    const selectedNodeId = pendingRevealIdRef.current;

    if (!isActive || !selectedNodeId) {
      return;
    }

    const items = rootRef.current?.querySelectorAll<HTMLElement>('[data-node-id]');
    const availableItems = [...items ?? []];

    const target = availableItems.find((item) => (
      item.dataset['nodeId'] === selectedNodeId
    ));

    const node = graphNodes.find(({ id }) => id === selectedNodeId);

    const parentsToExpand = getExpandableParentIds(graphNodes, selectedNodeId);

    if (parentsToExpand.some((id) => !expandedItems.includes(id))) {
      return;
    }

    const parent = node?.data.kind === 'item'
      ? availableItems.find((item) => item.dataset['nodeId'] === node.parentId)
      : undefined;

    if (!target && !parent) {
      return;
    }

    const row = (target ?? parent)?.querySelector<HTMLElement>(
      ':scope > .MuiTreeItem-content',
    );

    row?.scrollIntoView({ block: 'nearest' });
    pendingRevealIdRef.current = null;
  }, [
    expandedItems,
    graphNodes,
    isActive,
    selectedNodeIds,
  ]);

  return rootRef;
}
