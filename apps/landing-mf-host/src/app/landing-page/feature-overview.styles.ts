import { alpha, darken, styled } from '@mui/material/styles';

import { featureSectionsClasses, FeatureSectionsStyles } from './feature-sections.styles';

export const featureOverviewClasses = {
  body: 'FeatureOverview__body',
  files: 'FeatureOverview__files',
  panel: 'FeatureOverview__panel',
} as const;

// language=postcss
export const FeatureOverviewStyles = styled(FeatureSectionsStyles)(({ theme }) => `
  .${featureSectionsClasses.stage}[data-unified-ui='true'] {
    background: linear-gradient(
      115deg,
      ${darken(theme.palette.info.onLight, 0.25)},
      ${theme.palette.secondary.onLight}
    );
  }

  .${featureOverviewClasses.panel} {
    background: ${theme.palette.background.paper};
    border: 1px solid ${theme.palette.divider};
    border-radius: ${theme.shape.borderRadius}px;
    color: ${theme.palette.text.primary};
    overflow: hidden;
    position: relative;
  }

  .${featureOverviewClasses.body} {
    max-height: min(54svh, 34rem);
    overflow: auto;
    padding: 1rem;
  }

  .${featureOverviewClasses.panel}[data-code='true'] > .${featureOverviewClasses.body} {
    --landing-code-editor-height: min(54vh, 34rem);

    max-height: none;
    padding: 0;
  }

  .${featureOverviewClasses.body} > pre {
    color: ${theme.palette.info.dark};
    margin: 0;
  }

  .${featureOverviewClasses.panel} svg {
    flex: none;
    height: 1rem;
    width: 1rem;
  }

  .${featureOverviewClasses.files} {
    display: grid;
    gap: 0.5rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .${featureOverviewClasses.files} > li {
    align-items: center;
    background: ${alpha(theme.palette.info.main, 0.08)};
    display: flex;
    gap: 0.6rem;
    padding: 0.45rem 0.65rem;
  }

  @media (max-width: 700px) {
    .${featureOverviewClasses.panel}[data-code='true'] > .${featureOverviewClasses.body} {
      --landing-code-editor-height: 30svh;
    }

    .${featureOverviewClasses.body} {
      max-height: 30svh;
    }
  }
`);
