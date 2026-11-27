import type { GraphPayloadDirectoryNodeData } from '@codegena/graph-core';
import { FolderStateIcon } from '@codegena/ui-unified/icons';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Handle, type Node, type NodeProps, Position } from '@xyflow/react';
import { clsx } from 'clsx';
import {
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { type MouseEvent, type ReactElement, useCallback } from 'react';

import {
  directoryNodeClasses,
  DirectoryNodeStyles,
} from './directory-node.styles';
import { useConnectedHandleVisibility } from './flow-elements';

export interface DirectoryFlowNodeData extends GraphPayloadDirectoryNodeData {
  description: string;
  hideUnconnectedHandles?: boolean;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

type DirectoryFlowNode = Node<DirectoryFlowNodeData, 'directory'>;

function stopToggleDoubleClick(event: MouseEvent<HTMLButtonElement>): void {
  event.stopPropagation();
}

export function DirectoryNode({
  data: {
    description,
    hideUnconnectedHandles,
    isExpanded,
    label,
    onToggle,
    relativeDirectoryPath,
  },
  id,
}: NodeProps<DirectoryFlowNode>): ReactElement {
  const connectionStyles = useConnectedHandleVisibility(hideUnconnectedHandles);

  const isRootDirectory = relativeDirectoryPath === '.';

  const directoryPath = isRootDirectory
    ? './'
    : relativeDirectoryPath;

  const directoryPathTooltip = `Directory ${directoryPath}`;

  const toggleLabel = [
    isExpanded ? 'Collapse' : 'Expand',
    relativeDirectoryPath,
    'directory',
  ].join(' ');

  const chevronProps = {
    'aria-hidden': true,
    'size': '1.2rem',
  } as const;

  const handleToggle = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation();
    onToggle(id);
  }, [
    id,
    onToggle,
  ]);

  const handleDoubleClick = useCallback((event: MouseEvent<HTMLDivElement>): void => {
    event.stopPropagation();

    if (!isRootDirectory) {
      onToggle(id);
    }
  }, [
    id,
    isRootDirectory,
    onToggle,
  ]);

  const renderedChevron = isExpanded
    ? <ChevronDown {...chevronProps} />
    : <ChevronRight {...chevronProps} />;

  const renderedToggle = !isRootDirectory && (
    <IconButton
      aria-expanded={isExpanded}
      aria-label={toggleLabel}
      className={directoryNodeClasses.toggle}
      onClick={handleToggle}
      onDoubleClick={stopToggleDoubleClick}
      size="small"
    >
      {renderedChevron}
    </IconButton>
  );

  return (
    <DirectoryNodeStyles
      className={clsx({
        [directoryNodeClasses.root]: true,
        [directoryNodeClasses.expanded]: isExpanded,
      })}
      elevation={0}
      onDoubleClickCapture={handleDoubleClick}
    >
      <Handle
        position={Position.Left}
        style={connectionStyles.target}
        type="target"
      />
      <FolderStateIcon
        className={directoryNodeClasses.icon}
        isExpanded={isExpanded}
      />
      <Stack
        className={directoryNodeClasses.text}
        spacing={0.5}
      >
        <Tooltip
          title={directoryPathTooltip}
        >
          <Typography
            aria-level={3}
            aria-label={directoryPathTooltip}
            className={directoryNodeClasses.label}
            noWrap
            role="heading"
            variant="body2"
          >
            {label}
          </Typography>
        </Tooltip>
        <Typography
          aria-label={description}
          className={directoryNodeClasses.description}
          color="text.secondary"
          noWrap
          role="note"
        >
          {description}
        </Typography>
      </Stack>
      {renderedToggle}
      <Handle
        position={Position.Right}
        style={connectionStyles.source}
        type="source"
      />
    </DirectoryNodeStyles>
  );
}
