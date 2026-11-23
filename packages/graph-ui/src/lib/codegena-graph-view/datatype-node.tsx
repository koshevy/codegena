import type { GraphPayloadItemNodeData } from '@codegena/graph-core';
import { DeclarationTypeIcon, WarningIconButton } from '@codegena/ui-unified/icons';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {
  Handle,
  type Node,
  type NodeProps,
  Position,
} from '@xyflow/react';
import type { ReactElement } from 'react';

import {
  datatypeNodeClasses,
  DatatypeNodeStyles,
} from './datatype-node.styles';
import { useConnectedHandleVisibility } from './flow-elements';

type DatatypeFlowNode = Node<GraphPayloadItemNodeData, 'datatype'>;

export function DatatypeNode({ data }: NodeProps<DatatypeFlowNode>): ReactElement {
  const { col, fileName, line } = data.sourceLocation;
  const sourceFileName = fileName.split(/[/\\]/).at(-1) ?? fileName;
  const connectionStyles = useConnectedHandleVisibility(data.hideUnconnectedHandles);
  const hasWarnings = data.logs.length > 0;
  const renderedWarning = hasWarnings && (
    <WarningIconButton
      ariaLabel={`Reveal warnings for ${data.identifierName}`}
      data-graph-warning-trigger=""
      iconSize={16}
      title="Has warnings (click to reveal)"
    />
  );

  return (
    <DatatypeNodeStyles
      className={datatypeNodeClasses.root}
      elevation={0}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={connectionStyles.target}
      />
      <Stack spacing={0.5}>
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="space-between"
          spacing={1}
        >
          <Tooltip
            title={`Declaration '${data.identifierName}'`}
          >
            <Typography
              aria-level={4}
              aria-label={`Declaration ${data.identifierName}`}
              className={datatypeNodeClasses.title}
              noWrap
              role="heading"
              variant="body2"
            >
              {data.label}
            </Typography>
          </Tooltip>
          <Stack
            alignItems="center"
            direction="row"
            spacing={1}
          >
            {renderedWarning}
            <DeclarationTypeIcon
              ariaLabel={`Reveal source and code for ${data.identifierName}`}
              declarationType={data.declarationType}
              title="Click to reveal source line in specification and generated code"
            />
          </Stack>
        </Stack>
        <Tooltip
          title={`${fileName}:${line}:${col}`}
        >
          <Typography
            className={datatypeNodeClasses.source}
            color="text.secondary"
            noWrap
          >
            {sourceFileName}:{line}:{col}
          </Typography>
        </Tooltip>
      </Stack>
      <Handle
        type="source"
        position={Position.Right}
        style={connectionStyles.source}
      />
    </DatatypeNodeStyles>
  );
}
