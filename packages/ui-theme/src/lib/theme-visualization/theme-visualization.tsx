import { useTheme } from '@mui/material/styles';
import { ReactElement } from 'react';

import { PaletteSection } from './palette-section/palette-section';
import { SpacesSection } from './spaces-section/spaces-section';
import {
  themeVisualizationClasses,
  ThemeVisualizationHeader,
  ThemeVisualizationIntro,
  ThemeVisualizationSections,
  ThemeVisualizationStyles,
  ThemeVisualizationTitle,
} from './theme-visualization.styles';
import { TypographySection } from './typography-section/typography-section';

/**
 * @internal
 */
export function ThemeVisualization(): ReactElement {
  const theme = useTheme();
  const themeModeLabel = theme.palette.mode === 'dark' ? 'Dark' : 'Light';

  return (
    <ThemeVisualizationStyles className={themeVisualizationClasses.root}>
      <ThemeVisualizationHeader
        className={themeVisualizationClasses.header}
        spacing={8}
      >
        <ThemeVisualizationTitle
          color="primary"
          variant="h1"
        >
          Codegena {themeModeLabel} Theme for MUI
        </ThemeVisualizationTitle>
        <ThemeVisualizationIntro
          color="text.secondary"
          variant="body1"
        >
          Design tokens for Codegena — typography, color, and spacing
          built around Golos Text and the Pastel Messenger palette.
        </ThemeVisualizationIntro>
      </ThemeVisualizationHeader>

      <ThemeVisualizationSections
        className={themeVisualizationClasses.sections}
        spacing={3}
      >
        <PaletteSection />
        <TypographySection />
        <SpacesSection />
      </ThemeVisualizationSections>
    </ThemeVisualizationStyles>
  );
}
