import type {
  GraphPayloadDirectoryNodeData,
  GraphPayloadGroupNodeData,
  GraphPayloadItemNodeData,
} from '@codegena/graph-core';
import Box from '@mui/material/Box';
import { styled, useTheme } from '@mui/material/styles';
import {
  Background,
  BackgroundVariant,
  ReactFlow,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { type ReactElement, useCallback, useState } from 'react';

import { DatatypeNode } from '../datatype-node';
import { DirectoryNode } from '../directory-node';
import { FileNode } from '../file-node';
import { getDirectoryNodeWidth } from '../get-directory-node-width';

interface GraphNodeStoryProps {
  data: (
    (GraphPayloadDirectoryNodeData & { description: string })
    | GraphPayloadGroupNodeData
    | GraphPayloadItemNodeData
  );
  initiallyExpanded?: boolean;
  onToggleDirectory?: (id: string) => void;
}

const nodeTypes = {
  datatype: DatatypeNode,
  directory: DirectoryNode,
  file: FileNode,
};

const nodeStyles = {
  group: { height: 96, width: 360 },
  item: { width: 320 },
};

const nodeTypesByKind = {
  directory: 'directory',
  group: 'file',
  item: 'datatype',
} as const;

// language=postcss
export const GraphNodeStoryStyles = styled(Box)(({ theme }) => `
  & {
    background-color: ${theme.palette.background.default};
    height: 360px;
    width: 100%;
  }
`);

export function GraphNodeStory({
  data,
  initiallyExpanded = false,
  onToggleDirectory,
}: GraphNodeStoryProps): ReactElement {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

  const handleToggleDirectory = useCallback((id: string): void => {
    setIsExpanded((current) => !current);
    onToggleDirectory?.(id);
  }, [onToggleDirectory]);

  const nodes: Node[] = [{
    data: {
      ...data,
      ...(data.kind === 'directory' && {
        isExpanded,
        onToggle: handleToggleDirectory,
      }),
    },
    id: 'story-node',
    position: { x: 0, y: 0 },
    style: data.kind === 'directory'
      ? { height: 64, width: getDirectoryNodeWidth(data.label, data.description) }
      : nodeStyles[data.kind],
    type: nodeTypesByKind[data.kind],
  }];

  return (
    <GraphNodeStoryStyles>
      <ReactFlow
        edges={[]}
        fitView
        fitViewOptions={{ maxZoom: 1, padding: 0.3 }}
        nodes={nodes}
        nodesConnectable={false}
        nodesDraggable={false}
        nodeTypes={nodeTypes}
      >
        <Background
          color={theme.palette.divider}
          gap={20}
          size={1}
          variant={BackgroundVariant.Dots}
        />
      </ReactFlow>
    </GraphNodeStoryStyles>
  );
}
