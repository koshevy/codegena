import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { Copy } from 'lucide-react';
import type { ReactElement } from 'react';

interface PlaygroundSourceSchemaCopyButtonProps {
  onClick: () => void;
}

export function PlaygroundSourceSchemaCopyButton({
  onClick,
}: PlaygroundSourceSchemaCopyButtonProps): ReactElement {
  return (
    <Tooltip title="Copy whole schema">
      <IconButton
        aria-label="Copy whole schema"
        onClick={onClick}
        size="small"
      >
        <Copy
          aria-hidden
          size={19}
          strokeWidth="1.5px"
        />
      </IconButton>
    </Tooltip>
  );
}
