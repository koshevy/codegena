import Box from '@mui/material/Box';
import { alpha, darken, emphasize, styled } from '@mui/material/styles';

import { featureStoryHeight } from './feature-story';

export const featureSectionsClasses = {
  bottomLine: 'FeatureSections__bottomLine',
  stage: 'FeatureSections__stage',
} as const;

// language=postcss
export const FeatureSectionsStyles = styled(Box)(({ theme }) => {
  const unifiedUiTextColor = darken(theme.palette.secondary.onLight, 0.3);
  const unifiedUiBackgroundColor = emphasize(unifiedUiTextColor, 0.9);

  return `
  & {
    background: transparent;
    height: ${featureStoryHeight * 100}svh;
    margin-top: -112px;
    position: relative;
    z-index: 1;
  }

  .${featureSectionsClasses.stage} {
    background: ${theme.palette.background.paper};
    height: 100svh;
    isolation: isolate;
    min-height: 720px;
    /* Clip the dolly without letting focus scroll the sticky stage's contents. */
    overflow: clip;
    padding: clamp(8rem, 23vh, 15rem) clamp(1.25rem, 6vw, 8rem);
    position: sticky;
    top: 0;
    transform-origin: top center;
  }

  .${featureSectionsClasses.bottomLine} {
    bottom: 3rem;
    color: ${theme.palette.text.secondary};
    display: flex;
    font-family: monospace;
    font-size: 0.7rem;
    justify-content: flex-end;
    left: clamp(1.25rem, 6vw, 8rem);
    letter-spacing: 0.14em;
    pointer-events: none;
    position: absolute;
    right: clamp(1.25rem, 6vw, 8rem);
    z-index: 3;
  }

  .${featureSectionsClasses.bottomLine}[data-unified-ui='true'] {
    color: ${unifiedUiTextColor};
  }

  .${featureSectionsClasses.bottomLine}[data-unified-ui='true'] > span {
    background-color: ${alpha(unifiedUiBackgroundColor, 0.75)};
    padding: 0.25rem 0.4rem;
  }

  @media (max-width: 700px) {
    & {
      margin-top: calc(-100px - max(0px, 54rem - 100svh));
    }

    .${featureSectionsClasses.bottomLine} {
      display: none;
    }

    .${featureSectionsClasses.stage} {
      min-height: 0;
      padding: 1.5rem 1.25rem 1rem;
    }
  }
  `;
});
