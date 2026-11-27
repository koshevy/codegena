export type NeutralScale = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  800: string;
  900: string;
};

/**
 * Accent tones relative to the page background: `dark` has stronger contrast,
 * and `light` is the softer tone, in both color schemes.
 */
export type SemanticColorTokens = {
  border: string;
  contrastText: string;
  dark: string;
  light: string;
  main: string;
  /**
   * Accent foreground on a deliberately light surface, regardless of page mode.
   */
  onLight: string;
  /**
   * Pale accent fill that stays light in both page modes.
   */
  lightSurface: string;
  surface: string;
  text: string;
};
