import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export type TokenGridLayout = 'compact' | 'medium' | 'palette' | 'wide';

const tokenGridColumns: Record<TokenGridLayout, string> = {
  compact: 'repeat(auto-fill, minmax(6.5rem, 1fr))',
  medium: 'repeat(auto-fill, minmax(8rem, 1fr))',
  palette: 'repeat(auto-fill, minmax(30%, 1fr))',
  wide: 'repeat(auto-fill, minmax(15%, 1fr))',
};

export const tokenGridClasses = {
  root: 'TokenGrid__root',
};

export const TokenGridStyles = styled(Box, {
  shouldForwardProp: (propName) => propName !== 'layout',
})<{ layout: TokenGridLayout }>(({ layout, theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  gridTemplateColumns: tokenGridColumns[layout],
}));

export const TokenGroupBlock = styled(Box)({});

export const TokenGroupTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
}));

export const TokenGroupDescription = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
}));
