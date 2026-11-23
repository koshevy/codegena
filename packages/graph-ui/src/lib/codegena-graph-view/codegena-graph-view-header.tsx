import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Braces, Files, LineSquiggle } from 'lucide-react';
import type { ReactElement } from 'react';

import {
  codegenaGraphViewHeaderClasses,
  CodegenaGraphViewHeaderStyles,
} from './codegena-graph-view-header.styles';

interface CodegenaGraphViewHeaderProps {
  datatypeCount: number;
  fileCount: number;
  title: string;
}

export function CodegenaGraphViewHeader({
  datatypeCount,
  fileCount,
  title,
}: CodegenaGraphViewHeaderProps): ReactElement {
  const fileNoun = fileCount === 1 ? 'file' : 'files';
  const datatypeNoun = datatypeCount === 1 ? 'datatype' : 'datatypes';
  const fileLabel = `${fileCount} ${fileNoun}`;
  const datatypeLabel = `${datatypeCount} ${datatypeNoun}`;

  return (
    <CodegenaGraphViewHeaderStyles
      className={codegenaGraphViewHeaderClasses.root}
    >
      <Box>
        <Typography
          className={codegenaGraphViewHeaderClasses.brand}
        >
          CODEGENA GRAPH
        </Typography>
        <Typography
          className={codegenaGraphViewHeaderClasses.title}
          variant="h6"
        >
          {title}
        </Typography>
      </Box>
      <Stack
        className={codegenaGraphViewHeaderClasses.legend}
      >
        <Chip
          icon={<Files size={14} />}
          label={fileLabel}
          size="small"
          variant="outlined"
        />
        <Chip
          icon={<Braces size={14} />}
          label={datatypeLabel}
          size="small"
          variant="outlined"
        />
        <Chip
          color="primary"
          icon={<LineSquiggle size="1rem" />}
          label="Import"
          size="small"
          variant="outlined"
        />
        <Chip
          color="secondary"
          icon={<LineSquiggle size="1rem" />}
          label="Reference"
          size="small"
          variant="outlined"
        />
      </Stack>
    </CodegenaGraphViewHeaderStyles>
  );
}
