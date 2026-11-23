import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export const SpacingMetricsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  gridTemplateColumns: '1fr',
  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  },
}));

export const MetricCardStyles = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: `${theme.shape.borderRadius}px`,
  padding: theme.spacing(1.5, 2),
}));

export const MetricCardValue = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(0.25),
}));

export const SpacingRowStyles = styled(Box)(({ theme }) => ({
  alignItems: 'center',
  display: 'grid',
  gap: theme.spacing(2),
  gridTemplateColumns: '3rem 1fr',
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: '4rem 1fr 11rem',
  },
}));

export const SpacingBarTrack = styled(Box)({
  alignItems: 'center',
  display: 'flex',
  minHeight: 28,
});

export const SpacingBarStyles = styled(Box, {
  shouldForwardProp: (propName) => propName !== 'barWidth',
})<{ barWidth: string }>(({ barWidth, theme }) => ({
  background: [
    `linear-gradient(90deg, ${theme.palette.primary.main}`,
    `${theme.palette.focus.main})`,
  ].join(', '),
  borderRadius: `${theme.shape.borderRadius / 2}px`,
  height: 16,
  width: barWidth,
}));

export const SpacingRowMeta = styled(Typography)(({ theme }) => ({
  textAlign: 'left',
  [theme.breakpoints.up('md')]: {
    textAlign: 'right',
  },
}));
