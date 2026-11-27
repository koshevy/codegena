import type { GraphPayload, GraphPayloadLog } from '@codegena/graph-core';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { type ReactElement, useCallback, useState } from 'react';

import { GeneratedFileDetails } from './generated-file-details';
export interface WarningRevealStoryProps {
  graph: GraphPayload;
  log: GraphPayloadLog;
  sourceSchemaText: string;
}

export function WarningRevealStory({
  graph,
  log,
  sourceSchemaText,
}: WarningRevealStoryProps): ReactElement {
  const [focusedWarning, setFocusedWarning] = useState<GraphPayloadLog>();

  const handleRevealWarning = useCallback((): void => {
    setFocusedWarning({ ...log });
  }, [log]);

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', height: 320 }}
    >
      <Button
        onClick={handleRevealWarning}
      >
        Reveal warning
      </Button>
      <GeneratedFileDetails
        detailsOpen
        focusedWarning={focusedWarning}
        graph={graph}
        highlightFocusedWarning
        selectedNodeIds={[]}
        showAllFiles
        sourceSchemaText={sourceSchemaText}
      />
    </Box>
  );
}
