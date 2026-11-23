import type { GraphPayloadLog } from '@codegena/graph-core';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { type MouseEvent, type ReactElement, useCallback, useState } from 'react';

import { WarningCopyMenu } from '../warning-copy-menu';

interface WarningsListHeaderProps {
  logs: GraphPayloadLog[];
  sourceSchemaText: string;
}

export function WarningsListHeader({
  logs,
  sourceSchemaText,
}: WarningsListHeaderProps): ReactElement {
  const [menuPosition, setMenuPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);

  const handleContextMenu = useCallback((event: MouseEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    setMenuPosition({ left: event.clientX, top: event.clientY });
  }, []);

  const handleClose = useCallback((): void => {
    setMenuPosition(null);
  }, []);

  return (
    <Box
      onContextMenu={handleContextMenu}
    >
      <Typography
        color="text.secondary"
        variant="overline"
      >
        Warnings
      </Typography>
      <WarningCopyMenu
        position={menuPosition}
        logs={logs}
        onClose={handleClose}
        scope="all"
        sourceSchemaText={sourceSchemaText}
      />
    </Box>
  );
}
