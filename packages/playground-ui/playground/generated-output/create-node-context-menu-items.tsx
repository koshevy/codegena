import type {
  GraphPayload,
  GraphPayloadLog,
  GraphPayloadNode,
  GraphNodeContextActions,
} from '@codegena/graph-core';
import { getWarningLog } from '@codegena/playground-ui/graph-utils';
import type { ContextMenuItem } from '@codegena/ui-unified/menus';
import {
  FileSearch,
  FolderClosed,
  FolderOpen,
  ListChecks,
  SearchCode,
  SquareCode,
  SquareCheck,
  SquareMinus,
  TriangleAlert,
} from 'lucide-react';

interface NodeContextMenuOptions {
  actions: GraphNodeContextActions;
  detailsOpen: boolean;
  detailsScope: 'all' | 'selected';
  graph: GraphPayload;
  nodeId: string;
  onRevealInSpecification: (nodeId: string) => void;
  onShowInDetails: (nodeId: string, scope: 'all' | 'selected') => void;
  selectedNodeIds: string[];
  sourceOpen: boolean;
}

function getFileId(node?: GraphPayloadNode): string | undefined {
  if (node?.data.kind === 'item') {
    return node.parentId;
  }

  if (node?.data.kind === 'group') {
    return node.id;
  }

  return undefined;
}

export function createNodeContextMenuItems({
  actions,
  detailsOpen,
  detailsScope,
  graph,
  nodeId,
  onRevealInSpecification,
  onShowInDetails,
  selectedNodeIds,
  sourceOpen,
}: NodeContextMenuOptions): ContextMenuItem[] {
  const node = graph.nodes.find(({ id }) => id === nodeId);

  if (!node) {
    return [];
  }

  const children = graph.nodes.filter((candidate) => (
    'parentId' in candidate && candidate.parentId === nodeId
  ));

  const logs: GraphPayloadLog[] = node.data.kind === 'item'
    ? node.data.logs
    : children.flatMap((child) => child.data.kind === 'item' ? child.data.logs : []);

  const warning = getWarningLog(logs);
  const selectedNodeIdSet = new Set(selectedNodeIds);
  const selectedNodes = graph.nodes.filter(({ id }) => (
    selectedNodeIdSet.has(id)
  ));
  const targetFileId = getFileId(node);

  const isOnlySelectedFile = targetFileId !== undefined
    && selectedNodes.length > 0
    && selectedNodes.every((selectedNode) => (
      getFileId(selectedNode) === targetFileId
    ));
  const selectionItem: ContextMenuItem = actions.isSelected
    ? {
        icon: <SquareMinus aria-hidden />,
        id: 'deselect',
        label: 'Deselect',
        onSelect: (event) => actions.unselect(event.shiftKey),
      }
    : {
        icon: <SquareCheck aria-hidden />,
        id: 'select',
        label: 'Select',
        onSelect: (event) => actions.select(event.shiftKey),
      };

  const items: ContextMenuItem[] = [selectionItem];

  if (node.data.kind === 'directory' && actions.directoryExpansion) {
    const { isExpanded, toggle } = actions.directoryExpansion;

    items.push({
      icon: isExpanded
        ? <FolderClosed aria-hidden />
        : <FolderOpen aria-hidden />,
      id: isExpanded ? 'collapse-directory' : 'expand-directory',
      label: isExpanded ? 'Collapse directory' : 'Expand directory',
      onSelect: toggle,
    });
  }

  items.push(
    {
      disabled: isOnlySelectedFile && detailsOpen && detailsScope === 'selected',
      icon: <SquareCode aria-hidden />,
      id: 'reveal-details-selected',
      label: 'Reveal details (only this)',
      onSelect: () => onShowInDetails(nodeId, 'selected'),
    },
    {
      icon: <SearchCode aria-hidden />,
      id: 'reveal-details-all',
      label: 'Reveal details (between others)',
      onSelect: () => onShowInDetails(nodeId, 'all'),
    },
    {
      disabled: !warning,
      icon: <TriangleAlert aria-hidden />,
      id: 'reveal-warnings',
      label: 'Reveal warnings',
      onSelect: () => {
        if (warning) {
          actions.revealWarning(warning);
        }
      },
    },
  );

  if (!sourceOpen && node.data.kind === 'item') {
    items.push({
      icon: <FileSearch aria-hidden />,
      id: 'reveal-in-specification',
      label: 'Reveal in specification',
      onSelect: () => onRevealInSpecification(nodeId),
    });
  }
  else if (node.data.kind === 'group') {
    items.push({
      disabled: children.length <= 1
        || actions.areSelected(children.map(({ id }) => id)),
      icon: <ListChecks aria-hidden />,
      id: 'select-declarations',
      label: 'Select all declarations',
      onSelect: (event) => actions.selectMany(
        children.map(({ id }) => id),
        event.shiftKey,
      ),
    });
  }

  return items;
}
