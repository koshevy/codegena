import type { Theme } from '@mui/material/styles';
import type { PresetConfig } from 'shaders/js';

export function createProgressBlobPreset(
  theme: Theme,
  shouldReduceMotion: boolean | null,
): PresetConfig {
  return {
    components: [{
      id: 'progress-blob',
      type: 'Blob',
      props: {
        colorA: theme.palette.info.main,
        colorB: theme.palette.secondary.main,
        deformation: 1,
        highlightColor: theme.palette.info.dark,
        highlightIntensity: 0.5,
        size: 0.75,
        softness: 0.8,
        speed: shouldReduceMotion ? 0 : 0.7,
      },
    }],
  };
}
