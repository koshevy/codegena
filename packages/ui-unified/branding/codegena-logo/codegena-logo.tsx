import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Braces } from 'lucide-react';
import type { ReactElement } from 'react';

import type { CodegenaLogoProps } from './codegena-logo.props';
import { codegenaLogoClasses, CodegenaLogoStyles } from './codegena-logo.styles';

export function CodegenaLogo({ subtitle }: CodegenaLogoProps): ReactElement {
  const renderedSubtitle = subtitle && (
    <Typography
      color="text.secondary"
      variant="caption"
    >
      {subtitle}
    </Typography>
  );

  return (
    <CodegenaLogoStyles>
      <Box className={codegenaLogoClasses.mark}>
        <Braces
          aria-hidden
          color="currentColor"
          size="2.3rem"
        />
      </Box>
      <Box className={codegenaLogoClasses.text}>
        <Typography
          fontWeight={800}
          letterSpacing={1.1}
          variant="subtitle1"
        >
          CODEGENA
        </Typography>
        {renderedSubtitle}
      </Box>
    </CodegenaLogoStyles>
  );
}
