import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export const TypographyFamilyPanel = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: `${theme.shape.borderRadius}px`,
  padding: theme.spacing(2, 2.5),
}));

export const TypographyFamilyName = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
}));

export const TypographyFamilyStack = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
}));

export const TypographyVariantRow = styled(Box)(({ theme }) => ({
  alignItems: 'center',
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'grid',
  gap: theme.spacing(2),
  gridTemplateColumns: '1fr',
  paddingBottom: theme.spacing(1.5),
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: '11rem 1fr 11rem',
  },
}));

export const TypographyVariantSample = styled(Typography)({
  whiteSpace: 'pre-wrap',
});
