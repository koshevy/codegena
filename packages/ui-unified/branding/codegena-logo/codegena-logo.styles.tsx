import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const codegenaLogoClasses = {
  mark: 'CodegenaLogo__mark',
  text: 'CodegenaLogo__text',
} as const;

// language=postcss
export const CodegenaLogoStyles = styled(Box)(({ theme }) => `
  & {
    align-items: center;
    display: inline-flex;
    gap: ${theme.spacing(1.5)};
  }

  .${codegenaLogoClasses.mark} {
    align-items: center;
    background-color: ${theme.palette.text.primary};
    color: ${theme.palette.background.paper};
    display: flex;
    padding: 0 .9rem;
  }

  .${codegenaLogoClasses.text} {
    display: flex;
    flex-direction: column;
    font-family: "JetBrains Mono", monospace;
    justify-content: center;
  }

  .${codegenaLogoClasses.text} h6 {
    font-family: inherit;
    font-size: 1.5rem;
  }

  .${codegenaLogoClasses.text} .MuiTypography-caption {
    font-family: inherit;
  }
`);
