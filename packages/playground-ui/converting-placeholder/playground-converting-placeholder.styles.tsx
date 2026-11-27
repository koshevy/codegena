import Box from '@mui/material/Box';
import { alpha, styled } from '@mui/material/styles';

export const playgroundConvertingPlaceholderClasses = {
  artwork: 'PlaygroundConvertingPlaceholder__artwork',
  progress: 'PlaygroundConvertingPlaceholder__progress',
};

// language=postcss
export const PlaygroundConvertingPlaceholderStyles = styled(Box)(({ theme }) => `
  & {
    align-items: center;
    color: ${theme.palette.text.secondary};
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 2rem;
    justify-content: center;
    min-height: 100vh;
    padding: ${theme.spacing(4)};
    text-align: center;
  }

  & .${playgroundConvertingPlaceholderClasses.artwork} {
    align-items: center;
    background: radial-gradient(
      circle at 35% 30%,
      ${alpha(theme.palette.primary.main, 0.2)},
      ${alpha(theme.palette.secondary.main, 0.08)} 72%
    );
    border-radius: 50%;
    box-shadow: 0 0 0 12px ${alpha(theme.palette.primary.main, 0.05)};
    display: flex;
    height: 112px;
    justify-content: center;
    width: 112px;
  }

  & .${playgroundConvertingPlaceholderClasses.progress} {
    color: ${theme.palette.primary.main};
  }
`);
