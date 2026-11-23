import type { GraphPayloadGroupNodeData } from '@codegena/graph-core';
import {
  ProgrammingLanguageIcon,
  resolveProgrammingLanguage,
} from '@codegena/ui-unified/icons';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {
  Handle,
  type Node,
  type NodeProps,
  Position,
} from '@xyflow/react';
import type { ReactElement } from 'react';

import { fileNodeClasses, FileNodeStyles } from './file-node.styles';
import { useConnectedHandleVisibility } from './flow-elements';

type FileFlowNode = Node<GraphPayloadGroupNodeData, 'file'>;

export function FileNode({
  data: {
    fileName,
    hideUnconnectedHandles,
    programmingLanguage = 'TypeScript',
  },
}: NodeProps<FileFlowNode>): ReactElement {
  const connectionStyles = useConnectedHandleVisibility(hideUnconnectedHandles);

  return (
    <FileNodeStyles
      className={fileNodeClasses.root}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={connectionStyles.target}
      />
      <Tooltip
        title={`File ./${fileName}`}
      >
        <Box
          aria-level={3}
          aria-label={`File ${fileName}`}
          className={fileNodeClasses.header}
          role="heading"
        >
          <ProgrammingLanguageIcon
            language={resolveProgrammingLanguage(programmingLanguage)}
          />
          <Box
            className={fileNodeClasses.text}
          >
            <Typography
              className={fileNodeClasses.name}
              component="span"
              noWrap
              variant="h6"
            >
              {fileName}
            </Typography>
          </Box>
        </Box>
      </Tooltip>
      <Handle
        type="source"
        position={Position.Right}
        style={connectionStyles.source}
      />
    </FileNodeStyles>
  );
}
