import { fontFamilies } from '@codegena/ui-theme';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const heroIntroClasses = {
  accessible: 'HeroIntro__accessible',
  copy: 'HeroIntro__copy',
  idea: 'HeroIntro__idea',
  install: 'HeroIntro__install',
  measure: 'HeroIntro__measure',
  opening: 'HeroIntro__opening',
  prompt: 'HeroIntro__prompt',
  replacement: 'HeroIntro__replacement',
  root: 'Hero__intro',
  scramble: 'HeroIntro__scramble',
} as const;

// language=postcss
export const HeroIntroStyles = styled(Box)(({ theme }) => `
  & {
    display: grid;
    margin: 3rem auto 0;
    max-width: 42rem;
    position: relative;
    width: 100%;
  }

  .${heroIntroClasses.copy},
  .${heroIntroClasses.measure} {
    font-size: clamp(1.05rem, 1.35vw, 1.125rem);
    font-weight: 400;
    line-height: 1.7;
  }

  .${heroIntroClasses.copy} {
    color: ${theme.palette.text.secondary};
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    transform-origin: center top;
  }

  .${heroIntroClasses.copy} p {
    font-size: inherit;
    line-height: inherit;
    margin: 0;
    max-height: 3lh;
    overflow: hidden;
  }

  .${heroIntroClasses.measure} {
    grid-area: 1 / 1;
    margin: 0;
    max-height: 3lh;
    overflow: hidden;
    visibility: hidden;
  }

  .${heroIntroClasses.accessible} {
    clip: rect(0, 0, 0, 0);
    height: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }

  .${heroIntroClasses.idea} {
    color: ${theme.palette.secondary.dark};
  }

  .${heroIntroClasses.scramble} {
    color: ${theme.palette.text.secondary};
    opacity: 0.3;
  }

  .${heroIntroClasses.replacement} {
    align-items: center;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    left: 50%;
    padding-top: 1rem;
    position: absolute;
    top: 0;
    translate: -50% 0;
    visibility: hidden;
    width: min(90vw, 45rem);
  }

  .${heroIntroClasses.prompt} {
    width: 100%;
  }

  .${heroIntroClasses.install} {
    background-color: ${theme.palette.secondary.main};
    border-radius: 0.25rem;
    box-shadow: ${theme.shadows[5]};
    color: ${theme.palette.background.paper};
    display: inline-block;
    font-family: ${fontFamilies.mono};
    font-size: 0.85rem;
    font-weight: 400;
    max-width: 100%;
    overflow-wrap: anywhere;
    padding: 0.5rem 0.75rem;
  }

  @media (max-width: 700px) {
    & {
      margin-top: 2rem;
      max-width: 95vw;
    }

    .${heroIntroClasses.copy},
    .${heroIntroClasses.measure} {
      margin-inline: auto;
      max-width: calc(95vw / 1.1);
    }

    .${heroIntroClasses.measure} {
      width: 100%;
    }

    .${heroIntroClasses.copy} p,
    .${heroIntroClasses.measure} {
      max-height: none;
    }
  }

  @media (max-width: 520px) and (max-height: 700px) {
    & {
      margin-top: 1rem;
    }
  }
`);
