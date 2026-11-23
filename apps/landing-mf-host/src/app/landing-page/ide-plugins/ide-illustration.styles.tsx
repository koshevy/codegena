import Box from '@mui/material/Box';
import { alpha, styled } from '@mui/material/styles';

export const ideIllustrationClasses = {
  canvas: 'IdeIllustration__canvas',
  editor: 'IdeIllustration__editor',
} as const;

// language=postcss
export const IdeIllustrationStyles = styled(Box)(({ theme }) => `
  & {
    align-items: center;
    display: flex;
    justify-content: center;
    height: 28rem;
  }

  .${ideIllustrationClasses.canvas} {
    aspect-ratio: 1;
    flex: none;
    position: relative;
    width: min(36rem, 100%);
  }

  .${ideIllustrationClasses.editor} {
    align-items: center;
    background: ${alpha(theme.palette.background.paper, 0.85)};
    border: 1px solid ${alpha(theme.palette.info.dark, 0.35)};
    box-shadow: 0 1.25rem 3rem ${alpha(theme.palette.common.black, 0.25)};
    color: ${theme.palette.text.primary};
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    height: 9rem;
    justify-content: center;
    position: absolute;
    width: 9rem;
  }

  .${ideIllustrationClasses.editor} svg {
    height: 4rem;
    width: 4rem;
  }

  .${ideIllustrationClasses.editor} span {
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.04em;
  }

  .${ideIllustrationClasses.editor}[data-editor='vscode'] {
    color: ${theme.palette.info.dark};
    left: 19%;
    top: 23%;
    transform: rotate(-8deg);
  }

  .${ideIllustrationClasses.editor}[data-editor='jetbrains'] {
    color: ${theme.palette.secondary.dark};
    right: 17%;
    top: 27%;
    transform: rotate(7deg);
  }

  .${ideIllustrationClasses.editor}[data-editor='cursor'] {
    bottom: 16%;
    color: ${theme.palette.text.primary};
    left: calc(50% - 4.5rem);
    transform: rotate(-3deg);
  }

  @media (max-width: 700px) {
    & {
      height: 28svh;
      translate: 0 18svh;
    }

    .${ideIllustrationClasses.canvas} {
      width: min(23rem, 84vw, 47svh);
    }

    .${ideIllustrationClasses.editor} {
      gap: 0.4rem;
      height: 5.75rem;
      width: 5.75rem;
    }

    .${ideIllustrationClasses.editor} svg {
      height: 2.5rem;
      width: 2.5rem;
    }

    .${ideIllustrationClasses.editor} span {
      font-size: 0.65rem;
    }

    .${ideIllustrationClasses.editor}[data-editor='cursor'] {
      left: calc(50% - 2.875rem);
    }
  }
`);
