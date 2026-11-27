import Box from '@mui/material/Box';
import { styled, PaletteColor } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { ReactElement } from 'react';

import { ColorSwatch } from '../color-swatch/color-swatch';

export const paletteToneRowClasses = {
  body: 'PaletteToneRow__body',
  header: 'PaletteToneRow__header',
  root: 'PaletteToneRow__root',
};

export interface PaletteToneRowProps {
  description?: string;
  label: string;
  paletteColor: PaletteColor;
}

const PaletteToneRowStyles = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: `${theme.shape.borderRadius}px`,
  overflow: 'hidden',
}));

const PaletteToneRowHeaderStyles = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  borderBottom: `1px solid ${theme.palette.divider}`,
  height: '5rem',
  padding: theme.spacing(1, 2),
}));

const PaletteToneRowTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const PaletteToneRowDescription = styled(Typography)(({ theme }) => ({
  display: 'block',
  lineHeight: 1.2,
  marginTop: theme.spacing(0.25),
}));

const PaletteToneRowBodyStyles = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  gridTemplateColumns: 'repeat(auto-fill, minmax(6.5rem, 1fr))',
  padding: theme.spacing(2),
}));

/**
 * @internal
 */
export function PaletteToneRow({
  description,
  label,
  paletteColor,
}: PaletteToneRowProps): ReactElement {
  const renderedDescription = description && (
    <PaletteToneRowDescription
      color="text.secondary"
      variant="caption"
    >
      {description}
    </PaletteToneRowDescription>
  );

  return (
    <PaletteToneRowStyles className={paletteToneRowClasses.root}>
      <PaletteToneRowHeaderStyles className={paletteToneRowClasses.header}>
        <PaletteToneRowTitle variant="subtitle1">
          {label}
        </PaletteToneRowTitle>
        {renderedDescription}
      </PaletteToneRowHeaderStyles>
      <PaletteToneRowBodyStyles className={paletteToneRowClasses.body}>
        <ColorSwatch
          color={paletteColor.light}
          label="Light"
        />
        <ColorSwatch
          color={paletteColor.main}
          label="Main"
        />
        <ColorSwatch
          color={paletteColor.dark}
          label="Dark"
        />
        <ColorSwatch
          color={paletteColor.surface}
          label="Surface"
        />
        <ColorSwatch
          color={paletteColor.border}
          label="Border"
        />
        <ColorSwatch
          color={paletteColor.text}
          label="Text"
        />
        <ColorSwatch
          color={paletteColor.onLight}
          label="On light surface"
        />
        <ColorSwatch
          color={paletteColor.lightSurface}
          label="Light surface"
        />
        <ColorSwatch
          color={paletteColor.contrastText}
          label="Contrast"
          sublabel={`on ${paletteColor.main}`}
        />
      </PaletteToneRowBodyStyles>
    </PaletteToneRowStyles>
  );
}
