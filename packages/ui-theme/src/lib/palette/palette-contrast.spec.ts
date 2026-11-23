import { createTheme, getContrastRatio } from '@mui/material/styles';

import { darkThemePalette } from './dark-palette-tokens';
import { lightThemePalette } from './light-palette-tokens';
import '../theme/extended-theme';

const accents = ['primary', 'secondary', 'info', 'success', 'warning', 'error'] as const;

describe.each([lightThemePalette, darkThemePalette])(
  '$mode palette contrast roles',
  (tokens) => {
    const { palette } = createTheme({ palette: tokens });

    it.each(accents)('%s orders emphasis against the page surface', (accent) => {
      const color = palette[accent];
      const background = palette.background.paper;

      expect(getContrastRatio(color.dark, background))
        .toBeGreaterThan(getContrastRatio(color.main, background));
      expect(getContrastRatio(color.main, background))
        .toBeGreaterThan(getContrastRatio(color.light, background));
    });

    it.each(accents)('%s pairs a pale fill with a darker foreground', (accent) => {
      const color = palette[accent];

      expect(getContrastRatio(color.onLight, '#ffffff'))
        .toBeGreaterThan(getContrastRatio(color.lightSurface, '#ffffff'));
      expect(getContrastRatio(color.onLight, color.lightSurface))
        .toBeGreaterThan(getContrastRatio(color.main, color.lightSurface));
    });
  },
);
