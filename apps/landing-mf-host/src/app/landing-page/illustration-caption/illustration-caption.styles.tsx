import { fontFamilies } from '@codegena/ui-theme';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

// language=postcss
export const IllustrationCaptionStyles = styled(Typography)(({ theme }) => `
  & {
    color: ${theme.palette.text.secondary};
    font-size: 1rem;
    line-height: 1.6;
    margin: 0;
  }

  & code {
    color: ${theme.palette.info.dark};
    font-family: ${fontFamilies.mono};
  }

  @media (max-width: 700px) {
    & {
      font-size: 0.875rem;
      line-height: 1.5;
    }
  }
`);
