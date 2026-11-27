import Box from '@mui/material/Box';
import { alpha, styled } from '@mui/material/styles';

export const generatedFileDetailsPlaceholderClasses = {
  artwork: 'GeneratedFileDetailsPlaceholder__artwork',
  icon: 'GeneratedFileDetailsPlaceholder__icon',
  text: 'GeneratedFileDetailsPlaceholder__text',
};

// language=postcss
export const GeneratedFileDetailsPlaceholderStyles = styled(Box)(({ theme }) => `
  & {
    align-items: center;
    color: ${theme.palette.text.secondary};
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 2rem;
    justify-content: center;
    min-height: 240px;
    padding: ${theme.spacing(4)};
    text-align: center;
  }

  & .${generatedFileDetailsPlaceholderClasses.artwork} {
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
    position: relative;
    width: 112px;
  }

  & .${generatedFileDetailsPlaceholderClasses.icon} {
    color: ${theme.palette.primary.main};
    filter: drop-shadow(2px 3px 2px ${alpha(theme.palette.primary.dark, 0.2)});
    transform: rotate(-8deg);
  }

  & .${generatedFileDetailsPlaceholderClasses.text} {
    max-width: 24rem;
  }
`);
