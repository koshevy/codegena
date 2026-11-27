import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { ReactElement } from 'react';

export const colorSwatchClasses = {
  preview: 'ColorSwatch__preview',
  root: 'ColorSwatch__root',
};

export interface ColorSwatchProps {
  color: string;
  label: string;
  sublabel?: string;
}

const ColorSwatchPreview = styled(Box, {
  shouldForwardProp: (propName) => propName !== 'swatchColor',
})<{ swatchColor: string }>(({ swatchColor, theme }) => ({
  backgroundColor: swatchColor,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: `${theme.shape.borderRadius}px`,
  boxShadow: theme.shadows[1],
  height: 72,
}));

const ColorSwatchMeta = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(0.25),
}));

/**
 * @internal
 */
export function ColorSwatch({
  color,
  label,
  sublabel,
}: ColorSwatchProps): ReactElement {
  const renderedSublabel = sublabel && (
    <ColorSwatchMeta
      color="text.secondary"
      variant="caption"
    >
      {sublabel}
    </ColorSwatchMeta>
  );

  return (
    <Stack
      className={colorSwatchClasses.root}
      spacing={1}
    >
      <ColorSwatchPreview
        className={colorSwatchClasses.preview}
        swatchColor={color}
      />
      <Box>
        <Typography variant="subtitle2">{label}</Typography>
        <ColorSwatchMeta
          color="text.secondary"
          variant="caption"
        >
          {color}
        </ColorSwatchMeta>
        {renderedSublabel}
      </Box>
    </Stack>
  );
}
