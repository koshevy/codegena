import type { GraphNodeContextActions } from '@codegena/graph-core';
import type { MouseEvent } from 'react';

export type GraphNodeContextMenuHandler = (
  event: MouseEvent,
  nodeId: string,
  actions: GraphNodeContextActions,
) => void;

export type GraphPaneContextMenuHandler = (
  event: MouseEvent | globalThis.MouseEvent,
  clearSelection: () => void,
) => void;
