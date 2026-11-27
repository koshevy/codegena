import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { SquareMousePointer } from 'lucide-react';
import type { ReactElement } from 'react';

import {
  generatedFileDetailsPlaceholderClasses,
  GeneratedFileDetailsPlaceholderStyles,
} from './generated-file-details-placeholder.styles';

interface GeneratedFileDetailsPlaceholderProps {
  onShowAllFiles?: () => void;
}

export function GeneratedFileDetailsPlaceholder({
  onShowAllFiles,
}: GeneratedFileDetailsPlaceholderProps): ReactElement {
  const renderedShowAllLink = onShowAllFiles && (
    <>
      {', or choose '}
      <Link
        component="button"
        onClick={onShowAllFiles}
        type="button"
      >
        see all files
      </Link>
    </>
  );

  return (
    <GeneratedFileDetailsPlaceholderStyles>
      <Box
        aria-hidden
        className={generatedFileDetailsPlaceholderClasses.artwork}
      >
        <SquareMousePointer
          className={generatedFileDetailsPlaceholderClasses.icon}
          size={48}
          strokeWidth={1.6}
        />
      </Box>
      <Typography
        className={generatedFileDetailsPlaceholderClasses.text}
        variant="body2"
      >
        Select generated files or/and data types in the main column
        {renderedShowAllLink}.
      </Typography>
    </GeneratedFileDetailsPlaceholderStyles>
  );
}
