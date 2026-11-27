import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

import type { Severity } from '../severity';

export const severityCardClasses = {
  message: 'SeverityCard__message',
} as const;

// language=postcss
export const SeverityCardStyles = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'severity',
})<{ severity: Severity }>(({ severity, theme }) => `
  & {
    background: ${theme.palette.background.paper};
    border-left: 3px solid ${theme.palette[severity].main};
    min-width: 0;
    padding: ${theme.spacing(1.5, 2)};
    user-select: text;
  }

  & .${severityCardClasses.message} {
    margin-top: ${theme.spacing(1)};
    max-height: 160px;
    max-width: 100%;
    min-width: 0;
    overflow: auto;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }
`);
