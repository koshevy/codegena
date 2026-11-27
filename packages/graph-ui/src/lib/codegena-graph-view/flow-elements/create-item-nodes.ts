import type {
  GraphPayloadItemNode,
  GraphPayloadItemNodeData,
} from '@codegena/graph-core';
import type { Node } from '@xyflow/react';

const datatypeWidth = 320;

export const datatypeNodeHeight = 64;

const datatypeOffsetX = 20;
const datatypeOffsetY = 60;
const datatypeGap = 12;

/**
 * Positions declarations in source order inside their file.
 * React Flow measures their rendered heights. An estimated initialHeight would
 * be reapplied when a selection replaces the controlled node, then removed
 * during measurement, resizing the observed node inside its resize callback.
 */
export function createItemNodes(
  items: GraphPayloadItemNode[],
): Node<GraphPayloadItemNodeData>[] {
  return items.map((item, index) => ({
    ...item,
    ariaLabel: `${item.data.identifierName} declaration`,
    draggable: false,
    initialWidth: datatypeWidth,
    position: {
      x: datatypeOffsetX,
      y: datatypeOffsetY + index * (datatypeNodeHeight + datatypeGap),
    },
    style: { width: datatypeWidth },
    type: 'datatype',
  }));
}
