import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import type { ReactElement } from 'react';

import { GitHubLinkStyles } from './github-link.styles';
import { GitHubInvertocatIcon } from '../../icons';

export function GitHubLink({ href }: { href: string }): ReactElement {
  return (
    <Tooltip title="View repository on GitHub">
      <IconButton
        aria-label="GitHub repository"
        component={GitHubLinkStyles}
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        <GitHubInvertocatIcon />
      </IconButton>
    </Tooltip>
  );
}
