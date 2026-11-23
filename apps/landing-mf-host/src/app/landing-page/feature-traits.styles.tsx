import Box from '@mui/material/Box';
import { alpha, darken, emphasize, styled } from '@mui/material/styles';

export const featureTraitsClasses = {
  badge: 'FeatureTraits__badge',
  description: 'FeatureTraits__description',
  emphasis: 'FeatureTraits__emphasis',
  heading: 'FeatureTraits__heading',
  kicker: 'FeatureTraits__kicker',
  textLink: 'FeatureTraits__textLink',
} as const;

// language=postcss
export const FeatureTraitsStyles = styled(Box)(({ theme }) => {
  const unifiedUiTextColor = darken(theme.palette.secondary.onLight, 0.3);
  const unifiedUiBackgroundColor = emphasize(unifiedUiTextColor, 0.9);
  const uncoveredUnifiedUiTitleColor = theme.palette.mode === 'light'
    ? theme.palette.text.primary
    : theme.palette.common.white;

  return `
  & {
    max-width: min(31rem, calc(39vw - 2.4rem));
    position: relative;
    z-index: 2;
  }

  .${featureTraitsClasses.kicker} {
    color: ${theme.palette.info.dark};
    font-family: monospace;
    font-size: 0.75rem;
    letter-spacing: 0.18em;
    margin: 0 0 2rem;
  }

  .${featureTraitsClasses.heading} {
    color: ${theme.palette.text.primary};
    font-size: clamp(3rem, 5vw, 5rem);
    font-weight: 600;
    letter-spacing: -0.075em;
    line-height: 1.04;
    margin: 0;

    .${featureTraitsClasses.emphasis}[data-has-badge='true'] {
      display: inline-block;
      position: relative;
    }
  }

  .${featureTraitsClasses.badge} {
    border-radius: ${theme.shape.borderRadius}px;
    color: ${theme.palette.background.paper};
    font-size: 0.7rem;
    font-weight: 700;
    height: 1.7rem;
    letter-spacing: 0.04em;
    max-width: none;
    position: absolute;
    right: -7rem;
    top: -1.25rem;
    transform: rotate(10deg);
    white-space: nowrap;
  }

  .${featureTraitsClasses.description} {
    color: ${theme.palette.text.secondary};
    font-size: 1.08rem;
    line-height: 1.8;
    margin: 2rem 0 2.4rem;
  }

  [data-unified-ui='true'] .${featureTraitsClasses.kicker} {
    background-color: ${alpha(theme.palette.common.white, 0.88)};
    color: ${theme.palette.secondary.onLight};
    display: table;
    padding: 0.25rem 0.5rem;
  }

  [data-unified-ui='true'] .${featureTraitsClasses.heading} {
    color: ${theme.palette.common.white};
  }

  [data-unified-ui='true'][data-blob-covering='false'] .${featureTraitsClasses.heading} {
    color: ${uncoveredUnifiedUiTitleColor};
  }

  [data-unified-ui='true'] .${featureTraitsClasses.description} {
    background-color: ${alpha(unifiedUiBackgroundColor, 0.75)};
    border-radius: ${theme.shape.borderRadius}px;
    color: ${unifiedUiTextColor};
    padding: 0.75rem 1rem;
  }

  .${featureTraitsClasses.textLink} {
    align-items: center;
    border-bottom: 1px solid ${theme.palette.info.main};
    color: ${theme.palette.text.primary};
    display: inline-flex;
    font-size: 0.8rem;
    font-weight: 600;
    gap: 1rem;
    letter-spacing: 0.07em;
    padding-bottom: 0.55rem;
    text-decoration: none;
    text-transform: uppercase;
  }

  .${featureTraitsClasses.textLink}:hover {
    color: ${theme.palette.info.dark};
  }

  @media (max-width: 700px) {
    & {
      max-width: 100%;
    }

    .${featureTraitsClasses.kicker} {
      font-size: 0.65rem;
      margin-bottom: 1.25rem;
    }

    .${featureTraitsClasses.heading} {
      font-size: clamp(2.2rem, 7vw, 3.3rem);
    }

    .${featureTraitsClasses.description} {
      font-size: 0.875rem;
      line-height: 1.4;
      margin: 1.2rem 0 0.5rem;
    }
  }
  `;
});
