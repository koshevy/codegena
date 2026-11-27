import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import { ReactElement } from 'react';

import { PaletteToneRow } from './palette-tone-row';
import { paletteMeta } from '../../palette';
import { ColorSwatch } from '../color-swatch/color-swatch';
import { SectionCard } from '../section-card/section-card';
import { TokenGroup } from '../token-group/token-group';
import { TokenGridStyles } from '../token-group/token-group.styles';

/**
 * @internal
 */
export function PaletteSection(): ReactElement {
  const theme = useTheme();
  const { palette } = theme;
  const neutralSteps = Object.entries(palette.neutral) as Array<[string, string]>;

  return (
    <SectionCard
      accentColor={theme.palette.secondary.main}
      subtitle={
        'Structured Pastel Messenger palette with neutral scale, '
        + 'focus rings, and Codegena surfaces.'
      }
      title="Palette"
    >
      <Stack spacing={2.5}>
        <TokenGroup
          description={paletteMeta.neutral}
          title="Neutral scale"
        >
          {neutralSteps.map(([step, color]) => (
            <ColorSwatch
              key={step}
              color={color}
              label={`Neutral ${step}`}
            />
          ))}
        </TokenGroup>

        <TokenGroup
          description={paletteMeta.focus}
          title="Focus"
        >
          <ColorSwatch
            color={palette.focus.main}
            label="Focus Main"
          />
          <ColorSwatch
            color={palette.focus.ring}
            label="Focus Ring"
          />
        </TokenGroup>

        <TokenGridStyles layout="palette">
          <PaletteToneRow
            description={paletteMeta.primary}
            label="Primary"
            paletteColor={palette.primary}
          />
          <PaletteToneRow
            description={paletteMeta.secondary}
            label="Secondary"
            paletteColor={palette.secondary}
          />
          <PaletteToneRow
            description={paletteMeta.success}
            label="Success"
            paletteColor={palette.success}
          />
          <PaletteToneRow
            description={paletteMeta.info}
            label="Info"
            paletteColor={palette.info}
          />
          <PaletteToneRow
            description={paletteMeta.warning}
            label="Warning"
            paletteColor={palette.warning}
          />
          <PaletteToneRow
            description={paletteMeta.error}
            label="Error"
            paletteColor={palette.error}
          />
        </TokenGridStyles>

        <TokenGroup
          layout="wide"
          title="Text and backgrounds"
        >
          <ColorSwatch
            color={palette.text.primary}
            label="Text Primary"
          />
          <ColorSwatch
            color={palette.text.secondary}
            label="Text Secondary"
          />
          <ColorSwatch
            color={palette.text.disabled}
            label="Text Disabled"
          />
          <ColorSwatch
            color={palette.divider}
            label="Divider"
          />
          <ColorSwatch
            color={palette.background.default}
            label="Background Default"
          />
          <ColorSwatch
            color={palette.background.paper}
            label="Background Paper"
          />
        </TokenGroup>

        <TokenGroup
          layout="medium"
          title="Codegena surfaces"
        >
          <ColorSwatch
            color={palette.codegena.background.editor}
            label="Editor"
          />
          <ColorSwatch
            color={palette.codegena.background.toolbar}
            label="Toolbar"
          />
          <ColorSwatch
            color={palette.codegena.background.menu}
            label="Menu"
          />
          <ColorSwatch
            color={palette.codegena.typography.editorPlaceholder}
            label="Placeholder"
          />
          <ColorSwatch
            color={palette.codegena.background.skeletonFigure}
            label="Skeleton"
          />
          <ColorSwatch
            color={palette.codegena.background.skeletonShimmer}
            label="Skeleton Shimmer"
          />
          <ColorSwatch
            color={palette.codegena.typography.toolbar}
            label="Toolbar Text"
          />
          <ColorSwatch
            color={palette.codegena.typography.editor}
            label="Editor Text"
          />
          <ColorSwatch
            color={palette.codegena.typography.menu}
            label="Menu Text"
          />
        </TokenGroup>

        <TokenGroup
          description={paletteMeta.secondary}
          layout="medium"
          title="Codegena accent"
        >
          <ColorSwatch
            color={palette.codegena.accent.main}
            label="Accent Main"
          />
          <ColorSwatch
            color={palette.codegena.accent.surface}
            label="Accent Surface"
          />
          <ColorSwatch
            color={palette.codegena.accent.border}
            label="Accent Border"
          />
          <ColorSwatch
            color={palette.codegena.accent.text}
            label="Accent Text"
          />
        </TokenGroup>
      </Stack>
    </SectionCard>
  );
}
