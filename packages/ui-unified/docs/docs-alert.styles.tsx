import Alert from '@mui/material/Alert';
import { alpha, styled } from '@mui/material/styles';

import type { DocsAlertColor } from './docs-alert-color';

// language=postcss
export const DocsAlertStyles = styled(Alert, {
  shouldForwardProp: (prop) => prop !== 'tone',
})<{ tone: DocsAlertColor }>(({ theme, tone }) => {
  const { palette } = theme;
  const color = palette[tone];

  return `
    & {
      backdrop-filter: blur(4px);
      background-color: ${alpha(color.surface, 0.8)};
      border: 1px solid ${color.border};
      border-radius: 0.5rem;
      color: ${palette.text.primary};
      font-size: inherit;
      margin-block: 1rem;
      padding: 0.8rem 1rem;
    }

    & .MuiAlert-icon,
    & .MuiAlertTitle-root {
      color: ${color.text};
      opacity: 1;
    }

    & .MuiAlert-icon,
    & .MuiAlert-message {
      padding-block: 0.15rem;
    }

    & .MuiAlert-message > :last-child {
      margin-bottom: 0;
    }
  `;
});
