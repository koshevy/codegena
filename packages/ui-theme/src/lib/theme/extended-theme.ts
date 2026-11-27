import type { CSSProperties } from 'react';

import type { NeutralScale, SemanticColorTokens } from '../palette/palette-types';

/* eslint-disable
@typescript-eslint/no-empty-object-type,
@typescript-eslint/no-empty-interface
*/

type FocusPalette = {
  main: string;
  ring: string;
};

declare module '@mui/material/styles' {
  interface PaletteColor extends SemanticColorTokens {}

  interface SimplePaletteColorOptions extends Partial<SemanticColorTokens> {}

  interface PaletteOptions {
    focus?: FocusPalette;
    neutral?: NeutralScale;
    codegena: {
      accent: {
        border: string;
        main: string;
        surface: string;
        text: string;
      };
      background: {
        editor: string;
        menu: string;
        skeletonFigure: string;
        skeletonShimmer: string;
        toolbar: string;
      };
      typography: {
        editor: string;
        editorPlaceholder: string;
        menu: string;
        toolbar: string;
      };
    };
  }

  interface Palette extends PaletteOptions {
    focus: FocusPalette;
    neutral: NeutralScale;
  }

  interface TypographyVariants {
    codegenaMessage: CSSProperties;
    codegenaRichTextToolbarMenu: CSSProperties;
  }

  interface TypographyVariantsOptions {
    codegenaMessage: CSSProperties;
    codegenaRichTextToolbarMenu?: CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    codegenaMessage: true;
    codegenaRichTextToolbarMenu: true;
  }
}
